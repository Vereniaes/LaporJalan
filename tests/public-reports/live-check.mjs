/* Capture the real source and visible UI without replacing network responses.
Todo:
-> record live checks separately from deterministic tests
*/
import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const out = 'knowledge/rebranding-2026-10-17/runs/map-list-2026-10-17';
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
const findMap = () => {
  const container = document.querySelector('.maplibregl-map');
  let fiber = container?.[Object.keys(container).find(key => key.startsWith('__reactFiber$'))];
  while (fiber) {
    for (let hook = fiber.memoizedState; hook; hook = hook.next) {
      const value = hook.memoizedState?.current;
      if (value && typeof value.getPitch === 'function') return value;
    }
    fiber = fiber.return;
  }
  throw new Error('Map unavailable');
};
try {
  for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }], ['narrow', { width: 320, height: 740 }]]) {
    const page = await browser.newPage({ viewport, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:3004');
    await expect(page.locator('.lj-loading')).toHaveCount(0, { timeout: 20_000 });
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.locator('.lj-report-row').first()).toBeVisible();
    const map = await page.evaluateHandle(findMap);
    await expect.poll(() => map.evaluate(value => value.isStyleLoaded() && !value.isMoving()), { timeout: 30_000 }).toBe(true);
    await page.waitForTimeout(1500);
    const count = await page.locator('.lj-report-row').count();
    await page.screenshot({ path: `${out}/${name}-map.png` });
    const panel = await page.locator('.lj-panel').boundingBox();
    const attribution = await page.locator('.maplibregl-ctrl-attrib').boundingBox();
    if (name !== 'desktop') expect(attribution.y + attribution.height).toBeLessThanOrEqual(panel.y + 1);
    await page.locator('.lj-report-row').first().click();
    await expect(page.locator('.lj-detail h2')).toBeFocused();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/${name}-detail.png` });
    const selected = await page.locator('.lj-marker.is-selected').boundingBox();
    const bounds = await page.locator('.lj-map').boundingBox();
    expect(selected.x).toBeGreaterThanOrEqual(bounds.x);
    expect(selected.y).toBeGreaterThanOrEqual(bounds.y);
    expect(selected.x + selected.width).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(selected.y + selected.height).toBeLessThanOrEqual(bounds.y + bounds.height);
    await page.getByRole('button', { name: 'Kembali ke daftar' }).click();

    let frames;
    if (name !== 'narrow') {
      frames = await map.evaluate(async value => {
        const samples = [];
        let previous;
        const started = performance.now();
        value.panBy([120, 0], { duration: 2500 });
        await new Promise(resolve => {
          function frame(time) {
            if (previous !== undefined) samples.push(time - previous);
            previous = time;
            if (performance.now() - started < 3000) requestAnimationFrame(frame);
            else resolve();
          }
          requestAnimationFrame(frame);
        });
        samples.sort((a, b) => a - b);
        return { samples: samples.length, medianMs: samples[Math.floor(samples.length * .5)], p95Ms: samples[Math.floor(samples.length * .95)] };
      });
    }

    const toggle = page.getByRole('button', { name: 'Mode 3D', exact: true });
    await toggle.click();
    await expect.poll(() => map.evaluate(value => value.isStyleLoaded() && !value.isMoving()), { timeout: 30_000 }).toBe(true);
    await page.waitForTimeout(1000);
    const buildings = await map.evaluate(value => ({ pitch: value.getPitch(),
      visibility: value.getLayoutProperty('public-buildings-3d', 'visibility'),
      rendered: value.queryRenderedFeatures({ layers: ['public-buildings-3d'] }).length,
      source: value.getLayer('public-buildings-3d').source }));
    expect(buildings.pitch).toBe(56);
    expect(buildings.visibility).toBe('visible');
    expect(buildings.rendered).toBeGreaterThan(0);
    await page.screenshot({ path: `${out}/${name}-3d.png` });
    await page.locator('.lj-report-row').first().click();
    await page.waitForTimeout(1000);
    expect(await map.evaluate(value => value.getPitch())).toBe(56);
    await page.screenshot({ path: `${out}/${name}-3d-detail.png` });
    await page.getByRole('button', { name: 'Kembali ke daftar' }).click();
    await toggle.click();
    expect(await map.evaluate(value => value.getLayoutProperty('public-buildings-3d', 'visibility'))).toBe('none');

    if (name === 'desktop') {
      await page.evaluate(() => {
        const elements = [...document.querySelectorAll('.lj-header *, .lj-panel *')];
        const sizes = elements.map(element => parseFloat(getComputedStyle(element).fontSize));
        elements.forEach((element, index) => { element.style.fontSize = `${sizes[index] * 2}px`; });
      });
      await page.screenshot({ path: `${out}/desktop-text-200.png` });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.lj-report-row').first().click();
      await page.getByRole('link', { name: 'Buka peta sumber' }).scrollIntoViewIfNeeded();
      await expect(page.getByRole('link', { name: 'Buka peta sumber' })).toBeVisible();
    }
    results.push({ name, viewport, reports: count, errors, frames: frames ?? null, buildings,
      pitch: await map.evaluate(value => value.getPitch()), browser: browser.version(),
      renderer: 'Chromium headless with SwiftShader', passed: true });
    await map.dispose();
    await page.close();
  }
} finally {
  await fs.writeFile(`${out}/live-checks.json`, JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
