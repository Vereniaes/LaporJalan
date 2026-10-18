/* Report form on the existing map: location, evidence, then review.
Todo:
-> preserve input after failures and confirm public submission
*/
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, LocateFixed } from 'lucide-react';
import { api, CATEGORY_LABELS, CitizenReport, errorMessage } from './community';
import { ReportCategory } from './data';
import { MediaPicker } from './ReportMedia';

export type ReportLocation = { lng: number; lat: number };
export function NewReport({ location, onLocation, onPicking, onClose, onSaved }: {
  location: ReportLocation | null; onLocation: (point: ReportLocation) => void; onPicking: (value: boolean) => void;
  onClose: () => void; onSaved: (report: CitizenReport) => void;
}) {
  const [step, setStep] = useState(0), [category, setCategory] = useState<ReportCategory>('road');
  const [title, setTitle] = useState(''), [description, setDescription] = useState(''), [address, setAddress] = useState('');
  const [files, setFiles] = useState<File[]>([]), [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [lat, setLat] = useState(''), [lng, setLng] = useState('');
  const requestId = useRef(crypto.randomUUID()), heading = useRef<HTMLHeadingElement>(null);
  const dirty = Boolean(title || description || address || files.length || location);
  useEffect(() => { onPicking(step === 0); heading.current?.focus(); return () => onPicking(false); }, [step, onPicking]);
  useEffect(() => { if (location) { setLat(location.lat.toFixed(6)); setLng(location.lng.toFixed(6)); } }, [location]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty || busy) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);
  function close() { if (!busy && (!dirty || confirm('Isian belum dikirim. Buang isian dan kembali ke peta?'))) onClose(); }
  function coordinates() {
    const point = { lat: Number(lat), lng: Number(lng) };
    if (!lat.trim() || !lng.trim() || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || point.lat < -6.5 || point.lat > -5.2 || point.lng < 106.3 || point.lng > 107.1) {
      setError('Pilih titik di sekitar Jakarta atau periksa koordinat.'); return false;
    }
    onLocation(point); setError(''); return true;
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (step === 0) { if (coordinates()) setStep(1); return; }
    if (step === 1) { setStep(2); return; }
    if (!location || !consent || busy) return;
    setBusy(true);
    const body = new FormData();
    Object.entries({ requestId: requestId.current, category, title, description, address,
      lat: String(location.lat), lng: String(location.lng), publicConsent: 'true' }).forEach(([key, value]) => body.set(key, value));
    files.forEach(file => body.append('media', file));
    try { onSaved(await api<CitizenReport>('/reports', { method: 'POST', body })); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className="lj-composer">
    <button className="lj-back" onClick={close} disabled={busy}><ArrowLeft size={18} /> Kembali ke peta</button>
    <div className="lj-composer-body">
      <p className="lj-eyebrow">LAPORAN WARGA · LAPORJALAN</p><h2 ref={heading} tabIndex={-1}>Tambah laporan</h2>
      <ol className="lj-steps" aria-label="Langkah laporan">{['Lokasi', 'Kondisi', 'Tinjau'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
      <form className="lj-form" onSubmit={submit}>
        <fieldset disabled={busy}>
          {step === 0 && <>
            <h3>Tentukan lokasi kejadian</h3><p>Klik peta untuk menaruh pin, atau isi koordinat. Lokasi perangkat hanya digunakan setelah tombol dipilih.</p>
            <button className="lj-secondary" type="button" onClick={() => {
              if (!navigator.geolocation) { setError('Lokasi perangkat tidak tersedia. Pilih titik pada peta.'); return; }
              navigator.geolocation.getCurrentPosition(position => {
                const point = { lng: position.coords.longitude, lat: position.coords.latitude };
                if (point.lng < 106.3 || point.lng > 107.1 || point.lat < -6.5 || point.lat > -5.2) { setError('Lokasi perangkat berada di luar area awal Jakarta. Pilih titik kejadian pada peta.'); return; }
                onLocation(point); setError('');
              }, () => setError('Lokasi tidak diperoleh. Pilih titik pada peta atau isi koordinat.'), { timeout: 10_000 });
            }}><LocateFixed size={17} /> Gunakan lokasi perangkat</button>
            <div className="lj-coordinate-fields"><label>Lintang<input inputMode="decimal" required value={lat} onChange={event => setLat(event.target.value)} placeholder="Contoh: -6.20" /></label>
              <label>Bujur<input inputMode="decimal" required value={lng} onChange={event => setLng(event.target.value)} placeholder="Contoh: 106.84" /></label></div>
            <button type="button" className="lj-text-action" onClick={coordinates}>Perbarui pin dari koordinat</button>
            <label>Alamat atau patokan <span>(opsional)</span><input value={address} maxLength={300} onChange={event => setAddress(event.target.value)} placeholder="Nama jalan, persimpangan, atau bangunan terdekat" /></label>
          </>}
          {step === 1 && <>
            <label htmlFor="report-category">Kategori</label><select id="report-category" value={category} onChange={event => setCategory(event.target.value as ReportCategory)}>{Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
            <label>Judul laporan<input value={title} required minLength={5} maxLength={120} onChange={event => setTitle(event.target.value)} placeholder="Ringkas masalah yang terlihat" /></label>
            <label>Uraian kejadian<textarea value={description} required minLength={10} maxLength={4000} rows={5} onChange={event => setDescription(event.target.value)} placeholder="Jelaskan kondisi, waktu pengamatan, dan bagian jalan yang terdampak." /></label>
            <MediaPicker files={files} onChange={setFiles} />
          </>}
          {step === 2 && <>
            <h3>Periksa sebelum mengirim</h3><div className="lj-review"><strong>{title}</strong><p>{description}</p><dl>
              <dt>Kategori</dt><dd>{CATEGORY_LABELS[category]}</dd><dt>Lokasi</dt><dd>{location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}</dd>
              <dt>Patokan</dt><dd>{address || 'Tidak diisi'}</dd><dt>Lampiran</dt><dd>{files.length ? files.map(file => file.name).join(', ') : 'Tanpa lampiran'}</dd>
            </dl></div>
            <p className="lj-form-note">Laporan tersimpan di LaporJalan. Belum dikirim ke kanal pemerintah. Status dan pembaruan merupakan pengamatan pelapor.</p>
            <label className="lj-checkbox"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} />Lokasi, isi, dan lampiran boleh ditampilkan kepada publik. Tidak ada data pribadi yang disertakan.</label>
          </>}
        </fieldset>
        {error && <p className="lj-form-error" role="alert">{error}</p>}
        <div className="lj-form-actions">{step > 0 && <button type="button" className="lj-secondary" disabled={busy} onClick={() => { setStep(value => value - 1); setError(''); }}>Sebelumnya</button>}
          <button className="lj-primary" disabled={busy}>{busy ? 'Menyimpan laporan…' : step === 2 ? 'Kirim laporan' : 'Lanjutkan'}</button></div>
      </form>
    </div>
  </div>;
}
