# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: review.browser.spec.ts >> R02 an earlier file read cannot replace a newer image selection
- Location: tests/review.browser.spec.ts:6:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: getByAltText('Preview Kerusakan')
Expected pattern: /photo-1584467735871/
Received string:  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIC8+PC9zdmc+"
Timeout: 5000ms

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for getByAltText('Preview Kerusakan')
    14 × locator resolved to <img alt="Preview Kerusakan" class="w-full h-full object-cover" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIC8+PC9zdmc+"/>
       - unexpected value "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIC8+PC9zdmc+"

```

```yaml
- img "Preview Kerusakan"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { prepare, ready, mapState, mapHandle } from './helpers/map';
  3   | import { fixture } from './fixtures';
  4   | import { INITIAL_REPORTS } from '../src/services/mockData';
  5   | 
  6   | test('R02 an earlier file read cannot replace a newer image selection', async ({ page }) => {
  7   |   await page.addInitScript(() => {
  8   |     const Reader = window.FileReader;
  9   |     window.FileReader = class extends Reader {
  10  |       readAsDataURL(file: Blob) {
  11  |         (window as any).releaseFixtureFile = () => {
  12  |           this.addEventListener('loadend', () => { (window as any).fixtureFileDone = true; });
  13  |           super.readAsDataURL(file);
  14  |         };
  15  |       }
  16  |     };
  17  |   });
  18  |   await prepare(page);
  19  |   await page.getByRole('button', { name: 'Lapor', exact: true }).click();
  20  |   await page.locator('input[type=file]').setInputFiles({ name: 'slow.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" /></svg>') });
  21  |   await page.getByRole('dialog').getByRole('button', { name: 'Galian Utilitas' }).click();
  22  |   await expect(page.getByAltText('Preview Kerusakan')).toHaveAttribute('src', /photo-1584467735871/);
  23  |   await page.evaluate(() => (window as any).releaseFixtureFile());
  24  |   await expect.poll(() => page.evaluate(() => (window as any).fixtureFileDone)).toBe(true);
> 25  |   await expect(page.getByAltText('Preview Kerusakan')).toHaveAttribute('src', /photo-1584467735871/);
      |                                                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  26  | });
  27  | 
  28  | test('C06 empty report response clears prior selection and inspection', async ({ page }) => {
  29  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  30  |   await prepare(page);
  31  |   let release!: () => void;
  32  |   const gate = new Promise<void>(resolve => { release = resolve; });
  33  |   await page.route('**/api/reports', async route => { await gate; await route.fulfill({ json: { data: [] } }); });
  34  |   await page.reload();
  35  |   await ready(page);
  36  |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  37  |   release();
  38  |   await expect(page.getByRole('button', { name: 'Daftar (0)' })).toBeVisible();
  39  |   await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  40  |   await expect(page.locator('.map-report-marker')).toHaveCount(0);
  41  | });
  42  | 
  43  | test('C05 invalid search coordinates do not crash or move the map', async ({ page }) => {
  44  |   await prepare(page);
  45  |   const errors: string[] = [];
  46  |   page.on('pageerror', error => errors.push(error.message));
  47  |   await page.route('**/api/places/**', route => route.fulfill({ json: { predictions: [{ id: 'bad', name: 'Invalid place', address: 'Invalid fixture', lng: 106, lat: 95 }] } }));
  48  |   const before = (await mapState(page))!.center;
  49  |   await page.getByPlaceholder(/Cari jalan/).fill('Invalid');
  50  |   await page.getByText('Invalid place', { exact: true }).click();
  51  |   await ready(page);
  52  |   expect(errors).toEqual([]);
  53  |   expect((await mapState(page))!.center).toEqual(before);
  54  | });
  55  | 
  56  | test('C05 refreshed coordinates follow the active report with the same id', async ({ page }) => {
  57  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  58  |   await prepare(page);
  59  |   let release!: () => void;
  60  |   const gate = new Promise<void>(resolve => { release = resolve; });
  61  |   const refreshed = { ...INITIAL_REPORTS[0], lat: -6.197, lng: 106.825 };
  62  |   await page.route('**/api/reports', async route => { await gate; await route.fulfill({ json: { data: [refreshed] } }); });
  63  |   await page.reload();
  64  |   await ready(page);
  65  |   await page.locator('#b-3d').click();
  66  |   release();
  67  |   await expect.poll(async () => (await mapState(page))!.center[0]).toBeCloseTo(refreshed.lng, 6);
  68  |   expect((await mapState(page))!.center[1]).toBeCloseTo(refreshed.lat, 6);
  69  | });
  70  | 
  71  | test('U02 inspection frames a larger physical cavity without scaling the model', async ({ page }) => {
  72  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  73  |   await prepare(page);
  74  |   await page.route('**/api/reports', route => route.fulfill({ json: { data: [{ ...fixture.report, widthCm: 150 }] } }));
  75  |   await page.reload();
  76  |   await ready(page);
  77  |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  78  |   await ready(page);
  79  |   const map = await mapHandle(page);
  80  |   const bounds = await map.evaluate(map => {
  81  |     const layer = map.getLayer('inspection-damage').implementation;
  82  |     const { anchor, widthM } = layer.options;
  83  |     const radius = widthM / 2;
  84  |     const points = Array.from({ length: 64 }, (_, i) => {
  85  |       const angle = i / 64 * 2 * Math.PI;
  86  |       return map.project([anchor[0] + radius * Math.cos(angle) / (111319.49 * Math.cos(anchor[1] * Math.PI / 180)), anchor[1] + radius * Math.sin(angle) / 111319.49]);
  87  |     });
  88  |     return { minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)), width: map.getContainer().clientWidth, widthM };
  89  |   });
  90  |   expect(bounds.widthM).toBe(1.5);
  91  |   expect(bounds.minX).toBeGreaterThan(12);
  92  |   expect(bounds.maxX).toBeLessThan(bounds.width - 12);
  93  |   await map.dispose();
  94  | });
  95  | 
  96  | test('D04 unavailable image does not fabricate analysis', async ({ page }) => {
  97  |   await prepare(page);
  98  |   await page.getByRole('button', { name: 'Lapor', exact: true }).click();
  99  |   await page.route('**/images.unsplash.com/**', route => route.abort());
  100 |   await page.getByRole('button', { name: 'Lubang Aspal' }).click();
  101 |   await expect(page.getByRole('status')).toContainText('Gambar tidak dapat dianalisis');
  102 |   await expect(page.getByRole('button', { name: 'Simpan Laporan Contoh' })).toBeDisabled();
  103 | });
  104 | 
```