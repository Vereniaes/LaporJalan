/* Todo:
-> the map for browsers without usable WebGL (owner choice, 10 Nov): raster tiles in Leaflet, no GPU needed
    -> same pins and grouping, the condition shapes, the pinned card (docked), picking a location, "Cari di area ini"
    -> no 3D and no drawing of stretches/areas; the form is told so and keeps the point
*/
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import { conditionFootprints } from './conditionFeatures';
import { groupReports, pinButton } from '../map/markers';
import type { MapProps } from './PublicMap';

// OpenStreetMap standard raster tiles: no key, attribution required; the tile policy allows light use, which a fallback is
// Why/Note: CARTO basemaps answered "API KEY REQUIRED" (checked 10 Nov 2026)
export const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const ATTRIBUTION = '© kontributor <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export function LiteMap({ reports, selected, onSelect, onArea, picking = false, selectionLocked = false, draftLocation, onLocation, drawing, onDrawingCancel, cooperative = false, minimal = false, popups = [] }: MapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map>();
  const pins = useRef<L.LayerGroup>(), shapes = useRef<L.GeoJSON>(), draft = useRef<L.CircleMarker>();
  const props = useRef({ reports, selected, onSelect, picking, selectionLocked, onLocation });
  props.current = { reports, selected, onSelect, picking, selectionLocked, onLocation };
  const [moved, setMoved] = useState(false), [drawingNote, setDrawingNote] = useState(false);
  const fitted = useRef(false);

  // --- pins (same grouping and buttons as the WebGL map) ---
  function drawPins() {
    const instance = map.current, layer = pins.current;
    if (!instance || !layer) return;
    layer.clearLayers();
    const size = instance.getSize(), active = props.current.selected;
    const groups = groupReports(props.current.reports, row => instance.latLngToContainerPoint([row.lat, row.lng]), size.x, size.y, active?.id ?? null);
    for (const { members } of groups) {
      const row = members[0], isGroup = members.length > 1;
      const button = pinButton(members, active?.id === row.id, props.current.picking || props.current.selectionLocked);
      button.onclick = event => {
        L.DomEvent.stopPropagation(event);
        if (isGroup) instance.setView([row.lat, row.lng], Math.min(instance.getZoom() + 2, 19), { animate: false });
        else props.current.onSelect(row);
      };
      L.marker([row.lat, row.lng], { icon: L.divIcon({ html: button, className: 'lj-lite-pin', iconSize: [44, 44] }), keyboard: false }).addTo(layer);
    }
  }
  // --- end of pins ---

  useEffect(() => {
    if (!container.current) return;
    const touch = matchMedia('(pointer: coarse)').matches;
    // landing (cooperative): the page keeps the wheel; on touch, one finger scrolls the page
    const instance = L.map(container.current, { zoomControl: false, attributionControl: true, preferCanvas: true,
      scrollWheelZoom: !cooperative, dragging: !(cooperative && touch), center: [-6.2088, 106.8456], zoom: 11, maxZoom: 19 });
    instance.attributionControl.setPrefix(false);
    L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(instance);
    shapes.current = L.geoJSON(undefined, { interactive: false, style: feature => ({ color: feature?.properties?.color ?? '#1D2023', weight: 6, opacity: .9, fillOpacity: .35 }) }).addTo(instance);
    pins.current = L.layerGroup().addTo(instance);
    instance.on('moveend zoomend', () => { drawPins(); setMoved(true); });
    instance.on('click', event => { if (props.current.picking) props.current.onLocation?.({ lng: event.latlng.lng, lat: event.latlng.lat }); });
    map.current = instance;
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    return () => { observer.disconnect(); instance.remove(); map.current = undefined; };
  }, []);

  // data: shapes, pins, and the first view framed on the reports
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    shapes.current?.clearLayers();
    shapes.current?.addData(conditionFootprints(reports.map(row => selected?.id === row.id ? selected : row)) as GeoJSON.FeatureCollection);
    if (reports.length && !fitted.current) {
      fitted.current = true;
      instance.fitBounds(L.latLngBounds(reports.map(row => [row.lat, row.lng] as [number, number])), minimal ? { padding: [24, 24], paddingBottomRight: [24, 56] } : { padding: [48, 48] });
    }
    drawPins();
  }, [reports, selected, picking, selectionLocked]);

  // selection: move to the report, clear of the docked card on wide screens
  useEffect(() => {
    const instance = map.current;
    if (!instance || !selected) return;
    const docked = instance.getSize().x > 640 && !matchMedia('(max-width: 800px)').matches ? 190 : 0;
    const zoom = Math.max(instance.getZoom(), 16), target = instance.project([selected.lat, selected.lng], zoom).add([docked, 0]);
    instance.setView(instance.unproject(target, zoom), zoom, { animate: false });
  }, [selected?.id]);

  // the draft location of a new report
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    instance.getContainer().style.cursor = picking ? 'crosshair' : '';
    draft.current?.remove(); draft.current = undefined;
    if (draftLocation) {
      draft.current = L.circleMarker([draftLocation.lat, draftLocation.lng], { radius: 9, color: '#ffffff', weight: 3, fillColor: '#b65d24', fillOpacity: 1 }).addTo(instance);
      instance.panTo([draftLocation.lat, draftLocation.lng], { animate: false });
    }
  }, [draftLocation, picking]);

  // drawing a stretch or an area needs the WebGL map: say so and hand the form back
  useEffect(() => { if (drawing) { setDrawingNote(true); onDrawingCancel?.(); } }, [drawing?.id]);

  const pinned = popups.filter(popup => popup.pinned);
  return <section className="lj-map lj-lite-map" aria-label="Peta laporan">
    <div ref={container} className="lj-map-canvas" />
    {pinned.map(popup => <div key={popup.report.id} className="lj-popup lj-popup-fallback is-pinned">{popup.content}</div>)}
    {drawingNote && <div className="lj-map-notice" role="status">Menggambar ruas atau area belum bisa di peta ringan. Pilih bentuk Titik, atau buka di perangkat yang mendukung WebGL.
      <button onClick={() => setDrawingNote(false)}>Tutup</button></div>}
    {!minimal && <>
      {moved && !selected && !picking && !selectionLocked && <button className="lj-area-button" onClick={() => {
        const bounds = map.current!.getBounds();
        onArea({ west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth() });
        setMoved(false);
      }}>Cari di area ini</button>}
      <div className="lj-map-tools" aria-label="Kontrol peta">
        <button aria-label="Perbesar peta" onClick={() => map.current?.zoomIn(1, { animate: false })}><Plus size={20} /></button>
        <button aria-label="Perkecil peta" onClick={() => map.current?.zoomOut(1, { animate: false })}><Minus size={20} /></button>
        <button aria-label="Tampilkan semua hasil pada peta" disabled={!reports.length} onClick={() => map.current?.fitBounds(L.latLngBounds(reports.map(row => [row.lat, row.lng] as [number, number])), { padding: [48, 48], animate: false })}><LocateFixed size={20} /></button>
      </div>
      <div className="lj-map-key"><span className="lj-key-dot" /> {picking ? 'Klik peta untuk lokasi laporan' : 'Peta ringan · perangkat tanpa WebGL'}</div>
    </>}
  </section>;
}
