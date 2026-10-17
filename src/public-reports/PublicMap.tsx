/* Keep public report points and the list on the same 2D map.
Todo:
-> group nearby points and restore the view after closing a report
*/
import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as LibreMap, Marker } from 'maplibre-gl';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapArea, PublicReport } from './data';
import { cameraPose, NavigationMode } from '../map/camera';

interface Props {
  reports: PublicReport[];
  selected: PublicReport | null;
  onSelect: (report: PublicReport) => void;
  onArea: (area: MapArea) => void;
}
const duration = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350;

export function PublicMap({ reports, selected, onSelect, onArea }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LibreMap>();
  const markers = useRef<Marker[]>([]);
  const [mode, setMode] = useState<NavigationMode>('2d');
  const appliedMode = useRef<NavigationMode>('2d');
  const props = useRef({ reports, selected, onSelect, mode });
  props.current = { reports, selected, onSelect, mode };
  const previousView = useRef<{ center: [number, number]; zoom: number }>();
  const fitted = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [moved, setMoved] = useState(false);

  // map markers (group nearby visible points; selected reports remain separate) --------------------------
  // input param : current map projection and filtered reports
  // output : buttons for points and groups; same IDs as the report list
  function drawMarkers() {
    const instance = map.current;
    if (!instance) return;
    markers.current.forEach(marker => marker.remove());
    const groups = new Map<string, PublicReport[]>();
    const { reports: rows, selected: active } = props.current;
    for (const row of rows) {
      const point = instance.project([row.lng, row.lat]);
      if (point.x < -44 || point.y < -44 || point.x > instance.getContainer().clientWidth + 44 ||
        point.y > instance.getContainer().clientHeight + 44) continue;
      const key = active?.id === row.id ? `selected:${row.id}` : `${Math.floor(point.x / 52)},${Math.floor(point.y / 52)}`;
      groups.set(key, [...(groups.get(key) ?? []), row]);
    }
    markers.current = [...groups.values()].map(group => {
      const row = group[0];
      const isGroup = group.length > 1;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `lj-marker${isGroup ? ' is-cluster' : ''}${active?.id === row.id ? ' is-selected' : ''}`;
      button.dataset.reportIds = group.map(item => item.id).join(',');
      button.innerHTML = isGroup ? `<span>${group.length}</span>` : '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 4-2 16M16 4l2 16M12 5v3m0 3v3m0 3v2"/></svg></span>';
      button.onclick = () => {
        if (isGroup) instance.easeTo({ center: [row.lng, row.lat], zoom: Math.min(instance.getZoom() + 2, 19), duration: duration() });
        else props.current.onSelect(row);
      };
      const marker = new maplibregl.Marker({ element: button }).setLngLat([row.lng, row.lat]).addTo(instance);
      button.setAttribute('aria-label', isGroup ? `Perbesar ${group.length} laporan` : `Buka laporan ${row.code}`);
      return marker;
    });
  }
  // end of helper ---------------------------------------------------------------------------------------

  function fitReports() {
    const instance = map.current;
    if (!instance || !props.current.reports.length) return;
    const bounds = new maplibregl.LngLatBounds();
    props.current.reports.forEach(row => bounds.extend([row.lng, row.lat]));
    instance.fitBounds(bounds, { padding: 65, maxZoom: 15, duration: duration(), ...cameraPose(props.current.mode, instance.getBearing()) });
  }

  useEffect(() => {
    if (!container.current) return;
    let instance: LibreMap;
    let disposed = false;
    try {
      instance = new maplibregl.Map({ container: container.current, style: 'https://tiles.openfreemap.org/styles/positron',
        center: [106.8456, -6.2088], zoom: 11, pitch: 0, bearing: 0, maxPitch: 0, maxZoom: 19,
        dragRotate: false, pitchWithRotate: false, touchPitch: false, attributionControl: false });
    } catch {
      setFailed(true);
      return;
    }
    map.current = instance;
    instance.touchZoomRotate.disableRotation();
    instance.keyboard.disableRotation();
    instance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    const timeout = window.setTimeout(() => { if (!disposed && !instance.isStyleLoaded()) setFailed(true); }, 15_000);
    instance.on('load', () => {
      window.clearTimeout(timeout);
      if (instance.getSource('openmaptiles')) {
        const label = instance.getStyle().layers.find(layer => layer.type === 'symbol')?.id;
        instance.addLayer({ id: 'public-buildings-3d', type: 'fill-extrusion', source: 'openmaptiles',
          'source-layer': 'building', minzoom: 14.5,
          filter: ['all', ['!=', ['get', 'hide_3d'], true], ['has', 'render_height']],
          layout: { visibility: 'none' },
          paint: { 'fill-extrusion-color': '#cbd3cc', 'fill-extrusion-opacity': 0.9,
            'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14.5, 0, 15.5, ['max', 0, ['to-number', ['get', 'render_height'], 0]]],
            'fill-extrusion-base': ['max', 0, ['to-number', ['get', 'render_min_height'], 0]],
            'fill-extrusion-vertical-gradient': true },
        }, label);
      }
      setReady(true); setFailed(false); drawMarkers();
    });
    instance.on('error', () => setFailed(true));
    instance.on('moveend', () => { drawMarkers(); setMoved(true); });
    const observer = new ResizeObserver(() => {
      instance.resize();
      const active = props.current.selected;
      if (active) instance.jumpTo({ center: [active.lng, active.lat] });
      drawMarkers();
    });
    observer.observe(container.current);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      observer.disconnect();
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      instance.remove();
      map.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (reports.length && !fitted.current) { fitted.current = true; fitReports(); }
    drawMarkers();
  }, [reports, ready]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready) return;
    if (appliedMode.current !== mode) instance.stop();
    appliedMode.current = mode;
    instance.setMaxPitch(mode === '3d' ? 60 : 0);
    if (mode === '3d') {
      instance.dragRotate.enable();
      instance.touchZoomRotate.enableRotation();
      instance.touchPitch.enable();
      instance.keyboard.enableRotation();
    } else {
      instance.dragRotate.disable();
      instance.touchZoomRotate.disableRotation();
      instance.touchPitch.disable();
      instance.keyboard.disableRotation();
    }
    if (instance.getLayer('public-buildings-3d')) instance.setLayoutProperty('public-buildings-3d', 'visibility', mode === '3d' ? 'visible' : 'none');
    if (mode === '2d' && instance.getPitch() === 0 && instance.getBearing() === 0) return;
    instance.stop();
    instance.easeTo({ ...cameraPose(mode, instance.getBearing()),
      ...(mode === '3d' ? { zoom: Math.max(instance.getZoom(), 15.5) } : {}), duration: duration() });
  }, [mode, ready]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready) return;
    if (selected) {
      if (!previousView.current) previousView.current = { center: instance.getCenter().toArray() as [number, number], zoom: instance.getZoom() };
      instance.easeTo({ center: [selected.lng, selected.lat], zoom: Math.max(instance.getZoom(), props.current.mode === '3d' ? 15.5 : 15),
        ...cameraPose(props.current.mode, instance.getBearing()), duration: duration() });
    } else if (previousView.current) {
      instance.stop();
      instance.jumpTo(previousView.current);
      previousView.current = undefined;
    }
    drawMarkers();
  }, [selected?.id, ready]);

  return <section className="lj-map" aria-label="Peta laporan">
    <div ref={container} className="lj-map-canvas" />
    {failed && <div className="lj-map-notice" role="status">Peta belum tersedia sepenuhnya. Daftar laporan tetap dapat digunakan.</div>}
    {!failed && !ready && <div className="lj-map-notice" role="status">Memuat peta…</div>}
    {ready && <>
      {moved && !selected && <button className="lj-area-button" onClick={() => {
        const bounds = map.current!.getBounds();
        onArea({ west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() });
        setMoved(false);
      }}>Cari di area ini</button>}
      <div className="lj-map-tools" aria-label="Kontrol peta">
        <button className="lj-mode-toggle" aria-label="Mode 3D" aria-pressed={mode === '3d'}
          title={mode === '3d' ? 'Kembali ke peta 2D' : 'Lihat peta 3D'} onClick={() => setMode(current => current === '2d' ? '3d' : '2d')}>
          {mode === '3d' ? '2D' : '3D'}
        </button>
        <button aria-label="Perbesar peta" onClick={() => map.current?.zoomIn({ duration: duration() })}><Plus size={20} /></button>
        <button aria-label="Perkecil peta" onClick={() => map.current?.zoomOut({ duration: duration() })}><Minus size={20} /></button>
        <button aria-label="Tampilkan semua hasil pada peta" disabled={!reports.length} onClick={fitReports}><LocateFixed size={20} /></button>
      </div>
      <div className="lj-map-key"><span className="lj-key-dot" /> {mode === '3d' ? '3D · tinggi bangunan menurut sumber peta' : 'Laporan kategori Jalan'}</div>
    </>}
  </section>;
}
