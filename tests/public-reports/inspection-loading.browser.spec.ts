/* Todo:
-> keep delayed inspection code from changing a cancelled map view
*/
import { test, expect, type Page } from '@playwright/test';
import { snapshot, style } from './fixtures';
import { mapHandle, mapState, ready } from '../helpers/map';
import type { CitizenReport } from '../../src/public-reports/community';

const anchor: [number, number] = [106.8232095, -6.196562];
const report: CitizenReport = {
  id: '44444444-4444-4444-8444-444444444444', code: 'LJ-LOADING-FIXTURE', origin: 'community', category: 'road', sourceCategory: 'Jalan',
  title: 'Fixture inspeksi tertunda', description: 'Laporan sintetis khusus pengujian pemuatan ilustrasi.', address: '', lng: anchor[0], lat: anchor[1],
  createdAt: '2026-10-28T10:00:00.000Z', updatedAt: '2026-10-28T10:00:00.000Z', status: 'reported', sourceStatus: 'Dilaporkan',
  revision: 0, media: [], updates: [], canManage: false, canUpdate: false,
  condition: { kind: 'pothole', observedAt: '2026-10-28T10:00:00.000Z', source: 'reporter', locationConfirmed: true,
    geometry: { type: 'Point', coordinates: anchor }, dimensions: { method: 'measured', tool: 'Meteran fixture', widthM: .52, depthM: .075 } },
};
const modulePath = '**/src/map/DamageLayer.ts*';

async function setup(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/public-reports', route => route.fulfill({ json: { ...snapshot, reports: [] } }));
  await page.route('**/api/community/**', route => route.fulfill({ json: route.request().url().endsWith('/capabilities')
    ? { reports: true, write: true, login: true, reason: null }
    : route.request().url().includes('/reports/') ? report : { reports: [report], nextCursor: null } }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/peta');
  await expect(page.locator('.lj-report-row')).toHaveCount(1);
  await ready(page);
  await page.locator('.lj-report-row').click();
  await expect(page.getByRole('button', { name: 'Lihat ilustrasi 3D', exact: true })).toBeVisible();
  await ready(page);
}

async function delayModule(page: Page) {
  let release!: () => void, arrived = false;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(modulePath, async route => { arrived = true; await gate; await route.continue(); });
  return { release, arrived: () => arrived };
}

test('exiting a delayed inspection restores the view and allows later re-entry', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const deferred = await delayModule(page);
  try {
    await setup(page);
    const before = (await mapState(page))!;
    await page.getByRole('button', { name: 'Lihat ilustrasi 3D', exact: true }).click();
    await expect.poll(deferred.arrived).toBe(true);
    await expect(page.getByText('Memuat ilustrasi 3D…', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Putar 90°', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Keluar inspeksi', exact: true }).click();
    await ready(page);
    const restored = (await mapState(page))!;
    expect(restored.inspection).toBeUndefined();
    expect(restored.pitch).toBe(before.pitch);
    expect(restored.zoom).toBeCloseTo(before.zoom, 5);
    deferred.release();
    await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('/src/map/DamageLayer.ts')))).toBe(true);
    expect((await mapState(page))!.inspection).toBeUndefined();
    await expect(page.getByRole('region', { name: 'Inspeksi kondisi', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Lihat ilustrasi 3D', exact: true }).click();
    await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
    await expect(page.getByText('Memuat ilustrasi 3D…', { exact: true })).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(1);
    expect(errors).toEqual([]);
  } finally { deferred.release(); }
});

test('a failed inspection module preserves readable detail and recovers after reload', async ({ page }) => {
  let fail = true;
  await page.route(modulePath, route => fail ? route.abort('failed') : route.continue());
  await setup(page);
  await page.getByRole('button', { name: 'Lihat ilustrasi 3D', exact: true }).click();
  await expect(page.getByText('Representasi 3D belum tersedia pada perangkat ini.', { exact: false })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Inspeksi kondisi', exact: true })).toHaveCount(0);
  await expect(page.locator('.lj-popup.is-pinned h2')).toHaveText(report.title);
  await ready(page);
  expect((await mapState(page))!.pitch).toBe(0);
  expect((await mapState(page))!.inspection).toBeUndefined();
  fail = false;
  await page.reload();
  await expect(page.getByRole('button', { name: 'Lihat ilustrasi 3D', exact: true })).toBeVisible();
  await ready(page);
  await page.getByRole('button', { name: 'Lihat ilustrasi 3D', exact: true }).click();
  await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('style replacement during a delayed module load installs one current inspection', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const deferred = await delayModule(page);
  try {
    await setup(page);
    await page.getByRole('button', { name: 'Lihat ilustrasi 3D', exact: true }).click();
    await expect.poll(deferred.arrived).toBe(true);
    const map = await mapHandle(page);
    await map.evaluate((instance, nextStyle) => new Promise<void>(resolve => { instance.once('style.load', () => resolve()); instance.setStyle(nextStyle, { diff: false }); }), style);
    deferred.release();
    await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
    await expect(page.getByText('Memuat ilustrasi 3D…', { exact: true })).toHaveCount(0);
    expect(await map.evaluate(instance => (instance as any).style._order.filter((id: string) => id === 'inspection-damage').length)).toBe(1);
    await page.getByRole('button', { name: 'Mode 3D', exact: true }).click();
    await ready(page);
    expect((await mapState(page))!.inspection).toBeUndefined();
    expect((await mapState(page))!.pitch).toBe(0);
    await expect(page.locator('canvas')).toHaveCount(1);
    expect(errors).toEqual([]);
    await map.dispose();
  } finally { deferred.release(); }
});
