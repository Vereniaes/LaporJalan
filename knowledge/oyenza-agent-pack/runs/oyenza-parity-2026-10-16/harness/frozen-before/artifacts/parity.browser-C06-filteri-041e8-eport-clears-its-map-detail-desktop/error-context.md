# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: parity.browser.spec.ts >> C06 filtering selected report clears its map detail
- Location: tests/parity.browser.spec.ts:113:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByText('Inspeksi Lapangan 3D', { exact: true })
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for getByText('Inspeksi Lapangan 3D', { exact: true })
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
    - generic [ref=e39]:
      - button "Semua" [ref=e40] [cursor=pointer]
      - button "Lubang" [ref=e41] [cursor=pointer]
      - button "Galian Utilitas" [ref=e42] [cursor=pointer]
      - button "Retak" [active] [ref=e43] [cursor=pointer]
  - generic [ref=e45]:
    - generic [ref=e46]:
      - generic:
        - region "Map" [ref=e47]
        - generic "Map marker" [ref=e48] [cursor=pointer]:
          - generic [ref=e51]: 1 • CCTV Bundaran HI
        - generic "Map marker" [ref=e52] [cursor=pointer]:
          - generic [ref=e55]: 6B • CCTV Tosari Dukuh Atas
        - generic "Map marker" [ref=e56] [cursor=pointer]:
          - generic [ref=e59]: 4C • CCTV Simpang Semanggi
        - generic "Map marker" [ref=e60] [cursor=pointer]:
          - generic [ref=e63]: 9D • CCTV Rasuna Said Kuningan
      - group [ref=e64]:
        - generic "Toggle attribution" [ref=e65] [cursor=pointer]
        - link "MapLibre" [ref=e67] [cursor=pointer]:
          - /url: https://maplibre.org/
    - generic [ref=e68]:
      - button "3D" [pressed] [ref=e69] [cursor=pointer]:
        - generic [ref=e70]: 3D
      - button "Reset Sudut Pandang" [ref=e71] [cursor=pointer]:
        - img [ref=e72]
    - generic [ref=e75]:
      - generic [ref=e76]:
        - generic [ref=e79]: Inspeksi Lapangan 3D
        - button "✕ Tutup" [ref=e80] [cursor=pointer]
      - generic [ref=e81]:
        - heading "Fixture pothole 52 cm" [level=4] [ref=e82]
        - paragraph [ref=e83]: Synthetic anchor - road not verified
      - generic [ref=e84]:
        - generic [ref=e85]:
          - text: "Kedalaman:"
          - generic [ref=e86]: 7.5 cm
        - generic [ref=e87]:
          - text: "Lebar:"
          - generic [ref=e88]: 52 cm
      - generic [ref=e89]:
        - button "Putar Orbit 360°" [ref=e90] [cursor=pointer]:
          - img [ref=e91]
          - generic [ref=e94]: Putar Orbit 360°
        - button "Jalanan" [ref=e95] [cursor=pointer]
        - button "Atas" [ref=e96] [cursor=pointer]
    - generic [ref=e97]:
      - generic [ref=e100]: Lubang Kritis
      - generic [ref=e103]: Galian Utilitas
      - generic [ref=e106]: Kerucut CCTV
      - generic [ref=e109]: Macet
```

# Test source

```ts
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
> 121 |   await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
      |                                                                         ^ Error: expect(locator).toHaveCount(expected) failed
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