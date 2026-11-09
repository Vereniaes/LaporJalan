/* Todo:
-> measure what the reporter drew: line length, polygon area
-> walk along a line for the inspection camera: point at a distance, bearing
*/
export type LngLat = [number, number];

// --- distances on the map ---

const EARTH_M = 6371008.8;
const rad = (degrees: number) => degrees * Math.PI / 180;

// metres between two points (haversine)
export function distance(a: LngLat, b: LngLat) {
  const h = Math.sin(rad(b[1] - a[1]) / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(rad(b[0] - a[0]) / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.sqrt(h));
}
export const lineLength = (line: LngLat[]) => line.slice(1).reduce((sum, point, i) => sum + distance(line[i], point), 0);

// Purpose : area of a closed polygon ring in m²
// Why/Note: shoelace on a local flat projection - fine for street-sized shapes, not for whole districts
export function ringArea(ring: LngLat[]) {
  const kx = 111320 * Math.cos(rad(ring[0][1])), ky = 110540;
  const xy = ring.map(([lng, lat]) => [(lng - ring[0][0]) * kx, (lat - ring[0][1]) * ky]);
  let twice = 0;
  for (let i = 0; i < xy.length - 1; i++) twice += xy[i][0] * xy[i + 1][1] - xy[i + 1][0] * xy[i][1];
  return Math.abs(twice) / 2;
}

// point at a distance (metres from the start) along a line; past the end gives the last point
export function pointAlong(line: LngLat[], metres: number): LngLat {
  let walked = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const step = distance(line[i], line[i + 1]);
    if (step > 0 && walked + step >= metres) {
      const t = Math.max(0, metres - walked) / step;
      return [line[i][0] + (line[i + 1][0] - line[i][0]) * t, line[i][1] + (line[i + 1][1] - line[i][1]) * t];
    }
    walked += step;
  }
  return line[line.length - 1];
}

// compass bearing from a to b in degrees (0 = north)
export function bearing(a: LngLat, b: LngLat) {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1])) - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// --- end of distances on the map ---
