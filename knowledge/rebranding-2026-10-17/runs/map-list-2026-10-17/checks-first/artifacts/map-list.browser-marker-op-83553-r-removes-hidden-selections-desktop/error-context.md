# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: map-list.browser.spec.ts >> marker opens the matching report and a filter removes hidden selections
- Location: tests/public-reports/map-list.browser.spec.ts:36:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Buka laporan TEST-B', exact: true })

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
      - generic [ref=e16]: Cari laporan
      - generic [ref=e17]:
        - img [ref=e18]
        - searchbox "Cari laporan" [ref=e21]
    - generic [ref=e22]:
      - img [ref=e23]
      - text: Jakarta
    - link "Peta CRM" [ref=e26] [cursor=pointer]:
      - /url: https://crm.jakarta.go.id/peta/
      - text: Peta CRM
      - img [ref=e27]
  - main [ref=e30]:
    - region "Peta laporan" [ref=e31]:
      - generic [ref=e32]:
        - generic:
          - region "Map" [ref=e33]
          - button "Map marker" [ref=e34] [cursor=pointer]:
            - generic [ref=e35]: "2"
          - button "Map marker" [ref=e36] [cursor=pointer]:
            - img [ref=e38]
      - button "Cari di area ini" [ref=e40] [cursor=pointer]
      - generic "Kontrol peta" [ref=e41]:
        - button "Perbesar peta" [ref=e42] [cursor=pointer]:
          - img [ref=e43]
        - button "Perkecil peta" [ref=e44] [cursor=pointer]:
          - img [ref=e45]
        - button "Tampilkan semua hasil pada peta" [ref=e46] [cursor=pointer]:
          - img [ref=e47]
      - generic: Laporan kategori Jalan
    - region "Laporan publik" [ref=e50]:
      - generic [ref=e51]:
        - generic [ref=e52]:
          - paragraph [ref=e53]: PETA WARGA
          - heading "Jalan di sekitar." [level=1] [ref=e54]
        - button "Perbarui laporan" [ref=e55] [cursor=pointer]:
          - img [ref=e56]
        - paragraph [ref=e61]: Pantau laporan publik dan status dari sumbernya.
      - navigation "Kategori laporan" [ref=e62]:
        - button "Semua" [pressed] [ref=e63] [cursor=pointer]:
          - img [ref=e64]
          - text: Semua
        - button "Jalan" [ref=e65] [cursor=pointer]:
          - img [ref=e66]
          - text: Jalan
        - button "Pembangunan" [ref=e70] [cursor=pointer]:
          - img [ref=e71]
          - text: Pembangunan
        - button "Saluran" [ref=e76] [cursor=pointer]:
          - img [ref=e77]
          - text: Saluran
        - button "Pembakaran" [ref=e81] [cursor=pointer]:
          - img [ref=e82]
          - text: Pembakaran
      - generic [ref=e84]:
        - generic [ref=e85]:
          - heading "3 laporan" [level=2] [ref=e86]
          - generic [ref=e87]: Terbaru dahulu
        - generic "Daftar laporan" [ref=e88]:
          - button "JALAN 17 Okt, 10.00 TEST-A Laporan warga · JAKI Koordinasi" [ref=e89] [cursor=pointer]:
            - generic [ref=e90]:
              - img [ref=e91]
              - generic [ref=e95]: Tanpa foto
            - generic [ref=e96]:
              - generic [ref=e97]:
                - text: JALAN
                - time [ref=e98]: 17 Okt, 10.00
              - strong [ref=e99]: TEST-A
              - generic [ref=e100]: Laporan warga · JAKI
              - generic [ref=e101]: Koordinasi
            - img [ref=e102]
          - button "JALAN 17 Okt, 09.00 TEST-B Laporan warga · JAKI Selesai" [ref=e104] [cursor=pointer]:
            - generic [ref=e105]:
              - img [ref=e106]
              - generic [ref=e110]: Tanpa foto
            - generic [ref=e111]:
              - generic [ref=e112]:
                - text: JALAN
                - time [ref=e113]: 17 Okt, 09.00
              - strong [ref=e114]: TEST-B
              - generic [ref=e115]: Laporan warga · JAKI
              - generic [ref=e116]: Selesai
            - img [ref=e117]
          - button "JALAN 17 Okt, 08.00 TEST-C Laporan warga · JAKI Status belum tersedia" [ref=e119] [cursor=pointer]:
            - generic [ref=e120]:
              - img [ref=e121]
              - generic [ref=e125]: Tanpa foto
            - generic [ref=e126]:
              - generic [ref=e127]:
                - text: JALAN
                - time [ref=e128]: 17 Okt, 08.00
              - strong [ref=e129]: TEST-C
              - generic [ref=e130]: Laporan warga · JAKI
              - generic [ref=e131]: Status belum tersedia
            - img [ref=e132]
      - generic [ref=e134]:
        - generic [ref=e135]:
          - strong [ref=e137]: CRM Jakarta · JAKI
          - generic [ref=e138]: Bukan layanan resmi pemerintah
        - paragraph [ref=e139]: 16 Okt - 17 Okt · Diambil 17 Okt, 11.00 WIB
        - paragraph [ref=e140]: Hanya laporan publik berkategori Jalan pada peta CRM. Bukan seluruh laporan Jakarta.
```

# Test source

```ts
  1   | /* Exercise public map/list states using isolated responses.
  2   | Todo:
  3   | -> verify selection, failure states, keyboard and responsive bounds
  4   | */
  5   | import { test, expect, Page } from '@playwright/test';
  6   | import { snapshot, style } from './fixtures';
  7   | import { mapHandle, mapState, ready } from '../helpers/map';
  8   | 
  9   | async function prepare(page: Page, data: unknown = snapshot) {
  10  |   await page.route('**/api/public-reports', route => route.fulfill({ json: data }));
  11  |   await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  12  |   await page.goto('/');
  13  |   await expect(page.getByRole('heading', { name: '3 laporan', exact: true })).toBeVisible();
  14  |   await ready(page);
  15  | }
  16  | async function expand(page: Page) {
  17  |   const button = page.getByRole('button', { name: 'Perluas daftar' });
  18  |   if (await button.isVisible()) await button.click();
  19  | }
  20  | 
  21  | test('selection links list and map, stays 2D and restores the previous view and focus', async ({ page }) => {
  22  |   await prepare(page);
  23  |   await expand(page);
  24  |   const before = await mapState(page);
  25  |   await page.locator('[data-report-id="test-b"]').click();
  26  |   await expect(page.locator('.lj-detail h2')).toHaveText('TEST-B');
  27  |   await expect(page.locator('.lj-marker.is-selected')).toHaveAttribute('data-report-ids', 'test-b');
  28  |   await ready(page);
  29  |   expect((await mapState(page))?.pitch).toBe(0);
  30  |   await page.keyboard.press('Escape');
  31  |   await expect(page.locator('[data-report-id="test-b"]')).toBeFocused();
  32  |   expect((await mapState(page))?.zoom).toBeCloseTo(before!.zoom, 5);
  33  |   expect((await mapState(page))?.center[0]).toBeCloseTo(before!.center[0], 5);
  34  | });
  35  | 
  36  | test('marker opens the matching report and a filter removes hidden selections', async ({ page }) => {
  37  |   await prepare(page);
> 38  |   await page.getByRole('button', { name: 'Buka laporan TEST-B', exact: true }).click();
      |                                                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  39  |   await expect(page.locator('.lj-detail h2')).toHaveText('TEST-B');
  40  |   await page.getByRole('button', { name: 'Pembangunan', exact: true }).click();
  41  |   await expect(page.locator('.lj-detail')).toHaveCount(0);
  42  |   await expect(page.locator('.lj-marker')).toHaveCount(0);
  43  |   await expand(page);
  44  |   await expect(page.getByRole('heading', { name: 'Sumber kategori belum tersedia' })).toBeVisible();
  45  | });
  46  | 
  47  | test('search synchronizes the list and markers without inventing locations', async ({ page }) => {
  48  |   await prepare(page);
  49  |   await page.getByLabel('Cari laporan', { exact: true }).fill('selesai');
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
```