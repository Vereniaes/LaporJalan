# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: review.browser.spec.ts >> C05 invalid search coordinates do not crash or move the map
- Location: tests/review.browser.spec.ts:21:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: undefined

Call Log:
- Timeout 30000ms exceeded while waiting on the predicate
```

# Test source

```ts
  1  | import { expect, type Page, type TestInfo } from '@playwright/test';
  2  | import { fixture, style, snapshot } from '../fixtures';
  3  | 
  4  | // Read the existing Map3D ref without adding production instrumentation.
  5  | export async function mapState(page: Page) {
  6  |   return page.evaluate(() => {
  7  |     const container = document.querySelector('.maplibregl-map');
  8  |     if (!container) return null;
  9  |     const key = Object.keys(container).find(k => k.startsWith('__reactFiber$'));
  10 |     let fiber = key && (container as any)[key];
  11 |     while (fiber) {
  12 |       let hook = fiber.memoizedState;
  13 |       while (hook) {
  14 |         const map = hook.memoizedState?.current;
  15 |         if (map && typeof map.getPitch === 'function') {
  16 |           return { pitch: map.getPitch(), bearing: map.getBearing(), zoom: map.getZoom(),
  17 |             inspection: map.getLayer('inspection-damage')?.implementation?.getState(),
  18 |             moving: map.isMoving(), styleReady: map.isStyleLoaded(), center: map.getCenter().toArray(),
  19 |             layers: map.getStyle()?.layers?.map((l: any) => ({ id: l.id, type: l.type })) };
  20 |         }
  21 |         hook = hook.next;
  22 |       }
  23 |       fiber = fiber.return;
  24 |     }
  25 |     return null;
  26 |   });
  27 | }
  28 | export async function ready(page: Page) {
> 29 |   await expect.poll(async () => (await mapState(page))?.styleReady, { timeout: 30000 }).toBe(true);
     |                                                                                         ^ Error: expect(received).toBe(expected) // Object.is equality
  30 |   await expect.poll(async () => (await mapState(page))?.moving, { timeout: 15000 }).toBe(false);
  31 | }
  32 | export async function evidence(page: Page, info: TestInfo, name: string) {
  33 |   await page.screenshot({ path: info.outputPath(`${name}.png`), animations: 'disabled' });
  34 |   await info.attach(`${name}-state`, { body: JSON.stringify({ fixture: fixture.id, viewport: page.viewportSize(),
  35 |     map: await mapState(page), toggle: await page.locator('#b-3d').getAttribute('aria-pressed'),
  36 |     browser: page.context().browser()?.version(), url: page.url() }, null, 2), contentType: 'application/json' });
  37 | }
  38 | 
  39 | 
  40 | export async function prepare(page: Page, realMap = false, path = '/') {
  41 |   await page.clock.setFixedTime(new Date(fixture.time));
  42 |   await page.route('**/api/**', async route => {
  43 |     const path = new URL(route.request().url()).pathname;
  44 |     if (route.request().method() !== 'GET') return route.fulfill({ status: 405, body: 'No writes allowed' });
  45 |     await route.fulfill({ json: path.endsWith('/reports') ? { data: [fixture.report, { ...fixture.report, id: 'fixture-second', title: 'Fixture second report', lng: 106.824 }] } : { predictions: [{ id: 'fixture-place', name: 'Fixture place', address: 'Synthetic place', lng: 106.824, lat: -6.197 }] } });
  46 |   });
  47 |   await page.route('**/*', async route => {
  48 |     const url = route.request().url();
  49 |     if (route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/svg+xml', body: snapshot });
  50 |     if (!realMap && url.includes('tiles.openfreemap.org/styles/')) return route.fulfill({ json: style });
  51 |     return route.fallback();
  52 |   });
  53 |   await page.goto(path);
  54 |   await expect(page.locator('#b-3d')).toBeVisible();
  55 |   await ready(page);
  56 | }
  57 | 
  58 | export async function mapHandle(page: Page) {
  59 |   return page.evaluateHandle(() => {
  60 |     const container = document.querySelector('.maplibregl-map')!;
  61 |     const key = Object.keys(container).find(key => key.startsWith('__reactFiber$'))!;
  62 |     let fiber = (container as any)[key];
  63 |     while (fiber) {
  64 |       let hook = fiber.memoizedState;
  65 |       while (hook) {
  66 |         const value = hook.memoizedState?.current;
  67 |         if (value && typeof value.getPitch === 'function') return value;
  68 |         hook = hook.next;
  69 |       }
  70 |       fiber = fiber.return;
  71 |     }
  72 |     throw new Error('Map instance unavailable');
  73 |   });
  74 | }
  75 | 
  76 | 
```