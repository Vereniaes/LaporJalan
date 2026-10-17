# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: parity.browser.spec.ts >> C03 explicit inspection exits to previous 2D
- Location: tests/parity.browser.spec.ts:83:1

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
      - button "Daftar (2)" [ref=e23] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e25]: Daftar (2)
      - button "CCTV (4)" [ref=e26] [cursor=pointer]:
        - img [ref=e27]
        - generic [ref=e30]: CCTV (4)
    - generic [ref=e32]:
      - img [ref=e33]
      - textbox "Cari jalan seluruh Indonesia (Google Places)..." [ref=e36]
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - text: 🐱
            - img [ref=e42]
          - generic [ref=e47]:
            - generic [ref=e48]:
              - generic [ref=e49]: Miko Pantau Jalan
              - generic [ref=e50]: Real-Time
            - paragraph [ref=e51]:
              - text: Ada
              - strong [ref=e52]: 1 Lubang Kritis
              - text: "&"
              - strong [ref=e53]: 2 Galian Utilitas
              - text: di koridor Sudirman. Kurangi kecepatan motor saat hujan!
          - button [ref=e54] [cursor=pointer]:
            - img [ref=e55]
        - generic [ref=e58]:
          - button "Galian Pipa/Kabel Pantau jalan dibongkar" [ref=e59] [cursor=pointer]:
            - img [ref=e61]
            - generic [ref=e65]:
              - generic [ref=e66]: Galian Pipa/Kabel
              - text: Pantau jalan dibongkar
          - button "Miko CCTV 4 Kamera aktif" [ref=e67] [cursor=pointer]:
            - img [ref=e69]
            - generic [ref=e72]:
              - generic [ref=e73]: Miko CCTV
              - text: 4 Kamera aktif
      - generic [ref=e74] [cursor=pointer]:
        - generic [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]: 🌊
            - generic [ref=e78]:
              - generic [ref=e79]:
                - heading "Miko Pantau Genangan" [level=4] [ref=e80]
                - generic [ref=e81]: Siaga 3
              - paragraph [ref=e82]: Tinggi Air ~20 cm di Jl. Thamrin Barat
          - img [ref=e83]
        - generic [ref=e85]:
          - img [ref=e86]
          - generic [ref=e88]:
            - strong [ref=e89]: "Waspada Lubang Tak Kasat Mata:"
            - text: Genangan air hujan menutupi lubang sedalam 7.5 cm. Bahaya fatal bagi ban motor!
      - generic [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e94]: Jalan Nasional (BBPJN PUPR)
          - generic [ref=e95]: BAHAYA KRITIS
        - generic [ref=e96]:
          - heading "Fixture pothole 52 cm" [level=2] [ref=e97]
          - generic [ref=e98]:
            - img [ref=e99]
            - generic [ref=e102]: Synthetic anchor - road not verified
        - generic [ref=e103]:
          - generic [ref=e104]:
            - generic [ref=e105]: Kedalaman
            - generic [ref=e106]: ~7.5 cm
          - generic [ref=e107]:
            - generic [ref=e108]: Estimasi Lebar
            - generic [ref=e109]: ~52 cm
          - generic [ref=e110]:
            - generic [ref=e111]: Bina Marga UP
            - text: "8.5"
        - generic [ref=e112]:
          - button "Inspeksi Potongan Melintang 3D (Putar 360°)" [ref=e113] [cursor=pointer]:
            - img [ref=e114]
            - generic [ref=e118]: Inspeksi Potongan Melintang 3D (Putar 360°)
          - generic [ref=e119]:
            - button "Lihat Lapangan 3D" [ref=e120] [cursor=pointer]:
              - img [ref=e121]
              - generic [ref=e124]: Lihat Lapangan 3D
            - button "Sebelum vs Sesudah" [ref=e125] [cursor=pointer]:
              - img [ref=e126]
              - generic [ref=e129]: Sebelum vs Sesudah
        - generic [ref=e130]:
          - generic [ref=e131]: "Catatan Lapangan:"
          - text: Synthetic test report
  - generic [ref=e133]:
    - generic [ref=e134]:
      - generic:
        - region "Map" [ref=e135]
        - generic "Map marker" [ref=e136] [cursor=pointer]:
          - generic [ref=e139]: 1 • CCTV Bundaran HI
        - generic "Map marker" [ref=e140] [cursor=pointer]:
          - generic [ref=e143]: 6B • CCTV Tosari Dukuh Atas
        - generic "Map marker" [ref=e144] [cursor=pointer]:
          - generic [ref=e147]: 4C • CCTV Simpang Semanggi
        - generic "Map marker" [ref=e148] [cursor=pointer]:
          - generic [ref=e151]: 9D • CCTV Rasuna Said Kuningan
        - generic "Map marker" [ref=e152] [cursor=pointer]:
          - generic [ref=e153]:
            - generic:
              - generic:
                - generic: "Kedalaman:"
                - generic: 7.5 cm
              - generic:
                - generic: "Lebar:"
                - generic: 52 cm
              - generic:
                - generic: "Lebar jalan:"
                - generic: 7 m
            - generic [ref=e154]:
              - generic [ref=e155]: LUBANG
              - generic [ref=e156]: 7.5cm
        - generic "Map marker" [ref=e158] [cursor=pointer]:
          - generic [ref=e160]:
            - generic [ref=e161]: LUBANG
            - generic [ref=e162]: 7.5cm
      - group [ref=e164]:
        - generic "Toggle attribution" [ref=e165] [cursor=pointer]
        - link "MapLibre" [ref=e167] [cursor=pointer]:
          - /url: https://maplibre.org/
    - generic [ref=e168]:
      - button "2D" [ref=e169] [cursor=pointer]:
        - generic [ref=e170]: 2D
      - button "Reset Sudut Pandang" [ref=e171] [cursor=pointer]:
        - img [ref=e172]
    - generic [ref=e175]:
      - generic [ref=e178]: Lubang Kritis
      - generic [ref=e181]: Galian Utilitas
      - generic [ref=e184]: Kerucut CCTV
      - generic [ref=e187]: Macet
```

# Test source

```ts
  1   | import { test, expect, type Page, type TestInfo } from '@playwright/test';
  2   | import { fixture, style, snapshot } from './fixtures';
  3   | import { mapState, ready, evidence } from './helpers/map';
  4   | 
  5   | async function prepare(page: Page, realMap = false) {
  6   |   await page.clock.setFixedTime(new Date(fixture.time));
  7   |   await page.route('**/api/**', async route => {
  8   |     const path = new URL(route.request().url()).pathname;
  9   |     if (route.request().method() !== 'GET') return route.fulfill({ status: 405, body: 'No writes allowed' });
  10  |     await route.fulfill({ json: path.endsWith('/reports') ? { data: [fixture.report, { ...fixture.report, id: 'fixture-second', title: 'Fixture second report', lng: 106.824 }] } : { predictions: [{ id: 'fixture-place', name: 'Fixture place', address: 'Synthetic place', lng: 106.824, lat: -6.197 }] } });
  11  |   });
  12  |   await page.route('**/*', async route => {
  13  |     const url = route.request().url();
  14  |     if (route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/svg+xml', body: snapshot });
  15  |     if (!realMap && url.includes('tiles.openfreemap.org/styles/')) return route.fulfill({ json: style });
  16  |     return route.fallback();
  17  |   });
  18  |   await page.goto('/');
  19  |   await expect(page.locator('#b-3d')).toBeVisible();
  20  |   await ready(page);
  21  | }
  22  | 
  23  | test('B03 deterministic baseline screenshot', async ({ page }, info) => {
  24  |   await prepare(page);
  25  |   await evidence(page, info, 'baseline');
  26  |   expect(await page.locator('.maplibregl-canvas').count()).toBe(1);
  27  | });
  28  | 
  29  | test('C01 report selection preserves manual 2D', async ({ page }, info) => {
  30  |   await prepare(page);
  31  |   await page.locator('#b-3d').click();
  32  |   await ready(page);
  33  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  34  |   await evidence(page, info, 'before-selection-2d');
  35  |   await page.getByRole('button', { name: /Daftar/ }).click();
  36  |   await page.getByText('Fixture second report', { exact: true }).click();
  37  |   await ready(page);
  38  |   await evidence(page, info, 'after-selection-2d');
  39  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  40  |   await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  41  | });
  42  | 
  43  | test('C01 search preserves manual 2D', async ({ page }, info) => {
  44  |   await prepare(page);
  45  |   await page.locator('#b-3d').click();
  46  |   await ready(page);
  47  |   await page.getByPlaceholder(/Cari jalan/).fill('Fixture');
  48  |   await page.getByText('Fixture place', { exact: true }).click();
  49  |   await ready(page);
  50  |   await evidence(page, info, 'after-search-2d');
  51  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  52  | });
  53  | 
  54  | test('M01 static CCTV snapshot never claims LIVE', async ({ page }, info) => {
  55  |   await prepare(page);
  56  |   await page.getByRole('button', { name: /^CCTV/ }).click();
  57  |   await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  58  |   const popup = page.locator('.maplibregl-popup-content');
  59  |   await expect(popup).toBeVisible();
  60  |   await expect(popup.locator('img')).toHaveJSProperty('complete', true);
  61  |   await info.attach('cctv-dom', { body: JSON.stringify({ images: await popup.locator('img').count(), videos: await popup.locator('video').count(), text: await popup.innerText() }, null, 2), contentType: 'application/json' });
  62  |   await evidence(page, info, 'cctv-snapshot');
  63  |   await expect(popup.getByText('LIVE', { exact: true })).toHaveCount(0);
  64  | });
  65  | 
  66  | test('B03 live-integration map screenshot', async ({ page }, info) => {
  67  |   await prepare(page, true);
  68  |   await evidence(page, info, 'real-map-baseline');
  69  | });
  70  | 
  71  | 
  72  | test('C02 reset preserves manual 2D', async ({ page }, info) => {
  73  |   await prepare(page);
  74  |   await page.locator('#b-3d').click();
  75  |   await ready(page);
  76  |   await page.getByTitle('Reset Sudut Pandang').click();
  77  |   await ready(page);
  78  |   await evidence(page, info, 'reset-2d');
  79  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  80  |   await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  81  | });
  82  | 
  83  | test('C03 explicit inspection exits to previous 2D', async ({ page }, info) => {
  84  |   await prepare(page);
  85  |   await page.locator('#b-3d').click();
  86  |   await ready(page);
  87  |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  88  |   await ready(page);
  89  |   expect((await mapState(page))!.pitch).toBeGreaterThan(0);
  90  |   await page.getByRole('button', { name: /Tutup$/ }).click();
  91  |   await ready(page);
  92  |   await evidence(page, info, 'exit-inspection-2d');
> 93  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
      |                                         ^ Error: expect(received).toBeCloseTo(expected, precision)
  94  |   await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  95  | });
  96  | 
  97  | test('C04 selecting 2D cancels inspection and orbit', async ({ page }, info) => {
  98  |   await prepare(page);
  99  |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  100 |   await ready(page);
  101 |   await page.getByRole('button', { name: 'Putar Orbit 360°' }).click();
  102 |   await page.locator('#b-3d').click();
  103 |   await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  104 |   await ready(page);
  105 |   const first = (await mapState(page))!;
  106 |   await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  107 |   const second = (await mapState(page))!;
  108 |   await evidence(page, info, 'orbit-cancelled-2d');
  109 |   expect(first.pitch).toBeCloseTo(0, 6);
  110 |   expect(second.bearing).toBeCloseTo(first.bearing, 6);
  111 | });
  112 | 
  113 | test('C06 filtering selected report clears its map detail', async ({ page }, info) => {
  114 |   await prepare(page);
  115 |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  116 |   await ready(page);
  117 |   await page.getByRole('button', { name: /Daftar/ }).click();
  118 |   await page.getByRole('button', { name: 'Retak', exact: true }).click();
  119 |   await expect(page.locator('.maplibregl-marker').filter({ hasText: 'LUBANG' })).toHaveCount(0);
  120 |   await evidence(page, info, 'filtered-selection');
  121 |   await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  122 | });
  123 | 
  124 | test('C01 CCTV selection preserves manual 2D', async ({ page }, info) => {
  125 |   await prepare(page);
  126 |   await page.locator('#b-3d').click();
  127 |   await ready(page);
  128 |   await page.getByRole('button', { name: /^CCTV/ }).click();
  129 |   await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  130 |   await ready(page);
  131 |   await evidence(page, info, 'cctv-2d');
  132 |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
  133 |   await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  134 | });
  135 | 
```