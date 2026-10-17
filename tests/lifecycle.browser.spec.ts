import { test, expect } from '@playwright/test';
import { prepare, ready, mapHandle, mapState, evidence } from './helpers/map';
import { style } from './fixtures';

test('G05 G06 style reload and context recovery preserve inspection', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  const map = await mapHandle(page);
  await map.evaluate((map, style) => new Promise<void>(resolve => {
    map.once('style.load', () => resolve());
    map.setStyle(style, { diff: false });
  }), style);
  await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  await ready(page);
  await map.evaluate(map => new Promise<void>(resolve => {
    const gl = map.getCanvas().getContext('webgl2');
    const extension = gl.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('Controlled context loss unavailable');
    map.once('webglcontextrestored', () => resolve());
    map.once('webglcontextlost', () => setTimeout(() => extension.restoreContext(), 100));
    extension.loseContext();
  }));
  const count = (await mapState(page))!.inspection!.renderCount;
  await map.evaluate(map => map.triggerRepaint());
  await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(count);
  for (const pose of [{ bearing: 90, pitch: 35, zoom: 24.5 }, { bearing: 180, pitch: 60, zoom: 25 }]) {
    await map.evaluate((map, pose) => new Promise<void>(resolve => {
      map.once('render', () => resolve()); map.jumpTo(pose); map.panBy([15, -10], { duration: 0 }); map.triggerRepaint();
    }), pose);
    const actual = (await mapState(page))!.inspection!;
    const projected = await map.evaluate(map => { const p = map.project(map.getLayer('inspection-damage').implementation.options.anchor); return [p.x, p.y]; });
    expect(Math.hypot(...actual.projectedAnchorCss.map((value: number, index: number) => value - projected[index]))).toBeLessThanOrEqual(2);
  }
  await evidence(page, info, 'context-restored');
  expect(await page.locator('canvas').count()).toBe(1);
  await map.dispose();
});

test('L01 L02 L03 application resources plateau over twenty complete cycles', async ({ page }, info) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const pending = new Set<number>();
    const request = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => {
      const id = request(time => { pending.delete(id); callback(time); });
      pending.add(id); return id;
    };
    window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
    (window as any).pendingFixtureFrames = () => pending.size;
  });
  await prepare(page, false, '/tests/lifecycle/index.html');
  const cycles = [];
  for (let index = 0; index < 20; index++) {
    await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
    await ready(page);
    const map = await mapHandle(page);
    const layer = await map.evaluateHandle(map => map.getLayer('inspection-damage').implementation);
    await expect.poll(() => layer.evaluate(layer => layer.getState().renderCount)).toBeGreaterThan(0);
    const resources = await layer.evaluate(layer => layer.getState().resources);
    await page.getByRole('button', { name: 'Putar Orbit 360°' }).click();
    await page.locator('#b-3d').click();
    await ready(page);
    expect(await layer.evaluate(layer => layer.getState().resources)).toEqual({ geometries: 0, materials: 0, textures: 0, programs: 0 });
    await page.getByRole('button', { name: /^CCTV/ }).click();
    await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
    await ready(page);
    await page.getByTitle('Tutup CCTV').click();
    const listeners = await map.evaluate(map => Object.fromEntries(Object.entries(map._listeners).map(([key, list]) => [key, (list as any[]).length])));
    cycles.push({ cycle: index + 1, resources, listeners, canvas: await page.locator('canvas').count() });
    await page.evaluate(() => (window as any).mountFixtureApp(false));
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => (window as any).pendingFixtureFrames())).toBe(0);
    expect(await map.evaluate(map => map._removed)).toBe(true);
    await map.dispose(); await layer.dispose();
    if (index < 19) {
      await page.evaluate(() => (window as any).mountFixtureApp(true));
      await expect(page.locator('#b-3d')).toBeVisible();
      await ready(page);
    }
  }
  for (const cycle of cycles.slice(5)) {
    expect(cycle.resources).toEqual(cycles[5].resources);
    expect(cycle.listeners).toEqual(cycles[5].listeners);
    expect(cycle.canvas).toBe(1);
  }
  await info.attach('complete-cycles', { body: JSON.stringify({ cycles, unavailable: ['GPU total memory', 'garbage-collected heap retention'] }, null, 2), contentType: 'application/json' });
});
