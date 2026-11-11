/* Todo:
-> check condition points and delayed device location with isolated fixtures
*/
import { test, expect, type Page } from '@playwright/test';
import { snapshot, style } from './fixtures';
import { completeEvidence, drawStroke, pickPoint } from '../helpers/point';
import type { CitizenReport } from '../../src/public-reports/community';
import { mapHandle, ready } from '../helpers/map';

const pin: [number, number] = [106.84, -6.2], conditionPoint: [number, number] = [106.85, -6.21];
const fixture: CitizenReport = {
  id: '33333333-3333-4333-8333-333333333333', code: 'LJ-FORM-FIXTURE', origin: 'community', category: 'road', sourceCategory: 'Jalan',
  title: 'Kondisi pada titik terpisah', description: 'Fixture formulir, bukan laporan publik nyata.', address: '', lng: pin[0], lat: pin[1],
  createdAt: '2026-10-28T10:00:00.000Z', updatedAt: '2026-10-28T10:00:00.000Z', status: 'reported', sourceStatus: 'Dilaporkan',
  revision: 0, media: [], updates: [], canManage: true, canUpdate: true,
  condition: { kind: 'pothole', observedAt: '2026-10-28T09:34:56.789Z', source: 'reporter', locationConfirmed: true, geometry: { type: 'Point', coordinates: conditionPoint } },
};
const field = (body: string, name: string) => new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)`).exec(body)?.[1];

async function setup(page: Page) {
  let current = structuredClone(fixture);
  const submitted: string[] = [];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-10-28T12:00:00.000Z'));
  await page.addInitScript(() => {
    sessionStorage.setItem('lj-session', 'form-fixture-session');
    (window as any).__gpsReplies = [];
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
      getCurrentPosition(success: unknown, error: unknown) { (window as any).__gpsReplies.push({ success, error }); },
    } });
  });
  await page.route('**/api/public-reports', route => route.fulfill({ json: { ...snapshot, reports: [] } }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.route('**/api/community/**', route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path.endsWith('/capabilities')) return route.fulfill({ json: { reports: true, write: true, login: true, reason: null } });
    if (path.endsWith('/auth/session')) return route.fulfill({ json: { user: { id: 'form-owner', email: 'form@example.test' } } });
    if (request.method() === 'POST') {
      const body = request.postData() ?? ''; submitted.push(body);
      const condition = field(body, 'condition');
      current = { ...current, ...(condition !== undefined ? { condition: JSON.parse(condition) } : {}), revision: (current.revision ?? 0) + 1 };
      if (path.endsWith('/reports')) current = { ...current, title: field(body, 'title')!, lng: Number(field(body, 'lng')), lat: Number(field(body, 'lat')) };
      return route.fulfill({ json: current });
    }
    return route.fulfill({ json: path.endsWith('/reports') ? { reports: [current], nextCursor: null } : current });
  });
  await page.goto('/peta');
  await expect(page.getByRole('button', { name: 'Tambah laporan', exact: true })).toBeEnabled();
  await expect(page.locator('.lj-header').getByRole('link', { name: 'Akun', exact: true })).toBeVisible();
  return submitted;
}
const manualPin = (page: Page) => pickPoint(page, pin);
async function deliverGps(page: Page, index = 0) {
  await page.evaluate(index => (window as any).__gpsReplies[index].success({ coords: { longitude: 106.9, latitude: -6.3 } }), index);
}

test('editing preserves the confirmed condition Point until a new Point is explicitly chosen', async ({ page }) => {
  const submitted = await setup(page);
  // owners manage a report on the account page (owner choice, 9 Nov)
  await page.goto(`/akun?laporan=${fixture.id}`);
  await page.getByRole('button', { name: 'Tambah pembaruan', exact: true }).click();
  await page.getByLabel('Ubah kondisi dan bentuk', { exact: true }).check();
  await expect(page.getByText('Titik kondisi: -6.210000, 106.850000.', { exact: true })).toBeVisible();
  await page.getByLabel('Catatan pembaruan', { exact: true }).fill('Kondisi masih berada pada titik pengamatan semula.');
  await page.getByLabel('Lokasi dan bentuk telah diperiksa.', { exact: true }).check();
  await page.getByLabel(/^Catatan dan lampiran boleh dipublikasikan/).check();
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await expect.poll(() => submitted.length).toBe(1);
  const preserved = JSON.parse(field(submitted[0], 'condition')!);
  expect(preserved.geometry.coordinates).toEqual(conditionPoint);
  expect(preserved.observedAt).toBe(fixture.condition!.observedAt);
  await page.getByRole('button', { name: 'Tambah pembaruan', exact: true }).click();
  await page.getByLabel('Ubah kondisi dan bentuk', { exact: true }).check();
  await page.getByLabel('Bentuk lokasi', { exact: true }).selectOption('line');
  await page.getByLabel('Bentuk lokasi', { exact: true }).selectOption('point');
  await expect(page.getByText('Titik kondisi: -6.200000, 106.840000.', { exact: true })).toBeVisible();
  await page.getByLabel('Catatan pembaruan', { exact: true }).fill('Titik kondisi dipilih ulang mengikuti pin laporan.');
  await page.getByLabel('Lokasi dan bentuk telah diperiksa.', { exact: true }).check();
  await page.getByLabel(/^Catatan dan lampiran boleh dipublikasikan/).check();
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await expect.poll(() => submitted.length).toBe(2);
  expect(JSON.parse(field(submitted[1], 'condition')!).geometry.coordinates).toEqual(pin);
});

test('a closed composer cannot deliver device location into a new composer', async ({ page }) => {
  await setup(page);
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await page.getByRole('button', { name: 'Gunakan lokasi perangkat', exact: true }).click();
  await page.getByRole('button', { name: 'Kembali ke peta', exact: true }).click();
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await manualPin(page);
  await deliverGps(page);
  // the closed form's late reply does not move the new form's map or undo its confirmation
  await expect(page.locator('.lj-point-confirm output')).toHaveText('-6.200000, 106.840000');
  await expect(page.getByText('Titik dikonfirmasi', { exact: true })).toBeVisible();
});

test('delayed device location cannot replace a manual pin or invalidate the reviewed condition', async ({ page }) => {
  const submitted = await setup(page);
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await page.getByRole('button', { name: 'Gunakan lokasi perangkat', exact: true }).click();
  await manualPin(page);
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await page.getByLabel('Judul laporan', { exact: true }).fill('Lokasi manual yang telah ditinjau');
  await page.getByLabel('Uraian kejadian', { exact: true }).fill('Fixture untuk memeriksa kepemilikan permintaan lokasi perangkat.');
  await page.getByLabel('Jenis kondisi', { exact: true }).selectOption('pothole');
  await page.getByLabel('Waktu pengamatan', { exact: true }).fill('2026-10-28T18:00');
  await page.getByLabel('Lokasi dan bentuk telah diperiksa.', { exact: true }).check();
  await completeEvidence(page); // a photo (owner, 10 Nov); the condition is already chosen above
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await deliverGps(page);
  await expect(page.locator('.lj-review')).toContainText('-6.200000, 106.840000');
  await page.getByLabel(/^Lokasi, isi, dan lampiran boleh ditampilkan/).check();
  await page.getByRole('button', { name: 'Kirim laporan', exact: true }).click();
  await expect.poll(() => submitted.length).toBe(1);
  expect(field(submitted[0], 'lat')).toBe(String(pin[1]));
  expect(field(submitted[0], 'lng')).toBe(String(pin[0]));
  expect(JSON.parse(field(submitted[0], 'condition')!).geometry.coordinates).toEqual(pin);
});

test('keyboard drawing keeps the finished line visible before explicit confirmation', async ({ page }, info) => {
  const submitted = await setup(page);
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await manualPin(page);
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await page.getByLabel('Judul laporan', { exact: true }).fill('Ruas hasil gambar melalui papan ketik');
  await page.getByLabel('Uraian kejadian', { exact: true }).fill('Fixture akses papan ketik untuk gambar ruas dan konfirmasi lokasi.');
  await page.getByLabel('Jenis kondisi', { exact: true }).selectOption('closure');
  await page.getByLabel('Waktu pengamatan', { exact: true }).fill('2026-10-28T18:00');
  await page.getByLabel('Bentuk lokasi', { exact: true }).selectOption('line');
  await page.getByRole('button', { name: 'Gambar ruas', exact: true }).click();
  // the single-pointer path (WCAG 2.5.7): pan the popup's own map with the keys, add the point under the centre mark
  await expect(page.locator('.lj-shape-drawer[data-ready]')).toBeVisible({ timeout: 20_000 });
  const region = page.getByRole('region', { name: 'Gambar lokasi', exact: true });
  const addPoint = page.getByRole('button', { name: 'Tambah titik di tengah peta', exact: true });
  await addPoint.focus(); await addPoint.press('Enter');
  await expect(region).toContainText('1/63 titik');
  await page.locator('.lj-shape-drawer .maplibregl-canvas').focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  await addPoint.focus(); await addPoint.press('Enter');
  await expect(region).toContainText('2/63 titik');
  await page.getByRole('button', { name: 'Selesai menggambar', exact: true }).press('Enter');
  await expect(region).toHaveCount(0);
  const confirmation = page.getByLabel('Lokasi dan bentuk telah diperiksa.', { exact: true });
  await expect(confirmation).not.toBeChecked();
  await page.screenshot({ path: info.outputPath('keyboard-sketch-before-confirmation.png') });
  await completeEvidence(page); // a photo (owner, 10 Nov); the condition is already chosen above
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Periksa sebelum mengirim', exact: true })).toHaveCount(0);
  expect(submitted).toHaveLength(0);
  await confirmation.check();
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Periksa sebelum mengirim', exact: true })).toBeVisible();
  await expect(page.locator('.lj-condition-summary')).toContainText('Ruas dikonfirmasi pelapor.');
});


test('a freehand area closes itself, and a crossing outline is refused with a reason', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); await setup(page);
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click(); await manualPin(page);
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await page.getByLabel('Jenis kondisi', { exact: true }).selectOption('closure');
  await page.getByLabel('Bentuk lokasi', { exact: true }).selectOption('area');
  await page.getByRole('button', { name: 'Gambar area', exact: true }).click();
  // a figure-eight crosses itself: refused, the drawing stays for another try
  await drawStroke(page, [[0.3, 0.35], [0.7, 0.7], [0.7, 0.35], [0.3, 0.7]]);
  await page.getByRole('button', { name: 'Selesai menggambar', exact: true }).click();
  await expect(page.locator('.lj-shape-drawer')).toContainText('saling menyilang');
  await page.getByRole('button', { name: 'Hapus gambar', exact: true }).click();
  await drawStroke(page, [[0.3, 0.35], [0.7, 0.35], [0.7, 0.7], [0.3, 0.7]]);
  await page.getByRole('button', { name: 'Selesai menggambar', exact: true }).click();
  await expect(page.locator('.lj-shape-drawer')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Gambar ulang area', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a failed device location says why: denied permission, no location, or too slow', async ({ page }) => {
  await setup(page);
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  const locate = page.getByRole('button', { name: 'Gunakan lokasi perangkat', exact: true }), note = page.locator('.lj-point-note');
  for (const [code, text] of [[1, 'Izin lokasi ditolak browser.'], [2, 'layanan lokasi di perangkat'], [3, 'terlalu lama']] as const) {
    await locate.click();
    await page.evaluate(code => { const replies = (window as any).__gpsReplies; replies[replies.length - 1].error({ code }); }, code);
    await expect(note).toContainText(text);
  }
  await expect(page.getByRole('button', { name: 'Konfirmasi titik ini', exact: true })).toBeVisible(); // the map still works by hand
});
