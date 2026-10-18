/* Public report history and owner-only field observations.
Todo:
-> show persisted updates and retain failed submissions
*/
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { api, CitizenReport, errorMessage, OBSERVATIONS, User } from './community';
import { PublicReport, reportDate } from './data';
import { MediaPicker, ReportMedia } from './ReportMedia';

export function CitizenDetail({ summary, user, onClose, onLogin, onSaved, onDirty }: {
  summary: PublicReport; user: User | null; onClose: () => void; onLogin: () => void; onSaved: (report: CitizenReport) => void; onDirty: (dirty: boolean) => void;
}) {
  const [report, setReport] = useState<CitizenReport | null>(null), [error, setError] = useState(''), [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState(false), [note, setNote] = useState(''), [status, setStatus] = useState<keyof typeof OBSERVATIONS>('unchanged');
  const [files, setFiles] = useState<File[]>([]), [busy, setBusy] = useState(false), [consent, setConsent] = useState(false), [saved, setSaved] = useState(false);
  const requestId = useRef(crypto.randomUUID()), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [summary.id]);
  useEffect(() => { onDirty(Boolean(note || files.length || busy)); return () => onDirty(false); }, [note, files.length, busy, onDirty]);
  function close() { if (!busy && ((!note && !files.length) || confirm('Pembaruan belum dikirim. Buang isian?'))) onClose(); }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [note, files.length, busy, onClose]);
  useEffect(() => {
    const controller = new AbortController(); setError('');
    api<CitizenReport>(`/reports/${encodeURIComponent(summary.id)}`, { signal: controller.signal })
      .then(setReport).catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); });
    return () => controller.abort();
  }, [summary.id, user?.id, refresh]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (note || files.length || busy) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [note, files.length, busy]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!report || busy) return;
    const body = new FormData();
    Object.entries({ requestId: requestId.current, note, status, revision: String(report.revision), publicConsent: String(consent) }).forEach(([key, value]) => body.set(key, value));
    files.forEach(file => body.append('media', file));
    setBusy(true); setError(''); setSaved(false);
    try {
      const result = await api<CitizenReport>(`/reports/${report.id}/updates`, { method: 'POST', body });
      setReport(result); onSaved(result); setNote(''); setFiles([]); setConsent(false); setEditing(false); setSaved(true); requestId.current = crypto.randomUUID();
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className="lj-detail">
    <button className="lj-back" disabled={busy} onClick={close}><ArrowLeft size={18} /> Kembali ke daftar</button>
    <div className="lj-detail-body">
      <p className="lj-eyebrow">LAPORAN WARGA · LAPORJALAN</p><h2 ref={heading} tabIndex={-1}>{summary.title}</h2>
      <p className="lj-detail-date">{summary.code}<br />Dibuat {reportDate(summary.createdAt)} WIB</p>
      <span className="lj-status">{report?.sourceStatus ?? summary.sourceStatus} · Pelapor</span>
      <p className="lj-detail-note">Pengamatan warga, belum diverifikasi pemerintah.</p>
      <p className="lj-description">{summary.description}</p>
      <ReportMedia reportId={summary.id} media={summary.media ?? []} />
      <dl className="lj-facts"><div><dt>Lokasi</dt><dd>{summary.address || 'Patokan tidak diisi'}<br />{summary.lat.toFixed(6)}, {summary.lng.toFixed(6)}</dd></div><div><dt>Kategori</dt><dd>{summary.sourceCategory}</dd></div></dl>
      <div className="lj-history-heading"><h3>Riwayat pembaruan</h3><button aria-label="Muat ulang riwayat" disabled={busy} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={17} /></button></div>
      {error && <p className="lj-form-error" role="alert">{error}</p>}
      {saved && <p className="lj-form-success" role="status">Pembaruan tersimpan.</p>}
      {!report && !error && <p role="status">Memuat riwayat…</p>}
      <ol className="lj-timeline">{report?.updates?.map((entry, index) => <li key={entry.id}>
        <strong>{index === 0 ? 'Laporan dibuat' : OBSERVATIONS[entry.status as keyof typeof OBSERVATIONS]}</strong>
        <p className="lj-entry-meta">{entry.actor} · <time dateTime={entry.createdAt}>{reportDate(entry.createdAt)} WIB</time></p>
        <p>{entry.note}</p>{index > 0 && <ReportMedia reportId={summary.id} media={entry.media} />}
      </li>)}</ol>
      {!user && <button className="lj-secondary" onClick={onLogin}>Masuk untuk mengelola laporan</button>}
      {user && report?.canUpdate && !editing && <button className="lj-primary" onClick={() => { setEditing(true); setSaved(false); }}>Tambah pembaruan</button>}
      {user && editing && report?.canUpdate && <form className="lj-form lj-update-form" onSubmit={submit}>
        <h3>Catat perkembangan</h3><p>Status ini merupakan kondisi yang diamati pelapor.</p>
        <fieldset disabled={busy}><label htmlFor="observation-status">Kondisi saat ini</label><select id="observation-status" value={status} onChange={event => setStatus(event.target.value as keyof typeof OBSERVATIONS)}>{Object.entries(OBSERVATIONS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
          <label>Catatan pembaruan<textarea required minLength={10} maxLength={4000} rows={4} value={note} onChange={event => setNote(event.target.value)} /></label>
          <MediaPicker files={files} onChange={setFiles} disabled={busy} />
          <label className="lj-checkbox"><input required type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />Catatan dan lampiran boleh dipublikasikan.</label>
        </fieldset><button className="lj-primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan pembaruan'}</button>
      </form>}
    </div>
  </div>;
}
