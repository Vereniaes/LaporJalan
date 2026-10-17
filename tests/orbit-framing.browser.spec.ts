import { test, expect } from '@playwright/test';
import { prepare, ready, mapHandle, evidence } from './helpers/map';

test('U02 explicit orbit keeps the cavity inside the unobstructed map', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  const map = await mapHandle(page);
  await page.getByRole('button', { name: 'Putar Orbit 360°' }).click();
  const samples = await map.evaluate(map => new Promise<any[]>((resolve, reject) => {
    const samples: any[] = [];
    let previous = map.getBearing(), travel = 0;
    const { anchor, widthM } = map.getLayer('inspection-damage').implementation.options;
    const initial = map.project(anchor);
    const timeout = setTimeout(() => {
      map.off('render', sample);
      reject(new Error(`Orbit did not finish a turn; travelled ${travel} degrees`));
    }, 30000);
    const sample = () => {
      const bearing = map.getBearing();
      travel += Math.max(0, ((bearing - previous + 540) % 360) - 180);
      previous = bearing;
      if (travel < (samples.length + 1) * 90) return;
      const canvas = map.getContainer().getBoundingClientRect();
      const radius = widthM / 2;
      const points = Array.from({ length: 64 }, (_, i) => {
        const angle = i / 64 * Math.PI * 2;
        const point = map.project([anchor[0] + radius * Math.cos(angle) / (111319.49 * Math.cos(anchor[1] * Math.PI / 180)),
          anchor[1] + radius * Math.sin(angle) / 111319.49]);
        return [point.x + canvas.left, point.y + canvas.top];
      });
      const current = map.project(anchor);
      samples.push({ quadrant: samples.length + 1, bearing, travel,
        left: Math.min(...points.map(p => p[0])), right: Math.max(...points.map(p => p[0])),
        top: Math.min(...points.map(p => p[1])), bottom: Math.max(...points.map(p => p[1])),
        mapLeft: canvas.left, mapRight: canvas.right,
        anchorDrift: Math.hypot(current.x - initial.x, current.y - initial.y),
        unobstructed: points.every(([x, y]) => document.elementFromPoint(x, y) === map.getCanvas()) });
      if (samples.length === 4) {
        clearTimeout(timeout); map.off('render', sample); resolve(samples);
      }
    };
    map.on('render', sample);
  }));
  await page.getByRole('button', { name: 'Berhenti Orbit' }).click();
  await info.attach('orbit-rim-bounds', { body: JSON.stringify(samples), contentType: 'application/json' });
  await evidence(page, info, 'orbit-framing');
  expect(samples).toHaveLength(4);
  for (const bounds of samples) {
    expect(bounds.left).toBeGreaterThanOrEqual(bounds.mapLeft);
    expect(bounds.right).toBeLessThanOrEqual(bounds.mapRight);
    expect(bounds.anchorDrift).toBeLessThanOrEqual(2);
    expect(bounds.unobstructed).toBe(true);
  }
  await map.dispose();
});

test('U02 map attribution links remain unobstructed by app overlays', async ({ page }, info) => {
  await prepare(page, true);
  const links = await page.locator('.maplibregl-ctrl-attrib a').evaluateAll(links => links.map(link => {
    const box = link.getBoundingClientRect();
    const x = (box.left + box.right) / 2, y = (box.top + box.bottom) / 2;
    const hit = document.elementFromPoint(x, y);
    return { text: link.textContent, visible: box.width > 0 && box.height > 0,
      unobstructed: !!hit && link.contains(hit), coveredBy: hit?.className, x, y };
  }));
  await info.attach('attribution-hit-test', { body: JSON.stringify(links), contentType: 'application/json' });
  await evidence(page, info, 'attribution-overlays');
  expect(links.some(link => link.visible)).toBe(true);
  expect(links.filter(link => link.visible && !link.unobstructed)).toEqual([]);
});
