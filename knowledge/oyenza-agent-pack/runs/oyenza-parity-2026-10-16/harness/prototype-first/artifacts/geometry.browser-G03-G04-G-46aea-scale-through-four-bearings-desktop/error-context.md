# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: geometry.browser.spec.ts >> G03 G04 G05 prototype renders at physical scale through four bearings
- Location: tests/geometry.browser.spec.ts:6:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.evaluate: Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [active]:
  - region "Map" [ref=e2]
  - paragraph [ref=e3]: "Synthetic fixture: 0.52 m wide / 0.075 m deep / scale 1:1"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | async function state(page: import('@playwright/test').Page) {
  4  |   return page.evaluate(() => (window as any).prototypeLayer?.getState());
  5  | }
  6  | test('G03 G04 G05 prototype renders at physical scale through four bearings', async ({ page }, info) => {
  7  |   await page.goto('/tests/geometry/prototype.html');
  8  |   await expect.poll(async () => (await state(page))?.renderCount ?? 0).toBeGreaterThan(0);
  9  |   for (const bearing of [0, 90, 180, 270]) {
  10 |     await page.evaluate(bearing => (window as any).prototypeMap.jumpTo({ bearing, pitch: 60 }), bearing);
> 11 |     await page.evaluate(() => new Promise(resolve => (window as any).prototypeMap.once('idle', resolve)));
     |                ^ Error: page.evaluate: Test timeout of 45000ms exceeded.
  12 |     const actual = await state(page);
  13 |     expect(actual.canvasShared).toBe(true);
  14 |     expect(actual.webgl2).toBe(true);
  15 |     expect(actual.geometry.minZ).toBeCloseTo(-0.075, 6);
  16 |     expect(actual.depthRangeAfter).toEqual(actual.depthRangeBefore);
  17 |     const projected = await page.evaluate(() => {
  18 |       const map = (window as any).prototypeMap;
  19 |       const point = map.project((window as any).prototypeLayer.options.anchor);
  20 |       return [point.x, point.y];
  21 |     });
  22 |     expect(Math.hypot(...actual.projectedAnchorCss.map((n: number, i: number) => n - projected[i]))).toBeLessThanOrEqual(2);
  23 |     await page.screenshot({ path: info.outputPath(`cavity-${bearing}.png`) });
  24 |     await info.attach(`state-${bearing}`, { body: JSON.stringify(actual), contentType: 'application/json' });
  25 |   }
  26 |   await page.evaluate(() => {
  27 |     const map = (window as any).prototypeMap;
  28 |     map.jumpTo({ bearing: 0, pitch: 60 });
  29 |     map.setLayoutProperty('fixture-blocker', 'visibility', 'visible');
  30 |   });
  31 |   await page.evaluate(() => new Promise(resolve => (window as any).prototypeMap.once('idle', resolve)));
  32 |   await page.screenshot({ path: info.outputPath('cavity-blocker.png') });
  33 |   // Visibility and correct occlusion still require inspection of these artifacts.
  34 | });
  35 | 
  36 | test('L01 L03 prototype releases its resources over 20 cycles', async ({ page }, info) => {
  37 |   await page.goto('/tests/geometry/prototype.html');
  38 |   await expect.poll(async () => (await state(page))?.renderCount ?? 0).toBeGreaterThan(0);
  39 |   const cycles = [];
  40 |   for (let cycle = 0; cycle < 20; cycle++) {
  41 |     const removed = await page.evaluate(() => {
  42 |       (window as any).setPrototypeLayer(false);
  43 |       return (window as any).prototypeLayer.getState();
  44 |     });
  45 |     expect(removed.disposed).toBe(true);
  46 |     expect(removed.resources).toEqual({ geometries: 0, materials: 0, textures: 0, programs: 0 });
  47 |     await page.evaluate(() => (window as any).setPrototypeLayer(true));
  48 |     await expect.poll(async () => (await state(page))?.renderCount ?? 0).toBeGreaterThan(0);
  49 |     cycles.push(await state(page));
  50 |     expect(await page.locator('canvas').count()).toBe(1);
  51 |   }
  52 |   await page.evaluate(() => (window as any).reloadPrototypeStyle());
  53 |   await expect.poll(async () => (await state(page))?.renderCount ?? 0).toBeGreaterThan(0);
  54 |   await info.attach('cycles', { body: JSON.stringify(cycles), contentType: 'application/json' });
  55 | });
  56 | 
```