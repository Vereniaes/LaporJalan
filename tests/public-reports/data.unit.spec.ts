/* Verify the public contract and shared list/map filter.
Todo:
-> reject invalid metadata before creating map points
*/
import { test, expect } from '@playwright/test';
import { filterReports, parseSnapshot } from '../../src/public-reports/data';
import { snapshot } from './fixtures';

test('valid metadata stays distinct from damage measurements', () => {
  const result = parseSnapshot(snapshot);
  expect(result).toEqual(snapshot);
  expect(result.reports[0]).not.toHaveProperty('widthCm');
});
test('malformed responses and invalid points fail instead of displaying sample data', () => {
  for (const input of [{}, { ...snapshot, source: { ...snapshot.source, url: 'https://invalid.example' } },
    { ...snapshot, reports: [{ ...snapshot.reports[0], lng: 999 }] },
    { ...snapshot, reports: [snapshot.reports[0], snapshot.reports[0]] }]) expect(() => parseSnapshot(input)).toThrow();
});
test('search, category and area use the same report set', () => {
  const reports = snapshot.reports;
  expect(filterReports(reports, 'all', ' selesai ', null).map(row => row.id)).toEqual(['test-b']);
  expect(filterReports(reports, 'construction', '', null)).toEqual([]);
  expect(filterReports(reports, 'road', '', { west: 106.8, east: 106.83, south: -6.2, north: -6.18 }).map(row => row.id)).toEqual(['test-a', 'test-c']);
});
