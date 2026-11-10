/* Todo:
-> verify the Miko landing: live map, live numbers, capability-aware actions and badges, FAQ
-> protect reporting intent, restored sessions and mobile drawing
    -> these flows are copied from the 3D landing tests (now tests/archive/landing-3d.spec.archived.ts)
*/
import { test, expect, type Page } from '@playwright/test';
import { snapshot, style } from './fixtures';
import { ready } from '../helpers/map';

// --- isolated service ---
const user = { id: 'landing-owner', email: 'landing@example.test' };
async function prepare(page: Page) {
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.route('**/api/community/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/capabilities')) return route.fulfill({ json: { reports: true, write: true, login: true, reason: null } });
    if (path.endsWith('/auth/session')) return route.fulfill({ json: { user } });
    if (path.endsWith('/auth/exchange')) return route.fulfill({ json: { user, token: 'landing-fixture-session', returnTo: 'new' } });
    if (path.endsWith('/reports')) return route.fulfill({ json: { reports: [], nextCursor: null } });
    return route.abort();
  });
}
test.beforeEach(async ({ page }) => { await prepare(page); });
// --- end of isolated service ---

// --- landing ---
test('the hero map is live: public pins, cooperative gestures, a pin opens its report', async ({ page }) => {
  await page.goto('/');
  // live data, but the source is never named and no fetch time is shown (owner choice, 9 Nov)
  await expect(page.locator('.home .demo .lj-status').first()).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/CRM|JAKI|diambil/);
  await expect(page.locator('.home #data')).toHaveCount(0);
  await expect(page.locator('.home .maplibregl-cooperative-gesture-screen')).toContainText('dua jari');
  await expect(page.locator('.home .lj-map-tools')).toHaveCount(0);
  const pin = page.locator('.home .app-frame [data-report-ids="test-b"]');
  await expect(pin).toBeVisible();
  await pin.click();
  await expect(page).toHaveURL(/\/peta\?laporan=test-b/);
  await expect(page.locator('.lj-popup.is-pinned h2')).toHaveText('TEST-B');
});

test('no live numbers are shown when the public reports API fails', async ({ page }) => {
  await page.route('**/api/public-reports', route => route.fulfill({ status: 503, json: { message: 'Sumber tidak tersedia.' } }));
  await page.goto('/');
  await expect(page.locator('.home h1')).toBeVisible();
  await expect(page.locator('.home .demo .lj-status')).toHaveCount(0);
});

test('unavailable service hides reporting, marks citizen features not active, keeps the map open', async ({ page }) => {
  await page.route('**/api/community/capabilities', route => route.fulfill({ status: 503, json: { message: 'Laporan warga belum diaktifkan.' } }));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Laporkan jalan', exact: true })).toHaveCount(0);
  await page.locator('.home .hero').getByRole('link', { name: 'Buka peta' }).click();
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
});

test('legacy root report links and email confirmation links bypass the landing', async ({ page }) => {
  await page.goto('/?laporan=test-b');
  await expect(page.locator('.lj-popup.is-pinned h2')).toHaveText('TEST-B');
  await expect(page.locator('.home')).toHaveCount(0);
  await page.goto('/#masuk=landing-fixture-link');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Konfirmasi masuk', exact: true })).toBeVisible();
  await page.goto('/');
  await expect(page.locator('.home')).toBeVisible();
  await page.evaluate(() => { location.hash = 'masuk=landing-fixture-link'; });
  await expect(page.getByRole('button', { name: 'Konfirmasi masuk', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.home')).toBeVisible();
});

test('landing report intent continues through existing email confirmation to the form', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Laporkan jalan', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(new URL(page.url()).searchParams.has('buat')).toBe(false);
  await page.goto('/#masuk=landing-fixture-link');
  await page.getByRole('button', { name: 'Konfirmasi masuk', exact: true }).click();
  await expect(page.locator('.lj-composer')).toBeVisible();
  await expect(page.getByLabel('Lintang', { exact: true })).toBeVisible();
});

test('report intent waits for a stored session instead of opening an unnecessary login', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('lj-session', 'landing-fixture-session'));
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/community/auth/session', async route => { await gate; await route.fulfill({ json: { user } }); });
  await page.goto('/peta?buat=1');
  await expect(page.locator('.lj-report-row')).toHaveCount(3);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  release();
  await expect(page.locator('.lj-composer')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('a restored owner can report when delivery of new login emails is unavailable', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('lj-session', 'landing-fixture-session'));
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: true, write: true, login: false, reason: 'email_unconfigured' } }));
  await page.goto('/');
  await page.getByRole('link', { name: 'Laporkan jalan', exact: true }).click();
  await expect(page.locator('.lj-composer')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('the flow tells four steps in order and reporting leads the hero when it is on', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('.home .flow .step h3')).toHaveText(['Lihat peta', 'Buka laporan', 'Laporkan', 'Pantau pembaruan']);
  const hero = page.locator('.home .hero .actions a');
  await expect(hero.first()).toHaveText('Laporkan jalan');
  await expect(hero.first()).toHaveClass(/btn-primary/);
  // the account pages are reachable from the header and the footer while sign-in is available
  const head = page.locator('.home .site-head');
  await expect(head.getByRole('link', { name: 'Masuk', exact: true })).toHaveAttribute('href', '/masuk');
  await expect(head.getByRole('link', { name: 'Daftar', exact: true })).toHaveAttribute('href', '/daftar');
  // phones hide the section nav; Peta stays in the hero and the footer there
  if (info.project.name === 'desktop') await expect(head.getByRole('link', { name: 'Peta', exact: true })).toHaveAttribute('href', '/peta');
  await expect(page.locator('.home .foot-nav a')).toHaveText(['Beranda', 'Peta laporan', 'Daftar', 'Masuk']);
  await expect(page.locator('.home .btn-primary')).toHaveCount(2); // hero + closing card, never in the header
  await expect(page.locator('.home .flow .step').nth(2).getByRole('link', { name: 'Mulai lapor' })).toHaveAttribute('href', '/peta?buat=1');
});

test('with reporting off the hero leads with the map and the flow says which steps wait', async ({ page }) => {
  await page.route('**/api/community/capabilities', route => route.fulfill({ status: 503, json: { message: 'Laporan warga belum diaktifkan.' } }));
  await page.goto('/');
  await expect(page.locator('.home .hero .actions a').first()).toHaveText('Buka peta');
  // the account links stay even when the service is off; the forms there explain why
  await expect(page.locator('.home .site-head').getByRole('link', { name: 'Masuk', exact: true })).toHaveAttribute('href', '/masuk');
  await expect(page.locator('.home .foot-nav a')).toHaveText(['Beranda', 'Peta laporan', 'Daftar', 'Masuk']);
  await expect(page.locator('.home .flow .step').nth(2).getByRole('link', { name: 'Buka peta' })).toHaveAttribute('href', '/peta');
  await page.locator('.home .site-head').getByRole('link', { name: 'Daftar', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Kesiapan laporan warga belum dapat diperiksa.' })).toBeVisible(); // the check itself failed (503)
  await expect(page.getByRole('button', { name: 'Daftar', exact: true })).toBeDisabled();
});

test('the report drop ends with the pin placed and the stretch drawn, also with reduced motion', async ({ page }) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    const map = page.locator('.home .mini-map');
    await map.scrollIntoViewIfNeeded();
    await expect(map.locator('.lj-marker')).toHaveCSS('opacity', '1');
    await expect.poll(() => map.locator('.ruas').evaluate(e => getComputedStyle(e).clipPath)).toMatch(/^(none|inset\((0(px|%)?\s*){1,4}\))$/);
  }
});

test('the road down the flow is drawn by scrolling, every active step lights up, and reduced motion shows it all drawn', async ({ page }) => {
  await page.goto('/');
  const marking = page.locator('.home .road-marking');
  const clip = () => marking.evaluate(element => getComputedStyle(element).clipPath);
  expect(await clip()).toMatch(/inset\(0% 0% (100|9\d)/); // at the top of the page nothing is drawn yet
  await page.locator('.home .faq-sec').scrollIntoViewIfNeeded();
  await expect.poll(clip).toMatch(/^(none|inset\(0%( 0%)*( 0px)*\)|inset\(0% 0% 0%( 0%)?\))$/);
  await expect(page.locator('.home .step-node-fill')).toHaveCount(3); // steps 1, 2 and 4 are junctions; step 3 is the pin
  // each row (and its junction) lands when the visitor reaches it
  await page.locator('.home .flow .step').nth(2).scrollIntoViewIfNeeded();
  await expect(page.locator('.home .step-node.is-pin')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await clip()).toBe('none');
});

test('FAQ opens with the keyboard, one answer at a time, and survives rapid clicks', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('.home .faq details');
  const first = items.nth(0).locator('summary');
  await first.focus(); await page.keyboard.press('Enter');
  await expect(items.nth(0)).toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(0)).not.toHaveAttribute('open', '');
  await first.click(); await first.click(); await first.click();
  await expect(items.nth(0)).toHaveAttribute('open', '');
});
// --- end of landing ---

// --- reporting space on the map page ---
test('mobile reporting keeps actions visible and drawing restores the same map', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile reporting layout');
  await page.addInitScript(() => sessionStorage.setItem('lj-session', 'landing-fixture-session'));
  await page.goto('/peta?buat=1'); await ready(page);
  await expect(page.locator('.lj-composer')).toBeVisible();
  await page.getByLabel('Lintang', { exact: true }).fill('-6.2'); await page.getByLabel('Bujur', { exact: true }).fill('106.84');
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await expect(page.locator('.lj-map')).toBeHidden();
  await expect(page.locator('.lj-search')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Lanjutkan', exact: true })).toBeInViewport();
  const canvas = await page.locator('.lj-map-canvas canvas').elementHandle();
  await page.getByLabel('Jenis kondisi', { exact: true }).selectOption('pothole');
  await page.getByLabel('Bentuk lokasi', { exact: true }).selectOption('line');
  await page.getByRole('button', { name: 'Gambar ruas', exact: true }).click();
  await expect(page.locator('.lj-map')).toBeVisible();
  await expect(page.locator('.lj-map-drawing')).toBeVisible();
  expect(await canvas!.evaluate(element => element.isConnected)).toBe(true);
  await page.getByRole('button', { name: 'Batal menggambar', exact: true }).click();
  await expect(page.locator('.lj-map')).toBeHidden();
});
// --- end of reporting space on the map page ---
