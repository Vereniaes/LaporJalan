/* Todo:
-> verify public map states, selection, keyboard, and responsive bounds
-> a report opens as a card on its pin (no detail page beside the map, owner choice 9 Nov)
*/
import { test, expect, Page } from '@playwright/test';
import { snapshot, style } from './fixtures';
import { mapHandle, mapState, ready } from '../helpers/map';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: true, write: true, login: true, reason: null } }));
  await page.route('**/api/community/reports*', route => route.fulfill({ json: { reports: [], nextCursor: null } }));
});

async function prepare(page: Page, data: unknown = snapshot) {
  await page.route('**/api/public-reports', route => route.fulfill({ json: data }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/peta');
  // one title with the count as a badge (owner, 11 Nov); the count is also announced
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jalan di sekitar3');
  await expect(page.locator('.lj-panel-intro .lj-count')).toHaveText('3');
  await expect(page.getByText('3 laporan', { exact: true })).toHaveCount(1);
  if (process.env.LJ_SHOT) { const expand = page.getByRole('button', { name: 'Perluas daftar' }); if (await expand.isVisible()) await expand.click(); await page.screenshot({ path: `/tmp/panel-${test.info().project.name}.png` }); }
  await expect(page.getByRole('button', { name: 'Mode 3D', exact: true })).toBeVisible();
  await ready(page);
}
const card = (page: Page) => page.locator('.lj-popup.is-pinned');
async function expand(page: Page) {
  const button = page.getByRole('button', { name: 'Perluas daftar' });
  if (await button.isVisible()) await button.click();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

test('a pin previews its report on hover and pins it on click; the list stays', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Hover needs a fine pointer');
  await prepare(page);
  await page.getByRole('button', { name: 'Buka laporan TEST-B', exact: true }).hover();
  await expect(page.locator('.lj-popup:not(.is-pinned) h2')).toHaveText('TEST-B');
  await expect(card(page)).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('laporan')).toBeNull();
  await page.getByRole('button', { name: 'Buka laporan TEST-B', exact: true }).click();
  await expect(card(page).locator('h2')).toHaveText('TEST-B');
  expect(new URL(page.url()).searchParams.get('laporan')).toBe('test-b');
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
  await expect(page.locator('.lj-detail')).toHaveCount(0);
  // previewing another report (here from its list row; its pin is off-screen after the zoom) never replaces the pinned card
  await page.locator('[data-report-id="test-a"]').hover();
  await expect(page.locator('.lj-popup:not(.is-pinned) h2')).toHaveText('TEST-A');
  await expect(card(page).locator('h2')).toHaveText('TEST-B');
});

test('a pinned report shows Laporan and Riwayat tabs from the database, clear of the header', async ({ page }) => {
  await page.route('**/api/public-reports/test-b', route => route.fulfill({ json: { id: 'test-b', code: 'TEST-B', subcategory: 'Jalan', status: 'Disposisi',
    unit: 'SUDIN BINA MARGA', area: { village: 'CAKUNG TIMUR', district: 'CAKUNG', city: 'JAKARTA TIMUR' }, description: 'Lubang besar di lajur kiri',
    address: 'Jalan Raya Bekasi', addressDetail: '', createdAt: '2026-10-17T00:00:00.000Z', updatedAt: '2026-10-17T03:00:00.000Z',
    history: [{ at: '2026-10-17T03:00:00.000Z', status: 'Disposisi', unit: 'SUDIN BINA MARGA', role: 'skpd', note: 'Mohon ditindaklanjuti' },
      { at: '2026-10-17T01:00:00.000Z', status: 'Menunggu', unit: null, role: 'lurah', note: '' }] } }));
  await prepare(page);
  await expand(page);
  await page.locator('[data-report-id="test-b"]').click();
  const pinned = card(page);
  await expect(pinned.getByRole('tab', { name: 'Laporan', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(pinned).toContainText('SUDIN BINA MARGA');
  await expect(pinned).toContainText('Lubang besar di lajur kiri');
  await expect(pinned).toContainText('CAKUNG TIMUR, CAKUNG, JAKARTA TIMUR');
  await pinned.getByRole('tab', { name: /^Riwayat/ }).click();
  await expect(pinned.locator('.lj-popup-history li')).toHaveCount(2);
  await expect(pinned.locator('.lj-popup-history li').first()).toContainText('Mohon ditindaklanjuti');
  await expect(pinned.locator('.lj-popup-history li').last()).toContainText('Menunggu (Kelurahan)');
  const header = (await page.locator('.lj-header').boundingBox())!, box = (await pinned.locator('.lj-popup-card').boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
});

test('selection links list and map, stays 2D and restores the previous view and focus', async ({ page }) => {
  await prepare(page);
  await expand(page);
  const before = await mapState(page);
  await page.locator('[data-report-id="test-b"]').click();
  await expect(card(page).locator('h2')).toHaveText('TEST-B');
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
  await expect(card(page).locator('h2')).toHaveText('TEST-B');
  await card(page).getByRole('button', { name: 'Tutup laporan', exact: true }).click();
  await page.getByRole('button', { name: 'Pembangunan', exact: true }).click();
  await expect(card(page)).toHaveCount(0);
  await expect(page.locator('.lj-marker')).toHaveCount(0);
  await expand(page);
  await expect(page.getByRole('heading', { name: 'Belum ada laporan yang sesuai' })).toBeVisible();
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
  await page.goto('/peta');
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
  await page.goto('/peta');
  await expect(page.getByText('Peta belum tersedia sepenuhnya.', { exact: false })).toBeVisible();
  await expand(page);
  await page.locator('[data-report-id="test-a"]').click();
  await expect(card(page).locator('h2')).toHaveText('TEST-A');
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
  await expect(card(page).locator('h2')).toBeFocused();
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
  await expect(card(page).locator('h2')).toBeFocused();
  await card(page).getByRole('button', { name: 'Tutup laporan' }).press('Enter');
  await expect(row).toBeFocused();
});

test('a narrow screen keeps the list, detail and attribution reachable', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await prepare(page);
  await expand(page);
  await page.locator('[data-report-id="test-b"]').click();
  await expect(card(page).locator('h2')).toBeVisible();
  await expect(card(page).locator('.lj-status')).toBeInViewport();
  // the panel never turns into a second page
  await expect(page.locator('.lj-report-row')).not.toHaveCount(0);
  // the data source is never named on the map page (owner choice, 9 Nov)
  expect(await page.locator('body').innerText()).not.toMatch(/CRM|JAKI/);
  await expect(page.getByRole('link', { name: /CRM|sumber/i })).toHaveCount(0);
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
    await card(page).getByRole('button', { name: 'Tutup laporan' }).click();
  }
  await expect(page.locator('canvas')).toHaveCount(canvasCount);
  await expect(page.locator('.lj-marker')).toHaveCount(markerCount);
});

test('loading waits for actual data, including data arriving after the map', async ({ page }) => {
  let release: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/public-reports', async route => { await gate; await route.fulfill({ json: snapshot }); });
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/peta');
  await expect(page.getByText('Memuat laporan…')).toBeVisible();
  await expect(page.locator('.lj-report-row')).toHaveCount(0);
  await ready(page);
  release!();
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
  await expect(page.locator('.lj-marker')).not.toHaveCount(0);
});

test('closing the card on a phone keeps the collapsed panel and restores the map context', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile panel behavior');
  await prepare(page);
  const before = await mapState(page);
  await page.locator('[data-report-id="test-a"]').click();
  await expect(card(page).locator('h2')).toHaveText('TEST-A');
  await expect(card(page)).toBeInViewport();
  await card(page).getByRole('button', { name: 'Tutup laporan' }).click();
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
  await card(page).getByRole('button', { name: 'Tutup laporan' }).click();
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


test('disabled citizen service keeps CRM readable and prevents unavailable login', async ({ page }) => {
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: false, write: false, login: false, reason: 'disabled' } }));
  await prepare(page);
  await expect(page.getByRole('button', { name: 'Tambah laporan', exact: true })).toBeDisabled();
  await expand(page);
  await page.locator('[data-report-id="test-b"]').click();
  await expect(card(page).locator('h2')).toHaveText('TEST-B');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.lj-map-canvas canvas')).toHaveCount(1);
});

test('email unavailable does not prevent reading citizen and CRM reports', async ({ page }) => {
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: true, write: true, login: false, reason: 'email_unconfigured' } }));
  await prepare(page);
  await expect(page.getByRole('button', { name: 'Tambah laporan', exact: true })).toBeDisabled();
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
});


test('invalid write origin keeps an existing account read-only', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('lj-session', 'a'.repeat(43)));
  await page.route('**/api/community/auth/session', route => route.fulfill({ json: { user: { id: '11111111-1111-4111-8111-111111111111', email: 'session-fixture@example.test' } } }));
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: true, write: false, login: false, reason: 'origin_unconfigured' } }));
  await prepare(page);
  await expect(page.getByRole('button', { name: 'Tambah laporan', exact: true })).toBeDisabled();
  await expect(page.locator('.lj-account-row').getByRole('button', { name: 'Laporan sendiri', exact: true })).toBeVisible();
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
});

test('main refresh can recover a failed capability check', async ({ page }) => {
  let attempts = 0, available = false;
  await page.route('**/api/community/capabilities', route => {
    attempts++;
    return !available ? route.fulfill({ status: 503 }) : route.fulfill({ json: { reports: true, write: true, login: true, reason: null } });
  });
  await prepare(page);
  await expect(page.getByRole('button', { name: 'Tambah laporan', exact: true })).toBeDisabled();
  const initialRequests = attempts; available = true;
  await page.getByRole('button', { name: 'Perbarui laporan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tambah laporan', exact: true })).toBeEnabled();
  expect(attempts).toBeGreaterThan(initialRequests);
});
