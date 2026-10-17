# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interaction.browser.spec.ts >> C02 late flight and zoom callbacks cannot override manual 2D
- Location: tests/interaction.browser.spec.ts:26:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 55.94336303072171
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: 🚧
        - generic [ref=e8]:
          - generic [ref=e9]:
            - heading "LaporJalan" [level=1] [ref=e10]
            - generic [ref=e11]: Demo
          - paragraph [ref=e12]: Peta kondisi jalan
      - button "Lapor" [ref=e13] [cursor=pointer]:
        - img [ref=e14]
        - generic [ref=e17]: Lapor
    - generic [ref=e18]:
      - button "Peta 3D" [ref=e19] [cursor=pointer]:
        - img [ref=e20]
        - generic [ref=e22]: Peta 3D
      - button "Daftar (2)" [ref=e23] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e25]: Daftar (2)
      - button "CCTV (4)" [ref=e26] [cursor=pointer]:
        - img [ref=e27]
        - generic [ref=e30]: CCTV (4)
    - generic [ref=e32]:
      - img [ref=e33]
      - textbox "Cari jalan atau laporan..." [ref=e36]
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - img [ref=e40]
          - generic [ref=e45]:
            - paragraph [ref=e46]: Pantau kondisi jalan
            - paragraph [ref=e47]: 2 laporan tersedia. Pilih titik untuk melihat detail.
            - button "Tambahkan laporan" [ref=e48] [cursor=pointer]
          - button "Tutup ringkasan" [ref=e49] [cursor=pointer]:
            - img [ref=e50]
        - generic [ref=e53]:
          - button "Galian utilitas" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
            - generic [ref=e59]: Galian utilitas
          - button "4 kamera contoh" [ref=e60] [cursor=pointer]:
            - img [ref=e61]
            - generic [ref=e64]: 4 kamera contoh
      - button "Pantauan genangan Data ketinggian air belum tersedia." [ref=e65] [cursor=pointer]:
        - img [ref=e66]
        - generic [ref=e70]:
          - paragraph [ref=e71]: Pantauan genangan
          - paragraph [ref=e72]: Data ketinggian air belum tersedia.
        - img [ref=e73]
      - generic [ref=e75]:
        - generic [ref=e76]:
          - heading "Fixture pothole 52 cm" [level=2] [ref=e77]
          - generic [ref=e78]: berat
        - paragraph [ref=e79]:
          - img [ref=e80]
          - text: Synthetic anchor - road not verified
        - generic [ref=e83]:
          - generic [ref=e84]:
            - paragraph [ref=e85]: Kedalaman
            - paragraph [ref=e86]: 7.5 cm
          - generic [ref=e87]:
            - paragraph [ref=e88]: Lebar
            - paragraph [ref=e89]: 52 cm
        - paragraph [ref=e90]: Estimasi laporan - metode pengukuran belum diverifikasi.
        - button "Lihat Lapangan 3D" [ref=e91] [cursor=pointer]:
          - img [ref=e92]
          - text: Lihat Lapangan 3D
        - generic [ref=e95]:
          - button "Profil ilustratif" [ref=e96] [cursor=pointer]
          - button "Sebelum vs Sesudah" [ref=e97] [cursor=pointer]
        - group [ref=e98]:
          - generic "Catatan laporan" [ref=e99] [cursor=pointer]
  - generic [ref=e100]:
    - generic [ref=e101]:
      - generic [ref=e102]:
        - generic:
          - region "Map" [ref=e103]
          - button "Map marker" [ref=e104] [cursor=pointer]: CCTV hi-01
          - button "Map marker" [ref=e105] [cursor=pointer]: CCTV sudirman-6b
          - button "Map marker" [ref=e106] [cursor=pointer]: CCTV semanggi-4c
          - button "Map marker" [ref=e107] [cursor=pointer]: CCTV kuningan-9d
          - button "Map marker" [pressed] [ref=e108] [cursor=pointer]: LUBANG
          - button "Map marker" [ref=e109] [cursor=pointer]: LUBANG
        - group [ref=e110]:
          - generic "Toggle attribution" [ref=e111] [cursor=pointer]
          - link "MapLibre" [ref=e113] [cursor=pointer]:
            - /url: https://maplibre.org/
      - generic [ref=e114]:
        - button "2D" [ref=e115] [cursor=pointer]:
          - generic [ref=e116]: 2D
        - button "Reset Sudut Pandang" [ref=e117] [cursor=pointer]:
          - img [ref=e118]
      - generic [ref=e121]:
        - button "Perbesar peta" [active] [ref=e122] [cursor=pointer]: +
        - button "Perkecil peta" [ref=e123] [cursor=pointer]: −
    - button "Lapor jalan" [ref=e124] [cursor=pointer]:
      - img [ref=e125]
      - generic [ref=e128]: Lapor jalan
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { prepare, ready, mapState, mapHandle } from './helpers/map';
  3  | 
  4  | test('C05 an older geocoder response cannot replace a newer query', async ({ page }) => {
  5  |   await prepare(page);
  6  |   let release!: () => void;
  7  |   const gate = new Promise<void>(resolve => { release = resolve; });
  8  |   let oldStarted!: () => void;
  9  |   const started = new Promise<void>(resolve => { oldStarted = resolve; });
  10 |   await page.route('**/api/places/**', async route => {
  11 |     const old = new URL(route.request().url()).searchParams.get('input') === 'Older';
  12 |     if (old) { oldStarted(); await gate; }
  13 |     await route.fulfill({ json: { predictions: [{ id: old ? 'old' : 'new', name: old ? 'Older result' : 'Newer result', address: 'Fixture', lng: 106.825, lat: -6.197 }] } });
  14 |   });
  15 |   await page.getByPlaceholder(/Cari jalan/).fill('Older');
  16 |   await started;
  17 |   await page.getByPlaceholder(/Cari jalan/).fill('Newer');
  18 |   await expect(page.getByRole('button', { name: /Newer result/ })).toBeVisible();
  19 |   const response = page.waitForResponse(response => response.url().includes('input=Older'));
  20 |   release();
  21 |   await (await response).finished();
  22 |   await expect(page.getByRole('button', { name: /Older result/ })).toHaveCount(0);
  23 |   await expect(page.getByRole('button', { name: /Newer result/ })).toBeVisible();
  24 | });
  25 | 
  26 | test('C02 late flight and zoom callbacks cannot override manual 2D', async ({ page }) => {
  27 |   await prepare(page);
  28 |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  29 |   await page.locator('#b-3d').click();
  30 |   await page.getByRole('button', { name: 'Perbesar peta' }).click();
  31 |   await ready(page);
> 32 |   expect((await mapState(page))!.pitch).toBe(0);
     |                                         ^ Error: expect(received).toBe(expected) // Object.is equality
  33 |   await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  34 |   expect((await mapState(page))!.inspection).toBeUndefined();
  35 | });
  36 | 
  37 | test('M02 device fullscreen rejection retains an accessible preview', async ({ page }) => {
  38 |   await page.addInitScript(() => { Element.prototype.requestFullscreen = () => Promise.reject(new Error('Fixture fullscreen denied')); });
  39 |   await prepare(page);
  40 |   await page.getByRole('button', { name: /^CCTV/ }).click();
  41 |   await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  42 |   await ready(page);
  43 |   await page.getByRole('region', { name: 'Pratinjau CCTV' }).getByRole('button', { name: 'Layar Penuh' }).click();
  44 |   await page.getByTitle('Mode layar perangkat').click();
  45 |   await expect(page.getByRole('dialog').getByRole('status')).toContainText('Pratinjau tetap dapat digunakan');
  46 |   await page.keyboard.press('Escape');
  47 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  48 | });
  49 | 
  50 | test('M03 popup anchor tracks pan zoom and resize within two CSS pixels', async ({ page }, info) => {
  51 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  52 |   await prepare(page);
  53 |   await page.getByRole('button', { name: /^CCTV/ }).click();
  54 |   await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  55 |   await ready(page);
  56 |   const map = await mapHandle(page);
  57 |   const samples = [];
  58 |   for (const step of ['initial', 'pan', 'zoom', 'resize']) {
  59 |     if (step === 'pan') await map.evaluate(map => { map.panBy([30, 20], { duration: 0 }); });
  60 |     if (step === 'zoom') await map.evaluate(map => { map.zoomTo(map.getZoom() + 0.2, { duration: 0 }); });
  61 |     if (step === 'resize') {
  62 |       const viewport = page.viewportSize()!;
  63 |       await page.setViewportSize({ width: viewport.width + 10, height: viewport.height });
  64 |     }
  65 |     await ready(page);
  66 |     const result = await map.evaluate(map => {
  67 |       const popup = map._popups[0];
  68 |       const point = map.project(popup.getLngLat());
  69 |       return { point: [point.x, point.y], actual: [popup._pos.x, popup._pos.y], offset: popup.options.offset };
  70 |     });
  71 |     expect(Math.hypot(result.actual[0] - result.point[0], result.actual[1] - result.point[1])).toBeLessThanOrEqual(2);
  72 |     expect(result.offset).toEqual([0, -28]);
  73 |     samples.push({ step, ...result });
  74 |   }
  75 |   await info.attach('popup-projections', { body: JSON.stringify(samples), contentType: 'application/json' });
  76 |   await map.dispose();
  77 | });
  78 | 
```