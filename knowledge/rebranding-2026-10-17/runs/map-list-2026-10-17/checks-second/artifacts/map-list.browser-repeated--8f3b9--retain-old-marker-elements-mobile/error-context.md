# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: map-list.browser.spec.ts >> repeated selection does not add map canvases or retain old marker elements
- Location: tests/public-reports/map-list.browser.spec.ts:139:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.lj-marker')
Expected: 2
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('.lj-marker')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Ke daftar laporan" [ref=e4] [cursor=pointer]:
    - /url: "#report-panel"
  - banner [ref=e5]:
    - link "LaporJalan - halaman utama" [ref=e6] [cursor=pointer]:
      - /url: /
      - img [ref=e8]
      - generic [ref=e12]:
        - strong [ref=e13]: LaporJalan
        - generic [ref=e14]: Laporan jalan dari warga
    - generic [ref=e15]:
      - text: Cari laporan
      - generic [ref=e16]:
        - img [ref=e17]
        - searchbox "Cari laporan" [ref=e20]
    - generic [ref=e21]:
      - img [ref=e22]
      - text: Jakarta
  - main [ref=e25]:
    - region "Peta laporan" [ref=e26]:
      - generic [ref=e27]:
        - generic:
          - region "Map" [ref=e28]
          - button "Perbesar 2 laporan" [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: "2"
      - button "Cari di area ini" [ref=e31] [cursor=pointer]
      - generic "Kontrol peta" [ref=e32]:
        - button "Perbesar peta" [ref=e33] [cursor=pointer]:
          - img [ref=e34]
        - button "Perkecil peta" [ref=e35] [cursor=pointer]:
          - img [ref=e36]
        - button "Tampilkan semua hasil pada peta" [ref=e37] [cursor=pointer]:
          - img [ref=e38]
    - region "Laporan publik" [ref=e41]:
      - button "Lihat peta" [expanded] [ref=e42] [cursor=pointer]:
        - img [ref=e43]
        - text: Lihat peta
      - generic [ref=e45]:
        - generic [ref=e46]:
          - paragraph [ref=e47]: PETA WARGA
          - heading "Jalan di sekitar." [level=1] [ref=e48]
        - button "Perbarui laporan" [ref=e49] [cursor=pointer]:
          - img [ref=e50]
      - navigation "Kategori laporan" [ref=e55]:
        - button "Semua" [pressed] [ref=e56] [cursor=pointer]:
          - img [ref=e57]
          - text: Semua
        - button "Jalan" [ref=e58] [cursor=pointer]:
          - img [ref=e59]
          - text: Jalan
        - button "Pembangunan" [ref=e63] [cursor=pointer]:
          - img [ref=e64]
          - text: Pembangunan
        - button "Saluran" [ref=e69] [cursor=pointer]:
          - img [ref=e70]
          - text: Saluran
        - button "Pembakaran" [ref=e74] [cursor=pointer]:
          - img [ref=e75]
          - text: Pembakaran
      - generic [ref=e77]:
        - generic [ref=e78]:
          - heading "3 laporan" [level=2] [ref=e79]
          - generic [ref=e80]: Terbaru dahulu
        - generic "Daftar laporan" [ref=e81]:
          - button "JALAN 17 Okt, 10.00 TEST-A Laporan warga · JAKI Koordinasi" [ref=e82] [cursor=pointer]:
            - generic [ref=e83]:
              - img [ref=e84]
              - generic [ref=e88]: Tanpa foto
            - generic [ref=e89]:
              - generic [ref=e90]:
                - text: JALAN
                - time [ref=e91]: 17 Okt, 10.00
              - strong [ref=e92]: TEST-A
              - generic [ref=e93]: Laporan warga · JAKI
              - generic [ref=e94]: Koordinasi
            - img [ref=e95]
          - button "JALAN 17 Okt, 09.00 TEST-B Laporan warga · JAKI Selesai" [active] [ref=e97] [cursor=pointer]:
            - generic [ref=e98]:
              - img [ref=e99]
              - generic [ref=e103]: Tanpa foto
            - generic [ref=e104]:
              - generic [ref=e105]:
                - text: JALAN
                - time [ref=e106]: 17 Okt, 09.00
              - strong [ref=e107]: TEST-B
              - generic [ref=e108]: Laporan warga · JAKI
              - generic [ref=e109]: Selesai
            - img [ref=e110]
          - button "JALAN 17 Okt, 08.00 TEST-C Laporan warga · JAKI Status belum tersedia" [ref=e112] [cursor=pointer]:
            - generic [ref=e113]:
              - img [ref=e114]
              - generic [ref=e118]: Tanpa foto
            - generic [ref=e119]:
              - generic [ref=e120]:
                - text: JALAN
                - time [ref=e121]: 17 Okt, 08.00
              - strong [ref=e122]: TEST-C
              - generic [ref=e123]: Laporan warga · JAKI
              - generic [ref=e124]: Status belum tersedia
            - img [ref=e125]
      - generic [ref=e127]:
        - generic [ref=e128]:
          - strong [ref=e130]: CRM Jakarta · JAKI
          - generic [ref=e131]: Bukan layanan resmi pemerintah
        - paragraph [ref=e132]: 16 Okt - 17 Okt · Diambil 17 Okt, 11.00 WIB
        - paragraph [ref=e133]: Hanya laporan publik berkategori Jalan pada peta CRM. Bukan seluruh laporan Jakarta.
```

# Test source

```ts
  50  |   await expect(page.locator('.lj-report-row')).toHaveCount(1);
  51  |   await expect(page.locator('.lj-marker')).toHaveCount(1);
  52  |   await expect(page.locator('.lj-marker')).toHaveAttribute('data-report-ids', 'test-b');
  53  | });
  54  | 
  55  | test('area filtering happens only after the explicit map action', async ({ page }) => {
  56  |   await prepare(page);
  57  |   const map = await mapHandle(page);
  58  |   await map.evaluate(instance => instance.jumpTo({ center: [106.88, -6.23], zoom: 16 }));
  59  |   await expect(page.locator('.lj-report-row')).toHaveCount(3);
  60  |   await page.getByRole('button', { name: 'Cari di area ini' }).click();
  61  |   await expect(page.locator('.lj-report-row')).toHaveCount(1);
  62  |   await page.getByRole('button', { name: 'Hapus area' }).click();
  63  |   await expect(page.locator('.lj-report-row')).toHaveCount(3);
  64  |   await map.dispose();
  65  | });
  66  | 
  67  | test('refresh failure preserves the last successful timestamp and reports', async ({ page }) => {
  68  |   await prepare(page);
  69  |   await page.route('**/api/public-reports', route => route.fulfill({ status: 503 }));
  70  |   await page.getByRole('button', { name: 'Perbarui laporan' }).click();
  71  |   await expect(page.getByRole('alert')).toContainText('Pembaruan belum berhasil');
  72  |   await expect(page.getByRole('alert')).toContainText('17 Okt');
  73  |   await expect(page.locator('.lj-report-row')).toHaveCount(3);
  74  | });
  75  | 
  76  | test('initial failure is distinct from empty and retry can recover', async ({ page }) => {
  77  |   await page.route('**/api/public-reports', route => route.fulfill({ status: 503 }));
  78  |   await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  79  |   await page.goto('/');
  80  |   await expect(page.getByRole('alert')).toContainText('Laporan belum dapat dimuat');
  81  |   await expect(page.locator('.lj-report-row')).toHaveCount(0);
  82  |   await expect(page.getByText('Belum ada laporan yang sesuai')).toHaveCount(0);
  83  |   await page.route('**/api/public-reports', route => route.fulfill({ json: { ...snapshot, reports: [] } }));
  84  |   await page.getByRole('button', { name: 'Coba lagi' }).click();
  85  |   await expand(page);
  86  |   await expect(page.getByText('Belum ada laporan yang sesuai')).toBeVisible();
  87  |   await expect(page.getByRole('alert')).toHaveCount(0);
  88  | });
  89  | 
  90  | test('unavailable map keeps the report details usable', async ({ page }) => {
  91  |   await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  92  |   await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  93  |   await page.goto('/');
  94  |   await expect(page.getByText('Peta belum tersedia sepenuhnya.', { exact: false })).toBeVisible();
  95  |   await expand(page);
  96  |   await page.locator('[data-report-id="test-a"]').click();
  97  |   await expect(page.locator('.lj-detail h2')).toHaveText('TEST-A');
  98  | });
  99  | 
  100 | test('mobile and desktop keep attribution, controls and panel inside the viewport', async ({ page }, info) => {
  101 |   await prepare(page);
  102 |   const horizontal = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  103 |   expect(horizontal).toBe(true);
  104 |   const panel = await page.locator('.lj-panel').boundingBox();
  105 |   const attribution = await page.locator('.maplibregl-ctrl-attrib').boundingBox();
  106 |   if (info.project.name === 'mobile') expect(attribution!.y + attribution!.height).toBeLessThanOrEqual(panel!.y + 1);
  107 |   await page.screenshot({ path: info.outputPath('map-list.png') });
  108 |   await expand(page);
  109 |   await page.locator('[data-report-id="test-b"]').click();
  110 |   await expect(page.locator('.lj-detail h2')).toBeFocused();
  111 |   await page.screenshot({ path: info.outputPath('detail.png') });
  112 | });
  113 | 
  114 | test('keyboard search and report navigation work without pointing at the map', async ({ page }) => {
  115 |   await prepare(page);
  116 |   await expand(page);
  117 |   await page.getByLabel('Cari laporan', { exact: true }).focus();
  118 |   await page.keyboard.type('TEST-B');
  119 |   const row = page.locator('[data-report-id="test-b"]');
  120 |   await row.focus();
  121 |   await page.keyboard.press('Enter');
  122 |   await expect(page.locator('.lj-detail h2')).toBeFocused();
  123 |   await page.getByRole('button', { name: 'Kembali ke daftar' }).press('Enter');
  124 |   await expect(row).toBeFocused();
  125 | });
  126 | 
  127 | test('a narrow screen keeps the list, detail and attribution reachable', async ({ page }, info) => {
  128 |   await page.setViewportSize({ width: 320, height: 740 });
  129 |   await prepare(page);
  130 |   await expand(page);
  131 |   await page.locator('[data-report-id="test-b"]').click();
  132 |   await expect(page.locator('.lj-detail h2')).toBeVisible();
  133 |   await page.getByRole('link', { name: 'Buka peta sumber' }).scrollIntoViewIfNeeded();
  134 |   await expect(page.getByRole('link', { name: 'Buka peta sumber' })).toBeVisible();
  135 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  136 |   await page.screenshot({ path: info.outputPath('narrow-detail.png') });
  137 | });
  138 | 
  139 | test('repeated selection does not add map canvases or retain old marker elements', async ({ page }) => {
  140 |   await prepare(page);
  141 |   await expand(page);
  142 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  143 |   const canvasCount = await page.locator('canvas').count();
  144 |   const markerCount = await page.locator('.lj-marker').count();
  145 |   for (let i = 0; i < 20; i++) {
  146 |     await page.locator('[data-report-id="test-b"]').click();
  147 |     await page.getByRole('button', { name: 'Kembali ke daftar' }).click();
  148 |   }
  149 |   await expect(page.locator('canvas')).toHaveCount(canvasCount);
> 150 |   await expect(page.locator('.lj-marker')).toHaveCount(markerCount);
      |                                            ^ Error: expect(locator).toHaveCount(expected) failed
  151 | });
  152 | 
```