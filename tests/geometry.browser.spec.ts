import { test, expect } from '@playwright/test';

async function state(page: import('@playwright/test').Page) {
  return page.evaluate(() => (window as any).prototypeLayer?.getState());
}
test('G03 G04 G05 prototype renders at physical scale through four bearings', async ({ page }, info) => {
  await page.goto('/tests/geometry/prototype.html');
  await expect.poll(async () => (await state(page))?.renderCount ?? 0).toBeGreaterThan(0);
  for (const bearing of [0, 90, 180, 270]) {
    await page.evaluate(bearing => new Promise(resolve => {
      const map = (window as any).prototypeMap;
      map.once('render', resolve);
      map.jumpTo({ bearing, pitch: 60 });
      map.triggerRepaint();
    }), bearing);
    const actual = await state(page);
    expect(actual.canvasShared).toBe(true);
    expect(actual.webgl2).toBe(true);
    expect(actual.geometry.minZ).toBeCloseTo(-0.075, 6);
    for (const range of [actual.depthRangeBefore, actual.depthRangeAfter]) {
      expect(Array.isArray(range)).toBe(true);
      expect(range).toHaveLength(2);
      expect(range.every((value: unknown) => typeof value === 'number' && Number.isFinite(value))).toBe(true);
    }
    expect(actual.depthRangeAfter).toEqual(actual.depthRangeBefore);
    const projected = await page.evaluate(() => {
      const map = (window as any).prototypeMap;
      const point = map.project((window as any).prototypeLayer.options.anchor);
      return [point.x, point.y];
    });
    expect(Math.hypot(...actual.projectedAnchorCss.map((n: number, i: number) => n - projected[i]))).toBeLessThanOrEqual(2);
    await page.screenshot({ path: info.outputPath(`cavity-${bearing}.png`) });
    await info.attach(`state-${bearing}`, { body: JSON.stringify(actual), contentType: 'application/json' });
  }
  await expect.poll(() => page.evaluate(() => (window as any).prototypeMap.isSourceLoaded('blocker'))).toBe(true);
  await page.evaluate(() => new Promise(resolve => {
    const map = (window as any).prototypeMap;
    map.once('render', resolve);
    map.jumpTo({ bearing: 0, pitch: 60 });
    map.setLayoutProperty('fixture-blocker', 'visibility', 'visible');
    map.triggerRepaint();
  }));
  await page.screenshot({ path: info.outputPath('cavity-blocker.png') });
  // Visibility and correct occlusion still require inspection of these artifacts.
});

test('L01 L03 prototype releases its resources over 20 cycles', async ({ page }, info) => {
  await page.goto('/tests/geometry/prototype.html');
  await expect.poll(async () => (await state(page))?.renderCount ?? 0).toBeGreaterThan(0);
  const cycles = [];
  for (let cycle = 0; cycle < 20; cycle++) {
    const removed = await page.evaluate(() => {
      (window as any).setPrototypeLayer(false);
      return (window as any).prototypeLayer.getState();
    });
    expect(removed.disposed).toBe(true);
    expect(removed.resources).toEqual({ geometries: 0, materials: 0, textures: 0, programs: 0 });
    await page.evaluate(() => (window as any).setPrototypeLayer(true));
    await expect.poll(async () => (await state(page))?.renderCount ?? 0).toBeGreaterThan(0);
    cycles.push(await state(page));
    expect(await page.locator('canvas').count()).toBe(1);
  }
  await page.evaluate(() => (window as any).reloadPrototypeStyle());
  await expect.poll(async () => (await state(page))?.renderCount ?? 0).toBeGreaterThan(0);
  await info.attach('cycles', { body: JSON.stringify(cycles), contentType: 'application/json' });
});
