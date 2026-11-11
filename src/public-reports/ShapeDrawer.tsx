/* Todo:
-> draw a stretch (ruas) or an area inside the report popup, on its own tilted 3D map (owner, 11 Nov)
    -> pen: press and drag with a finger or the mouse; every stroke is smoothed and the screen point is projected onto the ground of the tilted map
    -> hand: drag pans, two fingers pinch; the map keys pan too
    -> single-pointer alternative for WCAG 2.5.7: "Tambah titik di tengah peta" adds the point under the centre mark
    -> output stays within the server's limits: at most 64 points, an area closed and free of self-crossings
*/
import { useEffect, useRef, useState } from 'react';
import maplibregl, { type GeoJSONSource, type Map as LibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Check, Hand, Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import { PUBLIC_MAP_STYLE } from './usePublicInspection';
import { buildingColor, themeBasemap } from '../map/basemap';
import { useTheme } from './theme';
import { emptyFeatures } from './conditionFeatures';
import type { ConditionGeometry, ConditionPosition } from './condition';

type Pt = ConditionPosition;
const MAX_POINTS = 64, MIN_STEP_PX = 4;

// --- geometry helpers ---
// metres between two lng/lat points (small distances)
function metres(a: Pt, b: Pt) {
  const k = Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180) * 111_320;
  return Math.hypot((a[0] - b[0]) * k, (a[1] - b[1]) * 110_540);
}
// Douglas-Peucker in metres: keeps the shape of a hand-drawn stroke with few points
function simplify(points: Pt[], tolerance: number): Pt[] {
  if (points.length < 3) return points;
  const [first, last] = [points[0], points[points.length - 1]];
  let index = 0, worst = 0;
  const length = metres(first, last) || 1e-9;
  for (let i = 1; i < points.length - 1; i++) {
    // distance from the point to the first-last chord (area of the triangle / base)
    const a = metres(first, points[i]), b = metres(points[i], last), s = (a + b + length) / 2;
    const d = 2 * Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - length))) / length;
    if (d > worst) { worst = d; index = i; }
  }
  if (worst <= tolerance) return [first, last];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}
function fitLimit(points: Pt[], limit: number) {
  let result = simplify(points, 0.4);
  for (let tolerance = 0.8; result.length > limit; tolerance *= 1.6) result = simplify(points, tolerance);
  return result;
}
function crosses(a: Pt, b: Pt, c: Pt, d: Pt) {
  const o = (p: Pt, q: Pt, r: Pt) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}
function selfCrossing(ring: Pt[]) {
  for (let i = 0; i < ring.length - 1; i++) for (let j = i + 2; j < ring.length - 1; j++) {
    if (i === 0 && j === ring.length - 2) continue;
    if (crosses(ring[i], ring[i + 1], ring[j], ring[j + 1])) return true;
  }
  return false;
}
// --- end of geometry helpers ---

export function ShapeDrawer({ mode, anchor, initial, onDone, onCancel }: {
  mode: 'line' | 'area'; anchor: Pt; initial?: ConditionGeometry | null;
  onDone: (geometry: ConditionGeometry) => void; onCancel: () => void;
}) {
  const box = useRef<HTMLDivElement>(null), map = useRef<LibreMap>();
  const [strokes, setStrokes] = useState<Pt[][]>(() => initial?.type === 'LineString' ? [initial.coordinates] : initial?.type === 'Polygon' ? [initial.coordinates[0].slice(0, -1)] : []);
  const [live, setLive] = useState<Pt[]>([]), [tool, setTool] = useState<'pen' | 'hand'>('pen'), [ready, setReady] = useState(false), [note, setNote] = useState('');
  const toolRef = useRef(tool); toolRef.current = tool;
  const theme = useTheme(); // the drawing map opens in the page theme (a theme change mid-drawing waits for the next drawing)
  const points = fitLimit(strokes.flat(), MAX_POINTS - 1);

  // --- the tilted map ---
  useEffect(() => {
    let instance: LibreMap;
    try {
      instance = new maplibregl.Map({ container: box.current!, style: PUBLIC_MAP_STYLE, center: anchor, zoom: 18, pitch: 55, bearing: -18, maxPitch: 70,
        attributionControl: false, dragRotate: false, touchPitch: false, boxZoom: false, doubleClickZoom: false });
    } catch { setNote('Peta 3D tidak dapat dimuat di perangkat ini. Pilih bentuk Titik.'); return; }
    map.current = instance;
    instance.touchZoomRotate.disableRotation();
    instance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    instance.on('style.load', () => {
      themeBasemap(instance, theme);
      const label = instance.getStyle().layers.find(layer => layer.type === 'symbol')?.id;
      if (instance.getSource('openmaptiles')) instance.addLayer({ id: 'shape-buildings', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 15,
        paint: { 'fill-extrusion-color': buildingColor(theme), 'fill-extrusion-opacity': 0.85, 'fill-extrusion-height': ['max', 0, ['to-number', ['get', 'render_height'], 0]], 'fill-extrusion-base': ['max', 0, ['to-number', ['get', 'render_min_height'], 0]] } }, label);
      instance.addSource('shape', { type: 'geojson', data: emptyFeatures() });
      instance.addSource('shape-anchor', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: anchor } } });
      // the drawing lies on the ground plane, so the tilt projects it in 3D; an area also rises a little
      instance.addLayer({ id: 'shape-area', type: 'fill-extrusion', source: 'shape', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-extrusion-color': '#0E7A4B', 'fill-extrusion-opacity': 0.45, 'fill-extrusion-height': 0.6 } });
      instance.addLayer({ id: 'shape-casing', type: 'line', source: 'shape', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-width': 9 } });
      instance.addLayer({ id: 'shape-line', type: 'line', source: 'shape', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#0E7A4B', 'line-width': 5 } });
      instance.addLayer({ id: 'shape-anchor', type: 'circle', source: 'shape-anchor', paint: { 'circle-radius': 7, 'circle-color': '#F6C318', 'circle-stroke-color': '#1D2023', 'circle-stroke-width': 2 } });
      setReady(true);
    });
    return () => { instance.remove(); map.current = undefined; };
  }, []);
  // what is on the map: finished strokes plus the stroke being drawn
  useEffect(() => {
    const source = map.current?.getSource('shape') as GeoJSONSource | undefined;
    if (!source) return;
    const all = [...points, ...live];
    const features = all.length < 2 ? [] : mode === 'area' && all.length >= 3 && !live.length
      ? [{ type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [[...all, all[0]]] } }, { type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: [...all, all[0]] } }]
      : [{ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: all } }];
    source.setData({ type: 'FeatureCollection', features });
  }, [ready, strokes, live, mode]);
  // pen: dragging draws (panning off); hand: dragging pans
  useEffect(() => {
    const instance = map.current;
    if (!instance || !ready) return;
    const canvas = instance.getCanvasContainer();
    if (tool === 'pen') { instance.dragPan.disable(); canvas.style.touchAction = 'none'; } else { instance.dragPan.enable(); canvas.style.touchAction = ''; }
    let stroke: Pt[] = [], last: [number, number] | null = null, pointers = 0;
    const at = (event: PointerEvent): [number, number] => { const rect = canvas.getBoundingClientRect(); return [event.clientX - rect.left, event.clientY - rect.top]; };
    const down = (event: PointerEvent) => {
      pointers++;
      if (toolRef.current !== 'pen' || pointers > 1 || event.button > 0) { stroke = []; setLive([]); last = null; return; } // a second finger means pinch, not ink
      canvas.setPointerCapture(event.pointerId);
      last = at(event); const p = instance.unproject(last); stroke = [[p.lng, p.lat]]; setLive(stroke);
    };
    const move = (event: PointerEvent) => {
      if (!last || pointers > 1) return;
      const xy = at(event);
      if (Math.hypot(xy[0] - last[0], xy[1] - last[1]) < MIN_STEP_PX) return;
      last = xy; const p = instance.unproject(xy); stroke = [...stroke, [p.lng, p.lat]]; setLive(stroke);
    };
    const up = () => {
      pointers = Math.max(0, pointers - 1);
      // simplify now: the updater runs later, after `stroke` is reset below
      if (last && stroke.length > 1) { const done = simplify(stroke, 0.4); setStrokes(rows => [...rows, done]); }
      last = null; stroke = []; setLive([]);
    };
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    return () => { canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); };
  }, [tool, ready]);
  // --- end of the tilted map ---

  function addCentre() {
    const centre = map.current?.getCenter(); if (!centre) return;
    setStrokes(rows => [...rows, [[centre.lng, centre.lat]]]); setNote('');
  }
  function finish() {
    const minimum = mode === 'area' ? 3 : 2;
    if (points.length < minimum) { setNote(mode === 'area' ? 'Gambar area dengan menggores keliling bagian yang terdampak.' : 'Gores sepanjang ruas yang terdampak.'); return; }
    if (mode === 'line') { onDone({ type: 'LineString', coordinates: points }); return; }
    const ring = [...points, points[0]];
    if (selfCrossing(ring)) { setNote('Garis area saling menyilang. Hapus lalu gores ulang kelilingnya.'); return; }
    onDone({ type: 'Polygon', coordinates: [ring] });
  }

  const label = mode === 'area' ? 'Gambar area' : 'Gambar ruas';
  return <div className="lj-shape-drawer" role="region" aria-label="Gambar lokasi" data-ready={ready || undefined}>
    <div className="lj-shape-map" data-tool={tool}>
      <div ref={box} />
      <span className="lj-shape-centre" aria-hidden="true" />
      <div className="lj-shape-tools" role="toolbar" aria-label="Alat gambar">
        <button type="button" aria-pressed={tool === 'pen'} aria-label="Pena: gores untuk menggambar" title="Gambar" onClick={() => setTool('pen')}><Pencil size={18} /></button>
        <button type="button" aria-pressed={tool === 'hand'} aria-label="Geser peta" title="Geser peta" onClick={() => setTool('hand')}><Hand size={18} /></button>
        <button type="button" aria-label="Urungkan goresan" title="Urungkan" disabled={!strokes.length} onClick={() => setStrokes(rows => rows.slice(0, -1))}><Undo2 size={18} /></button>
        <button type="button" aria-label="Hapus gambar" title="Hapus" disabled={!strokes.length} onClick={() => { setStrokes([]); setNote(''); }}><Trash2 size={18} /></button>
      </div>
    </div>
    <p className="lj-shape-hint">{tool === 'pen'
      ? (mode === 'area' ? 'Gores keliling area dengan jari atau mouse. Dua jari menggeser peta.' : 'Gores sepanjang ruas dengan jari atau mouse. Dua jari menggeser peta.')
      : 'Geser peta, lalu tambah titik di tanda tengah.'} {points.length}/{MAX_POINTS - 1} titik.</p>
    {note && <p className="lj-field-error" role="status">{note}</p>}
    <div className="lj-shape-actions">
      <button type="button" className="lj-text-action" onClick={addCentre} disabled={points.length >= MAX_POINTS - 1}><Plus size={16} /> Tambah titik di tengah peta</button>
      <button type="button" className="lj-secondary" onClick={onCancel}>Batal menggambar</button>
      <button type="button" className="lj-primary" onClick={finish}><Check size={16} /> Selesai menggambar</button>
    </div>
    <span className="lj-visually-hidden" aria-live="polite">{label}: {points.length} titik</span>
  </div>;
}
