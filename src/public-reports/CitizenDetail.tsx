/* Read citizen evidence and history; owners manage publication.
Todo:
-> keep failed input and use the server revision for each change
*/
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { api, ApiError, CitizenReport, errorMessage, OBSERVATIONS, User, writeJson } from './community';
import { PublicReport, reportDate } from './data';
import { MediaPicker, ReportMedia } from './ReportMedia';
import { ConditionFields, ConditionSummary } from './ConditionFields';
import { ConditionGeometry, GeometryDrawingStarter, RoadCondition, useConditionClock } from './condition';
import { PhotoAnalysis } from './PhotoAnalysis';
import { SkeletonBlock } from '../components/Skeleton';
import { statusClass } from './statusTone';
import { type AnalysisJob, type KindImport, conditionAnalysisReview, suggestedKind } from './analysis';

type Publication = { reporterName?: string; nameConsent?: boolean; visibility?: 'public' | 'withdrawn'; withdrawMediaIds?: string[] };
export function CitizenDetail({ summary, user, loginAvailable = true, writeAvailable = true, sessionExpired = false, onClose, onLogin, onSaved, onResolved, onDirty, onDrawGeometry, onGeometryPreview, onInspect }: {
  summary: PublicReport; user: User | null; loginAvailable?: boolean; writeAvailable?: boolean; sessionExpired?: boolean; onClose: () => void; onLogin: () => void; onSaved: (report: CitizenReport) => void; onDirty: (dirty: boolean) => void;
  onDrawGeometry?: GeometryDrawingStarter; onGeometryPreview?: (geometry: ConditionGeometry | null) => void; onInspect?: () => void;
  onResolved?: (report: CitizenReport) => void;
}) {
  const [loadedReport, setLoadedReport] = useState<CitizenReport | null>(null), [loadedUser, setLoadedUser] = useState(user?.id ?? '');
  const report = loadedUser === (user?.id ?? '') ? loadedReport : null;
  function setReport(value: CitizenReport) { setLoadedReport(value); setLoadedUser(user?.id ?? ''); }
  const [error, setError] = useState(''), [refresh, setRefresh] = useState(0);
  const [tab, setTab] = useState<'summary' | 'history'>('summary');
  const [editing, setEditing] = useState(false), [note, setNote] = useState(''), [status, setStatus] = useState<keyof typeof OBSERVATIONS>('unchanged');
  const [files, setFiles] = useState<File[]>([]), [busy, setBusy] = useState(false), [consent, setConsent] = useState(false), [saved, setSaved] = useState(false);
  const [naming, setNaming] = useState(false), [name, setName] = useState(''), [nameConsent, setNameConsent] = useState(false);
  const [pendingPublication, setPendingPublication] = useState<Publication | null>(null);
  const [conflict, setConflict] = useState(false);
  const [conditionChange, setConditionChange] = useState<RoadCondition | null | undefined>(), [conditionValid, setConditionValid] = useState(true);
  const [kindImport, setKindImport] = useState<KindImport | null>(null), [analysisSelection, setAnalysisSelection] = useState<AnalysisJob | null>(null);
  const pendingImport = useRef<{ id: string; job: AnalysisJob } | null>(null);
  useEffect(() => { setAnalysisSelection(null); setKindImport(null); pendingImport.current = null; }, [user?.id, summary.id]);
  const conditionNow = useConditionClock();
  const requestId = useRef(crypto.randomUUID()), publicationId = useRef(crypto.randomUUID()), heading = useRef<HTMLHeadingElement>(null);
  const dirty = Boolean(editing || naming || pendingPublication || busy);
  useEffect(() => { heading.current?.focus(); }, [summary.id]);
  useEffect(() => { onDirty(dirty); return () => onDirty(false); }, [dirty, onDirty]);
  function close() { if (!busy && (!dirty || confirm('Perubahan belum disimpan. Buang isian?'))) onClose(); }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [dirty, busy, onClose]);
  useEffect(() => {
    const controller = new AbortController(); setError('');
    api<CitizenReport>(`/reports/${encodeURIComponent(summary.id)}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) { setReport(result); onResolved?.(result); } }).catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); });
    return () => controller.abort();
  }, [summary.id, user?.id, refresh]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function accept(result: CitizenReport) { setReport(result); onSaved(result); setSaved(true); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!report || busy || !writeAvailable) return;
    if (!conditionValid) { setError('Periksa kondisi, waktu, dimensi, dan konfirmasi lokasi.'); return; }
    const analysisReview = conditionAnalysisReview(analysisSelection, report, conditionChange);
    if (analysisSelection && !analysisReview) { setError('Saran belum sesuai pengamatan atau sudah tidak berlaku. Tinjau jenis kondisi atau lanjutkan tanpa saran.'); return; }
    const body = new FormData();
    Object.entries({ requestId: requestId.current, note, status, revision: String(report.revision), publicConsent: String(consent) }).forEach(([key, value]) => body.set(key, value));
    files.forEach(file => body.append('media', file));
    if (conditionChange !== undefined) body.set('condition', JSON.stringify(conditionChange));
    if (analysisReview) body.set('analysisReview', JSON.stringify(analysisReview));
    setBusy(true); setError(''); setSaved(false); setConflict(false);
    try {
      accept(await api<CitizenReport>(`/reports/${report.id}/updates`, { method: 'POST', body }, 120_000));
      setNote(''); setFiles([]); setConsent(false); setConditionChange(undefined); setConditionValid(true); setAnalysisSelection(null); setKindImport(null); setEditing(false); requestId.current = crypto.randomUUID();
    } catch (error) { setError(errorMessage(error)); setConflict(error instanceof ApiError && error.status === 409); }
    finally { setBusy(false); }
  }
  async function publish(change: Publication, retry = false) {
    if (!report || busy || !writeAvailable) return;
    if (!retry) publicationId.current = crypto.randomUUID();
    setPendingPublication(change); setBusy(true); setError(''); setSaved(false); setConflict(false);
    try {
      accept(await writeJson<CitizenReport>(`/reports/${report.id}/publication`, { ...change, requestId: publicationId.current, revision: report.revision }, 'PATCH'));
      setPendingPublication(null); setNaming(false);
    } catch (error) { setError(errorMessage(error)); setConflict(error instanceof ApiError && error.status === 409); }
    finally { setBusy(false); }
  }
  const current = report ?? summary;
  const visibility = report?.visibility ?? 'public', actor = report?.reporterName || 'Pelapor';
  const privateAccess = visibility !== 'public';
  const attachments = report?.updates?.flatMap(entry => entry.media) ?? report?.media ?? [];
  const uniqueMedia = attachments.filter((file, index) => attachments.findIndex(row => row.id === file.id) === index);
  const entries = [...(report?.updates ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  function useAnalysis(job: AnalysisJob) {
    if (!report) return;
    const kind = suggestedKind(job, report); if (!kind) return;
    const id = crypto.randomUUID(); pendingImport.current = { id, job }; setKindImport({ id, kind });
  }
  return <div className="lj-detail">
    <button className="lj-back" disabled={busy} onClick={close}><ArrowLeft size={18} /> Kembali ke daftar</button>
    <div className="lj-detail-body">
      <p className="lj-eyebrow">LAPORAN WARGA · LAPORJALAN</p><h2 ref={heading} tabIndex={-1}>{current.title}</h2>
      <p className="lj-detail-date">{current.code} · {actor}<br /><time dateTime={current.createdAt}>Dibuat {reportDate(current.createdAt)} WIB</time></p>
      <span className={statusClass(current.sourceStatus || 'Dilaporkan')}>{current.sourceStatus || 'Dilaporkan'} · Pengamatan pelapor</span>
      {privateAccess && <p className="lj-publication-note" role="status">{visibility === 'hidden' ? 'Disembunyikan oleh moderasi. Publikasi tidak dapat dipulihkan dari akun ini.' : 'Laporan ditarik dari publik. Hanya pemilik yang dapat mengelola laporan ini.'}</p>}
      <div className="lj-detail-tabs" role="tablist" aria-label="Isi laporan">
        <button role="tab" id="citizen-summary-tab" aria-controls="citizen-summary" aria-selected={tab === 'summary'} onClick={() => setTab('summary')}>Ringkasan</button>
        <button role="tab" id="citizen-history-tab" aria-controls="citizen-history" aria-selected={tab === 'history'} onClick={() => setTab('history')}>Riwayat{report?.updates ? ` (${report.updates.length})` : ''}</button>
      </div>
      {error && <p className="lj-form-error" role="alert">{error}</p>}
      {conflict && <button className="lj-text-action" disabled={busy} onClick={() => { publicationId.current = crypto.randomUUID(); requestId.current = crypto.randomUUID(); setConflict(false); setRefresh(value => value + 1); }}>Muat versi terbaru; isian tetap disimpan</button>}
      {saved && <p className="lj-form-success" role="status">Perubahan tersimpan.</p>}
      {!report && !error && <SkeletonBlock label="Memuat laporan…" />}
      <div id="citizen-summary" role="tabpanel" aria-labelledby="citizen-summary-tab" hidden={tab !== 'summary'}>
        {report && <>
          {report.media.length ? <ReportMedia reportId={report.id} media={report.media} privateAccess={privateAccess} /> : <div className="lj-media-empty"><strong>Tanpa lampiran</strong><span>Laporan tetap dapat dibaca melalui uraian.</span></div>}
          {report.condition && <><ConditionSummary condition={report.condition} now={conditionNow} />{onInspect && <button className="lj-secondary" disabled={dirty} onClick={onInspect}>Lihat ilustrasi 3D</button>}</>}
          <p className="lj-description">{report.description}</p>
          <dl className="lj-facts"><div><dt>Lokasi</dt><dd>{report.address || 'Patokan tidak diisi'}<br />{report.lat.toFixed(6)}, {report.lng.toFixed(6)}</dd></div><div><dt>Kategori</dt><dd>{report.sourceCategory}</dd></div><div><dt>Pelapor</dt><dd>{actor}</dd></div></dl>
          <p className="lj-detail-note">Sumber: warga LaporJalan. Pengamatan belum diverifikasi pemerintah.</p>
        </>}
      </div>
      <div id="citizen-history" role="tabpanel" aria-labelledby="citizen-history-tab" hidden={tab !== 'history'}>
        <div className="lj-history-heading"><h3>Riwayat pengamatan</h3><button aria-label="Muat ulang riwayat" disabled={dirty} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={17} /></button></div>
        <ol className="lj-timeline">{entries.map(entry => {
          const initial = entry.id === report?.id || entry.status === 'reported';
          return <li key={entry.id}><strong>{initial ? 'Laporan dibuat' : OBSERVATIONS[entry.status as keyof typeof OBSERVATIONS]}</strong>
            <p className="lj-entry-meta">{entry.actor || actor} · warga LaporJalan<br /><time dateTime={entry.createdAt}>{reportDate(entry.createdAt)} WIB</time></p>
            <p>{entry.note}</p>{entry.condition && <ConditionSummary condition={entry.condition} now={conditionNow} historical />}{entry.condition === null && <p>Kondisi dan bentuk dihapus oleh pelapor.</p>}<ReportMedia reportId={summary.id} media={entry.media} privateAccess={privateAccess} />
          </li>;
        })}</ol>
        {report && !entries.length && <p className="lj-detail-note">Riwayat belum tersedia.</p>}
      </div>
      {!user && sessionExpired && <p className="lj-form-error" role="status">Sesi berakhir. Masuk kembali untuk mengelola laporan.</p>}
      {user && !writeAvailable && <p className="lj-detail-note" role="status">Pengiriman laporan belum tersedia.</p>}
      {!user && <button className="lj-secondary" disabled={!loginAvailable} onClick={onLogin}>Masuk untuk mengelola laporan</button>}
      {user && report?.canUpdate && !editing && !naming && !pendingPublication && <button className="lj-primary" disabled={!writeAvailable} onClick={() => { setEditing(true); setSaved(false); }}>Tambah pembaruan</button>}
      {editing && loadedReport?.canUpdate && <form className="lj-form lj-update-form" hidden={!user || !report?.canUpdate} onSubmit={submit}>
        <h3>Catat perkembangan</h3><p>Kondisi yang diamati pelapor. Maksimum 100 entri, termasuk laporan awal.</p>
        <fieldset disabled={busy || !writeAvailable || !user || !report?.canUpdate}><label htmlFor="observation-status">Kondisi saat ini</label><select id="observation-status" value={status} onChange={event => { setStatus(event.target.value as keyof typeof OBSERVATIONS); requestId.current = crypto.randomUUID(); }}>{Object.entries(OBSERVATIONS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
          <label>Catatan pembaruan<textarea required minLength={10} maxLength={4000} rows={4} value={note} onChange={event => { setNote(event.target.value); requestId.current = crypto.randomUUID(); }} /></label>
          <MediaPicker files={files} onChange={value => { setFiles(value); requestId.current = crypto.randomUUID(); }} disabled={busy} />
          {user && report?.canUpdate && report.visibility !== 'withdrawn' && report.visibility !== 'hidden' && <PhotoAnalysis key={`${user.id}:${report.id}`} report={report} ownerId={user.id} disabled={busy || !writeAvailable} selectedAnalysisId={analysisSelection?.analysisId}
            onUse={useAnalysis} onCorrect={job => { setAnalysisSelection(job); requestId.current = crypto.randomUUID(); }} onClear={() => { setAnalysisSelection(null); requestId.current = crypto.randomUUID(); }} onChanged={() => setRefresh(value => value + 1)} />}
          {analysisSelection && <button type="button" className="lj-text-action" disabled={busy} onClick={() => { setAnalysisSelection(null); requestId.current = crypto.randomUUID(); }}>Lanjutkan tanpa saran</button>}
          <ConditionFields inlineDrawing category={loadedReport.category} location={{ lng: loadedReport.lng, lat: loadedReport.lat }} initialCondition={loadedReport.condition} updating disabled={busy || !writeAvailable || !user || !report?.canUpdate} onDrawGeometry={onDrawGeometry} onGeometryPreview={onGeometryPreview} kindImport={kindImport} onKindImported={(id, applied) => { if (pendingImport.current?.id === id) { if (applied) setAnalysisSelection(pendingImport.current.job); pendingImport.current = null; } }} onChange={(value, valid) => { setConditionChange(value); setConditionValid(valid); requestId.current = crypto.randomUUID(); }} />
          <label className="lj-checkbox"><input required type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />Catatan dan lampiran boleh dipublikasikan. Lampiran telah diperiksa agar tidak memuat data pribadi.</label>
        </fieldset><div className="lj-form-actions"><button type="button" className="lj-secondary" disabled={busy} onClick={() => { if ((!note && !files.length && conditionChange === undefined) || confirm('Buang isian perkembangan?')) { setEditing(false); setNote(''); setFiles([]); setConditionChange(undefined); setConditionValid(true); setAnalysisSelection(null); setKindImport(null); } }}>Batal</button><button className="lj-primary" disabled={busy || !writeAvailable}>{busy ? 'Menyimpan…' : 'Simpan pembaruan'}</button></div>
      </form>}
      {user && report?.canManage && !editing && <section className="lj-publication-controls"><h3>Kelola publikasi</h3>
        {!naming && !pendingPublication && <div className="lj-owner-actions"><button className="lj-text-action" disabled={busy || !writeAvailable} onClick={() => { setName(report.reporterName ?? user.displayName ?? ''); setNameConsent(Boolean(report.reporterName)); setNaming(true); }}>Ubah nama publik</button>
          {visibility !== 'hidden' && <button className="lj-text-action" disabled={busy || !writeAvailable} onClick={() => { if (confirm(visibility === 'withdrawn' ? 'Publikasikan kembali laporan dan lampiran yang masih tersedia?' : 'Tarik laporan dan seluruh lampiran dari publik? Data tetap tersimpan untuk pengelolaan pemilik.')) void publish({ visibility: visibility === 'withdrawn' ? 'public' : 'withdrawn' }); }}>{visibility === 'withdrawn' ? 'Publikasikan kembali' : 'Tarik laporan'}</button>}
        </div>}
        {naming && !pendingPublication && <form className="lj-form" onSubmit={event => { event.preventDefault(); void publish({ nameConsent, reporterName: nameConsent ? name.trim() : '' }); }}><fieldset disabled={busy || !writeAvailable}>
          <label className="lj-checkbox"><input type="checkbox" checked={nameConsent} onChange={event => setNameConsent(event.target.checked)} />Tampilkan nama pada laporan ini.</label>
          {nameConsent && <label>Nama tampilan<input required maxLength={40} value={name} onChange={event => setName(event.target.value)} /></label>}
          <p>Ditampilkan sebagai: <strong>{nameConsent ? name.trim() || 'Pelapor' : 'Pelapor'}</strong>. Berlaku untuk seluruh riwayat laporan ini.</p>
        </fieldset><div className="lj-form-actions"><button type="button" className="lj-secondary" disabled={busy} onClick={() => setNaming(false)}>Batal</button><button className="lj-primary" disabled={busy || !writeAvailable}>Simpan nama</button></div></form>}
        {pendingPublication && <div className="lj-publication-note"><p>{busy ? 'Menyimpan publikasi…' : 'Publikasi belum terkonfirmasi. Coba kembali dengan perubahan yang sama.'}</p><button className="lj-text-action" disabled={busy || conflict || !writeAvailable} onClick={() => void publish(pendingPublication, true)}>Coba simpan kembali</button></div>}
        {!naming && !pendingPublication && uniqueMedia.length > 0 && <details><summary>Kelola lampiran ({uniqueMedia.length})</summary><p className="lj-detail-note">Lampiran yang ditarik tidak dapat dipublikasikan kembali. Data tetap tersimpan sampai kebijakan retensi ditetapkan.</p>{uniqueMedia.map((file, index) => <div className="lj-media-management" key={file.id}><span>Lampiran {index + 1} · {file.mime.startsWith('image/') ? 'Foto' : 'Video'}</span><button className="lj-text-action" disabled={busy || !writeAvailable} onClick={() => { if (confirm('Tarik lampiran ini dari publik? Tindakan tidak dapat dipulihkan.')) void publish({ withdrawMediaIds: [file.id] }); }}>Tarik lampiran</button></div>)}</details>}
      </section>}
    </div>
  </div>;
}
