import { test, expect } from '@playwright/test';
import { prepare, ready, mapState, mapHandle } from './helpers/map';
import { fixture } from './fixtures';
import { INITIAL_REPORTS } from '../src/services/mockData';

test('R02 an earlier file read cannot replace a newer image selection', async ({ page }) => {
  await page.addInitScript(() => {
    const Reader = window.FileReader;
    window.FileReader = class extends Reader {
      readAsDataURL(file: Blob) {
        (window as any).releaseFixtureFile = () => {
          this.addEventListener('loadend', () => { (window as any).fixtureFileDone = true; });
          super.readAsDataURL(file);
        };
      }
    };
  });
  await prepare(page);
  await page.getByRole('button', { name: 'Lapor', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'slow.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" /></svg>') });
  await page.getByRole('dialog').getByRole('button', { name: 'Galian Utilitas' }).click();
  await expect(page.getByAltText('Preview Kerusakan')).toHaveAttribute('src', /photo-1584467735871/);
  await page.evaluate(() => (window as any).releaseFixtureFile());
  await expect.poll(() => page.evaluate(() => (window as any).fixtureFileDone)).toBe(true);
  await expect(page.getByAltText('Preview Kerusakan')).toHaveAttribute('src', /photo-1584467735871/);
});

test('C06 empty report response clears prior selection and inspection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/reports', async route => { await gate; await route.fulfill({ json: { data: [] } }); });
  await page.reload();
  await ready(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  release();
  await expect(page.getByRole('button', { name: 'Daftar (0)' })).toBeVisible();
  await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  await expect(page.locator('.map-report-marker')).toHaveCount(0);
});

test('C05 invalid search coordinates do not crash or move the map', async ({ page }) => {
  await prepare(page);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/places/**', route => route.fulfill({ json: { predictions: [{ id: 'bad', name: 'Invalid place', address: 'Invalid fixture', lng: 106, lat: 95 }] } }));
  const before = (await mapState(page))!.center;
  await page.getByPlaceholder(/Cari jalan/).fill('Invalid');
  await page.getByText('Invalid place', { exact: true }).click();
  await ready(page);
  expect(errors).toEqual([]);
  expect((await mapState(page))!.center).toEqual(before);
});

test('C05 refreshed coordinates follow the active report with the same id', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const refreshed = { ...INITIAL_REPORTS[0], lat: -6.197, lng: 106.825 };
  await page.route('**/api/reports', async route => { await gate; await route.fulfill({ json: { data: [refreshed] } }); });
  await page.reload();
  await ready(page);
  await page.locator('#b-3d').click();
  release();
  await expect.poll(async () => (await mapState(page))!.center[0]).toBeCloseTo(refreshed.lng, 6);
  expect((await mapState(page))!.center[1]).toBeCloseTo(refreshed.lat, 6);
});

test('U02 inspection frames a larger physical cavity without scaling the model', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  await page.route('**/api/reports', route => route.fulfill({ json: { data: [{ ...fixture.report, widthCm: 150 }] } }));
  await page.reload();
  await ready(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  const map = await mapHandle(page);
  const bounds = await map.evaluate(map => {
    const layer = map.getLayer('inspection-damage').implementation;
    const { anchor, widthM } = layer.options;
    const radius = widthM / 2;
    const points = Array.from({ length: 64 }, (_, i) => {
      const angle = i / 64 * 2 * Math.PI;
      return map.project([anchor[0] + radius * Math.cos(angle) / (111319.49 * Math.cos(anchor[1] * Math.PI / 180)), anchor[1] + radius * Math.sin(angle) / 111319.49]);
    });
    return { minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)), width: map.getContainer().clientWidth, widthM };
  });
  expect(bounds.widthM).toBe(1.5);
  expect(bounds.minX).toBeGreaterThan(12);
  expect(bounds.maxX).toBeLessThan(bounds.width - 12);
  await map.dispose();
});

test('D04 unavailable image does not fabricate analysis', async ({ page }) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Lapor', exact: true }).click();
  await page.route('**/images.unsplash.com/**', route => route.abort());
  await page.getByRole('button', { name: 'Lubang Aspal' }).click();
  await expect(page.getByRole('status')).toContainText('Gambar tidak dapat dianalisis');
  await expect(page.getByRole('button', { name: 'Simpan Laporan Contoh' })).toBeDisabled();
});

test('D04 unavailable canvas does not fabricate analysis', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: any[]) {
      return type === '2d' ? null : (getContext as any).call(this, type, ...args);
    } as typeof getContext;
  });
  await prepare(page);
  await page.getByRole('button', { name: 'Lapor', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Lubang Aspal' }).click();
  await expect(page.getByRole('status')).toContainText('Gambar tidak dapat dianalisis');
  await expect(page.getByRole('button', { name: 'Simpan Laporan Contoh' })).toBeDisabled();
});
