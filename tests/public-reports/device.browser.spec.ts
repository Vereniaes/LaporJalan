/* Todo:
-> the map fits the device (owner choice, 10 Nov): full on capable graphics, saver mode on weak/software graphics, a raster map without WebGL
    -> headless Chromium renders WebGL in software (SwiftShader), so without a stored choice it is a "weak device" here
*/
import { test, expect, type Page } from '@playwright/test';
import { snapshot, style } from './fixtures';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
async function prepare(page: Page, { webgl = true }: { webgl?: boolean } = {}) {
  // no stored choice: the app decides from the device
  await page.addInitScript(() => localStorage.removeItem('lj-map-mode'));
  if (!webgl) await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: any[]) { return /webgl/.test(type) ? null : original.call(this, type, ...args); } as any;
  });
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: true, write: true, login: true, reason: null } }));
  await page.route('**/api/community/reports*', route => route.fulfill({ json: { reports: [], nextCursor: null } }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.route('https://tile.openstreetmap.org/**', route => route.fulfill({ body: PNG, contentType: 'image/png' }));
}

test('software graphics start in saver mode: no 3D, the toggle says so, and the full map is one click away', async ({ page }) => {
  await prepare(page);
  await page.goto('/peta');
  const saver = page.getByRole('button', { name: 'Mode hemat', exact: true });
  await expect(saver).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Mode 3D', exact: true })).toHaveCount(0);
  await expect(page.locator('.lj-map-key')).toContainText('mode hemat');
  await saver.click();
  await expect(page.getByRole('button', { name: 'Mode 3D', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mode hemat', exact: true })).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => localStorage.getItem('lj-map-mode'))).toBe('penuh');
});

test('without WebGL the raster map shows the same pins and opens the report card', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await prepare(page, { webgl: false });
  await page.goto('/peta?tab=laporan');
  await expect(page.locator('.lj-lite-map .leaflet-container')).toBeVisible();
  await expect(page.locator('.lj-map-key')).toContainText('Peta ringan');
  await expect(page.getByRole('button', { name: 'Mode 3D', exact: true })).toHaveCount(0);
  await expect(page.locator('.lj-lite-map .lj-marker').first()).toBeVisible();
  const row = page.locator('[data-report-id="test-b"]');
  if (!(await row.isVisible())) await page.getByRole('button', { name: 'Perluas daftar' }).click();
  await row.click();
  await expect(page.locator('.lj-popup.is-pinned h2')).toHaveText('TEST-B');
  // the card and the tools are on top of the map panes, not just in the DOM
  for (const selector of ['.lj-popup.is-pinned h2', '.lj-map-tools button']) {
    expect(await page.locator(selector).first().evaluate(element => { const box = element.getBoundingClientRect(); return element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)); })).toBe(true);
  }
  await expect(page.locator('.lj-popup.is-pinned').getByRole('button', { name: 'Lihat ilustrasi 3D' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('the landing shows a still map on a weak device and loads the live map on request', async ({ page }) => {
  await prepare(page, { webgl: false });
  await page.goto('/');
  const still = page.locator('.home .map-still img');
  await expect(still).toBeVisible();
  expect(await still.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.home .app-frame .lj-map')).toHaveCount(0);
  await page.getByRole('button', { name: 'Muat peta interaktif', exact: true }).click();
  await expect(page.locator('.home .app-frame .lj-lite-map .lj-marker').first()).toBeVisible();
});
