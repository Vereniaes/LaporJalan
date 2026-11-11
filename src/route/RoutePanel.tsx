/* Todo:
-> the Rute tab (owner, 11 Nov): from A to B, the road reports on the way and the arrival time
    -> Google's terms: a Google route is drawn only on a Google map, so this tab switches the map to Google Maps
    -> from: "Lokasi saya" unless a place is typed; to: a place from Google's suggestions; Mobil or Motor
    -> the answer: arrival time, minutes with traffic and how much traffic adds, distance, the reports met on the way in order
    -> without a key (VITE_GOOGLE_MAPS_API_KEY): say so, and offer the same trip in Google Maps
*/
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Bike, Car, ChevronRight, ExternalLink, LocateFixed, MapPinned, Navigation, Search } from 'lucide-react';
import { CATEGORY_LABELS } from '../public-reports/community';
import type { PublicReport } from '../public-reports/data';
import { statusClass } from '../public-reports/statusTone';
import { GOOGLE_KEY, arrival, kilometres, mapsLink, minutes, newSessionToken, suggestPlaces, type PlaceSuggestion, type Waypoint } from './google';
import type { RoutePlanner } from './useRoutePlanner';

export { GOOGLE_KEY, mapsLink };

export function RoutePanel({ planner, onOpen }: { planner?: RoutePlanner; onOpen?: (report: PublicReport) => void }) {
  return <div className="lj-route">
    <h1 className="lj-route-title">Rute</h1>
    <p className="lj-route-lead">Lihat laporan jalan rusak di jalur perjalanan dan perkiraan waktu tiba.</p>
    {GOOGLE_KEY && planner ? <Planner planner={planner} onOpen={onOpen} /> : <NoKey />}
  </div>;
}

function NoKey() {
  const [destination, setDestination] = useState('');
  return <div className="lj-route-off" role="status">
    <img src="/home/miko/pin-512.webp" width="64" height="64" alt="" loading="lazy" decoding="async" />
    <p><strong>Rute belum tersedia di sini.</strong><span>Sementara itu, tujuan dapat dibuka di Google Maps.</span></p>
    <label htmlFor="route-destination-link">Tujuan</label>
    <div className="lj-route-link-row">
      <MapPinned size={18} aria-hidden="true" />
      <input id="route-destination-link" value={destination} placeholder="Nama tempat atau alamat" onChange={event => setDestination(event.target.value)} />
    </div>
    <a className={`lj-primary${destination.trim() ? '' : ' is-disabled'}`} aria-disabled={!destination.trim()} href={destination.trim() ? mapsLink('', destination.trim(), 'driving') : undefined} target="_blank" rel="noreferrer">
      Buka di Google Maps <ExternalLink size={16} aria-hidden="true" /></a>
  </div>;
}

function Planner({ planner, onOpen }: { planner: RoutePlanner; onOpen?: (report: PublicReport) => void }) {
  const { route, routes, chosen, onRoute, status, error, mode } = planner;
  const busy = status === 'locating' || status === 'routing';
  const delay = route ? route.seconds - route.freeSeconds : 0;
  const counts = onRoute.reduce<Record<string, number>>((all, item) => ({ ...all, [item.report.category]: (all[item.report.category] ?? 0) + 1 }), {});
  return <>
    <form className="lj-route-form" onSubmit={event => { event.preventDefault(); void planner.search(); }}>
      <PlaceField label="Dari" placeholder="Lokasi saya" icon={<LocateFixed size={17} aria-hidden="true" />} value={planner.origin} onChange={planner.setOrigin} />
      <PlaceField label="Ke" placeholder="Cari tujuan" icon={<MapPinned size={17} aria-hidden="true" />} value={planner.destination} onChange={planner.setDestination} />
      <div className="lj-route-modes" role="group" aria-label="Kendaraan">
        <button type="button" aria-pressed={mode === 'DRIVE'} onClick={() => planner.setMode('DRIVE')}><Car size={17} aria-hidden="true" /> Mobil</button>
        <button type="button" aria-pressed={mode === 'TWO_WHEELER'} onClick={() => planner.setMode('TWO_WHEELER')}><Bike size={17} aria-hidden="true" /> Motor</button>
      </div>
      {mode === 'TWO_WHEELER' && <p className="lj-route-note">Rute motor dari Google masih tahap uji coba.</p>}
      <button className="lj-primary lj-route-go" disabled={busy || !planner.destination}><Navigation size={17} aria-hidden="true" />
        {status === 'locating' ? 'Membaca lokasi…' : status === 'routing' ? 'Menghitung rute…' : 'Cari rute'}</button>
    </form>

    {status === 'error' && <p className="lj-route-error" role="alert">{error}</p>}

    {route && status === 'done' && <section className="lj-route-result" aria-labelledby="t-route-eta" aria-live="polite">
      {routes.length > 1 && <div className="lj-route-options" role="radiogroup" aria-label="Pilihan rute">
        {routes.map((option, index) => <button key={index} role="radio" aria-checked={index === chosen} onClick={() => planner.choose(index)}>
          <strong>{minutes(option.seconds)}</strong><span>{kilometres(option.metres)}{option.label && !/^Rute \d/.test(option.label) ? ` · via ${option.label}` : ''}</span>
        </button>)}
      </div>}
      <div className="lj-route-eta">
        <h2 id="t-route-eta">Tiba {arrival(route.seconds, planner.askedAt)}</h2>
        <p><strong>{minutes(route.seconds)}</strong> · {kilometres(route.metres)}</p>
        <p className={delay >= 60 ? 'is-slow' : 'is-clear'}>{delay >= 60 ? `+${minutes(delay)} karena lalu lintas` : 'Lalu lintas lancar'}</p>
      </div>

      <div className="lj-route-reports">
        <h3>{onRoute.length ? `${onRoute.length} laporan di rute ini` : 'Tidak ada laporan di rute ini'}</h3>
        {onRoute.length > 0 && <p className="lj-route-counts">{Object.entries(counts).map(([category, count]) => `${count} ${CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]?.toLowerCase() ?? category}`).join(', ')}</p>}
        {onRoute.length ? <ol>{onRoute.map(({ report, along }) => <li key={report.id}>
          <button className="lj-route-report" aria-pressed={planner.focus === report.id} onClick={() => planner.setFocus(report.id)}>
            <span className="lj-route-along">{kilometres(along)}</span>
            <span className="lj-feed-copy"><strong>{report.title ?? report.code}</strong><span className={statusClass(report.sourceStatus)}>{report.sourceStatus ?? 'Belum ada status'}</span></span>
          </button>
          {planner.focus === report.id && onOpen && <button className="lj-text-action lj-route-open" onClick={() => onOpen(report)}>Lihat detail laporan <ChevronRight size={14} aria-hidden="true" /></button>}
        </li>)}</ol>
          : <p className="lj-route-empty"><img src="/home/miko/look-192.webp" width="48" height="48" alt="" loading="lazy" />Belum ada laporan jalan rusak dalam 60 m dari rute ini.</p>}
      </div>
      <p className="lj-route-source">Rute dan waktu tempuh dari Google, mengikuti lalu lintas saat ini.</p>
    </section>}
  </>;
}

// --- a place field with Google's suggestions (combobox) ---
function PlaceField({ label, placeholder, icon, value, onChange }: { label: string; placeholder: string; icon: ReactNode; value: Waypoint | null; onChange: (value: Waypoint | null) => void }) {
  const id = useId(), [text, setText] = useState(value?.label ?? ''), [items, setItems] = useState<PlaceSuggestion[]>([]), [active, setActive] = useState(-1), [open, setOpen] = useState(false);
  const token = useRef(newSessionToken());
  useEffect(() => { setText(value?.label ?? ''); }, [value?.label]);
  useEffect(() => {
    const term = text.trim();
    if (!open || term.length < 3 || term === value?.label) { setItems([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => { suggestPlaces(term, token.current, undefined, controller.signal).then(found => { setItems(found); setActive(-1); }).catch(() => setItems([])); }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [text, open]);
  const pick = (item: PlaceSuggestion) => { onChange({ placeId: item.placeId, label: item.main }); setText(item.main); setItems([]); setOpen(false); token.current = newSessionToken(); };
  const expanded = open && items.length > 0;
  return <div className="lj-place">
    <label htmlFor={`${id}-input`}>{label}</label>
    <div className="lj-route-link-row">
      {icon}
      <input id={`${id}-input`} role="combobox" aria-expanded={expanded} aria-controls={`${id}-list`} aria-autocomplete="list" autoComplete="off"
        aria-activedescendant={expanded && active >= 0 ? `${id}-${active}` : undefined}
        value={text} placeholder={placeholder}
        onChange={event => { setText(event.target.value); setOpen(true); if (value) onChange(null); }}
        onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={event => {
          if (!expanded) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive(current => (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length); }
          else if (event.key === 'Enter' && active >= 0) { event.preventDefault(); pick(items[active]); }
          else if (event.key === 'Escape') setOpen(false);
        }} />
      {!text && <Search size={16} aria-hidden="true" className="lj-place-hint" />}
    </div>
    <ul id={`${id}-list`} role="listbox" aria-label={`Saran ${label.toLowerCase()}`} className="lj-place-list" hidden={!expanded}>
      {items.map((item, index) => <li key={item.placeId} id={`${id}-${index}`} role="option" aria-selected={index === active}
        onMouseDown={event => { event.preventDefault(); pick(item); }}><strong>{item.main}</strong>{item.secondary && <span>{item.secondary}</span>}</li>)}
    </ul>
  </div>;
}
// --- end of place field ---
