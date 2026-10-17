import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { fixture, style, snapshot } from './fixtures';
import { mapState, ready, evidence, prepare } from './helpers/map';

test('B03 deterministic baseline screenshot', async ({ page }, info) => {
  await prepare(page);
  await evidence(page, info, 'baseline');
  expect(await page.locator('.maplibregl-canvas').count()).toBe(1);
});

test('C01 report selection preserves manual 2D', async ({ page }, info) => {
  await prepare(page);
  await page.locator('#b-3d').click();
  await ready(page);
  expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  await evidence(page, info, 'before-selection-2d');
  await page.getByRole('button', { name: /Daftar/ }).click();
  await page.getByText('Fixture second report', { exact: true }).click();
  await ready(page);
  await evidence(page, info, 'after-selection-2d');
  expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
});

test('C01 search preserves manual 2D', async ({ page }, info) => {
  await prepare(page);
  await page.locator('#b-3d').click();
  await ready(page);
  await page.getByPlaceholder(/Cari jalan/).fill('Fixture');
  await page.getByText('Fixture place', { exact: true }).click();
  await ready(page);
  await evidence(page, info, 'after-search-2d');
  expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
});

test('M01 static CCTV snapshot never claims LIVE', async ({ page }, info) => {
  await prepare(page);
  await page.getByRole('button', { name: /^CCTV/ }).click();
  await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  const popup = page.locator('.maplibregl-popup-content');
  await expect(popup).toBeVisible();
  await expect(popup.locator('img')).toHaveJSProperty('complete', true);
  await info.attach('cctv-dom', { body: JSON.stringify({ images: await popup.locator('img').count(), videos: await popup.locator('video').count(), text: await popup.innerText() }, null, 2), contentType: 'application/json' });
  await evidence(page, info, 'cctv-snapshot');
  await expect(popup.getByText('LIVE', { exact: true })).toHaveCount(0);
});

test('B03 live-integration map screenshot', async ({ page }, info) => {
  await prepare(page, true);
  await evidence(page, info, 'real-map-baseline');
});


test('C02 reset preserves manual 2D', async ({ page }, info) => {
  await prepare(page);
  await page.locator('#b-3d').click();
  await ready(page);
  await page.getByTitle('Reset Sudut Pandang').click();
  await ready(page);
  await evidence(page, info, 'reset-2d');
  expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
});

test('C03 explicit inspection exits to previous 2D', async ({ page }, info) => {
  await prepare(page);
  await page.locator('#b-3d').click();
  await ready(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  expect((await mapState(page))!.pitch).toBeGreaterThan(0);
  await page.getByRole('button', { name: /Tutup$/ }).click();
  await ready(page);
  await evidence(page, info, 'exit-inspection-2d');
  expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
});

test('C04 selecting 2D cancels inspection and orbit', async ({ page }, info) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  await page.getByRole('button', { name: 'Putar Orbit 360°' }).click();
  await page.locator('#b-3d').click();
  await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  await ready(page);
  const first = (await mapState(page))!;
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const second = (await mapState(page))!;
  await evidence(page, info, 'orbit-cancelled-2d');
  expect(first.pitch).toBeCloseTo(0, 6);
  expect(second.bearing).toBeCloseTo(first.bearing, 6);
});

test('C06 filtering selected report clears its map detail', async ({ page }, info) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  await page.getByRole('button', { name: /Daftar/ }).click();
  await page.getByRole('button', { name: 'Retak', exact: true }).click();
  await expect(page.locator('.maplibregl-marker').filter({ hasText: 'LUBANG' })).toHaveCount(0);
  await evidence(page, info, 'filtered-selection');
  await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
});

test('C01 CCTV selection preserves manual 2D', async ({ page }, info) => {
  await prepare(page);
  await page.locator('#b-3d').click();
  await ready(page);
  await page.getByRole('button', { name: /^CCTV/ }).click();
  await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  await ready(page);
  await evidence(page, info, 'cctv-2d');
  expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
});
