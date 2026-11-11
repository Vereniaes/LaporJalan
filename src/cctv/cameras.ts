/* Todo:
-> Opal CCTV (owner, 11 Nov): Jakarta's public traffic cameras, curated once into public/data/cctv-jakarta.json
    -> source: CCTV Publik Pemprov DKI Jakarta (jakcctv.jakarta.go.id/publik), streams served by Bali Tower
    -> played straight from the owner's server: no proxy, no recording, no frame capture
    -> map points are estimates from the camera names (flagged approx), the card says so
*/
import { useEffect, useState } from 'react';

export interface CctvStream { id: string; label: string; operator: string; hls: string; embed: string }
export interface CctvLocation { id: string; name: string; lat: number; lng: number; approx: boolean; streams: CctvStream[] }
export interface CctvSource { name: string; url: string; host: string; curatedAt: string; note: string }
export interface CctvData { source: CctvSource; locations: CctvLocation[] }

const https = (value: unknown) => typeof value === 'string' && value.startsWith('https://');
const inJakarta = (lat: unknown, lng: unknown) => typeof lat === 'number' && typeof lng === 'number' && lat > -6.45 && lat < -6.05 && lng > 106.6 && lng < 107.05;

// input param : the parsed file
// output      : only well-formed locations with at least one https stream; anything else is dropped
export function parseCameras(raw: any): CctvData | null {
  if (!raw || !raw.source || !Array.isArray(raw.locations)) return null;
  const locations: CctvLocation[] = raw.locations.flatMap((row: any) => {
    if (typeof row?.id !== 'string' || typeof row.name !== 'string' || !inJakarta(row.lat, row.lng) || !Array.isArray(row.streams)) return [];
    const streams = row.streams.filter((s: any) => typeof s?.id === 'string' && typeof s.label === 'string' && https(s.hls))
      .map((s: any) => ({ id: s.id, label: s.label, operator: String(s.operator ?? raw.source.name), hls: s.hls, embed: https(s.embed) ? s.embed : raw.source.url }));
    return streams.length ? [{ id: row.id, name: row.name, lat: row.lat, lng: row.lng, approx: row.approx !== false, streams }] : [];
  });
  return { source: raw.source, locations };
}

export const NO_CAMERAS: CctvLocation[] = [];

// loaded only once Opal CCTV is switched on, then kept for the visit
let cache: Promise<CctvData | null> | undefined;
export function loadCameras() {
  cache ??= fetch('/data/cctv-jakarta.json').then(res => res.ok ? res.json() : null).then(parseCameras).catch(() => { cache = undefined; return null; });
  return cache;
}
export function useCameras(enabled: boolean) {
  const [data, setData] = useState<CctvData | null>(null), [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled || data) return;
    let live = true;
    loadCameras().then(result => { if (!live) return; result ? setData(result) : setFailed(true); });
    return () => { live = false; };
  }, [enabled, data]);
  return { data, failed, loading: enabled && !data && !failed };
}

// the camera marker: a lens glyph on a dark round button, a count when one place has several cameras
export function cameraButton(location: CctvLocation, active: boolean) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `lj-cam-marker${active ? ' is-active' : ''}`;
  button.dataset.cameraId = location.id;
  button.innerHTML = `<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h12v10H3zM15 10l6-3v10l-6-3"/></svg></span>${location.streams.length > 1 ? `<b>${location.streams.length}</b>` : ''}`;
  button.setAttribute('aria-label', `Tonton CCTV ${location.name}, ${location.streams.length} kamera`);
  button.setAttribute('aria-pressed', String(active));
  return button;
}
