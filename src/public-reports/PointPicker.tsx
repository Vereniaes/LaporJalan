/* Todo:
-> pick the report point on a small map inside the form (owner, 10 Nov: no Lintang/Bujur fields), then confirm it
    -> the pin stays in the centre and the map moves under it: a finger never covers the point
    -> device location only moves the map; the reporter still confirms
    -> Leaflet + raster tiles: no second WebGL map, so it works on every device
*/
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Check, LocateFixed, MapPin } from 'lucide-react';
import { ATTRIBUTION, TILES } from './LiteMap';
import type { ReportLocation } from './NewReport';

const JAKARTA: ReportLocation = { lat: -6.2088, lng: 106.8456 };
const round = (point: ReportLocation) => ({ lat: Number(point.lat.toFixed(6)), lng: Number(point.lng.toFixed(6)) });
const same = (a: ReportLocation | null, b: ReportLocation) => Boolean(a) && a!.lat.toFixed(6) === b.lat.toFixed(6) && a!.lng.toFixed(6) === b.lng.toFixed(6);
// say why device location failed, by the browser's error code (owner, 10 Nov: "kenapa ga bisa?")
const LOCATION_ERRORS: Record<number, string> = {
  1: 'Izin lokasi ditolak browser. Izinkan lokasi untuk situs ini (ikon di kiri bilah alamat), lalu coba lagi, atau geser peta ke lokasi kejadian.',
  2: 'Perangkat belum bisa menentukan lokasi. Pastikan layanan lokasi di perangkat menyala, atau geser peta ke lokasi kejadian.',
  3: 'Lokasi perangkat terlalu lama didapat. Coba lagi, atau geser peta ke lokasi kejadian.',
};
// anywhere in Indonesia (owner, 10 Nov); the server checks the same box
export const inIndonesia = (point: ReportLocation) => point.lng >= 94.5 && point.lng <= 141.5 && point.lat >= -11.5 && point.lat <= 6.5;

// value: the confirmed point; onConfirm: the reporter confirmed the point under the pin; onPending: true while the map shows an unconfirmed point
export function PointPicker({ value, onConfirm, onPending, disabled = false, invalid = false }: {
  value: ReportLocation | null; onConfirm: (point: ReportLocation) => void; onPending: (pending: boolean) => void; disabled?: boolean; invalid?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null), map = useRef<L.Map>(), quiet = useRef(false), locating = useRef(0);
  const [center, setCenter] = useState(value ?? JAKARTA), [note, setNote] = useState('');
  const confirmed = same(value, center);
  useEffect(() => { onPending(!confirmed); }, [confirmed]);

  // move the map without reading its centre back (pixel rounding would shift the point)
  function show(point: ReportLocation, zoom = 17) {
    setCenter(round(point));
    quiet.current = true; map.current?.setView([point.lat, point.lng], Math.max(zoom, map.current.getZoom()), { animate: false }); quiet.current = false;
  }
  useEffect(() => {
    const instance = L.map(container.current!, { center: [center.lat, center.lng], zoom: value ? 17 : 12, attributionControl: true, keyboard: true });
    instance.attributionControl.setPrefix(false);
    L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(instance);
    instance.on('moveend', () => { if (!quiet.current) { const point = instance.getCenter(); setCenter(round({ lat: point.lat, lng: point.lng })); setNote(''); } });
    map.current = instance;
    const resized = new ResizeObserver(() => instance.invalidateSize()); resized.observe(container.current!);
    return () => { locating.current++; resized.disconnect(); instance.remove(); };
  }, []);
  // a point set elsewhere (the account page's big map) is shown here too
  useEffect(() => { if (value && !same(value, center)) show(value); }, [value]);

  function locate() {
    // browsers only share location on https or localhost (a LAN address like http://192.168.x.x never gets it)
    if (!window.isSecureContext) { setNote('Lokasi perangkat hanya bisa dipakai lewat alamat https. Geser peta ke lokasi kejadian.'); return; }
    if (!navigator.geolocation) { setNote('Browser ini tidak menyediakan lokasi perangkat. Geser peta ke lokasi kejadian.'); return; }
    const request = ++locating.current; setNote('Mencari lokasi perangkat…');
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== locating.current) return;
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      if (!inIndonesia(point)) { setNote('Lokasi perangkat berada di luar Indonesia. Geser peta ke lokasi kejadian.'); return; }
      show(point); setNote('Peta dipindah ke lokasi perangkat. Periksa pin, lalu konfirmasi.');
    }, failure => { if (request === locating.current) setNote(LOCATION_ERRORS[failure.code] ?? LOCATION_ERRORS[2]); }, { timeout: 10_000 });
  }
  function confirm() {
    if (!inIndonesia(center)) { setNote('Pilih titik di wilayah Indonesia.'); return; }
    onConfirm(center); setNote('');
  }

  return <div className="lj-point-picker">
    <div className="lj-point-map">
      <div ref={container} aria-label="Peta pemilih titik. Geser peta sampai pin berada di lokasi kejadian." role="application" />
      <MapPin className="lj-point-pin" size={34} aria-hidden="true" />
    </div>
    <button className="lj-text-action" type="button" onClick={locate} disabled={disabled}><LocateFixed size={16} /> Gunakan lokasi perangkat</button>
    <div className={`lj-point-confirm${confirmed ? ' is-confirmed' : ''}`}>
      <p aria-live="polite"><span>Titik</span> <output>{center.lat.toFixed(6)}, {center.lng.toFixed(6)}</output></p>
      {confirmed ? <strong><Check size={16} aria-hidden="true" /> Titik dikonfirmasi</strong>
        : <button className="lj-secondary" type="button" onClick={confirm} disabled={disabled} aria-invalid={invalid || undefined}>Konfirmasi titik ini</button>}
    </div>
    {note && <p className="lj-point-note" role="status">{note}</p>}
  </div>;
}
