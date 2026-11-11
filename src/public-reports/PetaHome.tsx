/* Todo:
-> the Peta tab (owner, 11 Nov): what is happening now
    -> Opal's greeting with the number of reports from the last 24 hours
    -> feature cards from one table (name, pose, badge, line, action); availability is a word + glyph, never colour alone
    -> "Baru masuk": the newest reports, refreshed quietly every minute by the page
*/
import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Clock, Construction, Flame, Route, Search, Video, Waves } from 'lucide-react';
import type { CctvLocation } from '../cctv/cameras';
import type { PublicReport } from './data';
import { reportDate } from './data';
import { statusClass } from './statusTone';
import { timeAgo } from './timeAgo';
import { MikoMotion } from '../home/MikoMotion';
import { SkeletonRows } from '../components/Skeleton';

// --- feature cards (poses are the existing felt stills; a new pose only changes this table) ---
type Badge = 'live' | 'baru' | 'segera';
const BADGE: Record<Badge, string> = { live: 'Live', baru: 'Baru', segera: 'Segera hadir' };
interface Feature { id: string; name: string; line: string; pose: string; badge: Badge; action?: 'cctv' | 'rute' }
const FEATURES: Feature[] = [
  { id: 'cctv', name: 'Opal CCTV', line: 'Intip kamera lalu lintas Jakarta.', pose: '/home/miko/look-192.webp', badge: 'live', action: 'cctv' },
  { id: 'rute', name: 'Opal Rute', line: 'Cek laporan jalan rusak di jalur perjalananmu.', pose: '/home/miko/pin-512.webp', badge: 'baru', action: 'rute' },
  { id: 'banjir', name: 'Opal Banjir', line: 'Pantau genangan dan tinggi air.', pose: '/home/miko/peek-puddle-512.webp', badge: 'segera' },
  { id: 'lalin', name: 'Opal Lalu Lintas', line: 'Kepadatan jalan di sekitarmu.', pose: '/home/miko/sleep-cone-awake-512.webp', badge: 'segera' },
];
const ICON = { road: Route, construction: Construction, drain: Waves, burning: Flame } as const;
// --- end of feature cards ---

export interface CameraList { places: CctvLocation[] | null; loading: boolean; failed: boolean; active: string | null; onOpen: (location: CctvLocation) => void }

export function PetaHome({ rows, loading, onSelect, onShowAll, onRoute, onCctv, cctvOn, cameras }: {
  rows: PublicReport[]; loading: boolean; onSelect: (report: PublicReport) => void; onShowAll: () => void; onRoute: () => void; onCctv: () => void; cctvOn: boolean; cameras: CameraList;
}) {
  const dayAgo = Date.now() - 24 * 3600_000;
  const today = rows.filter(row => Date.parse(row.createdAt) >= dayAgo).length;
  const latest = rows.slice(0, 8);
  const act = (feature: Feature) => feature.action === 'cctv' ? onCctv() : feature.action === 'rute' ? onRoute() : undefined;
  return <div className="lj-peta-home">
    <div className="lj-greeting">
      <MikoMotion anim="look" className="lj-greeting-opal" src="/home/miko/look-192.webp" />
      <p className="lj-greeting-bubble"><strong>Opal memantau {today.toLocaleString('id-ID')} laporan baru hari ini</strong><span>Dari laporan warga dan data publik.</span></p>
    </div>

    <ul className="lj-features" aria-label="Fitur Opal">
      {FEATURES.map(feature => {
        const body = <>
          <img className="lj-feature-pose" src={feature.pose} width="64" height="64" alt="" loading="lazy" decoding="async" />
          <span className="lj-feature-copy">
            <span className="lj-feature-name">{feature.name}<span className={`lj-badge is-${feature.badge}`}>{feature.badge === 'segera' ? <Clock size={11} aria-hidden="true" /> : <i aria-hidden="true" />}{BADGE[feature.badge]}</span></span>
            <span className="lj-feature-line">{feature.id === 'cctv' && cctvOn ? 'Kamera tampil di peta. Pilih kamera untuk menonton.' : feature.line}</span>
          </span>
          {feature.action && <ChevronRight size={18} className="lj-feature-go" aria-hidden="true" />}
        </>;
        return <li key={feature.id}>{feature.action
          ? <button className="lj-feature" aria-pressed={feature.id === 'cctv' ? cctvOn : undefined} onClick={() => act(feature)}>{body}</button>
          : <div className="lj-feature is-soon" aria-disabled="true">{body}</div>}</li>;
      })}
    </ul>

    {cctvOn && <CameraPicker {...cameras} />}

    <section className="lj-feed" aria-labelledby="t-feed">
      <div className="lj-feed-head"><h2 id="t-feed"><i className="lj-live-dot" aria-hidden="true" />Baru masuk</h2><span>diperbarui tiap menit</span></div>
      {loading && !latest.length ? <SkeletonRows count={4} thumb={false} /> : latest.length ? <ol>{latest.map(report => {
        const Icon = ICON[report.category] ?? Route;
        return <li key={report.id}><button className="lj-feed-row" onClick={() => onSelect(report)}>
          <span className={`lj-feed-icon cat-${report.category}`} aria-hidden="true"><Icon size={18} /></span>
          <span className="lj-feed-copy"><strong>{report.title ?? report.code}</strong>
            <span><time dateTime={report.createdAt} title={reportDate(report.createdAt)}>{timeAgo(report.createdAt)}</time><span className={statusClass(report.sourceStatus)}>{report.sourceStatus ?? 'Belum ada status'}</span></span></span>
        </button></li>;
      })}</ol> : <p className="lj-feed-empty">Belum ada laporan baru.</p>}
      <button className="lj-text-action lj-feed-all" onClick={onShowAll}>Lihat semua laporan <ChevronRight size={14} aria-hidden="true" /></button>
    </section>
  </div>;
}

// --- Opal CCTV: the camera places, searchable by street ---
function CameraPicker({ places, loading, failed, active, onOpen }: CameraList) {
  const [query, setQuery] = useState(''), box = useRef<HTMLElement>(null);
  // switching the layer on brings the list into view under the cards
  useEffect(() => { box.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, []);
  const term = query.trim().toLowerCase();
  const shown = (places ?? []).filter(place => !term || place.name.toLowerCase().includes(term) || place.streams.some(stream => stream.label.toLowerCase().includes(term)));
  return <section ref={box} className="lj-cams" aria-labelledby="t-cams">
    <div className="lj-feed-head"><h2 id="t-cams"><Video size={16} aria-hidden="true" />Kamera Jakarta</h2>{places && <span>{places.reduce((sum, place) => sum + place.streams.length, 0)} kamera · {places.length} lokasi</span>}</div>
    {failed ? <p className="lj-feed-empty" role="status">Daftar kamera belum bisa dimuat.</p>
      : loading || !places ? <SkeletonRows count={3} thumb={false} label="Memuat kamera…" />
      : <>
        <label className="lj-cams-search"><Search size={16} aria-hidden="true" /><span className="lj-visually-hidden">Cari kamera</span>
          <input type="search" value={query} placeholder="Cari nama jalan" onChange={event => setQuery(event.target.value)} /></label>
        {shown.length ? <ol>{shown.map(place => <li key={place.id}><button className="lj-cam-row" aria-pressed={active === place.id} onClick={() => onOpen(place)}>
          <span className="lj-cam-icon" aria-hidden="true"><Video size={17} /></span>
          <span className="lj-feed-copy"><strong>{place.name}</strong><span>{place.streams.length} kamera · {place.streams[0].operator}</span></span>
          <ChevronRight size={16} className="lj-feed-go" aria-hidden="true" />
        </button></li>)}</ol> : <p className="lj-feed-empty">Tidak ada kamera dengan nama itu.</p>}
      </>}
  </section>;
}
