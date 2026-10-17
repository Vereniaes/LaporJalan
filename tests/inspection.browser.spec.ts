import { test, expect } from '@playwright/test';
import { prepare, ready, mapState, evidence } from './helpers/map';

test('G02 G03 inspection uses the map canvas and report dimensions', async ({ page }, info) => {
  await prepare(page, true);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  const inspection = (await mapState(page))!.inspection;
  expect(inspection.canvasShared).toBe(true);
  expect(inspection.widthM).toBe(0.52);
  expect(inspection.depthM).toBe(0.075);
  expect(inspection.geometry.minZ).toBeCloseTo(-0.075, 6);
  expect(await page.locator('canvas').count()).toBe(1);
  await evidence(page, info, 'on-map-inspection');
  await page.locator('#b-3d').click();
  await ready(page);
  expect((await mapState(page))!.inspection).toBeUndefined();
  expect((await mapState(page))!.pitch).toBe(0);
});
