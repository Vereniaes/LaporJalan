/* The Peta | Laporan | Rute panel (owner, 11 Nov)
Todo:
-> /peta opens on Peta: Opal's greeting, the feature cards with word badges, "Baru masuk" newest first
-> the tab follows the URL and the arrow keys; a report link opens Laporan
-> Opal CCTV: cameras on the map and in a list; a stream that fails says so and offers a retry and the source
-> Rute without a Google key: says so and links the trip to Google Maps
*/
import { test, expect, Page } from '@playwright/test';
import { snapshot, style } from './fixtures';

const CAMERAS = { source: { name: 'CCTV Publik Pemprov DKI Jakarta', url: 'https://jakcctv.jakarta.go.id/publik', host: 'Bali Tower', curatedAt: '2026-11-12', note: '' }, locations: [
  { id: 'gatsu', name: 'Jl. Jend. Gatot Subroto', lat: -6.2139, lng: 106.8083, approx: true, streams: [
    { id: 'c1', label: 'JPO Gatot Subroto · Kamera 1', operator: 'Polda Metro Jaya', hls: 'https://cam.test/c1/index.m3u8', embed: 'https://cam.test/c1/embed.html' },
    { id: 'c2', label: 'JPO Gatot Subroto · Kamera 2', operator: 'Polda Metro Jaya', hls: 'https://cam.test/c2/index.m3u8', embed: 'https://cam.test/c2/embed.html' }] },
  { id: 'thamrin', name: 'Jl. M.H. Thamrin', lat: -6.1865, lng: 106.8232, approx: true, streams: [
    { id: 'c3', label: 'Thamrin · Kamera 1', operator: 'Dishub DKI', hls: 'https://cam.test/c3/index.m3u8', embed: 'https://cam.test/c3/embed.html' }] },
] };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: true, write: true, login: true, reason: null } }));
  await page.route('**/api/community/reports*', route => route.fulfill({ json: { reports: [], nextCursor: null } }));
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.route('**/data/cctv-jakarta.json', route => route.fulfill({ json: CAMERAS }));
  await page.route('https://cam.test/**', route => route.fulfill({ status: 404, body: '' }));
});

const openSheet = async (page: Page) => {
  const toggle = page.locator('.lj-panel-toggle');
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
};

test('the panel opens on Peta: greeting, feature cards with word badges, newest reports first', async ({ page }) => {
  await page.goto('/peta');
  await expect(page.getByRole('tab', { name: 'Peta' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.lj-greeting-bubble')).toContainText('Opal memantau');
  const cards = page.getByRole('list', { name: 'Fitur Opal' }).locator('li');
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0)).toContainText('Opal CCTV'); await expect(cards.nth(0)).toContainText('Live');
  await expect(cards.nth(2)).toContainText('Segera hadir'); await expect(cards.nth(3)).toContainText('Segera hadir');
  await expect(cards.nth(2).getByRole('button')).toHaveCount(0);                 // coming soon is not a button
  await expect(page.locator('.lj-feed-row strong')).toHaveText(['TEST-A', 'TEST-B', 'TEST-C']);
});

test('the tab follows the URL and the arrow keys; a report link opens Laporan', async ({ page }) => {
  await page.goto('/peta');
  await page.getByRole('tab', { name: 'Peta' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Laporan' })).toBeFocused();
  await expect(page).toHaveURL(/tab=laporan/);
  await openSheet(page);
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/tab=rute/);
  await page.keyboard.press('ArrowRight');
  await expect(page).not.toHaveURL(/tab=/);
  await page.goto('/peta?laporan=test-b');
  await expect(page.getByRole('tab', { name: 'Laporan' })).toHaveAttribute('aria-selected', 'true');
});

test('Opal CCTV puts cameras on the map and in a list; a failed stream says so', async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/peta');
  await expect(page.locator('.lj-cam-marker')).toHaveCount(0);                  // nothing until switched on
  await page.getByRole('button', { name: /Opal CCTV/ }).click();
  await expect(page.getByRole('button', { name: /Opal CCTV/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.lj-cam-marker')).toHaveCount(2);
  await expect(page.locator('.lj-cam-row')).toHaveCount(2);
  await page.getByRole('searchbox', { name: 'Cari kamera' }).fill('thamrin');
  await expect(page.locator('.lj-cam-row')).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Cari kamera' }).fill('');
  await page.locator('.lj-cam-marker[data-camera-id="gatsu"]').click();
  const player = page.getByRole('region', { name: 'CCTV Jl. Jend. Gatot Subroto' });
  await expect(player).toBeVisible();
  await expect(player.getByRole('button', { name: 'Kamera 2' })).toBeVisible();
  await expect(player).toContainText('Sumber: CCTV Publik Pemprov DKI Jakarta · titik di peta perkiraan');
  await expect(player.getByRole('alert')).toContainText('Kamera sedang tidak tersedia', { timeout: 20_000 });
  await expect(player.getByRole('link', { name: 'Buka sumber' })).toHaveAttribute('href', 'https://jakcctv.jakarta.go.id/publik');
  await expect(player.getByRole('button', { name: 'Coba lagi' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(player).toHaveCount(0);
  // switching the layer off removes the cameras
  await page.getByRole('button', { name: /Opal CCTV/ }).click();
  await expect(page.locator('.lj-cam-marker')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('a long list draws 30 rows, adds more near its end, and a far linked report is drawn first', async ({ page }) => {
  const many = { ...snapshot, reports: Array.from({ length: 100 }, (_, i) => ({ ...snapshot.reports[0], id: `bulk-${i}`, code: `BULK-${String(i).padStart(3, '0')}`,
    lng: 106.8 + (i % 10) / 100, lat: -6.2 + Math.floor(i / 10) / 100, createdAt: new Date(Date.UTC(2026, 9, 17, 3) - i * 60_000).toISOString() })) };
  await page.route('**/api/public-reports', route => route.fulfill({ json: many }));
  await page.goto('/peta?tab=laporan');
  await openSheet(page);
  const rows = page.locator('.lj-report-row');
  await expect(rows).toHaveCount(30);
  await expect(page.getByRole('button', { name: 'Tampilkan laporan berikutnya (30 dari 100)' })).toBeVisible();
  // near the end, 30 more by themselves (a tall panel may keep going while the end stays in reach)
  await page.locator('.lj-report-list').evaluate(list => { list.scrollTop = list.scrollHeight; });
  await expect.poll(() => rows.count()).toBeGreaterThanOrEqual(60);
  const before = await rows.count();
  if (before < 100) { await page.getByRole('button', { name: /Tampilkan laporan berikutnya/ }).click(); await expect.poll(() => rows.count()).toBeGreaterThan(before); } // the sentinel is also a button
  expect(await rows.count() % 30 === 0 || await rows.count() === 100).toBe(true);
  // a new filter starts again at 30
  await page.getByPlaceholder('Judul, kode, atau status laporan').fill('BULK');
  await expect(rows).toHaveCount(30);
  // a link to report 95 draws it first, not the 95 rows above it
  await page.goto('/peta?laporan=bulk-95');
  await openSheet(page);
  await expect(rows.first()).toHaveAttribute('data-report-id', 'bulk-95');
  await expect(rows).toHaveCount(31);
});

test('Rute without a Google key says so and opens the trip in Google Maps', async ({ page }) => {
  await page.goto('/peta?tab=rute');
  await openSheet(page);
  await expect(page.getByText('Rute belum tersedia di sini.')).toBeVisible();
  await page.getByLabel('Tujuan').fill('Blok M');
  await expect(page.getByRole('link', { name: 'Buka di Google Maps' })).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=Blok%20M&travelmode=driving');
});
