/* Review one saved photo privately without changing the report.
Todo:
-> stop polling when the owner panel closes or its source changes
*/
import { useEffect, useId, useRef, useState } from 'react';
import { api, ApiError, type CitizenReport, errorMessage, useCapabilities, writeJson } from './community';
import { CONDITION_LABELS } from './condition';
import { type AnalysisJob, reviewableAnalysis, suggestedKind } from './analysis';
import { ReportMedia } from './ReportMedia';
import { reportDate } from './data';

export function PhotoAnalysis({ report, ownerId, disabled, selectedAnalysisId, onUse, onCorrect, onClear, onChanged }: {
  report: CitizenReport; ownerId: string; disabled: boolean; selectedAnalysisId?: string;
  onUse: (job: AnalysisJob) => void; onCorrect: (job: AnalysisJob) => void; onClear: () => void;
  onChanged: () => void;
}) {
  const { capabilities } = useCapabilities(), label = useId();
  const available = capabilities?.analysis?.available === true;
  const [job, setJob] = useState<AnalysisJob | null>(null), [mediaId, setMediaId] = useState('');
  const [photoExpanded, setPhotoExpanded] = useState(false);
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const lifecycle = useRef<AbortController>(), admission = useRef({ mediaId: '', requestId: '' });
  const actionRequest = useRef({ key: '', requestId: '' });
  const pollUntil = useRef(0);
  const callbacks = useRef({ onClear, onChanged }); callbacks.current = { onClear, onChanged };
  const suppressionRefreshed = useRef('');
  const scope = `${ownerId}:${report.id}:${report.revision}`;
  const media = [...report.media, ...(report.updates ?? []).flatMap(entry => entry.media)].filter((file, index, rows) => file.mime.startsWith('image/') && rows.findIndex(row => row.id === file.id) === index);
  const base = `/reports/${encodeURIComponent(report.id)}/analyses`;
  useEffect(() => {
    const controller = new AbortController(); lifecycle.current = controller;
    pollUntil.current = Date.now() + 12 * 60_000;
    setJob(null); setMediaId(''); setPhotoExpanded(false); setError(''); setBusy(false); setLoading(available); admission.current = { mediaId: '', requestId: '' };
    if (available) api<{ analysis: AnalysisJob | null }>(`${base}?latest=true`, { signal: controller.signal }).then(result => {
      if (!controller.signal.aborted) { setJob(result.analysis); if (result.analysis) setMediaId(result.analysis.mediaId); }
    }).catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [scope, available]);
  useEffect(() => {
    if (!available || busy || !job || !['queued', 'running'].includes(job.execution)) return;
    if (Date.now() >= pollUntil.current) { setError('Pemeriksaan belum selesai. Buka kembali pembaruan untuk memeriksa statusnya.'); setJob(null); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api<AnalysisJob>(`${base}/${encodeURIComponent(job.analysisId)}`, { signal: controller.signal }).then(result => {
        if (!controller.signal.aborted) { setJob(result); setError(''); }
      }).catch(error => {
        if (!controller.signal.aborted) { setError(errorMessage(error)); setJob(null); }
      });
    }, Math.max(3000, Math.min(15000, job.pollAfterMs || 3000)));
    return () => { clearTimeout(timer); controller.abort(); };
  }, [available, scope, job, busy]);
  useEffect(() => {
    if (!job || job.freshness !== 'fresh') return;
    const timer = setTimeout(() => { setJob(current => current?.analysisId === job.analysisId ? { ...current, freshness: 'stale', applicable: false, reason: 'expired', suggestion: undefined } : current); }, Math.max(0, Math.min(2_147_483_647, Date.parse(job.expiresAt) - Date.now())));
    return () => clearTimeout(timer);
  }, [job?.analysisId, job?.expiresAt, job?.freshness]);
  useEffect(() => {
    if (job?.freshness !== 'suppressed') return;
    setMediaId(''); setPhotoExpanded(false);
    const key = `${job.analysisId}:${job.revision}`;
    if (suppressionRefreshed.current !== key) { suppressionRefreshed.current = key; callbacks.current.onChanged(); }
  }, [job?.analysisId, job?.freshness, job?.revision]);
  if (!available) return null;
  const current = job?.reportId === report.id ? job : null;
  const suppressed = current?.freshness === 'suppressed';
  const reviewed = current && current.review !== 'pending';
  const stale = !!current && !reviewed && (current.freshness !== 'fresh' || current.baseReportRevision !== report.revision || Date.parse(current.expiresAt) <= Date.now());
  const active = !!current && ['queued', 'running'].includes(current.execution);
  const kind = current ? suggestedKind(current, report) : null;
  const canCorrect = !!current && reviewableAnalysis(current, report);
  const photo = suppressed ? undefined : media.find(file => file.id === mediaId);
  const source = report.updates?.find(entry => entry.media.some(file => file.id === mediaId));
  const clear = () => { callbacks.current.onClear(); };
  async function request() {
    const signal = lifecycle.current?.signal;
    if (!photo || active || busy || loading || disabled || !signal || signal.aborted) return;
    if (admission.current.mediaId !== mediaId) admission.current = { mediaId, requestId: crypto.randomUUID() };
    setBusy(true); setError(''); clear();
    try { const result = await writeJson<AnalysisJob>(base, { requestId: admission.current.requestId, mediaId, expectedRevision: report.revision }, 'POST', signal); if (!signal.aborted) { setJob(result); admission.current = { mediaId: '', requestId: '' }; } }
    catch (error) { if (!signal.aborted) { setError(errorMessage(error)); if (error instanceof ApiError && error.status < 500) admission.current = { mediaId: '', requestId: '' }; } }
    finally { if (!signal.aborted) setBusy(false); }
  }
  async function change(action: 'cancel' | 'reject') {
    const signal = lifecycle.current?.signal;
    if (!current || busy || disabled || !signal || signal.aborted) return;
    setBusy(true); setError('');
    const actionKey = `${action}:${current.analysisId}:${action === 'cancel' ? current.jobVersion : report.revision}`;
    if (actionRequest.current.key !== actionKey) actionRequest.current = { key: actionKey, requestId: crypto.randomUUID() };
    try {
      const result = await writeJson<AnalysisJob>(`${base}/${encodeURIComponent(current.analysisId)}/${action}`, { requestId: actionRequest.current.requestId, ...(action === 'cancel' ? { expectedJobVersion: current.jobVersion } : { expectedRevision: report.revision }) }, 'POST', signal);
      if (!signal.aborted) { setJob(result); clear(); admission.current = { mediaId: '', requestId: '' }; actionRequest.current = { key: '', requestId: '' }; if (action === 'reject') onChanged(); }
    } catch (error) { if (!signal.aborted) setError(errorMessage(error)); }
    finally { if (!signal.aborted) setBusy(false); }
  }
  const suggestion = current?.freshness !== 'suppressed' ? current?.suggestion : undefined;
  return <section className="lj-condition-fields lj-photo-analysis" aria-labelledby={label}>
    <h4 id={label}>Bantuan foto <span>(opsional)</span></h4>
    <p className="lj-form-note">Saran perlu ditinjau. Foto tidak menentukan ukuran, lokasi, atau status penanganan.</p>
    <div><label htmlFor={`${label}-photo`}>Foto tersimpan</label><select id={`${label}-photo`} value={suppressed ? '' : mediaId} disabled={disabled || busy || active || loading || suppressed} onChange={event => { setMediaId(event.target.value); setPhotoExpanded(false); setJob(null); clear(); admission.current = { mediaId: '', requestId: '' }; }}><option value="">Pilih foto</option>{!suppressed && media.map((file, index) => <option key={file.id} value={file.id}>Foto {index + 1}</option>)}</select></div>
    {!media.length && <p>Pilih foto yang masih tersedia. Video belum dapat diperiksa.</p>}
    {photo && <div className="lj-analysis-evidence" data-expanded={photoExpanded}>
      <div id={`${label}-evidence`}><ReportMedia reportId={report.id} media={[photo]} /></div>
      <button type="button" className="lj-text-action" aria-controls={`${label}-evidence`} aria-expanded={photoExpanded} onClick={() => setPhotoExpanded(value => !value)}>{photoExpanded ? 'Perkecil foto' : 'Perbesar foto'}</button>
      <p className="lj-form-note">Diunggah {reportDate(source?.createdAt ?? report.createdAt)} WIB. Waktu unggah bukan waktu pengamatan.</p>
    </div>}
    {loading && <p role="status">Memeriksa pekerjaan sebelumnya…</p>}
    {active && <><p role="status" aria-live="polite">{current.execution === 'queued' ? 'Menunggu giliran' : 'Memeriksa foto'} · {reportDate(current.startedAt ?? current.createdAt)} WIB</p><button type="button" className="lj-text-action" disabled={busy || disabled} onClick={() => void change('cancel')}>Batalkan pemeriksaan</button></>}
    {current && (stale || suppressed) && <p role="status">{suppressed ? 'Sumber foto tidak tersedia untuk saran ini.' : 'Laporan berubah atau saran telah kedaluwarsa. Isi manual tetap tersedia.'}</p>}
    {reviewed && <p role="status">{current.review === 'accepted' ? 'Saran sudah diterima dalam pengamatan pelapor.' : current.review === 'corrected' ? 'Saran sudah dikoreksi dalam pengamatan pelapor.' : 'Saran tidak digunakan.'}</p>}
    {current && ['failed', 'cancelled'].includes(current.execution) && <p role="status">{current.execution === 'failed' ? 'Foto belum berhasil diperiksa.' : 'Pemeriksaan dibatalkan.'} Isi manual tetap tersedia.</p>}
    {suggestion && <>
      <p><strong>{reviewed ? 'Saran AI - telah ditinjau' : 'Saran AI - belum disimpan'}</strong></p>
      <p>{suggestion.kindSuggestion === 'possible_closure' ? 'Terlihat indikasi pembatasan akses. Pilih jenis dan pengamatan akses secara manual.' : kind ? CONDITION_LABELS[kind] : suggestion.kindSuggestion === 'unknown' ? 'Kondisi belum dapat dipastikan.' : suggestion.kindSuggestion === 'no_visible_issue' ? 'Tidak tampak kondisi yang dapat disarankan dari foto ini. Ini bukan pernyataan jalan aman.' : 'Tinjau kondisi secara manual sesuai kategori laporan.'}</p>
      {suggestion.qualityFlags.length > 0 && <p>Foto belum cukup jelas untuk memakai saran. Isi manual tetap tersedia.</p>}
      {kind && <button type="button" className="lj-primary" disabled={disabled || busy} onClick={() => onUse(current!)}>Gunakan jenis ini</button>}
      {canCorrect && <button type="button" className="lj-text-action" disabled={disabled || busy} onClick={() => onCorrect(current!)}>Catat koreksi jenis secara manual</button>}
      {selectedAnalysisId === current?.analysisId && <p role="status">Jenis sedang ditinjau. Lengkapi dan periksa pengamatan sebelum menyimpan.</p>}
      <details><summary>Bahan tinjauan privat</summary><p>Keluaran dapat keliru. Teks ini tidak disalin ke catatan publik.</p><ul>{suggestion.visibleEvidence.map((text, index) => <li key={index}>{text}</li>)}</ul><p>{suggestion.captionSuggestion}</p></details>
      {current?.review === 'pending' && current.freshness === 'fresh' && <button type="button" className="lj-text-action" disabled={busy || disabled} onClick={() => void change('reject')}>Tidak gunakan saran</button>}
    </>}
    <button type="button" className={suggestion ? 'lj-text-action' : 'lj-secondary'} disabled={!photo || disabled || busy || active || loading} onClick={() => void request()}>{suggestion ? 'Periksa foto lagi' : 'Bantu kenali kondisi'}</button>
    {error && <p className="lj-form-error" role="alert">{error} Tutup dan buka pembaruan untuk memeriksa pekerjaan yang sudah ada.</p>}
  </section>;
}
