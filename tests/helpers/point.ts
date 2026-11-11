/* Todo:
-> pick and confirm the report point on the form's small map (no coordinate fields since 10 Nov), and give the landmark
    -> the exact point comes from device location: a test's own geolocation mock (window.__gpsReplies) or the browser's
-> complete the evidence a new report needs (owner, 10 Nov): a photo/video and a condition, unless the test already gave them
*/
import { expect, type Page } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

export async function pickPoint(page: Page, [lng, lat]: readonly [number, number] = [106.84, -6.2]) {
  const mocked = await page.evaluate(() => Array.isArray((window as any).__gpsReplies));
  if (!mocked) { await page.context().grantPermissions(['geolocation']); await page.context().setGeolocation({ latitude: lat, longitude: lng }); }
  await page.getByRole('button', { name: 'Gunakan lokasi perangkat', exact: true }).click();
  if (mocked) await page.evaluate(([lng, lat]) => { const replies = (window as any).__gpsReplies; replies[replies.length - 1].success({ coords: { longitude: lng, latitude: lat } }); }, [lng, lat]);
  await expect(page.locator('.lj-point-confirm output')).toHaveText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  await page.getByRole('button', { name: 'Konfirmasi titik ini', exact: true }).click();
  await expect(page.getByText('Titik dikonfirmasi', { exact: true })).toBeVisible();
  const landmark = page.getByLabel('Alamat atau patokan', { exact: true });
  if (!(await landmark.inputValue())) await landmark.fill('Patokan uji terisolasi');
}

// on the Kondisi step: attach a photo and choose a point condition when the test has not
export async function completeEvidence(page: Page, { condition = true } = {}) {
  if (!(await page.locator('.lj-media-picker figure').count())) await page.locator('.lj-media-picker input[type=file]').setInputFiles({ name: 'bukti-uji.png', mimeType: 'image/png', buffer: PNG });
  if (!condition) return;
  const kind = page.getByLabel('Jenis kondisi', { exact: true });
  if (await kind.inputValue()) return;
  const first = await kind.locator('option:not([value=""])').first().getAttribute('value');
  await kind.selectOption(first!);
  await page.getByLabel('Waktu pengamatan', { exact: true }).fill('2026-10-28T10:00');
  await page.getByLabel('Lokasi dan bentuk telah diperiksa.', { exact: true }).check();
}

// draw on the report popup's own 3D map (ShapeDrawer): press, drag through the points (fractions of the map box), release
export async function drawStroke(page: Page, path: [number, number][]) {
  const drawer = page.locator('.lj-shape-drawer[data-ready]');
  await expect(drawer).toBeVisible({ timeout: 20_000 });
  await drawer.locator('.lj-shape-map').evaluate(element => element.scrollIntoView({ block: 'center' })); // the pointer must reach the whole map
  const box = (await drawer.locator('.maplibregl-canvas').boundingBox())!;
  const at = ([x, y]: [number, number]) => [box.x + box.width * x, box.y + box.height * y] as const;
  await page.mouse.move(...at(path[0])); await page.mouse.down();
  for (const point of path.slice(1)) await page.mouse.move(...at(point), { steps: 8 });
  await page.mouse.up();
}
