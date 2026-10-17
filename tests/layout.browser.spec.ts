import { test, expect } from '@playwright/test';
import { prepare, ready, evidence } from './helpers/map';

test('U02 panel and map use one responsive boundary', async ({ page }, info) => {
  await prepare(page, true);
  const panel = (await page.locator('.control-panel').boundingBox())!;
  const map = (await page.locator('.map-region').boundingBox())!;
  if (page.viewportSize()!.width >= 900) {
    expect(panel.width).toBe(400);
    expect(map.x).toBe(panel.width);
  } else {
    expect(panel.width).toBe(page.viewportSize()!.width);
    expect(panel.y).toBeGreaterThan(page.viewportSize()!.height / 2);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
  await evidence(page, info, 'responsive-map');
});

test('M02 U02 CCTV is visible after flight and fullscreen restores focus', async ({ page }, info) => {
  await prepare(page);
  await page.getByRole('button', { name: /^CCTV/ }).click();
  await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  await ready(page);
  const popup = page.getByRole('region', { name: 'Pratinjau CCTV' });
  await expect(popup).toBeVisible();
  const rect = (await popup.boundingBox())!;
  const viewport = page.viewportSize()!;
  await evidence(page, info, 'settled-cctv');
  expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(rect.x).toBeGreaterThanOrEqual(viewport.width < 900 ? 0 : 400);
  expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width);
  expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height < 900 ? viewport.height * 0.55 : viewport.height);
  const expand = popup.getByRole('button', { name: 'Layar Penuh' });
  await expand.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: info.outputPath('cctv-expanded.png') });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(expand).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
});
