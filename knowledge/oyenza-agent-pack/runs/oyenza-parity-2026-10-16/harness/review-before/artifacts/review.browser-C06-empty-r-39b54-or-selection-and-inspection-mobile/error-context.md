# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: review.browser.spec.ts >> C06 empty report response clears prior selection and inspection
- Location: tests/review.browser.spec.ts:6:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Daftar (0)' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Daftar (0)' })

```

```yaml
- text: 🚧
- heading "LaporJalan" [level=1]
- text: Demo
- paragraph: Peta kondisi jalan
- button "Lapor":
  - img
  - text: Lapor
- button "Peta 3D":
  - img
  - text: Peta 3D
- button "Daftar (4)":
  - img
  - text: Daftar (4)
- button "CCTV (4)":
  - img
  - text: CCTV (4)
- img
- textbox "Cari jalan atau laporan..."
- img
- paragraph: Pantau kondisi jalan
- paragraph: 4 laporan tersedia. Pilih titik untuk melihat detail.
- button "Tambahkan laporan"
- button "Tutup ringkasan":
  - img
- button "Galian utilitas":
  - img
  - text: Galian utilitas
- button "4 kamera contoh":
  - img
  - text: 4 kamera contoh
- button "Pantauan genangan Data ketinggian air belum tersedia.":
  - img
  - paragraph: Pantauan genangan
  - paragraph: Data ketinggian air belum tersedia.
  - img
- heading "Lubang Kritis Lajur Kanan Jalur Cepat" [level=2]
- text: berat
- paragraph:
  - img
  - text: Jl. M.H. Thamrin No. 28, Menteng (Arah Bundaran HI)
- paragraph: Kedalaman
- paragraph: 7.5 cm
- paragraph: Lebar
- paragraph: 52 cm
- paragraph: Estimasi laporan - metode pengukuran belum diverifikasi.
- button "Lihat Lapangan 3D":
  - img
  - text: Lihat Lapangan 3D
- button "Profil ilustratif"
- button "Sebelum vs Sesudah"
- button "1 • CCTV Bundaran HI Gambar contoh":
  - paragraph: 1 • CCTV Bundaran HI
  - paragraph:
    - img
    - text: Gambar contoh
- group: Catatan laporan
- region "Map"
- text: Tautan contoh • 168m
- button "Map marker": CCTV hi-01
- button "Map marker": CCTV sudirman-6b
- button "Map marker": CCTV semanggi-4c
- button "Map marker": CCTV kuningan-9d
- button "Map marker": GALIAN
- button "Map marker": RETAK
- button "Map marker": AMBLES
- group:
  - link "MapLibre":
    - /url: https://maplibre.org/
- button "3D" [pressed]
- button "Reset Sudut Pandang":
  - img
- button "Perbesar peta": +
- button "Perkecil peta": −
- text: Inspeksi Lapangan 3D
- button "✕ Tutup"
- text: "Kedalaman: 7.5 cm Lebar: 52 cm"
- paragraph: Model estimasi 1:1 - bentuk ilustratif
- button "Putar Orbit 360°":
  - img
  - text: Putar Orbit 360°
- button "Jalanan"
- button "Atas"
- button "Lapor jalan":
  - img
  - text: Lapor jalan
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { prepare, ready, mapState, mapHandle } from './helpers/map';
  3  | import { fixture } from './fixtures';
  4  | import { INITIAL_REPORTS } from '../src/services/mockData';
  5  | 
  6  | test('C06 empty report response clears prior selection and inspection', async ({ page }) => {
  7  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  8  |   await prepare(page);
  9  |   let release!: () => void;
  10 |   const gate = new Promise<void>(resolve => { release = resolve; });
  11 |   await page.route('**/api/reports', async route => { await gate; await route.fulfill({ json: { data: [] } }); });
  12 |   await page.reload();
  13 |   await ready(page);
  14 |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  15 |   release();
> 16 |   await expect(page.getByRole('button', { name: 'Daftar (0)' })).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  17 |   await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  18 |   await expect(page.locator('.map-report-marker')).toHaveCount(0);
  19 | });
  20 | 
  21 | test('C05 invalid search coordinates do not crash or move the map', async ({ page }) => {
  22 |   await prepare(page);
  23 |   const errors: string[] = [];
  24 |   page.on('pageerror', error => errors.push(error.message));
  25 |   await page.route('**/api/places/**', route => route.fulfill({ json: { predictions: [{ id: 'bad', name: 'Invalid place', address: 'Invalid fixture', lng: 106, lat: 95 }] } }));
  26 |   const before = (await mapState(page))!.center;
  27 |   await page.getByPlaceholder(/Cari jalan/).fill('Invalid');
  28 |   await page.getByText('Invalid place', { exact: true }).click();
  29 |   await ready(page);
  30 |   expect(errors).toEqual([]);
  31 |   expect((await mapState(page))!.center).toEqual(before);
  32 | });
  33 | 
  34 | test('C05 refreshed coordinates follow the active report with the same id', async ({ page }) => {
  35 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  36 |   await prepare(page);
  37 |   let release!: () => void;
  38 |   const gate = new Promise<void>(resolve => { release = resolve; });
  39 |   const refreshed = { ...INITIAL_REPORTS[0], lat: -6.197, lng: 106.825 };
  40 |   await page.route('**/api/reports', async route => { await gate; await route.fulfill({ json: { data: [refreshed] } }); });
  41 |   await page.reload();
  42 |   await ready(page);
  43 |   await page.locator('#b-3d').click();
  44 |   release();
  45 |   await expect.poll(async () => (await mapState(page))!.center[0]).toBeCloseTo(refreshed.lng, 6);
  46 |   expect((await mapState(page))!.center[1]).toBeCloseTo(refreshed.lat, 6);
  47 | });
  48 | 
  49 | test('U02 inspection frames a larger physical cavity without scaling the model', async ({ page }) => {
  50 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  51 |   await prepare(page);
  52 |   await page.route('**/api/reports', route => route.fulfill({ json: { data: [{ ...fixture.report, widthCm: 150 }] } }));
  53 |   await page.reload();
  54 |   await ready(page);
  55 |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  56 |   await ready(page);
  57 |   const map = await mapHandle(page);
  58 |   const bounds = await map.evaluate(map => {
  59 |     const layer = map.getLayer('inspection-damage').implementation;
  60 |     const { anchor, widthM } = layer.options;
  61 |     const radius = widthM / 2;
  62 |     const points = Array.from({ length: 64 }, (_, i) => {
  63 |       const angle = i / 64 * 2 * Math.PI;
  64 |       return map.project([anchor[0] + radius * Math.cos(angle) / (111319.49 * Math.cos(anchor[1] * Math.PI / 180)), anchor[1] + radius * Math.sin(angle) / 111319.49]);
  65 |     });
  66 |     return { minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)), width: map.getContainer().clientWidth, widthM };
  67 |   });
  68 |   expect(bounds.widthM).toBe(1.5);
  69 |   expect(bounds.minX).toBeGreaterThan(12);
  70 |   expect(bounds.maxX).toBeLessThan(bounds.width - 12);
  71 |   await map.dispose();
  72 | });
  73 | 
  74 | test('D04 unavailable image does not fabricate analysis', async ({ page }) => {
  75 |   await prepare(page);
  76 |   await page.getByRole('button', { name: 'Lapor', exact: true }).click();
  77 |   await page.route('**/images.unsplash.com/**', route => route.abort());
  78 |   await page.getByRole('button', { name: 'Lubang Aspal' }).click();
  79 |   await expect(page.getByRole('status')).toContainText('Gambar tidak dapat dianalisis');
  80 |   await expect(page.getByRole('button', { name: 'Simpan Laporan Contoh' })).toBeDisabled();
  81 | });
  82 | 
```