/* Rute: path geometry, Google's polyline, reports met on the way */
import { test, expect } from '@playwright/test';
import { chainage, decodePolyline, distanceToPath, nearestOnPath } from '../../src/map/geo';
import { reportsOnRoute, minutes, kilometres } from '../../src/route/google';
import { parseCameras } from '../../src/cctv/cameras';
import { snapshot } from './fixtures';

test('decodes Google\'s documented example polyline', () => {
  const points = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
  expect(points).toEqual([[-120.2, 38.5], [-120.95, 40.7], [-126.453, 43.252]]);
});

test('distance to a path and how far along it', () => {
  const path: [number, number][] = [[106.80, -6.20], [106.81, -6.20]];           // ~1.1 km due east
  expect(distanceToPath([106.805, -6.20], path)).toBeLessThan(1);
  expect(distanceToPath([106.805, -6.2005], path)).toBeGreaterThan(50);            // ~55 m south
  expect(distanceToPath([106.805, -6.2005], path)).toBeLessThan(60);
  expect(chainage([106.805, -6.2005], path)).toBeGreaterThan(540);
  expect(chainage([106.805, -6.2005], path)).toBeLessThan(570);
  expect(nearestOnPath([106.79, -6.20], path).along).toBe(0);                     // before the start: clamps to it
});

test('reports on a route: only within 60 m, in the order met from the start', () => {
  const path = decodePolyline('~_vd@oi|jSn}@o}@n}@o}@');                           // (-6.18,106.81) → (-6.19,106.82) → (-6.20,106.83)
  const found = reportsOnRoute(snapshot.reports as any, path);
  expect(found.map(item => item.report.id)).toEqual(['test-a', 'test-c']);
  expect(found[0].along).toBeLessThan(found[1].along);
  expect(reportsOnRoute(snapshot.reports as any, decodePolyline('~_vd@oi|jSo}@owHnzDnzD')).map(item => item.report.id)).not.toContain('test-c');
});

test('times and distances read in Indonesian', () => {
  expect(minutes(30)).toBe('1 mnt');
  expect(minutes(35 * 60)).toBe('35 mnt');
  expect(minutes(95 * 60)).toBe('1 j 35 mnt');
  expect(kilometres(640)).toBe('640 m');
  expect(kilometres(12_440)).toBe('12,4 km');
});

test('the camera file keeps only well-formed Jakarta places with https streams', () => {
  const data = parseCameras({ source: { name: 'S', url: 'https://example.test', host: 'H', curatedAt: '2026-11-12', note: '' }, locations: [
    { id: 'ok', name: 'Jl. A', lat: -6.2, lng: 106.8, approx: true, streams: [{ id: 's1', label: 'A', operator: 'Dishub', hls: 'https://cam.test/1/index.m3u8', embed: 'javascript:alert(1)' }] },
    { id: 'http', name: 'Jl. B', lat: -6.2, lng: 106.8, streams: [{ id: 's2', label: 'B', hls: 'http://cam.test/2.m3u8' }] },
    { id: 'far', name: 'Bandung', lat: -6.9, lng: 107.6, streams: [{ id: 's3', label: 'C', hls: 'https://cam.test/3.m3u8' }] },
  ] });
  expect(data?.locations.map(place => place.id)).toEqual(['ok']);
  expect(data?.locations[0].streams[0].embed).toBe('https://example.test');
  expect(parseCameras({ nope: true })).toBeNull();
});
