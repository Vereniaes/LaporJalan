import { expect, type Page, type TestInfo } from '@playwright/test';
import { fixture, style, snapshot } from '../fixtures';

// Read the existing Map3D ref without adding production instrumentation.
export async function mapState(page: Page) {
  return page.evaluate(() => {
    const container = document.querySelector('.maplibregl-map');
    if (!container) return null;
    const key = Object.keys(container).find(k => k.startsWith('__reactFiber$'));
    let fiber = key && (container as any)[key];
    while (fiber) {
      let hook = fiber.memoizedState;
      while (hook) {
        const map = hook.memoizedState?.current;
        if (map && typeof map.getPitch === 'function') {
          return { pitch: map.getPitch(), bearing: map.getBearing(), zoom: map.getZoom(),
            inspection: map.getLayer('inspection-damage')?.implementation?.getState(),
            moving: map.isMoving(), styleReady: map.isStyleLoaded(), center: map.getCenter().toArray(),
            layers: map.getStyle()?.layers?.map((l: any) => ({ id: l.id, type: l.type })) };
        }
        hook = hook.next;
      }
      fiber = fiber.return;
    }
    return null;
  });
}
export async function ready(page: Page) {
  await expect.poll(async () => (await mapState(page))?.styleReady, { timeout: 30000 }).toBe(true);
  await expect.poll(async () => (await mapState(page))?.moving, { timeout: 15000 }).toBe(false);
}
export async function evidence(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: info.outputPath(`${name}.png`), animations: 'disabled' });
  await info.attach(`${name}-state`, { body: JSON.stringify({ fixture: fixture.id, viewport: page.viewportSize(),
    map: await mapState(page), toggle: await page.locator('#b-3d').getAttribute('aria-pressed'),
    browser: page.context().browser()?.version(), url: page.url() }, null, 2), contentType: 'application/json' });
}


export async function prepare(page: Page, realMap = false, path = '/') {
  await page.clock.setFixedTime(new Date(fixture.time));
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET') return route.fulfill({ status: 405, body: 'No writes allowed' });
    await route.fulfill({ json: path.endsWith('/reports') ? { data: [fixture.report, { ...fixture.report, id: 'fixture-second', title: 'Fixture second report', lng: 106.824 }] } : { predictions: [{ id: 'fixture-place', name: 'Fixture place', address: 'Synthetic place', lng: 106.824, lat: -6.197 }] } });
  });
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/svg+xml', body: snapshot });
    if (!realMap && url.includes('tiles.openfreemap.org/styles/')) return route.fulfill({ json: style });
    return route.fallback();
  });
  await page.goto(path);
  await expect(page.locator('#b-3d')).toBeVisible();
  await ready(page);
}

export async function mapHandle(page: Page) {
  return page.evaluateHandle(() => {
    const container = document.querySelector('.maplibregl-map')!;
    const key = Object.keys(container).find(key => key.startsWith('__reactFiber$'))!;
    let fiber = (container as any)[key];
    while (fiber) {
      let hook = fiber.memoizedState;
      while (hook) {
        const value = hook.memoizedState?.current;
        if (value && typeof value.getPitch === 'function') return value;
        hook = hook.next;
      }
      fiber = fiber.return;
    }
    throw new Error('Map instance unavailable');
  });
}

