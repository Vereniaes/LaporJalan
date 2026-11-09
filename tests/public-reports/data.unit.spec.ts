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
  // the source url may be empty (data from our database); a category outside our four is still refused
  for (const input of [{}, { ...snapshot, reports: [{ ...snapshot.reports[0], category: 'parking' }] }, { ...snapshot, source: { ...snapshot.source, url: 42 } },
    { ...snapshot, reports: [{ ...snapshot.reports[0], lng: 999 }] },
    { ...snapshot, reports: [snapshot.reports[0], snapshot.reports[0]] }]) expect(() => parseSnapshot(input)).toThrow();
});
test('imported reports from the database parse with our categories and an empty source url', () => {
  const imported = { ...snapshot, source: { ...snapshot.source, name: 'LaporJalan', url: '' },
    reports: [{ ...snapshot.reports[0], category: 'drain', sourceCategory: 'Tutup Saluran' }] };
  const result = parseSnapshot(imported);
  expect(result.reports[0]).toMatchObject({ category: 'drain', sourceCategory: 'Tutup Saluran' });
  expect(result.source.url).toBe('');
});
test('search, category and area use the same report set', () => {
  const reports = snapshot.reports;
  expect(filterReports(reports, 'all', ' selesai ', null).map(row => row.id)).toEqual(['test-b']);
  expect(filterReports(reports, 'construction', '', null)).toEqual([]);
  expect(filterReports(reports, 'road', '', { west: 106.8, east: 106.83, south: -6.2, north: -6.18 }).map(row => row.id)).toEqual(['test-a', 'test-c']);
});
