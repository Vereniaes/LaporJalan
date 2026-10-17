import { test, expect } from '@playwright/test';
import { style } from './fixtures';
import { prepare, ready, mapHandle, mapState } from './helpers/map';

test('G06 close labels restore original visibility after zoom, exit and style replacement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  const map = await mapHandle(page);
  const labels = {
    ...style,
    sources: { labels: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } },
    layers: [...style.layers,
      { id: 'label-default', type: 'symbol', source: 'labels', layout: { 'symbol-placement': 'line' } },
      { id: 'label-visible', type: 'symbol', source: 'labels', layout: { 'symbol-placement': 'line-center', visibility: 'visible' } },
      { id: 'label-hidden', type: 'symbol', source: 'labels', layout: { 'symbol-placement': 'line', visibility: 'none' } },
      { id: 'label-city', type: 'symbol', source: 'labels', layout: { 'symbol-placement': 'point' } },
    ],
  };
  const visibility = () => map.evaluate(map => ['label-default', 'label-visible', 'label-hidden', 'label-city']
    .map(id => map.getLayoutProperty(id, 'visibility') ?? null));
  const ordinary = [null, 'visible', 'none', null];
  const close = ['none', 'none', 'none', null];
  await map.evaluate((map, style) => map.setStyle(style, { diff: false }), labels);
  await ready(page);
  await expect.poll(visibility).toEqual(ordinary);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  await expect.poll(visibility).toEqual(close);
  await map.evaluate(map => map.jumpTo({ zoom: 21 }));
  await ready(page);
  await expect.poll(visibility).toEqual(ordinary);
  await page.getByRole('button', { name: 'Jalanan', exact: true }).click();
  await ready(page);
  await expect.poll(visibility).toEqual(close);
  await map.evaluate((map, style) => map.setStyle(style, { diff: false }), labels);
  await ready(page);
  await expect.poll(visibility).toEqual(close);
  await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  await page.getByRole('button', { name: '✕ Tutup', exact: true }).click();
  await ready(page);
  await expect.poll(visibility).toEqual(ordinary);
  expect((await mapState(page))!.zoom).toBe(16.5);
  expect((await mapState(page))!.inspection).toBeUndefined();
  await map.dispose();
});
