import { test, expect } from '@playwright/test';
import { fixture } from './fixtures';
import mappedRoad from './mapped-road.json' with { type: 'json' };
import { prepare, ready, mapState, mapHandle, evidence } from './helpers/map';

test('G03 G04 mapped road integration keeps synthetic damage at the verified map anchor', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page, true);
  const report = { ...fixture.report, id: mappedRoad.id, lng: mappedRoad.anchor[0], lat: mappedRoad.anchor[1],
    title: 'Model uji pada jalan terpetakan', address: `${mappedRoad.road} - dimensi sintetis` };
  await page.route('**/api/reports', route => route.fulfill({ json: { data: [report] } }));
  await page.reload();
  await ready(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  const map = await mapHandle(page);
  for (const bearing of [0, 90, 180, 270]) {
    const before = await mapState(page);
    await info.attach(`before-bearing-${bearing}`, { body: JSON.stringify(before, null, 2), contentType: 'application/json' });
    await map.evaluate((map, bearing) => {
      map.easeTo({ bearing, around: map.getLayer('inspection-damage').implementation.options.anchor, duration: 0 });
      map.triggerRepaint();
    }, bearing);
    try {
      await expect.poll(async () => {
        const current = await mapState(page);
        const difference = Math.abs(((current!.bearing - bearing + 540) % 360) - 180);
        return difference < 0.001 && (current?.inspection?.renderCount ?? 0) > before!.inspection!.renderCount;
      }, { timeout: 10000, message: `Bearing ${bearing} must reach its pose and render a newer cavity frame` }).toBe(true);
    } finally {
      await info.attach(`after-bearing-${bearing}`, { body: JSON.stringify({
        state: await mapState(page),
        renderer: await map.evaluate(map => ({ removed: !!map._removed,
          framePending: !!map._frameRequest, contextLost: map.getCanvas().getContext('webgl2')?.isContextLost(),
          canvas: [map.getCanvas().width, map.getCanvas().height] })),
      }, null, 2), contentType: 'application/json' });
      await info.attach(`direct-render-diagnostic-${bearing}`, { body: JSON.stringify(await map.evaluate(map => {
        try {
          map._render(0);
          return { error: null, renderCount: map.getLayer('inspection-damage')?.implementation?.getState().renderCount };
        } catch (error) {
          return { error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error) };
        }
      }), null, 2), contentType: 'application/json' });
    }
    await evidence(page, info, `mapped-road-${bearing}`);
  }
  const actual = (await mapState(page))!.inspection!;
  expect(actual.anchor).toEqual(mappedRoad.anchor);
  expect(actual.widthM).toBe(0.52);
  expect(actual.depthM).toBe(0.075);
  await info.attach('road-provenance', { body: JSON.stringify(mappedRoad, null, 2), contentType: 'application/json' });
  await map.dispose();
});
