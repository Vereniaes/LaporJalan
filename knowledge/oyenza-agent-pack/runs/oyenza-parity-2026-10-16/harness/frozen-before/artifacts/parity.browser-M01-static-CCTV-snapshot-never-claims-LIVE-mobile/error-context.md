# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: parity.browser.spec.ts >> M01 static CCTV snapshot never claims LIVE
- Location: tests/parity.browser.spec.ts:54:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.maplibregl-popup-content').getByText('LIVE', { exact: true })
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.maplibregl-popup-content').getByText('LIVE', { exact: true })
    14 × locator resolved to 1 element
       - unexpected value "1"

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
    - generic [ref=e38]:
      - generic [ref=e39]: "Kamera Pengawas Lalu Lintas & Galian:"
      - generic [ref=e40]:
        - generic [ref=e41] [cursor=pointer]:
          - generic [ref=e42]:
            - img "1 • CCTV Bundaran HI" [ref=e43]
            - generic [ref=e44]: LIVE
          - generic [ref=e45]:
            - generic [ref=e46]:
              - generic [ref=e47]: 1 • CCTV Bundaran HI
              - generic [ref=e48]: 09:42:55
            - paragraph [ref=e49]: Bundaran HI • Sisi Hotel Indonesia • Simpang C09
            - generic [ref=e50]:
              - generic [ref=e51]: Sudut 35°
              - generic [ref=e52]: •
              - generic [ref=e53]: Jangkauan 280m
        - generic [ref=e54] [cursor=pointer]:
          - generic [ref=e55]:
            - img "6B • CCTV Tosari Dukuh Atas" [ref=e56]
            - generic [ref=e57]: LIVE
          - generic [ref=e58]:
            - generic [ref=e59]:
              - generic [ref=e60]: 6B • CCTV Tosari Dukuh Atas
              - generic [ref=e61]: 09:43:10
            - paragraph [ref=e62]: Jl. Jenderal Sudirman • Halte Tosari 1
            - generic [ref=e63]:
              - generic [ref=e64]: Sudut 195°
              - generic [ref=e65]: •
              - generic [ref=e66]: Jangkauan 320m
        - generic [ref=e67] [cursor=pointer]:
          - generic [ref=e68]:
            - img "4C • CCTV Simpang Semanggi" [ref=e69]
            - generic [ref=e70]: LIVE
          - generic [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]: 4C • CCTV Simpang Semanggi
              - generic [ref=e74]: 09:41:20
            - paragraph [ref=e75]: Plaza Semanggi • Sudirman Loop B
            - generic [ref=e76]:
              - generic [ref=e77]: Sudut 80°
              - generic [ref=e78]: •
              - generic [ref=e79]: Jangkauan 350m
        - generic [ref=e80] [cursor=pointer]:
          - generic [ref=e81]:
            - img "9D • CCTV Rasuna Said Kuningan" [ref=e82]
            - generic [ref=e83]: LIVE
          - generic [ref=e84]:
            - generic [ref=e85]:
              - generic [ref=e86]: 9D • CCTV Rasuna Said Kuningan
              - generic [ref=e87]: 09:40:02
            - paragraph [ref=e88]: HR Rasuna Said • Depan Menara Kadin
            - generic [ref=e89]:
              - generic [ref=e90]: Sudut 350°
              - generic [ref=e91]: •
              - generic [ref=e92]: Jangkauan 300m
  - generic [ref=e93]:
    - generic [ref=e94]:
      - generic [ref=e95]:
        - generic:
          - region "Map" [ref=e96]
          - generic "Map marker" [ref=e97] [cursor=pointer]:
            - generic [ref=e100]: 1 • CCTV Bundaran HI
          - generic "Map marker" [ref=e101] [cursor=pointer]:
            - generic [ref=e104]: 6B • CCTV Tosari Dukuh Atas
          - generic "Map marker" [ref=e105] [cursor=pointer]:
            - generic [ref=e108]: 4C • CCTV Simpang Semanggi
          - generic "Map marker" [ref=e109] [cursor=pointer]:
            - generic [ref=e112]: 9D • CCTV Rasuna Said Kuningan
          - generic "Map marker" [ref=e113] [cursor=pointer]:
            - generic [ref=e114]:
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
              - generic [ref=e115]:
                - generic [ref=e116]: LUBANG
                - generic [ref=e117]: 7.5cm
          - generic "Map marker" [ref=e119] [cursor=pointer]:
            - generic [ref=e121]:
              - generic [ref=e122]: LUBANG
              - generic [ref=e123]: 7.5cm
        - group [ref=e125]:
          - generic "Toggle attribution" [ref=e126] [cursor=pointer]
          - link "MapLibre" [ref=e128] [cursor=pointer]:
            - /url: https://maplibre.org/
        - generic [ref=e131]:
          - generic [ref=e132]:
            - generic [ref=e133]:
              - heading "1 • CCTV Bundaran HI" [level=4] [ref=e134]
              - paragraph [ref=e135]: Bundaran HI • Sisi Hotel Indonesia • Simpang C09 • Jasa Marga
            - button "Tutup CCTV" [ref=e136] [cursor=pointer]:
              - img [ref=e137]
          - generic [ref=e140]:
            - img "1 • CCTV Bundaran HI" [ref=e141]
            - generic [ref=e142]:
              - img [ref=e143]
              - generic [ref=e149]: LIVE
            - generic [ref=e150]: Sudut 35° • 280m
          - generic [ref=e151]:
            - generic [ref=e152]: "Update: 09:42:55 WIB"
            - button "Bagikan" [ref=e154] [cursor=pointer]:
              - img [ref=e155]
              - generic [ref=e161]: Bagikan
      - generic [ref=e162]:
        - button "3D" [pressed] [ref=e163] [cursor=pointer]:
          - generic [ref=e164]: 3D
        - button "Reset Sudut Pandang" [ref=e165] [cursor=pointer]:
          - img [ref=e166]
    - button "Lapor 1-Snap AI" [ref=e169] [cursor=pointer]:
      - img [ref=e170]
      - generic [ref=e173]: Lapor 1-Snap AI
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
> 63  |   await expect(popup.getByText('LIVE', { exact: true })).toHaveCount(0);
      |                                                          ^ Error: expect(locator).toHaveCount(expected) failed
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
  93  |   expect((await mapState(page))!.pitch).toBeCloseTo(0, 6);
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