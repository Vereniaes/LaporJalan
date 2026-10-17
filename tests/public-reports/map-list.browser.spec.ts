/* Exercise public map/list states using isolated responses.
Todo:
-> verify selection, failure states, keyboard and responsive bounds
*/
import { test, expect, Page } from '@playwright/test';
import { snapshot, style } from './fixtures';
import { mapHandle, mapState, ready } from '../helpers/map';

async function prepare(page: Page, data: unknown = snapshot) {
  await page.route('**/api/public-reports', route => route.fulfill({ json: data }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '3 laporan', exact: true })).toBeVisible();
  await ready(page);
}
async function expand(page: Page) {
  const button = page.getByRole('button', { name: 'Perluas daftar' });
  if (await button.isVisible()) await button.click();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

test('selection links list and map, stays 2D and restores the previous view and focus', async ({ page }) => {
  await prepare(page);
  await expand(page);
  const before = await mapState(page);
  await page.locator('[data-report-id="test-b"]').click();
  await expect(page.locator('.lj-detail h2')).toHaveText('TEST-B');
  await expect(page.locator('.lj-marker.is-selected')).toHaveAttribute('data-report-ids', 'test-b');
  await ready(page);
  expect((await mapState(page))?.pitch).toBe(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-report-id="test-b"]')).toBeFocused();
  expect((await mapState(page))?.zoom).toBeCloseTo(before!.zoom, 5);
  expect((await mapState(page))?.center[0]).toBeCloseTo(before!.center[0], 5);
});

test('marker opens the matching report and a filter removes hidden selections', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Buka laporan TEST-B', exact: true }).click();
  await expect(page.locator('.lj-detail h2')).toHaveText('TEST-B');
  await page.getByRole('button', { name: 'Pembangunan', exact: true }).click();
  await expect(page.locator('.lj-detail')).toHaveCount(0);
  await expect(page.locator('.lj-marker')).toHaveCount(0);
  await expand(page);
  await expect(page.getByRole('heading', { name: 'Sumber kategori belum tersedia' })).toBeVisible();
});

test('search synchronizes the list and markers without inventing locations', async ({ page }) => {
  await prepare(page);
  await page.getByLabel('Cari laporan', { exact: true }).fill('selesai');
  await expect(page.locator('.lj-report-row')).toHaveCount(1);
  await expect(page.locator('.lj-marker')).toHaveCount(1);
  await expect(page.locator('.lj-marker')).toHaveAttribute('data-report-ids', 'test-b');
});

test('area filtering happens only after the explicit map action', async ({ page }) => {
  await prepare(page);
  const map = await mapHandle(page);
  await map.evaluate(instance => instance.jumpTo({ center: [106.88, -6.23], zoom: 16 }));
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
  await page.getByRole('button', { name: 'Cari di area ini' }).click();
  await expect(page.locator('.lj-report-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Hapus area' }).click();
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
  await map.dispose();
});

test('refresh failure preserves the last successful timestamp and reports', async ({ page }) => {
  await prepare(page);
  await page.route('**/api/public-reports', route => route.fulfill({ status: 503 }));
  await page.getByRole('button', { name: 'Perbarui laporan' }).click();
  await expect(page.getByRole('alert')).toContainText('Pembaruan belum berhasil');
  await expect(page.getByRole('alert')).toContainText('17 Okt');
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
});

test('initial failure is distinct from empty and retry can recover', async ({ page }) => {
  await page.route('**/api/public-reports', route => route.fulfill({ status: 503 }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Laporan belum dapat dimuat');
  await expect(page.locator('.lj-report-row')).toHaveCount(0);
  await expect(page.getByText('Belum ada laporan yang sesuai')).toHaveCount(0);
  await page.route('**/api/public-reports', route => route.fulfill({ json: { ...snapshot, reports: [] } }));
  await page.getByRole('button', { name: 'Coba lagi' }).click();
  await expand(page);
  await expect(page.getByText('Belum ada laporan yang sesuai')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('unavailable map keeps the report details usable', async ({ page }) => {
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await expect(page.getByText('Peta belum tersedia sepenuhnya.', { exact: false })).toBeVisible();
  await expand(page);
  await page.locator('[data-report-id="test-a"]').click();
  await expect(page.locator('.lj-detail h2')).toHaveText('TEST-A');
});

test('mobile and desktop keep attribution, controls and panel inside the viewport', async ({ page }, info) => {
  await prepare(page);
  const horizontal = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  expect(horizontal).toBe(true);
  const panel = await page.locator('.lj-panel').boundingBox();
  const attribution = await page.locator('.maplibregl-ctrl-attrib').boundingBox();
  if (info.project.name === 'mobile') expect(attribution!.y + attribution!.height).toBeLessThanOrEqual(panel!.y + 1);
  await page.screenshot({ path: info.outputPath('map-list.png') });
  await expand(page);
  await page.locator('[data-report-id="test-b"]').click();
  await expect(page.locator('.lj-detail h2')).toBeFocused();
  await page.screenshot({ path: info.outputPath('detail.png') });
});

test('keyboard search and report navigation work without pointing at the map', async ({ page }) => {
  await prepare(page);
  await expand(page);
  await page.getByLabel('Cari laporan', { exact: true }).focus();
  await page.keyboard.type('TEST-B');
  const row = page.locator('[data-report-id="test-b"]');
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.lj-detail h2')).toBeFocused();
  await page.getByRole('button', { name: 'Kembali ke daftar' }).press('Enter');
  await expect(row).toBeFocused();
});

test('a narrow screen keeps the list, detail and attribution reachable', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await prepare(page);
  await expand(page);
  await page.locator('[data-report-id="test-b"]').click();
  await expect(page.locator('.lj-detail h2')).toBeVisible();
  await page.getByRole('link', { name: 'Buka peta sumber' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', { name: 'Buka peta sumber' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('narrow-detail.png') });
});

test('repeated selection does not add map canvases or retain old marker elements', async ({ page }) => {
  await prepare(page);
  await expand(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const canvasCount = await page.locator('canvas').count();
  const markerCount = await page.locator('.lj-marker').count();
  for (let i = 0; i < 20; i++) {
    await page.locator('[data-report-id="test-b"]').click();
    await page.getByRole('button', { name: 'Kembali ke daftar' }).click();
  }
  await expect(page.locator('canvas')).toHaveCount(canvasCount);
  await expect(page.locator('.lj-marker')).toHaveCount(markerCount);
});

test('loading waits for actual data, including data arriving after the map', async ({ page }) => {
  let release: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/public-reports', async route => { await gate; await route.fulfill({ json: snapshot }); });
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/');
  await expect(page.getByText('Memuat laporan dari CRM Jakarta…')).toBeVisible();
  await expect(page.locator('.lj-report-row')).toHaveCount(0);
  await ready(page);
  release!();
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
  await expect(page.locator('.lj-marker')).not.toHaveCount(0);
});

test('closing detail restores the collapsed mobile panel and its map context', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile panel behavior');
  await prepare(page);
  const before = await mapState(page);
  await page.locator('[data-report-id="test-a"]').click();
  await expect(page.getByRole('button', { name: 'Lihat peta', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Kembali ke daftar' }).click();
  await expect(page.getByRole('button', { name: 'Perluas daftar' })).toBeVisible();
  await ready(page);
  expect((await mapState(page))?.center[0]).toBeCloseTo(before!.center[0], 5);
  expect((await mapState(page))?.center[1]).toBeCloseTo(before!.center[1], 5);
});

test('2D is initial and the 3D choice survives selection, search and return', async ({ page }) => {
  await prepare(page);
  const toggle = page.getByRole('button', { name: 'Mode 3D', exact: true });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect((await mapState(page))?.pitch).toBe(0);
  await toggle.click();
  await ready(page);
  expect((await mapState(page))?.pitch).toBeCloseTo(56, 4);
  await page.getByLabel('Cari laporan', { exact: true }).fill('TEST-B');
  await page.locator('[data-report-id="test-b"]').click();
  await ready(page);
  expect((await mapState(page))?.pitch).toBeCloseTo(56, 4);
  await page.getByRole('button', { name: 'Kembali ke daftar' }).click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect((await mapState(page))?.pitch).toBeCloseTo(56, 4);
  await toggle.click();
  await ready(page);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect((await mapState(page))?.pitch).toBe(0);
  await page.locator('[data-report-id="test-b"]').click();
  await ready(page);
  expect((await mapState(page))?.pitch).toBe(0);
});

test('rapid mode changes cancel old camera transitions and reuse the canvas', async ({ page }) => {
  await prepare(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const toggle = page.getByRole('button', { name: 'Mode 3D', exact: true });
  const canvases = await page.locator('canvas').count();
  for (let i = 0; i < 10; i++) { await toggle.click(); await toggle.click(); }
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect((await mapState(page))?.pitch).toBe(0);
  await expect(page.locator('canvas')).toHaveCount(canvases);
  const map = await mapHandle(page);
  expect(await map.evaluate(instance => ({ maxPitch: instance.getMaxPitch(), rotate: instance.dragRotate.isEnabled(), touchPitch: instance.touchPitch.isEnabled() })))
    .toEqual({ maxPitch: 0, rotate: false, touchPitch: false });
  await map.dispose();
});
