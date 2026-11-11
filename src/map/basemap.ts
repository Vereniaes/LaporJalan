/* Todo:
-> give the grey Positron basemap colour where the ground has it: parks and woods green, water blue (owner, 10 Nov: "petanya lifeless")
    -> pale tones only: report pins, condition lines and the flood colour (#2B6C99) must stay the strongest marks on the map
-> dark mode (owner, 11 Nov: "peta gelap berwarna"): slate ground, deep green parks, deep blue water, light labels
    -> the light values are read from the style once and restored, so the theme can switch without reloading the map
*/
import type { Map as LibreMap } from 'maplibre-gl';
import type { Theme } from '../public-reports/theme';

// layer id in the OpenFreeMap Positron style -> paint values; a missing layer is skipped
const TINT: Record<string, Record<string, string>> = {
  park: { 'fill-color': '#d5e8cc' },
  landcover_wood: { 'fill-color': '#c9e0bf' },
  water: { 'fill-color': '#b9d7ec' },
  waterway: { 'line-color': '#9cc5e3' },
};
export const BUILDING_COLOR = '#d4d6d9'; // neutral, so green only means green space
export const buildingColor = (theme: Theme) => theme === 'dark' ? '#323a44' : BUILDING_COLOR;

// dark: by layer id first, then by layer type (roads, rails and borders are lines; labels are symbols)
const DARK: Record<string, Record<string, string>> = {
  background: { 'background-color': '#161b21' },
  park: { 'fill-color': '#1d3a2a' },
  landcover_wood: { 'fill-color': '#1a3326' },
  landcover_ice_shelf: { 'fill-color': '#262d36' },
  landcover_glacier: { 'fill-color': '#262d36' },
  landuse_residential: { 'fill-color': '#1b2128' },
  water: { 'fill-color': '#132c40' },
  waterway: { 'line-color': '#1f4a68' },
  building: { 'fill-color': '#262d36', 'fill-outline-color': '#2e363f' },
  'aeroway-area': { 'fill-color': '#232a32' },
  road_area_pier: { 'fill-color': '#161b21' },
  road_pier: { 'line-color': '#161b21' },
  highway_path: { 'line-color': '#2a3139' },
  highway_minor: { 'line-color': '#2c343d' },
  highway_major_casing: { 'line-color': '#1f252c' },
  highway_major_inner: { 'line-color': '#3b4550' },
  highway_major_subtle: { 'line-color': '#2c343d' },
  highway_motorway_casing: { 'line-color': '#1f252c' },
  highway_motorway_inner: { 'line-color': '#4a5562' },
  highway_motorway_subtle: { 'line-color': '#323b45' },
  highway_motorway_bridge_casing: { 'line-color': '#1f252c' },
  highway_motorway_bridge_inner: { 'line-color': '#4a5562' },
  tunnel_motorway_casing: { 'line-color': '#1f252c' },
  tunnel_motorway_inner: { 'line-color': '#2c343d' },
  water_name_point_label: { 'text-color': '#8fb8d8', 'text-halo-color': '#132c40' },
  water_name_line_label: { 'text-color': '#8fb8d8', 'text-halo-color': '#132c40' },
  waterway_line_label: { 'text-color': '#8fb8d8', 'text-halo-color': '#132c40' },
};
const DARK_LINE = '#323a44', DARK_DASH = '#1f252c', DARK_BORDER = '#4c5562';
const DARK_LABEL = { 'text-color': '#cdd3db', 'text-halo-color': '#161b21' };

// the original (light) value of every paint property we change, per map
const saved = new WeakMap<LibreMap, Map<string, unknown>>();

function darkPaint(id: string, type: string): Record<string, string> {
  if (DARK[id]) return DARK[id];
  if (type === 'line') return { 'line-color': id.includes('dash') ? DARK_DASH : id.startsWith('boundary') ? DARK_BORDER : DARK_LINE };
  if (type === 'symbol') return DARK_LABEL;
  return {};
}

// input param : a map whose style has loaded, and the theme
// output      : the basemap painted for the theme (3D buildings are added by the caller: see buildingColor)
export function themeBasemap(map: LibreMap, theme: Theme) {
  let originals = saved.get(map);
  if (!originals) { originals = new Map(); saved.set(map, originals); }
  for (const layer of map.getStyle().layers) {
    if (layer.id.startsWith('public-') || layer.id.startsWith('condition-') || layer.id.startsWith('shape-')) continue; // ours, not the basemap
    const dark = darkPaint(layer.id, layer.type), tint = TINT[layer.id] ?? {};
    for (const property of new Set([...Object.keys(dark), ...Object.keys(tint)])) {
      const key = `${layer.id}|${property}`;
      // the first call sees the style's own value: keep it, so light can be restored later
      if (!originals.has(key)) originals.set(key, map.getPaintProperty(layer.id, property) ?? null);
      const next = theme === 'dark' ? (dark[property] ?? originals.get(key)) : (tint[property] ?? originals.get(key));
      try { map.setPaintProperty(layer.id, property, next ?? undefined); } catch { /* a property this layer does not take */ }
    }
  }
}

// kept for callers that only need the light tint
export const tintBasemap = (map: LibreMap) => themeBasemap(map, 'light');
