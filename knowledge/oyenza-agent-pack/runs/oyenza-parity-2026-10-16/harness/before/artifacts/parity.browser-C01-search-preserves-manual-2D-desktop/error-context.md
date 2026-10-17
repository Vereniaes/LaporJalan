# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: parity.browser.spec.ts >> C01 search preserves manual 2D
- Location: tests/parity.browser.spec.ts:75:1

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 0
Received: 58.00000000000001

Expected precision:    6
Expected difference: < 0.0000005
Received difference:   58.00000000000001
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
            - generic [ref=e11]: 3D Live
          - paragraph [ref=e12]: Sistem Deteksi Citra & Pantau Galian
      - button "Lapor" [ref=e13] [cursor=pointer]:
        - img [ref=e14]
        - generic [ref=e17]: Lapor
    - generic [ref=e18]:
      - button "Peta 3D" [ref=e19] [cursor=pointer]:
        - img [ref=e20]
        - generic [ref=e22]: Peta 3D
      - button "Daftar (1)" [ref=e23] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e25]: Daftar (1)
      - button "CCTV (4)" [ref=e26] [cursor=pointer]:
        - img [ref=e27]
        - generic [ref=e30]: CCTV (4)
    - generic [ref=e31]:
      - generic [ref=e32]:
        - img [ref=e33]
        - textbox "Cari jalan seluruh Indonesia (Google Places)..." [ref=e36]: Fixture place
      - generic [ref=e38] [cursor=pointer]:
        - generic [ref=e39]: Fixture place
        - generic [ref=e40]: Synthetic place
    - generic [ref=e41]:
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]:
            - text: 🐱
            - img [ref=e46]
          - generic [ref=e51]:
            - generic [ref=e52]:
              - generic [ref=e53]: Miko Pantau Jalan
              - generic [ref=e54]: Real-Time
            - paragraph [ref=e55]:
              - text: Ada
              - strong [ref=e56]: 1 Lubang Kritis
              - text: "&"
              - strong [ref=e57]: 2 Galian Utilitas
              - text: di koridor Sudirman. Kurangi kecepatan motor saat hujan!
          - button [ref=e58] [cursor=pointer]:
            - img [ref=e59]
        - generic [ref=e62]:
          - button "Galian Pipa/Kabel Pantau jalan dibongkar" [ref=e63] [cursor=pointer]:
            - img [ref=e65]
            - generic [ref=e69]:
              - generic [ref=e70]: Galian Pipa/Kabel
              - text: Pantau jalan dibongkar
          - button "Miko CCTV 4 Kamera aktif" [ref=e71] [cursor=pointer]:
            - img [ref=e73]
            - generic [ref=e76]:
              - generic [ref=e77]: Miko CCTV
              - text: 4 Kamera aktif
      - generic [ref=e78] [cursor=pointer]:
        - generic [ref=e79]:
          - generic [ref=e80]:
            - generic [ref=e81]: 🌊
            - generic [ref=e82]:
              - generic [ref=e83]:
                - heading "Miko Pantau Genangan" [level=4] [ref=e84]
                - generic [ref=e85]: Siaga 3
              - paragraph [ref=e86]: Tinggi Air ~20 cm di Jl. Thamrin Barat
          - img [ref=e87]
        - generic [ref=e89]:
          - img [ref=e90]
          - generic [ref=e92]:
            - strong [ref=e93]: "Waspada Lubang Tak Kasat Mata:"
            - text: Genangan air hujan menutupi lubang sedalam 7.5 cm. Bahaya fatal bagi ban motor!
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e98]: Jalan Nasional (BBPJN PUPR)
          - generic [ref=e99]: BAHAYA KRITIS
        - generic [ref=e100]:
          - heading "Fixture pothole 52 cm" [level=2] [ref=e101]
          - generic [ref=e102]:
            - img [ref=e103]
            - generic [ref=e106]: Synthetic anchor - road not verified
        - generic [ref=e107]:
          - generic [ref=e108]:
            - generic [ref=e109]: Kedalaman
            - generic [ref=e110]: ~7.5 cm
          - generic [ref=e111]:
            - generic [ref=e112]: Estimasi Lebar
            - generic [ref=e113]: ~52 cm
          - generic [ref=e114]:
            - generic [ref=e115]: Bina Marga UP
            - text: "8.5"
        - generic [ref=e116]:
          - button "Inspeksi Potongan Melintang 3D (Putar 360°)" [ref=e117] [cursor=pointer]:
            - img [ref=e118]
            - generic [ref=e122]: Inspeksi Potongan Melintang 3D (Putar 360°)
          - generic [ref=e123]:
            - button "Lihat Lapangan 3D" [ref=e124] [cursor=pointer]:
              - img [ref=e125]
              - generic [ref=e128]: Lihat Lapangan 3D
            - button "Sebelum vs Sesudah" [ref=e129] [cursor=pointer]:
              - img [ref=e130]
              - generic [ref=e133]: Sebelum vs Sesudah
        - generic [ref=e134]:
          - generic [ref=e135]: "Catatan Lapangan:"
          - text: Synthetic test report
  - generic [ref=e137]:
    - generic [ref=e138]:
      - generic:
        - region "Map" [ref=e139]
        - generic "Map marker" [ref=e140] [cursor=pointer]:
          - generic [ref=e143]: 1 • CCTV Bundaran HI
        - generic "Map marker" [ref=e144] [cursor=pointer]:
          - generic [ref=e147]: 6B • CCTV Tosari Dukuh Atas
        - generic "Map marker" [ref=e148] [cursor=pointer]:
          - generic [ref=e151]: 4C • CCTV Simpang Semanggi
        - generic "Map marker" [ref=e152] [cursor=pointer]:
          - generic [ref=e155]: 9D • CCTV Rasuna Said Kuningan
      - group [ref=e156]:
        - generic "Toggle attribution" [ref=e157] [cursor=pointer]
        - link "MapLibre" [ref=e159] [cursor=pointer]:
          - /url: https://maplibre.org/
    - generic [ref=e160]:
      - button "2D" [ref=e161] [cursor=pointer]:
        - generic [ref=e162]: 2D
      - button "Reset Sudut Pandang" [ref=e163] [cursor=pointer]:
        - img [ref=e164]
    - generic [ref=e167]:
      - generic [ref=e170]: Lubang Kritis
      - generic [ref=e173]: Galian Utilitas
      - generic [ref=e176]: Kerucut CCTV
      - generic [ref=e179]: Macet
```

# Test source

```ts
  1   | import { test, expect, type Page, type TestInfo } from '@playwright/test';
  2   | import { fixture, style, snapshot } from './fixtures';
  3   | 
  4   | // Read the existing Map3D ref without adding production instrumentation.
  5   | async function mapState(page: Page) {
  6   |   return page.evaluate(() => {
  7   |     const container = document.querySelector('.maplibregl-map');
  8   |     if (!container) return null;
  9   |     const key = Object.keys(container).find(k => k.startsWith('__reactFiber$'));
  10  |     let fiber = key && (container as any)[key];
  11  |     while (fiber) {
  12  |       let hook = fiber.memoizedState;
  13  |       while (hook) {
  14  |         const map = hook.memoizedState?.current;
  15  |         if (map && typeof map.getPitch === 'function') {
  16  |           return { pitch: map.getPitch(), bearing: map.getBearing(), zoom: map.getZoom(),
  17  |             moving: map.isMoving(), styleReady: map.isStyleLoaded(), center: map.getCenter().toArray(),
  18  |             layers: map.getStyle()?.layers?.map((l: any) => ({ id: l.id, type: l.type })) };
  19  |         }
  20  |         hook = hook.next;
  21  |       }
  22  |       fiber = fiber.return;
  23  |     }
  24  |     return null;
  25  |   });
  26  | }
  27  | async function ready(page: Page) {
  28  |   await expect.poll(async () => (await mapState(page))?.styleReady, { timeout: 30000 }).toBe(true);
  29  |   await expect.poll(async () => (await mapState(page))?.moving, { timeout: 15000 }).toBe(false);
  30  | }
  31  | async function evidence(page: Page, info: TestInfo, name: string) {
  32  |   await page.screenshot({ path: info.outputPath(`${name}.png`), animations: 'disabled' });
  33  |   await info.attach(`${name}-state`, { body: JSON.stringify({ fixture: fixture.id, viewport: page.viewportSize(),
  34  |     map: await mapState(page), toggle: await page.locator('#b-3d').getAttribute('aria-pressed'),
  35  |     browser: page.context().browser()?.version(), url: page.url() }, null, 2), contentType: 'application/json' });
  36  | }
  37  | async function prepare(page: Page, realMap = false) {
  38  |   await page.clock.setFixedTime(new Date(fixture.time));
  39  |   await page.route('**/api/**', async route => {
  40  |     const path = new URL(route.request().url()).pathname;
  41  |     if (route.request().method() !== 'GET') return route.fulfill({ status: 405, body: 'No writes allowed' });
  42  |     await route.fulfill({ json: path.endsWith('/reports') ? { data: [fixture.report] } : { predictions: [{ id: 'fixture-place', name: 'Fixture place', address: 'Synthetic place', lng: 106.824, lat: -6.197 }] } });
  43  |   });
  44  |   await page.route('**/*', async route => {
  45  |     const url = route.request().url();
  46  |     if (route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/svg+xml', body: snapshot });
  47  |     if (!realMap && url.includes('tiles.openfreemap.org/styles/')) return route.fulfill({ json: style });
  48  |     return route.fallback();
  49  |   });
  50  |   await page.goto('/');
  51  |   await expect(page.locator('#b-3d')).toBeVisible();
  52  |   await ready(page);
  53  | }
  54  | 
  55  | test('B03 deterministic baseline screenshot', async ({ page }, info) => {
  56  |   await prepare(page);
  57  |   await evidence(page, info, 'baseline');
  58  |   expect(await page.locator('.maplibregl-canvas').count()).toBe(1);
  59  | });
  60  | 
  61  | test('C01 report selection preserves manual 2D', async ({ page }, info) => {
  62  |   await prepare(page);
  63  |   await page.locator('#b-3d').click();
  64  |   await ready(page);
  65  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  66  |   await evidence(page, info, 'before-selection-2d');
  67  |   await page.getByRole('button', { name: /Daftar/ }).click();
  68  |   await page.getByText('Fixture pothole 52 cm', { exact: true }).click();
  69  |   await ready(page);
  70  |   await evidence(page, info, 'after-selection-2d');
  71  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  72  |   await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  73  | });
  74  | 
  75  | test('C01 search preserves manual 2D', async ({ page }, info) => {
  76  |   await prepare(page);
  77  |   await page.locator('#b-3d').click();
  78  |   await ready(page);
  79  |   await page.getByPlaceholder(/Cari jalan/).fill('Fixture');
  80  |   await page.getByText('Fixture place', { exact: true }).click();
  81  |   await ready(page);
  82  |   await evidence(page, info, 'after-search-2d');
> 83  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
      |                                         ^ Error: expect(received).toBeCloseTo(expected, precision)
  84  | });
  85  | 
  86  | test('M01 static CCTV snapshot never claims LIVE', async ({ page }, info) => {
  87  |   await prepare(page);
  88  |   await page.getByRole('button', { name: /^CCTV/ }).click();
  89  |   await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  90  |   const popup = page.locator('.maplibregl-popup-content');
  91  |   await expect(popup).toBeVisible();
  92  |   await expect(popup.locator('img')).toHaveJSProperty('complete', true);
  93  |   await info.attach('cctv-dom', { body: JSON.stringify({ images: await popup.locator('img').count(), videos: await popup.locator('video').count(), text: await popup.innerText() }, null, 2), contentType: 'application/json' });
  94  |   await evidence(page, info, 'cctv-snapshot');
  95  |   await expect(popup.getByText('LIVE', { exact: true })).toHaveCount(0);
  96  | });
  97  | 
  98  | test('B03 live-integration map screenshot', async ({ page }, info) => {
  99  |   await prepare(page, true);
  100 |   await evidence(page, info, 'real-map-baseline');
  101 | });
  102 | 
```