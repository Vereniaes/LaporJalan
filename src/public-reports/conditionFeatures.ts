/* Build map shapes from confirmed reports, without inventing measured dimensions.
Todo:
-> share footprint, draft and illustrative symbol data
-> colour and pattern per condition kind, map layers and legend swatches
*/
import maplibregl, { type ExpressionSpecification, type FilterSpecification, type LayerSpecification, type Map as LibreMap } from 'maplibre-gl';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { PublicReport } from './data';
import type { ConditionGeometry, ConditionKind, RoadCondition } from './condition';

export const emptyFeatures = (): FeatureCollection => ({ type: 'FeatureCollection', features: [] });
const feature = (geometry: Geometry, properties: Record<string, unknown> = {}): Feature => ({ type: 'Feature', geometry, properties });
// --- condition kind styles (one table for map layers and legend) ---

// Why/Note: family = colour, kind inside a family = pattern; the kind word always stays next to the swatch
const RUST = '#A8322A', CONE = '#DC5F2F', ASPHALT = '#1D2023', WATER = '#2B6C99', SMOKE = '#77706A', OTHER = '#7C8288';
export const CONDITION_FAMILIES: { label: string; kinds: ConditionKind[] }[] = [
  { label: 'Rusak', kinds: ['pothole', 'subsidence', 'crack'] },
  { label: 'Pekerjaan dan penutupan', kinds: ['excavation', 'construction', 'closure'] },
  { label: 'Saluran', kinds: ['blocked_drain'] },
  { label: 'Pembakaran', kinds: ['burning'] },
  { label: 'Lainnya', kinds: ['other'] },
];
// glyph = pin icon (inner SVG, 24 px box); kinds without one keep their category icon
const STYLE: Record<ConditionKind, { color: string; pattern?: string; glyph?: string }> = {
  pothole: { color: RUST, glyph: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>' },
  subsidence: { color: RUST, pattern: 'p-ambles', glyph: '<path d="M12 3v11"/><path d="m7 9 5 5 5-5"/><path d="M3 20h4l2-3h6l2 3h4"/>' },
  crack: { color: RUST, pattern: 'p-retak', glyph: '<path d="M12 2 9 8l5 3-4 5 2 6"/><path d="m14 11 5-2"/>' },
  excavation: { color: CONE, pattern: 'p-galian', glyph: '<path d="M2 22v-5l5-5 5 5-5 5z"/><path d="M9.5 14.5 16 8"/><path d="m17 2 5 5-.5.5a3.53 3.53 0 0 1-5 0 3.53 3.53 0 0 1 0-5L17 2"/>' },
  construction: { color: CONE, pattern: 'p-kerja' },
  closure: { color: ASPHALT, pattern: 'p-tutup', glyph: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>' },
  blocked_drain: { color: WATER, pattern: 'p-saluran' },
  burning: { color: SMOKE },
  other: { color: OTHER, glyph: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>' },
};
const styleOf = (kind: ConditionKind) => STYLE[kind] ?? STYLE.other;
export const conditionGlyph = (kind: ConditionKind) => styleOf(kind).glyph;

// pattern tiles (32 px canvas, shown at 16 px), drawn once on first use
// Why/Note: map and legend read the same canvas, so the legend shows the map's pixels
let tiles: Record<string, HTMLCanvasElement> | undefined;
function patternTiles() {
  if (tiles) return tiles;
  const tile = (draw: (x: CanvasRenderingContext2D) => void) => { const c = document.createElement('canvas'); c.width = c.height = 32; draw(c.getContext('2d')!); return c; };
  const fill = (x: CanvasRenderingContext2D, color: string) => { x.fillStyle = color; x.fillRect(0, 0, 32, 32); };
  const stroke = (x: CanvasRenderingContext2D, color: string, path: () => void) => { x.strokeStyle = color; x.lineWidth = 2.5; x.beginPath(); path(); x.stroke(); };
  // diagonal barrier stripes on white, 8 px wide; period 16 so the 32 px tile has no seam
  const stripes = (color: string) => (x: CanvasRenderingContext2D) => {
    fill(x, '#FFFFFF'); x.fillStyle = color;
    for (let i = -32; i < 64; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 8, 0); x.lineTo(i - 24, 32); x.lineTo(i - 32, 32); x.closePath(); x.fill(); }
  };
  tiles = {
    'p-galian': tile(stripes(CONE)),
    'p-tutup': tile(stripes(ASPHALT)),
    'p-kerja': tile(x => { fill(x, CONE); x.fillStyle = '#FFFFFF'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) x.fillRect(i * 8, j * 8, 8, 8); }),
    'p-retak': tile(x => { fill(x, RUST); stroke(x, '#4A120D', () => { x.moveTo(0, 16); x.lineTo(7, 9); x.lineTo(13, 21); x.lineTo(20, 11); x.lineTo(26, 20); x.lineTo(32, 16); }); }),
    'p-ambles': tile(x => { fill(x, RUST); stroke(x, 'rgba(255,255,255,.85)', () => { for (const y of [6, 22]) { x.moveTo(6, y); x.lineTo(16, y + 6); x.lineTo(26, y); } }); }),
    'p-saluran': tile(x => { fill(x, WATER); stroke(x, 'rgba(255,255,255,.9)', () => { for (const y of [9, 25]) { x.moveTo(0, y); x.bezierCurveTo(8, y - 7, 16, y + 7, 24, y); x.bezierCurveTo(28, y - 3.5, 30, y - 3.5, 32, y); } }); }),
  };
  return tiles;
}
const swatchUrls: Record<string, string> = {};
export function swatchStyle(kind: ConditionKind) {
  const { color, pattern } = styleOf(kind);
  if (!pattern) return { background: color };
  swatchUrls[pattern] ??= patternTiles()[pattern].toDataURL();
  return { background: `url(${swatchUrls[pattern]}) 0 0 / 16px 16px` };
}

// --- end of condition kind styles ---

// --- condition footprints and layers ---

// footprints by kind (what the reporter drew)
// input param : reports; rows without a confirmed condition are skipped
// output      : lines and polygons with id, kind, color, pattern for the condition layers
// Why/Note    : a point becomes an 8 m spot (owner choice, 9 Nov). It marks the kind, it is not a size
export function conditionFootprints(reports: PublicReport[]): FeatureCollection {
  return { type: 'FeatureCollection', features: reports.flatMap(report => {
    const condition = report.condition;
    if (!condition) return [];
    const { color, pattern = '' } = styleOf(condition.kind);
    const geometry = condition.geometry;
    return [feature(geometry.type === 'Point' ? { type: 'Polygon', coordinates: [spot(geometry.coordinates, 8)] } : geometry,
      { id: report.id, kind: condition.kind, color, pattern })];
  }) };
}
function spot(center: [number, number], radiusM: number, steps = 24): [number, number][] {
  const origin = maplibregl.MercatorCoordinate.fromLngLat(center), r = origin.meterInMercatorCoordinateUnits() * radiusM;
  const ring = Array.from({ length: steps }, (_, i): [number, number] => {
    const angle = i / steps * 2 * Math.PI, at = new maplibregl.MercatorCoordinate(origin.x + Math.cos(angle) * r, origin.y + Math.sin(angle) * r).toLngLat();
    return [at.lng, at.lat];
  });
  return [...ring, ring[0]];
}

// Why/Note: line width is screen px (4 -> 10), it marks the stretch, not the road width (owner choice, 9 Nov)
const lineWidth = (extra: number) => ['interpolate', ['linear'], ['zoom'], 12, 4 + extra, 18, 10 + extra] as ExpressionSpecification;
const isLine: FilterSpecification = ['==', ['geometry-type'], 'LineString'];
const isArea: FilterSpecification = ['==', ['geometry-type'], 'Polygon'];
const plain: FilterSpecification = ['==', ['get', 'pattern'], ''];
const patterned: FilterSpecification = ['!=', ['get', 'pattern'], ''];
export const selectedConditionFilter = (id: string | null): FilterSpecification => ['==', ['get', 'id'], id ?? ''];

// condition layers on source condition-footprints (2D)
// input param : map, layer id to stay under (3D buildings)
// output      : pattern images + 7 layers, each added once
export function addConditionLayers(map: LibreMap, before?: string) {
  for (const [id, canvas] of Object.entries(patternTiles())) if (!map.hasImage(id)) map.addImage(id, canvas.getContext('2d')!.getImageData(0, 0, 32, 32), { pixelRatio: 2 });
  const round = { 'line-cap': 'round', 'line-join': 'round' };
  const layers = [
    { id: 'condition-selected', type: 'line', filter: selectedConditionFilter(null), layout: round,
      paint: { 'line-color': ASPHALT, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, ['case', isLine, 10, 4], 18, ['case', isLine, 16, 4]] } },
    { id: 'condition-area', type: 'fill', filter: ['all', isArea, plain], paint: { 'fill-color': ['get', 'color'], 'fill-opacity': .5 } },
    { id: 'condition-area-pattern', type: 'fill', filter: ['all', isArea, patterned], paint: { 'fill-pattern': ['get', 'pattern'], 'fill-opacity': .85 } },
    { id: 'condition-area-edge', type: 'line', filter: isArea, paint: { 'line-color': ['get', 'color'], 'line-width': 2 } },
    { id: 'condition-casing', type: 'line', filter: isLine, layout: round, paint: { 'line-color': '#FFFFFF', 'line-width': lineWidth(3) } },
    { id: 'condition-line', type: 'line', filter: ['all', isLine, plain], layout: round, paint: { 'line-color': ['get', 'color'], 'line-width': lineWidth(0) } },
    { id: 'condition-line-pattern', type: 'line', filter: ['all', isLine, patterned], layout: { 'line-join': 'round' }, paint: { 'line-pattern': ['get', 'pattern'], 'line-width': lineWidth(0) } },
  ];
  for (const layer of layers) if (!map.getLayer(layer.id)) map.addLayer({ ...layer, source: 'condition-footprints' } as LayerSpecification, before);
}

// --- end of condition footprints and layers ---
export function sketchFeatures(points: [number, number][], area: boolean): FeatureCollection {
  const features: Feature[] = points.map(point => feature({ type: 'Point', coordinates: point }));
  if (points.length >= 2) features.push(feature({ type: 'LineString', coordinates: points }));
  if (area && points.length >= 3) features.push(feature({ type: 'Polygon', coordinates: [[...points, points[0]]] }));
  return { type: 'FeatureCollection', features };
}

// Symbol sizes are drawing templates, never report measurements.
// input param : confirmed condition and the report anchor
// output : small native extrusion features on the same map depth buffer
export function conditionSymbols(condition: RoadCondition, anchor: [number, number]): FeatureCollection {
  const { color, pattern } = styleOf(condition.kind);
  const origin = maplibregl.MercatorCoordinate.fromLngLat(geometryAnchor(condition.geometry, anchor));
  const meter = origin.meterInMercatorCoordinateUnits();
  const point = (x: number, y: number): [number, number] => {
    const location = new maplibregl.MercatorCoordinate(origin.x + x * meter, origin.y - y * meter).toLngLat();
    return [location.lng, location.lat];
  };
  const box = (x: number, y: number, width: number, length: number, height: number, color: string) =>
    feature({ type: 'Polygon', coordinates: [[point(x-width/2,y-length/2),point(x+width/2,y-length/2),point(x+width/2,y+length/2),point(x-width/2,y+length/2),point(x-width/2,y-length/2)]] }, { height, color });
  const geometry = condition.geometry;
  if (geometry.type === 'Polygon') return { type: 'FeatureCollection', features: [feature(geometry, { height: .2, color, ...(pattern ? { pattern } : {}) })] };
  if (geometry.type === 'LineString') {
    // A narrow band follows only the line supplied by the reporter.
    const features: Feature[] = [];
    for (let i = 1; i < geometry.coordinates.length; i++) {
      const a = maplibregl.MercatorCoordinate.fromLngLat(geometry.coordinates[i-1]);
      const b = maplibregl.MercatorCoordinate.fromLngLat(geometry.coordinates[i]);
      const dx=(b.x-a.x)/meter, dy=-(b.y-a.y)/meter, length=Math.hypot(dx,dy);
      if (!length) continue;
      const nx=-dy/length*.12, ny=dx/length*.12;
      const ax=(a.x-origin.x)/meter, ay=-(a.y-origin.y)/meter;
      const bx=(b.x-origin.x)/meter, by=-(b.y-origin.y)/meter;
      features.push(feature({ type:'Polygon', coordinates:[[point(ax+nx,ay+ny),point(bx+nx,by+ny),point(bx-nx,by-ny),point(ax-nx,ay-ny),point(ax+nx,ay+ny)]] }, { height:.45, color }));
    }
    return { type:'FeatureCollection', features };
  }
  if (!['closure','construction','excavation'].includes(condition.kind)) {
    return {type:'FeatureCollection',features:[feature({type:'Polygon',coordinates:[[point(0,.85),point(-.8,-.65),point(.8,-.65),point(0,.85)]]},{height:.08,color}),box(0,-.05,.12,.55,.1,'#fff')]};
  }
  const features = [box(0,0,2.4,.25,.6,color)];
  for (const x of [-.9,0,.9]) features.push(box(x,-.14,.22,.05,.62,'#f7f4e9'));
  for (const x of [-.95,.95]) features.push(box(x,0,.12,.45,.7,'#47564f'));
  return { type:'FeatureCollection', features };
}
// end of helper --------------------------------------------------------------------------

export function geometryAnchor(geometry: ConditionGeometry, fallback: [number,number]): [number,number] {
  return geometry.type === 'Point' ? geometry.coordinates : fallback;
}
export function geometryBounds(geometry: ConditionGeometry) {
  const bounds = new maplibregl.LngLatBounds();
  (geometry.type === 'Polygon' ? geometry.coordinates[0] : geometry.type === 'LineString' ? geometry.coordinates : [geometry.coordinates]).forEach(point => bounds.extend(point));
  return bounds;
}
