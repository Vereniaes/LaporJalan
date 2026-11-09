/* Keep public report points and the list on the same 2D map.
Todo:
-> group nearby points and restore the view after closing a report
*/
import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as LibreMap, Marker, type GeoJSONSource } from 'maplibre-gl';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapArea, PublicReport } from './data';
import type { ReportLocation } from './NewReport';
import { cameraPose, type CameraMode } from '../map/camera';
import { manageCloseZoomLabels } from '../map/closeZoomLabels';
import { addConditionLayers, conditionFootprints, conditionGlyph, emptyFeatures, geometryBounds, selectedConditionFilter } from './conditionFeatures';
import { ConditionLegend } from './ConditionLegend';
import { conditionLabel, closureNeedsUpdate, type ConditionGeometry } from './condition';
import { MapSketch, type DrawingRequest } from './MapSketch';
import { configurePublicCamera, publicCameraSnapshot, usePublicInspection, PUBLIC_MAP_STYLE } from './usePublicInspection';
import './map-inspection.css';

interface Props {
  reports: PublicReport[];
  selected: PublicReport | null;
  onSelect: (report: PublicReport) => void;
  onArea: (area: MapArea) => void;
  picking?: boolean;
  selectionLocked?: boolean;
  draftLocation?: ReportLocation | null;
  onLocation?: (location: ReportLocation) => void;
  drawing?: DrawingRequest|null;
  onDrawingComplete?: (geometry: ConditionGeometry) => void;
  onDrawingCancel?: () => void;
  draftGeometry?: ConditionGeometry|null;
  inspecting?: boolean;
  onExitInspection?: () => void;
  cooperative?: boolean; // landing hero: page scroll stays with the page; pan with two fingers or Ctrl+scroll
  minimal?: boolean;     // landing hero: no tools, area search, key or legend
}
const duration = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350;
const GESTURE_TEXT = {
  'CooperativeGesturesHandler.WindowsHelpText': 'Tekan Ctrl sambil scroll untuk memperbesar peta',
  'CooperativeGesturesHandler.MacHelpText': 'Tekan ⌘ sambil scroll untuk memperbesar peta',
  'CooperativeGesturesHandler.MobileHelpText': 'Gunakan dua jari untuk menggeser peta',
};

// Purpose : open a report where its drawing can be seen
// Input   : map, report, camera mode, animate (false on resize)
// Why/Note: zoom 15 hid small areas and the 8 m point spot under the pin (owner choice, 9 Nov: frame the shape)
function frameSelection(map: LibreMap, report: PublicReport, mode: CameraMode, animate = true) {
  const geometry = report.condition?.geometry, pose = cameraPose(mode, map.getBearing()), ms = animate ? duration() : 0;
  if (geometry && geometry.type !== 'Point') {
    const canvas = map.getCanvas(), side = Math.round(Math.min(80, canvas.clientWidth / 5, canvas.clientHeight / 5));
    // keep the shape above the attribution corner (open until the map is first dragged, 2 lines on narrow phones)
    const container = map.getContainer(), corner = container.querySelector<HTMLElement>('.maplibregl-ctrl-bottom-right');
    const bottom = Math.min(Math.max(side, corner ? container.clientHeight - corner.offsetTop + 8 : 0), canvas.clientHeight - side - 24);
    map.fitBounds(geometryBounds(geometry), { padding: { top: side, right: side, left: side, bottom }, maxZoom: geometry.type === 'Polygon' ? 18.6 : 17.5, ...pose, duration: ms });
  } else map.easeTo({ center: [report.lng, report.lat], zoom: Math.max(map.getZoom(), geometry ? 18.8 : mode === '3d' ? 15.5 : 15), ...pose, duration: ms });
}

export function PublicMap({ reports, selected, onSelect, onArea, picking = false, selectionLocked = false, draftLocation, onLocation, drawing, onDrawingComplete, onDrawingCancel, draftGeometry, inspecting=false, onExitInspection, cooperative = false, minimal = false }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LibreMap>();
  const markers = useRef<Marker[]>([]);
  const draftMarker = useRef<Marker>();
  const [mode, setMode] = useState<CameraMode>('2d');
  const appliedMode = useRef<CameraMode>('2d');
  const props = useRef({ reports, selected, onSelect, mode, picking, onLocation, selectionLocked, drawing });
  props.current = { reports, selected, onSelect, mode, picking, onLocation, selectionLocked, drawing };
  const previousView = useRef<{id:string;pose: ReturnType<typeof publicCameraSnapshot>;mode:CameraMode}>();
  const fitted = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [moved, setMoved] = useState(false);
  const [epoch,setEpoch] = useState(0);
  const inspection=usePublicInspection(map,epoch,selected,inspecting,mode,setMode,onExitInspection);

  // map markers (group nearby visible points; selected reports remain separate) --------------------------
  // input param : current map projection and filtered reports
  // output : buttons for points and groups; same IDs as the report list
  function drawMarkers() {
    const instance = map.current;
    if (!instance) return;
    markers.current.forEach(marker => marker.remove());
    if(props.current.mode==='inspect' || props.current.drawing){markers.current=[];return;}
    // Why/Note: grouped by distance, not 52 px grid cells - pins in neighbouring cells could sit 1 px apart
    //           and their 44 px buttons overlapped (target size). Rule: closer than 44 px on both axes -> join the nearest group
    const groups: { x: number; y: number; selected: boolean; members: PublicReport[] }[] = [];
    const { reports: rows, selected: active } = props.current;
    for (const row of rows) {
      const point = instance.project([row.lng, row.lat]);
      if (point.x < -44 || point.y < -44 || point.x > instance.getContainer().clientWidth + 44 ||
        point.y > instance.getContainer().clientHeight + 44) continue;
      const selected = active?.id === row.id;
      let near: typeof groups[number] | undefined, best = 44;
      if (!selected) for (const group of groups) {
        const gap = Math.max(Math.abs(group.x - point.x), Math.abs(group.y - point.y));
        if (!group.selected && gap < best) { best = gap; near = group; }
      }
      if (near) near.members.push(row); else groups.push({ x: point.x, y: point.y, selected, members: [row] });
    }
    markers.current = groups.map(({ members: group }) => {
      const row = group[0];
      const isGroup = group.length > 1;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `lj-marker${isGroup ? ' is-cluster' : ''}${active?.id === row.id ? ' is-selected' : ''}`;
      button.dataset.reportIds = group.map(item => item.id).join(',');
      const paths = { road: 'm8 4-2 16M16 4l2 16M12 5v3m0 3v3m0 3v2',
        construction: 'M4 8h16v7H4zM7 15v5m10-5v5M7 8l5 7m1-7 5 7',
        drain: 'M3 7c3-4 6 4 9 0s6 4 9 0M3 12c3-4 6 4 9 0s6 4 9 0M3 17c3-4 6 4 9 0s6 4 9 0',
        burning: 'M12 3c1 5 7 5 7 11a7 7 0 0 1-14 0c0-3 2-5 4-7 0 3 1 4 3 5 2-3 1-6 0-9Z' };
      button.innerHTML = isGroup ? `<span>${group.length}</span>` : `<span><svg viewBox="0 0 24 24" aria-hidden="true">${(row.condition && conditionGlyph(row.condition.kind)) ?? `<path d="${paths[row.category] ?? paths.road}"/>`}</svg></span>`;
      button.disabled = props.current.picking || props.current.selectionLocked;
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
      instance = new maplibregl.Map({ container: container.current, style: PUBLIC_MAP_STYLE,
        center: [106.8456, -6.2088], zoom: 11, pitch: 0, bearing: 0, maxPitch: 0, maxZoom: 19,
        dragRotate: false, pitchWithRotate: false, touchPitch: false, attributionControl: false, cooperativeGestures: cooperative, locale: GESTURE_TEXT });
    } catch {
      setFailed(true);
      return;
    }
    map.current = instance;
    instance.touchZoomRotate.disableRotation();
    instance.keyboard.disableRotation();
    instance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    const timeout = window.setTimeout(() => { if (!disposed && !instance.isStyleLoaded()) setFailed(true); }, 15_000);
    instance.on('style.load', () => {
      window.clearTimeout(timeout);
      if (instance.getSource('openmaptiles') && !instance.getLayer('public-buildings-3d')) {
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
      for(const id of ['condition-footprints','condition-symbols']) if(!instance.getSource(id)) instance.addSource(id,{type:'geojson',data:emptyFeatures()});
      const before=instance.getLayer('public-buildings-3d')?'public-buildings-3d':undefined;
      addConditionLayers(instance,before);
      if(!instance.getLayer('condition-symbols-3d')) instance.addLayer({id:'condition-symbols-3d',type:'fill-extrusion',source:'condition-symbols',filter:['!',['has','pattern']],paint:{'fill-extrusion-color':['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-opacity':1}},before);
      if(!instance.getLayer('condition-symbols-3d-pattern')) instance.addLayer({id:'condition-symbols-3d-pattern',type:'fill-extrusion',source:'condition-symbols',filter:['has','pattern'],paint:{'fill-extrusion-pattern':['get','pattern'],'fill-extrusion-height':['get','height'],'fill-extrusion-opacity':1}},before);
      setEpoch(value=>value+1);setReady(true); setFailed(false); drawMarkers();
    });
    instance.on('click', event => { if (props.current.picking && !props.current.drawing) props.current.onLocation?.({ lng: event.lngLat.lng, lat: event.lngLat.lat }); });
    instance.on('error', () => setFailed(true));
    instance.on('moveend', () => { drawMarkers(); setMoved(true); });
    const observer = new ResizeObserver(() => {
      instance.resize();
      const active = props.current.selected;
      if (active && props.current.mode!=='inspect') {
        if (active.condition && active.condition.geometry.type !== 'Point') frameSelection(instance, active, props.current.mode, false);
        else instance.jumpTo({ center: [active.lng, active.lat] });
      }
      drawMarkers();
    });
    observer.observe(container.current);
    const releaseLabels=manageCloseZoomLabels(instance);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      observer.disconnect();
      releaseLabels();
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      draftMarker.current?.remove();
      draftMarker.current = undefined;
      instance.remove();
      map.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (reports.length && !fitted.current) { fitted.current = true; fitReports(); }
    drawMarkers();
  }, [reports, ready, picking, selectionLocked,mode,drawing?.id]);

  useEffect(()=>{const instance=map.current;if(!instance || !epoch)return;const rows=reports.map(row=>selected?.id===row.id?selected:row);(instance.getSource('condition-footprints') as GeoJSONSource|undefined)?.setData(conditionFootprints(rows));if(instance.getLayer('condition-selected'))instance.setFilter('condition-selected',selectedConditionFilter(selected?.id??null));},[reports,selected,epoch]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready) return;
    instance.getCanvas().style.cursor = picking ? 'crosshair' : '';
    if (!draftLocation) { draftMarker.current?.remove(); draftMarker.current = undefined; return; }
    if (!draftMarker.current) draftMarker.current = new maplibregl.Marker({ color: '#b65d24' }).setLngLat([draftLocation.lng, draftLocation.lat]).addTo(instance);
    draftMarker.current.setLngLat([draftLocation.lng, draftLocation.lat]);
    instance.easeTo({ center: [draftLocation.lng, draftLocation.lat], duration: duration() });
  }, [draftLocation, picking, ready]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready || inspecting || mode==='inspect') return;
    const changed=appliedMode.current!==mode;
    if (changed) instance.stop();
    appliedMode.current = mode;
    configurePublicCamera(instance,mode);
    if (instance.getLayer('public-buildings-3d')) instance.setLayoutProperty('public-buildings-3d', 'visibility', mode !== '2d' ? 'visible' : 'none');
    if (!changed || (mode === '2d' && instance.getPitch() === 0 && instance.getBearing() === 0)) return;
    instance.stop();
    instance.easeTo({ ...cameraPose(mode, instance.getBearing()),
      ...(mode === '3d' ? { zoom: Math.max(instance.getZoom(), 15.5) } : {}), duration: duration() });
  }, [mode, ready,epoch,inspecting]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready || inspecting || mode==='inspect') return;
    if (selected) {
      if (previousView.current?.id===selected.id) return;
      if (!previousView.current) previousView.current = {id:selected.id,pose:publicCameraSnapshot(instance),mode:props.current.mode};
      else previousView.current.id=selected.id;
      frameSelection(instance, selected, props.current.mode);
    } else if (previousView.current) {
      instance.stop();
      const saved=previousView.current;
      instance.jumpTo({...saved.pose,...(props.current.mode===saved.mode?{}:cameraPose(props.current.mode,instance.getBearing()))});
      previousView.current = undefined;
    }
    drawMarkers();
  }, [selected?.id, ready,epoch,mode==='inspect']);

  return <section className="lj-map" aria-label="Peta laporan">
    <div ref={container} className="lj-map-canvas" />
    {ready && <MapSketch map={map.current} epoch={epoch} drawing={drawing} preview={draftGeometry} onComplete={onDrawingComplete} onCancel={onDrawingCancel} />}
    {inspection.error && <div className="lj-inspection-error" role="status">{inspection.error}</div>}
    {failed && <div className="lj-map-notice" role="status">Peta belum tersedia sepenuhnya. Daftar laporan tetap dapat digunakan.</div>}
    {!failed && !ready && <div className="lj-map-notice" role="status">Memuat peta…</div>}
    {ready && !minimal && <>
      {moved && !selected && !picking && !selectionLocked && <button className="lj-area-button" onClick={() => {
        const bounds = map.current!.getBounds();
        onArea({ west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() });
        setMoved(false);
      }}>Cari di area ini</button>}
      <div className="lj-map-tools" aria-label="Kontrol peta">
        <button className="lj-mode-toggle" aria-label="Mode 3D" aria-pressed={mode !== '2d'}
          title={mode !== '2d' ? 'Kembali ke peta 2D' : 'Lihat peta 3D'} onClick={() => {if(mode==='inspect')inspection.exitTo2D();else setMode(current => current === '2d' ? '3d' : '2d');}}>
          {mode !== '2d' ? '2D' : '3D'}
        </button>
        <button aria-label="Perbesar peta" onClick={() => map.current?.zoomIn({ duration: duration() })}><Plus size={20} /></button>
        <button aria-label="Perkecil peta" onClick={() => map.current?.zoomOut({ duration: duration() })}><Minus size={20} /></button>
        <button aria-label="Tampilkan semua hasil pada peta" disabled={!reports.length || mode==='inspect' || Boolean(drawing)} onClick={fitReports}><LocateFixed size={20} /></button>
      </div>
      {inspection.active && selected?.condition && <div className="lj-inspection-controls" role="region" aria-label="Inspeksi kondisi">
        <strong>{conditionLabel(selected.condition)}</strong><p>{inspection.label}</p>
        {inspection.loading && <p role="status">Memuat ilustrasi 3D…</p>}
        {closureNeedsUpdate(selected.condition) && <p>Perlu pembaruan · pengamatan lebih dari 24 jam.</p>}
        <div><button disabled={inspection.loading} onClick={inspection.rotate}>{matchMedia('(prefers-reduced-motion: reduce)').matches?'Putar 90°':inspection.orbiting?'Hentikan putaran':'Putar mengelilingi'}</button><button onClick={inspection.stop}>Keluar inspeksi</button></div>
      </div>}
      <div className="lj-map-key"><span className="lj-key-dot" /> {mode === 'inspect' ? 'Ilustrasi kondisi menurut pelapor' : mode === '3d' ? '3D · tinggi bangunan menurut sumber peta' : picking ? 'Klik peta untuk lokasi laporan' : 'Laporan publik'}</div>
      {!drawing && mode !== 'inspect' && reports.some(row => row.condition) && <ConditionLegend />}
    </>}
  </section>;
}
