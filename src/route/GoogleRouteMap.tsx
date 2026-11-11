/* Todo:
-> the map of the Rute tab: Google Maps (Google's terms: a Google route only on a Google map)
    -> the routes as lines (the chosen one in the brand green, the others grey and clickable), A and B at the ends
    -> the reports on the chosen route as the same pins as the main map; a pin or a list row focuses the report
    -> loaded only here, once; if Google fails to load, the panel still works and says so
*/
import { useEffect, useRef, useState } from 'react';
import { pinButton } from '../map/markers';
import { GOOGLE_MAP_ID, JAKARTA, loadGoogleMaps, type Gmaps } from './google';
import type { RoutePlanner } from './useRoutePlanner';

const GREEN = '#0E7A4B', GREY = '#8A949B';

export function GoogleRouteMap({ planner }: { planner: RoutePlanner }) {
  const container = useRef<HTMLDivElement>(null);
  const [maps, setMaps] = useState<Gmaps>(), [failed, setFailed] = useState(false);
  const map = useRef<any>(), lines = useRef<any[]>([]), pins = useRef<any[]>([]);
  const plannerRef = useRef(planner); plannerRef.current = planner;
  const fit = useRef(() => {});

  useEffect(() => {
    let live = true;
    loadGoogleMaps().then(async google => {
      if (!live || !container.current) return;
      await google.importLibrary?.('marker');
      map.current = new google.Map(container.current, { center: JAKARTA, zoom: 12, mapId: GOOGLE_MAP_ID, disableDefaultUI: true, zoomControl: true,
        gestureHandling: 'greedy', clickableIcons: false });
      setMaps(google);
    }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, []);

  // --- the routes ---
  const { routes, chosen } = planner;
  useEffect(() => {
    if (!maps || !map.current) return;
    lines.current.forEach(line => line.setMap(null));
    lines.current = routes.map((route, index) => {
      const line = new maps.Polyline({ map: map.current, path: route.path.map(([lng, lat]) => ({ lat, lng })), clickable: index !== chosen,
        strokeColor: index === chosen ? GREEN : GREY, strokeOpacity: index === chosen ? 1 : .75, strokeWeight: index === chosen ? 7 : 5, zIndex: index === chosen ? 2 : 1 });
      if (index !== chosen) line.addListener('click', () => plannerRef.current.choose(index));
      return line;
    });
    fit.current();
  }, [maps, routes, chosen]);
  // the map area changes size (the phone sheet opens or closes): frame the route again
  fit.current = () => {
    const route = routes[chosen];
    if (!maps || !map.current || !route) return;
    const bounds = new maps.LatLngBounds();
    route.path.forEach(([lng, lat]) => bounds.extend({ lat, lng }));
    map.current.fitBounds(bounds, matchMedia('(max-width: 800px)').matches ? 32 : 72);
  };
  useEffect(() => {
    const element = container.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    let frame = 0, last = '';
    const observer = new ResizeObserver(([entry]) => {
      const size = `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`;
      if (size === last) return;
      last = size; cancelAnimationFrame(frame); frame = requestAnimationFrame(() => fit.current());
    });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  // --- A, B and the reports on the way ---
  const { onRoute, focus } = planner;
  useEffect(() => {
    const Marker = maps?.marker?.AdvancedMarkerElement;
    if (!Marker || !map.current) return;
    pins.current.forEach(pin => { pin.map = null; });
    const route = routes[chosen];
    if (!route) { pins.current = []; return; }
    const end = (letter: string, [lng, lat]: [number, number]) => {
      const element = document.createElement('span');
      element.className = 'lj-route-end'; element.textContent = letter; element.setAttribute('aria-hidden', 'true');
      return new Marker({ map: map.current, position: { lat, lng }, content: element, zIndex: 3 });
    };
    pins.current = [end('A', route.path[0]), end('B', route.path[route.path.length - 1]), ...onRoute.map(({ report }) => {
      const button = pinButton([report], focus === report.id, false), label = button.getAttribute('aria-label')!;
      button.setAttribute('aria-label', label.replace('Buka laporan', 'Sorot laporan'));
      button.addEventListener('click', () => plannerRef.current.setFocus(report.id));
      return new Marker({ map: map.current, position: { lat: report.lat, lng: report.lng }, content: button, zIndex: focus === report.id ? 4 : 1 });
    })];
  }, [maps, routes, chosen, onRoute, focus]);

  useEffect(() => {
    const report = onRoute.find(item => item.report.id === focus)?.report;
    if (report && map.current) map.current.panTo({ lat: report.lat, lng: report.lng });
  }, [focus]);

  return <section className="lj-map lj-google-map" aria-label="Peta rute (Google Maps)">
    <div ref={container} className="lj-map-canvas" />
    {!maps && !failed && <div className="lj-map-notice" role="status">Memuat peta Google…</div>}
    {failed && <div className="lj-map-notice" role="status">Peta Google belum dapat dimuat. Periksa koneksi lalu buka tab Rute lagi.</div>}
  </section>;
}
