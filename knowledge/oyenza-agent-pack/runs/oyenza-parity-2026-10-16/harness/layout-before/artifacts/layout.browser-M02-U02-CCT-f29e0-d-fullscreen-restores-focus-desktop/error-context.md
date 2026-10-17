# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout.browser.spec.ts >> M02 U02 CCTV is visible after flight and fullscreen restores focus
- Location: tests/layout.browser.spec.ts:19:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('region', { name: 'Pratinjau CCTV' }).getByRole('button', { name: 'Layar Penuh' })
Expected: focused
Received: inactive
Timeout:  5000ms

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByRole('region', { name: 'Pratinjau CCTV' }).getByRole('button', { name: 'Layar Penuh' })
    14 × locator resolved to <button class="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-[10px] font-semibold">…</button>
       - unexpected value "inactive"

```

```yaml
- button "Layar Penuh":
  - img
  - text: Layar Penuh
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { prepare, ready, evidence } from './helpers/map';
  3  | 
  4  | test('U02 panel and map use one responsive boundary', async ({ page }, info) => {
  5  |   await prepare(page, true);
  6  |   const panel = (await page.locator('.control-panel').boundingBox())!;
  7  |   const map = (await page.locator('.map-region').boundingBox())!;
  8  |   if (page.viewportSize()!.width >= 900) {
  9  |     expect(panel.width).toBe(400);
  10 |     expect(map.x).toBe(panel.width);
  11 |   } else {
  12 |     expect(panel.width).toBe(page.viewportSize()!.width);
  13 |     expect(panel.y).toBeGreaterThan(page.viewportSize()!.height / 2);
  14 |   }
  15 |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
  16 |   await evidence(page, info, 'responsive-map');
  17 | });
  18 | 
  19 | test('M02 U02 CCTV is visible after flight and fullscreen restores focus', async ({ page }, info) => {
  20 |   await prepare(page);
  21 |   await page.getByRole('button', { name: /^CCTV/ }).click();
  22 |   await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  23 |   await ready(page);
  24 |   const popup = page.getByRole('region', { name: 'Pratinjau CCTV' });
  25 |   await expect(popup).toBeVisible();
  26 |   const rect = (await popup.boundingBox())!;
  27 |   const viewport = page.viewportSize()!;
  28 |   await evidence(page, info, 'settled-cctv');
  29 |   expect(rect.y).toBeGreaterThanOrEqual(0);
  30 |   expect(rect.x).toBeGreaterThanOrEqual(viewport.width < 900 ? 0 : 400);
  31 |   expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width);
  32 |   expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height < 900 ? viewport.height * 0.55 : viewport.height);
  33 |   const expand = popup.getByRole('button', { name: 'Layar Penuh' });
  34 |   await expand.click();
  35 |   await expect(page.getByRole('dialog')).toBeVisible();
  36 |   await page.screenshot({ path: info.outputPath('cctv-expanded.png') });
  37 |   await page.keyboard.press('Escape');
  38 |   await expect(page.getByRole('dialog')).toHaveCount(0);
> 39 |   await expect(expand).toBeFocused();
     |                        ^ Error: expect(locator).toBeFocused() failed
  40 |   await page.keyboard.press('Escape');
  41 |   await expect(popup).toHaveCount(0);
  42 | });
  43 | 
```