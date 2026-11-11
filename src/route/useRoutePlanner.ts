/* Todo:
-> one trip, shared by the Rute panel and the Google map: from, to, mode, the routes, the chosen one, the reports on it
    -> an empty "from" means "my location" (asked from the device only when the route is requested)
*/
import { useMemo, useRef, useState } from 'react';
import type { PublicReport } from '../public-reports/data';
import { computeRoutes, reportsOnRoute, type RouteOption, type TravelMode, type Waypoint } from './google';

export type RouteStatus = 'idle' | 'locating' | 'routing' | 'done' | 'error';

const here = () => new Promise<Waypoint>((resolve, reject) => {
  if (!navigator.geolocation) { reject(new Error('Perangkat tidak memberi lokasi. Isi titik asal.')); return; }
  navigator.geolocation.getCurrentPosition(
    position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude, label: 'Lokasi saya' }),
    error => reject(new Error(error.code === error.PERMISSION_DENIED ? 'Izin lokasi ditolak. Isi titik asal.' : 'Lokasi belum terbaca. Isi titik asal.')),
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 120_000 });
});

export function useRoutePlanner(rows: PublicReport[]) {
  const [origin, setOrigin] = useState<Waypoint | null>(null), [destination, setDestination] = useState<Waypoint | null>(null);
  const [mode, setMode] = useState<TravelMode>('DRIVE'), [status, setStatus] = useState<RouteStatus>('idle'), [error, setError] = useState('');
  const [routes, setRoutes] = useState<RouteOption[]>([]), [chosen, setChosen] = useState(0), [focus, setFocus] = useState<string | null>(null);
  const [askedAt, setAskedAt] = useState(0);
  const request = useRef<AbortController>();

  async function search() {
    if (!destination) { setError('Pilih tujuan dari daftar saran.'); setStatus('error'); return; }
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setError(''); setFocus(null);
    try {
      let from = origin;
      if (!from) { setStatus('locating'); from = await here(); }
      setStatus('routing');
      const found = await computeRoutes(from, destination, mode, controller.signal);
      if (controller.signal.aborted) return;
      setRoutes(found); setChosen(0); setAskedAt(Date.now());
      if (found.length) setStatus('done'); else { setStatus('error'); setError('Google tidak menemukan rute untuk perjalanan ini.'); }
    } catch (problem) {
      if (controller.signal.aborted) return;
      setRoutes([]); setStatus('error'); setError(problem instanceof Error ? problem.message : 'Rute tidak dapat dihitung saat ini.');
    }
  }
  // a changed trip clears the old answer, so a time is never shown for a different trip
  const clear = () => { request.current?.abort(); setRoutes([]); setStatus('idle'); setError(''); setFocus(null); };

  const route = routes[chosen];
  const onRoute = useMemo(() => route ? reportsOnRoute(rows, route.path) : [], [rows, route]);
  return {
    origin, destination, mode, status, error, routes, chosen, route, onRoute, focus, askedAt,
    setOrigin: (value: Waypoint | null) => { setOrigin(value); clear(); },
    setDestination: (value: Waypoint | null) => { setDestination(value); clear(); },
    setMode: (value: TravelMode) => { setMode(value); clear(); },
    choose: (index: number) => { setChosen(index); setFocus(null); },
    setFocus, search,
  };
}
export type RoutePlanner = ReturnType<typeof useRoutePlanner>;
