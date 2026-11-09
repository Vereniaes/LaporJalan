/* Todo:
-> check condition points and delayed device location with isolated fixtures
*/
import { test, expect, type Page } from '@playwright/test';
import { snapshot, style } from './fixtures';
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
  await expect(page.getByRole('button', { name: 'Akun', exact: true })).toBeVisible();
  return submitted;
}
async function manualPin(page: Page) {
  await page.getByLabel('Lintang', { exact: true }).fill(String(pin[1]));
  await page.getByLabel('Bujur', { exact: true }).fill(String(pin[0]));
  await page.getByRole('button', { name: 'Perbarui pin dari koordinat', exact: true }).click();
  await expect(page.getByLabel('Lintang', { exact: true })).toHaveValue('-6.200000');
}
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
  await expect(page.getByLabel('Lintang', { exact: true })).toHaveValue('-6.200000');
  await expect(page.getByLabel('Bujur', { exact: true })).toHaveValue('106.840000');
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
  await ready(page);
  const addPoint = page.getByRole('button', { name: 'Tambah titik di tengah peta', exact: true });
  await addPoint.focus(); await addPoint.press('Enter');
  await expect(page.getByRole('region', { name: 'Gambar lokasi', exact: true })).toContainText('1/64 titik');
  await page.locator('.maplibregl-canvas').focus(); await page.keyboard.press('ArrowRight');
  await ready(page);
  await addPoint.focus(); await addPoint.press('Enter');
  await expect(page.getByRole('region', { name: 'Gambar lokasi', exact: true })).toContainText('2/64 titik');
  await page.getByRole('button', { name: 'Selesai menggambar', exact: true }).press('Enter');
  await expect(page.getByRole('region', { name: 'Gambar lokasi', exact: true })).toHaveCount(0);
  const confirmation = page.getByLabel('Lokasi dan bentuk telah diperiksa.', { exact: true });
  await expect(confirmation).not.toBeChecked();
  const map = await mapHandle(page);
  await expect.poll(async () => map.evaluate(instance => (instance.getSource('condition-sketch') as any).serialize().data.features[0]?.geometry.type)).toBe('LineString');
  const geometry = await map.evaluate(instance => (instance.getSource('condition-sketch') as any).serialize().data.features[0].geometry);
  expect(geometry.coordinates).toHaveLength(2);
  expect(geometry.coordinates[0]).not.toEqual(geometry.coordinates[1]);
  await page.screenshot({ path: info.outputPath('keyboard-sketch-before-confirmation.png') });
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Periksa sebelum mengirim', exact: true })).toHaveCount(0);
  expect(submitted).toHaveLength(0);
  await confirmation.check();
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Periksa sebelum mengirim', exact: true })).toBeVisible();
  await expect(page.locator('.lj-condition-summary')).toContainText('Ruas dikonfirmasi pelapor.');
  await map.dispose();
});


test('drawing during a pending style replacement replays the latest vertices without errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await setup(page);
 await page.getByRole('button',{name:'Tambah laporan',exact:true}).click();await manualPin(page);
 await page.getByRole('button',{name:'Lanjutkan',exact:true}).click();await page.getByLabel('Jenis kondisi',{exact:true}).selectOption('closure');
 await page.getByLabel('Bentuk lokasi',{exact:true}).selectOption('line');await page.getByRole('button',{name:'Gambar ruas',exact:true}).click();await ready(page);
 const add=page.getByRole('button',{name:'Tambah titik di tengah peta',exact:true});await add.click();const map=await mapHandle(page);
 await map.evaluate(m=>m.panBy([40,0],{duration:0}));
 let requested=false,release!:()=>void;const held=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/__condition-style.json',async r=>{requested=true;await held;await r.fulfill({json:style});});
 try{await map.evaluate(m=>m.setStyle('/__condition-style.json',{diff:false}));await expect.poll(()=>requested).toBe(true);await add.click();}
 finally{release();}
 await ready(page);await expect(page.getByRole('region',{name:'Gambar lokasi',exact:true})).toContainText('2/64 titik');
 await expect.poll(()=>map.evaluate(m=>m.getSource('condition-sketch')?.serialize().data.features.filter(f=>f.geometry.type==='Point').length)).toBe(2);
 expect(errors).toEqual([]);await map.dispose();
});
