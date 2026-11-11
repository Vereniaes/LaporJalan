/* Todo:
-> handle location, evidence, and report review
-> preserve input after failures and confirm public submission
*/
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api, CATEGORY_LABELS, CitizenReport, errorMessage } from './community';
import { ReportCategory } from './data';
import { MediaPicker } from './ReportMedia';
import { ConditionFields, ConditionSummary } from './ConditionFields';
import type { ConditionGeometry, GeometryDrawingStarter, RoadCondition } from './condition';
import { PointPicker } from './PointPicker';
import { FieldError, Req } from './Req';

export type ReportLocation = { lng: number; lat: number };
// backLabel/autoFocus: the account page keeps the form open beside its own map, so it says what closing does and does not steal focus on load
export function NewReport({ location, preferredName = '', writeAvailable = true, backLabel = 'Kembali ke peta', autoFocus = true, onLocation, onPicking, onClose, onSaved, onDrawGeometry, onGeometryPreview }: {
  preferredName?: string; writeAvailable?: boolean; backLabel?: string; autoFocus?: boolean;
  onDrawGeometry?: GeometryDrawingStarter; onGeometryPreview?: (geometry: ConditionGeometry | null) => void; onInspect?: () => void;
  location: ReportLocation | null; onLocation: (point: ReportLocation) => void; onPicking: (value: boolean) => void;
  onClose: () => void; onSaved: (report: CitizenReport) => void;
}) {
  const [step, setStep] = useState(0), [category, setCategory] = useState<ReportCategory>('road');
  const [title, setTitle] = useState(''), [description, setDescription] = useState(''), [address, setAddress] = useState('');
  const [files, setFiles] = useState<File[]>([]), [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [pointPending, setPointPending] = useState(true), [tried, setTried] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const [nameConsent, setNameConsent] = useState(false), [reporterName, setReporterName] = useState(preferredName);
  const [condition, setCondition] = useState<RoadCondition | null | undefined>(), [conditionValid, setConditionValid] = useState(true);
  const requestId = useRef(crypto.randomUUID()), heading = useRef<HTMLHeadingElement>(null);
  const dirty = Boolean(title.trim() || description.trim() || address.trim() || files.length);
  useEffect(() => { onPicking(step === 0); if (autoFocus || step > 0) heading.current?.focus(); return () => onPicking(false); }, [step, onPicking]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty || busy) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);
  function close() { if (!busy && (!dirty || confirm(`Isian belum dikirim. Buang isian${backLabel === 'Kembali ke peta' ? ' dan kembali ke peta' : ''}?`))) onClose(); }
  // --- validation (owner, 10 Nov): on Lanjutkan every missing field turns red with its own message, and focus jumps to the first one ---
  const short = (value: string, min: number, empty: string) => !value.trim() ? empty : value.trim().length < min ? `Minimal ${min} karakter.` : '';
  const problems: Record<string, string> = {
    point: !location || pointPending ? 'Geser peta sampai pin berada di lokasi kejadian, lalu pilih Konfirmasi titik ini.' : '',
    address: short(address, 3, 'Isi alamat atau patokan.'),
    title: short(title, 5, 'Isi judul laporan.'),
    description: short(description, 10, 'Isi uraian kejadian.'),
    media: files.length ? '' : 'Tambahkan minimal satu foto atau video.',
    condition: conditionValid && condition ? '' : 'Pilih jenis kondisi, lalu isi waktu pengamatan, bentuk lokasi, dan konfirmasinya.',
    name: nameConsent && !reporterName.trim() ? 'Isi nama tampilan.' : '',
    consent: consent ? '' : 'Centang persetujuan publikasi untuk mengirim.',
  };
  const STEP_FIELDS = [['point', 'address'], ['title', 'description', 'media', 'condition'], ['name', 'consent']];
  const show = (key: string) => tried ? problems[key] || undefined : undefined;
  useEffect(() => { setTried(false); setError(''); }, [step]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!writeAvailable || busy) return; setError('');
    const missing = STEP_FIELDS[step].filter(key => problems[key]);
    if (missing.length) {
      setTried(true);
      setError(missing.length > 1 ? `Lengkapi ${missing.length} isian bertanda merah.` : problems[missing[0]]); // the details sit under each field
      // after the red marks render: focus the first one in reading order and bring it into view
      requestAnimationFrame(() => {
        const first = form.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        first?.focus({ preventScroll: true });
        first?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
      return;
    }
    if (step < 2) { setStep(step + 1); return; }
    if (!location) return;
    setBusy(true);
    const body = new FormData();
    Object.entries({ requestId: requestId.current, category, title, description, address,
      lat: String(location.lat), lng: String(location.lng), publicConsent: 'true' }).forEach(([key, value]) => body.set(key, value));
    files.forEach(file => body.append('media', file));
    if (nameConsent) { body.set('nameConsent', 'true'); body.set('reporterName', reporterName.trim()); }
    if (condition) body.set('condition', JSON.stringify(condition));
    try { onSaved(await api<CitizenReport>('/reports', { method: 'POST', body }, 120_000)); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className="lj-composer" data-step={step}>
    <button className="lj-back" onClick={close} disabled={busy}><ArrowLeft size={18} /> {backLabel}</button>
    <div className="lj-composer-body">
      <img className="lj-compose-miko" src="/home/miko/pin-512.webp" width="56" height="56" alt="" />
      <p className="lj-eyebrow">LAPORAN WARGA · LAPORJALAN</p><h2 ref={heading} tabIndex={-1}>Tambah laporan</h2>
      <ol className="lj-steps" aria-label="Langkah laporan">{['Lokasi', 'Kondisi', 'Tinjau'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
      <form ref={form} className="lj-form" onSubmit={submit} noValidate>
        {!writeAvailable && <p role="status">Pengiriman laporan belum tersedia. Isian tetap disimpan.</p>}
        <fieldset disabled={busy || !writeAvailable}>
          {step === 0 && <>
            <h3>Tentukan lokasi kejadian</h3><p>Geser peta sampai pin berada di lokasi kejadian, lalu konfirmasi titiknya. Lokasi perangkat hanya digunakan setelah tombolnya dipilih.</p>
            <PointPicker value={location} onConfirm={point => { onLocation(point); setError(''); }} onPending={setPointPending} disabled={busy || !writeAvailable} invalid={Boolean(show('point'))} />
            <FieldError id="report-point-error" message={show('point')} />
            <label htmlFor="report-address"><span className="lj-label-text">Alamat atau patokan<Req /></span></label>
            <input id="report-address" aria-label="Alamat atau patokan" aria-invalid={show('address') ? true : undefined} aria-describedby={show('address') ? 'report-address-error' : undefined} value={address} required minLength={3} maxLength={300} onChange={event => { setAddress(event.target.value); if (error) setError(''); }} placeholder="Nama jalan, persimpangan, atau bangunan terdekat" />
            <FieldError id="report-address-error" message={show('address')} />
          </>}
          {step === 1 && <>
            <label htmlFor="report-category"><span className="lj-label-text">Kategori<Req /></span></label><select id="report-category" value={category} onChange={event => setCategory(event.target.value as ReportCategory)}>{Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
            <label><span className="lj-label-text">Judul laporan<Req /></span><input id="report-title" aria-invalid={show('title') ? true : undefined} aria-describedby={show('title') ? 'report-title-error' : undefined} value={title} required minLength={5} maxLength={120} onChange={event => setTitle(event.target.value)} placeholder="Ringkas masalah yang terlihat" /></label>
            <FieldError id="report-title-error" message={show('title')} />
            <label><span className="lj-label-text">Uraian kejadian<Req /></span><textarea id="report-description" aria-invalid={show('description') ? true : undefined} aria-describedby={show('description') ? 'report-description-error' : undefined} value={description} required minLength={10} maxLength={4000} rows={5} onChange={event => setDescription(event.target.value)} placeholder="Jelaskan kondisi, waktu pengamatan, dan bagian jalan yang terdampak." /></label>
            <FieldError id="report-description-error" message={show('description')} />
            <MediaPicker files={files} onChange={setFiles} required invalid={show('media')} />
          </>}
          <div hidden={step !== 1}><ConditionFields category={category} location={location} required inlineDrawing showErrors={tried && step === 1} disabled={step !== 1 || busy || !writeAvailable} onDrawGeometry={onDrawGeometry} onGeometryPreview={onGeometryPreview} onChange={(value, valid) => { setCondition(value); setConditionValid(valid); requestId.current = crypto.randomUUID(); }} /></div>
          {step === 2 && <>
            <h3>Periksa sebelum mengirim</h3><div className="lj-review"><strong>{title}</strong><p>{description}</p><dl>
              <dt>Kategori</dt><dd>{CATEGORY_LABELS[category]}</dd><dt>Lokasi</dt><dd>{location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}</dd>
              <dt>Patokan</dt><dd>{address || 'Tidak diisi'}</dd><dt>Lampiran</dt><dd>{files.length ? files.map(file => file.name).join(', ') : 'Tanpa lampiran'}</dd>
            </dl></div>
            {condition && <ConditionSummary condition={condition} />}
            <p className="lj-form-note">Laporan tersimpan di LaporJalan. Belum dikirim ke kanal pemerintah. Status dan pembaruan merupakan pengamatan pelapor.</p>
            <label className="lj-checkbox"><input type="checkbox" checked={nameConsent} onChange={event => setNameConsent(event.target.checked)} />Tampilkan nama pada laporan ini.</label>
            {nameConsent && <label><span className="lj-label-text">Nama tampilan<Req /></span><input required aria-invalid={show('name') ? true : undefined} maxLength={40} value={reporterName} onChange={event => setReporterName(event.target.value)} /></label>}
            <p className="lj-name-preview">Ditampilkan sebagai: <strong>{nameConsent ? reporterName.trim() || 'Pelapor' : 'Pelapor'}</strong>. Email tetap privat.</p>
            <label className={`lj-checkbox${show('consent') ? ' is-invalid' : ''}`}><input type="checkbox" required aria-invalid={show('consent') ? true : undefined} checked={consent} onChange={event => setConsent(event.target.checked)} />Lokasi, isi, dan lampiran boleh ditampilkan kepada publik. Lampiran telah diperiksa agar tidak memuat data pribadi.</label>
          </>}
        </fieldset>
        {error && <p className="lj-form-error" role="alert">{error}</p>}
        <div className="lj-form-actions">{step > 0 && <button type="button" className="lj-secondary" disabled={busy} onClick={() => { setStep(value => value - 1); setError(''); }}>Sebelumnya</button>}
          <button className="lj-primary" disabled={busy || !writeAvailable}>{busy ? 'Menyimpan laporan…' : step === 2 ? 'Kirim laporan' : 'Lanjutkan'}</button></div>
      </form>
    </div>
  </div>;
}
