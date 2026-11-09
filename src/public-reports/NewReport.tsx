/* Todo:
-> handle location, evidence, and report review
-> preserve input after failures and confirm public submission
*/
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, LocateFixed } from 'lucide-react';
import { api, CATEGORY_LABELS, CitizenReport, errorMessage } from './community';
import { ReportCategory } from './data';
import { MediaPicker } from './ReportMedia';
import { ConditionFields, ConditionSummary } from './ConditionFields';
import type { ConditionGeometry, GeometryDrawingStarter, RoadCondition } from './condition';

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
  const [lat, setLat] = useState(''), [lng, setLng] = useState('');
  const [nameConsent, setNameConsent] = useState(false), [reporterName, setReporterName] = useState(preferredName);
  const [condition, setCondition] = useState<RoadCondition | null | undefined>(), [conditionValid, setConditionValid] = useState(true);
  const requestId = useRef(crypto.randomUUID()), heading = useRef<HTMLHeadingElement>(null);
  const locationOwner = useRef({ active: true, request: 0, location, step });
  locationOwner.current.location = location; locationOwner.current.step = step;
  useEffect(() => { locationOwner.current.active = true; return () => { locationOwner.current.active = false; locationOwner.current.request++; }; }, []);
  const dirty = Boolean(title || description || address || files.length || location);
  useEffect(() => { onPicking(step === 0); if (autoFocus || step > 0) heading.current?.focus(); return () => onPicking(false); }, [step, onPicking]);
  useEffect(() => { if (location) { setLat(location.lat.toFixed(6)); setLng(location.lng.toFixed(6)); } }, [location]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty || busy) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);
  function close() { if (!busy && (!dirty || confirm(`Isian belum dikirim. Buang isian${backLabel === 'Kembali ke peta' ? ' dan kembali ke peta' : ''}?`))) { locationOwner.current.active = false; locationOwner.current.request++; onClose(); } }
  function coordinates() {
    locationOwner.current.request++;
    const point = { lat: Number(lat), lng: Number(lng) };
    if (!lat.trim() || !lng.trim() || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || point.lat < -6.5 || point.lat > -5.2 || point.lng < 106.3 || point.lng > 107.1) {
      setError('Pilih titik di sekitar Jakarta atau periksa koordinat.'); return false;
    }
    onLocation(point); setError(''); return true;
  }
  function locate() {
    if (!navigator.geolocation) { setError('Lokasi perangkat tidak tersedia. Pilih titik pada peta.'); return; }
    const request = ++locationOwner.current.request, requestedLocation = location;
    const owned = () => locationOwner.current.active && locationOwner.current.request === request && locationOwner.current.step === 0 && locationOwner.current.location === requestedLocation;
    navigator.geolocation.getCurrentPosition(position => {
      if (!owned()) return;
      const point = { lng: position.coords.longitude, lat: position.coords.latitude };
      if (point.lng < 106.3 || point.lng > 107.1 || point.lat < -6.5 || point.lat > -5.2) { setError('Lokasi perangkat berada di luar area awal Jakarta. Pilih titik kejadian pada peta.'); return; }
      onLocation(point); setError('');
    }, () => { if (owned()) setError('Lokasi tidak diperoleh. Pilih titik pada peta atau isi koordinat.'); }, { timeout: 10_000 });
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!writeAvailable) return; setError('');
    if (step === 0) { if (coordinates()) setStep(1); return; }
    if (!conditionValid) { setError('Periksa kondisi, waktu, dimensi, dan konfirmasi lokasi.'); return; }
    if (step === 1) { setStep(2); return; }
    if (!location || !consent || busy) return;
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
      <p className="lj-eyebrow">LAPORAN WARGA · LAPORJALAN</p><h2 ref={heading} tabIndex={-1}>Tambah laporan</h2>
      <ol className="lj-steps" aria-label="Langkah laporan">{['Lokasi', 'Kondisi', 'Tinjau'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
      <form className="lj-form" onSubmit={submit}>
        {!writeAvailable && <p role="status">Pengiriman laporan belum tersedia. Isian tetap disimpan.</p>}
        <fieldset disabled={busy || !writeAvailable}>
          {step === 0 && <>
            <h3>Tentukan lokasi kejadian</h3><p>Klik peta untuk menaruh pin, atau isi koordinat. Lokasi perangkat hanya digunakan setelah tombol dipilih.</p>
            <button className="lj-secondary" type="button" onClick={locate}><LocateFixed size={17} /> Gunakan lokasi perangkat</button>
            <div className="lj-coordinate-fields"><label>Lintang<input inputMode="decimal" required value={lat} onChange={event => { locationOwner.current.request++; setLat(event.target.value); }} placeholder="Contoh: -6.20" /></label>
              <label>Bujur<input inputMode="decimal" required value={lng} onChange={event => { locationOwner.current.request++; setLng(event.target.value); }} placeholder="Contoh: 106.84" /></label></div>
            <button type="button" className="lj-text-action" onClick={coordinates}>Perbarui pin dari koordinat</button>
            <label>Alamat atau patokan <span>(opsional)</span><input value={address} maxLength={300} onChange={event => setAddress(event.target.value)} placeholder="Nama jalan, persimpangan, atau bangunan terdekat" /></label>
          </>}
          {step === 1 && <>
            <label htmlFor="report-category">Kategori</label><select id="report-category" value={category} onChange={event => setCategory(event.target.value as ReportCategory)}>{Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
            <label>Judul laporan<input value={title} required minLength={5} maxLength={120} onChange={event => setTitle(event.target.value)} placeholder="Ringkas masalah yang terlihat" /></label>
            <label>Uraian kejadian<textarea value={description} required minLength={10} maxLength={4000} rows={5} onChange={event => setDescription(event.target.value)} placeholder="Jelaskan kondisi, waktu pengamatan, dan bagian jalan yang terdampak." /></label>
            <MediaPicker files={files} onChange={setFiles} />
          </>}
          <div hidden={step !== 1}><ConditionFields category={category} location={location} disabled={step !== 1 || busy || !writeAvailable} onDrawGeometry={onDrawGeometry} onGeometryPreview={onGeometryPreview} onChange={(value, valid) => { setCondition(value); setConditionValid(valid); requestId.current = crypto.randomUUID(); }} /></div>
          {step === 2 && <>
            <h3>Periksa sebelum mengirim</h3><div className="lj-review"><strong>{title}</strong><p>{description}</p><dl>
              <dt>Kategori</dt><dd>{CATEGORY_LABELS[category]}</dd><dt>Lokasi</dt><dd>{location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}</dd>
              <dt>Patokan</dt><dd>{address || 'Tidak diisi'}</dd><dt>Lampiran</dt><dd>{files.length ? files.map(file => file.name).join(', ') : 'Tanpa lampiran'}</dd>
            </dl></div>
            {condition && <ConditionSummary condition={condition} />}
            <p className="lj-form-note">Laporan tersimpan di LaporJalan. Belum dikirim ke kanal pemerintah. Status dan pembaruan merupakan pengamatan pelapor.</p>
            <label className="lj-checkbox"><input type="checkbox" checked={nameConsent} onChange={event => setNameConsent(event.target.checked)} />Tampilkan nama pada laporan ini.</label>
            {nameConsent && <label>Nama tampilan<input required maxLength={40} value={reporterName} onChange={event => setReporterName(event.target.value)} /></label>}
            <p className="lj-name-preview">Ditampilkan sebagai: <strong>{nameConsent ? reporterName.trim() || 'Pelapor' : 'Pelapor'}</strong>. Email tetap privat.</p>
            <label className="lj-checkbox"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} />Lokasi, isi, dan lampiran boleh ditampilkan kepada publik. Lampiran telah diperiksa agar tidak memuat data pribadi.</label>
          </>}
        </fieldset>
        {error && <p className="lj-form-error" role="alert">{error}</p>}
        <div className="lj-form-actions">{step > 0 && <button type="button" className="lj-secondary" disabled={busy} onClick={() => { setStep(value => value - 1); setError(''); }}>Sebelumnya</button>}
          <button className="lj-primary" disabled={busy || !writeAvailable}>{busy ? 'Menyimpan laporan…' : step === 2 ? 'Kirim laporan' : 'Lanjutkan'}</button></div>
      </form>
    </div>
  </div>;
}
