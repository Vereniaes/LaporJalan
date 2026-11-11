/* Rute with a Google key, Google faked: the script, Places Autocomplete (New) and Routes API.
Todo:
-> a trip from a typed place to a suggested place: arrival, traffic delay, reports in order, the Google map drawn
-> my location refused: say so and ask for a starting place; a changed trip clears the old answer
-> Google refuses the route: say why, no stale time
*/
import { test, expect, Page } from '@playwright/test';
import { snapshot, style } from '../public-reports/fixtures';

// a tiny stand-in for google.maps: records what the app draws so the test can read it
const FAKE_MAPS = `(() => {
  const drawn = window.__drawn = { maps: 0, lines: [], markers: [] };
  class Map { constructor(el) { drawn.maps++; this.el = el; el.dataset.fakeGoogle = '1'; } fitBounds() {} panTo(p) { drawn.panned = p; } }
  class Polyline { constructor(o) { this.o = o; drawn.lines.push(this); } setMap(m) { if (!m) drawn.lines = drawn.lines.filter(l => l !== this); } addListener() {} }
  class LatLngBounds { extend() {} }
  class AdvancedMarkerElement { constructor(o) { this.content = o.content; drawn.markers.push(this); if (o.map) o.map.el.append(o.content); }
    set map(m) { if (!m) { this.content.remove(); drawn.markers = drawn.markers.filter(x => x !== this); } } }
  window.google = { maps: { Map, Polyline, LatLngBounds, marker: { AdvancedMarkerElement }, importLibrary: async () => ({}) } };
  const cb = new URL(document.currentScript.src).searchParams.get('callback'); window[cb]();
})();`;

const ROUTES = { routes: [
  { duration: '2100s', staticDuration: '1740s', distanceMeters: 12440, description: 'Jl. Jend. Sudirman', polyline: { encodedPolyline: '~_vd@oi|jSn}@o}@n}@o}@' } },
  { duration: '2520s', staticDuration: '2400s', distanceMeters: 13900, description: 'Jl. Gatot Subroto', polyline: { encodedPolyline: '~_vd@oi|jSo}@owHnzDnzD' } },
] };

async function fakeGoogle(page: Page, routes: object | number = ROUTES) {
  const calls = { places: 0, routes: 0, body: null as any };
  await page.route('https://maps.googleapis.com/maps/api/js**', route => route.fulfill({ contentType: 'text/javascript', body: FAKE_MAPS }));
  await page.route('https://places.googleapis.com/v1/places:autocomplete', route => {
    calls.places++;
    const input = route.request().postDataJSON().input as string, main = input.startsWith('Mon') ? 'Monas' : 'Blok M';
    route.fulfill({ json: { suggestions: [{ placePrediction: { placeId: `place-${main}`, text: { text: `${main}, Jakarta` }, structuredFormat: { mainText: { text: main }, secondaryText: { text: 'Jakarta' } } } }] } });
  });
  await page.route('https://routes.googleapis.com/directions/v2:computeRoutes', route => {
    calls.routes++; calls.body = route.request().postDataJSON();
    typeof routes === 'number' ? route.fulfill({ status: routes, json: { error: { status: 'PERMISSION_DENIED' } } }) : route.fulfill({ json: routes });
  });
  return calls;
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: true, write: true, login: true, reason: null } }));
  await page.route('**/api/community/reports*', route => route.fulfill({ json: { reports: [], nextCursor: null } }));
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
});

async function pick(page: Page, field: 'Dari' | 'Ke', text: string) {
  const input = page.getByRole('combobox', { name: field, exact: true });
  await input.fill(text);
  await expect(page.getByRole('option', { name: new RegExp(text) })).toBeVisible();
  await input.press('ArrowDown'); await input.press('Enter');
  await expect(input).toHaveValue(text);
}

test('a trip shows the arrival, the traffic delay and the reports met on the way, on the Google map', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const calls = await fakeGoogle(page);
  await page.goto('/peta?tab=rute');
  await expect(page.locator('[data-fake-google]')).toHaveCount(1);              // the Google map took the map area
  await expect(page.locator('.lj-map:not(.lj-google-map)')).toBeHidden();       // the main map is kept, hidden
  await pick(page, 'Dari', 'Monas');
  await pick(page, 'Ke', 'Blok M');
  expect(calls.routes).toBe(0);                                                  // no route until asked
  await page.getByRole('button', { name: 'Motor' }).click();
  await expect(page.getByText('Rute motor dari Google masih tahap uji coba.')).toBeVisible();
  await page.getByRole('button', { name: 'Cari rute' }).click();
  await expect(page.getByRole('heading', { name: /^Tiba \d{2}\.\d{2}$/ })).toBeVisible();
  expect(calls.body).toMatchObject({ origin: { placeId: 'place-Monas' }, destination: { placeId: 'place-Blok M' }, travelMode: 'TWO_WHEELER', routingPreference: 'TRAFFIC_AWARE' });
  await expect(page.locator('.lj-route-eta')).toContainText('35 mnt · 12,4 km');
  await expect(page.locator('.lj-route-eta')).toContainText('+6 mnt karena lalu lintas');
  await expect(page.getByRole('heading', { name: '2 laporan di rute ini' })).toBeVisible();
  await expect(page.locator('.lj-route-report strong')).toHaveText(['TEST-A', 'TEST-C']);
  expect(await page.evaluate(() => (window as any).__drawn.lines.length)).toBe(2);
  await expect(page.locator('[data-fake-google] .lj-marker')).toHaveCount(2);    // the two reports as pins
  await expect(page.locator('[data-fake-google] .lj-route-end')).toHaveText(['A', 'B']);
  // the second route: slower, and it passes no report
  await page.getByRole('radio', { name: /42 mnt/ }).click();
  await expect(page.getByRole('heading', { name: 'Tidak ada laporan di rute ini' })).toBeVisible();
  await expect(page.locator('[data-fake-google] .lj-marker')).toHaveCount(0);
  // a report row focuses it; its detail opens the Laporan tab with the card
  await page.getByRole('radio', { name: /35 mnt/ }).click();
  await page.locator('.lj-route-report', { hasText: 'TEST-C' }).click();
  await expect(page.locator('.lj-route-report[aria-pressed=true]')).toContainText('TEST-C');
  await page.getByRole('button', { name: 'Lihat detail laporan' }).click();
  await expect(page.getByRole('tab', { name: 'Laporan' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.lj-popup.is-pinned h2')).toHaveText('TEST-C');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('a refused location asks for a starting place; a changed trip clears the old answer', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: (_ok: unknown, fail: (e: object) => void) => fail({ code: 1, PERMISSION_DENIED: 1 }) } }); });
  const calls = await fakeGoogle(page);
  await page.goto('/peta?tab=rute');
  await pick(page, 'Ke', 'Blok M');
  await page.getByRole('button', { name: 'Cari rute' }).click();
  await expect(page.getByRole('alert')).toHaveText('Izin lokasi ditolak. Isi titik asal.');
  expect(calls.routes).toBe(0);
  await pick(page, 'Dari', 'Monas');
  await page.getByRole('button', { name: 'Cari rute' }).click();
  await expect(page.locator('.lj-route-eta')).toBeVisible();
  await page.getByRole('button', { name: 'Motor' }).click();
  await expect(page.locator('.lj-route-eta')).toHaveCount(0);
});

test('Google refusing the route says why and shows no time', async ({ page }) => {
  await fakeGoogle(page, 403);
  await page.goto('/peta?tab=rute');
  await pick(page, 'Dari', 'Monas');
  await pick(page, 'Ke', 'Blok M');
  await page.getByRole('button', { name: 'Cari rute' }).click();
  await expect(page.getByRole('alert')).toHaveText('Kunci Google belum mengizinkan Routes API.');
  await expect(page.locator('.lj-route-eta')).toHaveCount(0);
});
