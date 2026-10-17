import { test, expect } from '@playwright/test';
import { prepare, ready, mapState, evidence } from './helpers/map';

test('G02 unavailable WebGL2 preserves a usable 2D map', async ({ page }, info) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...options) {
      if (type === 'webgl2') return null;
      return getContext.call(this, type, ...options);
    } as typeof getContext;
  });
  await prepare(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  await expect(page.getByText('Inspeksi 3D belum didukung pada perangkat ini.', { exact: true })).toBeVisible();
  expect((await mapState(page))!.inspection).toBeUndefined();
  await page.locator('#b-3d').click();
  await ready(page);
  expect((await mapState(page))!.pitch).toBe(0);
  await page.getByRole('button', { name: 'Perbesar peta' }).click();
  await ready(page);
  expect((await mapState(page))!.pitch).toBe(0);
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(1);
  await evidence(page, info, 'webgl1-fallback');
});
