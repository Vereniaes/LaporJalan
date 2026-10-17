# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: map-list.browser.spec.ts >> closing detail restores the collapsed mobile panel and its map context
- Location: tests/public-reports/map-list.browser.spec.ts:168:1

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 106.84568851053223
Received: 106.84680658672335

Expected precision:    5
Expected difference: < 0.000005
Received difference:   0.001118076191119144
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
          - button "Buka laporan TEST-B" [ref=e31] [cursor=pointer]:
            - img [ref=e33]
        - group [ref=e35]:
          - generic "Toggle attribution" [ref=e36] [cursor=pointer]
          - generic [ref=e37]: Test map attribution
      - button "Cari di area ini" [ref=e38] [cursor=pointer]
      - generic "Kontrol peta" [ref=e39]:
        - button "Mode 3D" [ref=e40] [cursor=pointer]: 3D
        - button "Perbesar peta" [ref=e41] [cursor=pointer]:
          - img [ref=e42]
        - button "Perkecil peta" [ref=e43] [cursor=pointer]:
          - img [ref=e44]
        - button "Tampilkan semua hasil pada peta" [ref=e45] [cursor=pointer]:
          - img [ref=e46]
    - region "Laporan publik" [ref=e49]:
      - button "Perluas daftar" [ref=e50] [cursor=pointer]:
        - img [ref=e51]
        - text: Perluas daftar
      - generic [ref=e52]:
        - generic [ref=e53]:
          - paragraph [ref=e54]: PETA WARGA
          - heading "Jalan di sekitar." [level=1] [ref=e55]
        - button "Perbarui laporan" [ref=e56] [cursor=pointer]:
          - img [ref=e57]
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
          - button "JALAN 17 Okt, 10.00 TEST-A Laporan warga · JAKI Koordinasi" [active] [ref=e89] [cursor=pointer]:
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
      - generic [ref=e135]:
        - strong [ref=e137]: CRM Jakarta · JAKI
        - generic [ref=e138]: Bukan layanan resmi pemerintah
```

# Test source

```ts
  77  | test('initial failure is distinct from empty and retry can recover', async ({ page }) => {
  78  |   await page.route('**/api/public-reports', route => route.fulfill({ status: 503 }));
  79  |   await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  80  |   await page.goto('/');
  81  |   await expect(page.getByRole('alert')).toContainText('Laporan belum dapat dimuat');
  82  |   await expect(page.locator('.lj-report-row')).toHaveCount(0);
  83  |   await expect(page.getByText('Belum ada laporan yang sesuai')).toHaveCount(0);
  84  |   await page.route('**/api/public-reports', route => route.fulfill({ json: { ...snapshot, reports: [] } }));
  85  |   await page.getByRole('button', { name: 'Coba lagi' }).click();
  86  |   await expand(page);
  87  |   await expect(page.getByText('Belum ada laporan yang sesuai')).toBeVisible();
  88  |   await expect(page.getByRole('alert')).toHaveCount(0);
  89  | });
  90  | 
  91  | test('unavailable map keeps the report details usable', async ({ page }) => {
  92  |   await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  93  |   await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  94  |   await page.goto('/');
  95  |   await expect(page.getByText('Peta belum tersedia sepenuhnya.', { exact: false })).toBeVisible();
  96  |   await expand(page);
  97  |   await page.locator('[data-report-id="test-a"]').click();
  98  |   await expect(page.locator('.lj-detail h2')).toHaveText('TEST-A');
  99  | });
  100 | 
  101 | test('mobile and desktop keep attribution, controls and panel inside the viewport', async ({ page }, info) => {
  102 |   await prepare(page);
  103 |   const horizontal = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  104 |   expect(horizontal).toBe(true);
  105 |   const panel = await page.locator('.lj-panel').boundingBox();
  106 |   const attribution = await page.locator('.maplibregl-ctrl-attrib').boundingBox();
  107 |   if (info.project.name === 'mobile') expect(attribution!.y + attribution!.height).toBeLessThanOrEqual(panel!.y + 1);
  108 |   await page.screenshot({ path: info.outputPath('map-list.png') });
  109 |   await expand(page);
  110 |   await page.locator('[data-report-id="test-b"]').click();
  111 |   await expect(page.locator('.lj-detail h2')).toBeFocused();
  112 |   await page.screenshot({ path: info.outputPath('detail.png') });
  113 | });
  114 | 
  115 | test('keyboard search and report navigation work without pointing at the map', async ({ page }) => {
  116 |   await prepare(page);
  117 |   await expand(page);
  118 |   await page.getByLabel('Cari laporan', { exact: true }).focus();
  119 |   await page.keyboard.type('TEST-B');
  120 |   const row = page.locator('[data-report-id="test-b"]');
  121 |   await row.focus();
  122 |   await page.keyboard.press('Enter');
  123 |   await expect(page.locator('.lj-detail h2')).toBeFocused();
  124 |   await page.getByRole('button', { name: 'Kembali ke daftar' }).press('Enter');
  125 |   await expect(row).toBeFocused();
  126 | });
  127 | 
  128 | test('a narrow screen keeps the list, detail and attribution reachable', async ({ page }, info) => {
  129 |   await page.setViewportSize({ width: 320, height: 740 });
  130 |   await prepare(page);
  131 |   await expand(page);
  132 |   await page.locator('[data-report-id="test-b"]').click();
  133 |   await expect(page.locator('.lj-detail h2')).toBeVisible();
  134 |   await page.getByRole('link', { name: 'Buka peta sumber' }).scrollIntoViewIfNeeded();
  135 |   await expect(page.getByRole('link', { name: 'Buka peta sumber' })).toBeVisible();
  136 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  137 |   await page.screenshot({ path: info.outputPath('narrow-detail.png') });
  138 | });
  139 | 
  140 | test('repeated selection does not add map canvases or retain old marker elements', async ({ page }) => {
  141 |   await prepare(page);
  142 |   await expand(page);
  143 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  144 |   const canvasCount = await page.locator('canvas').count();
  145 |   const markerCount = await page.locator('.lj-marker').count();
  146 |   for (let i = 0; i < 20; i++) {
  147 |     await page.locator('[data-report-id="test-b"]').click();
  148 |     await page.getByRole('button', { name: 'Kembali ke daftar' }).click();
  149 |   }
  150 |   await expect(page.locator('canvas')).toHaveCount(canvasCount);
  151 |   await expect(page.locator('.lj-marker')).toHaveCount(markerCount);
  152 | });
  153 | 
  154 | test('loading waits for actual data, including data arriving after the map', async ({ page }) => {
  155 |   let release: () => void;
  156 |   const gate = new Promise<void>(resolve => { release = resolve; });
  157 |   await page.route('**/api/public-reports', async route => { await gate; await route.fulfill({ json: snapshot }); });
  158 |   await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  159 |   await page.goto('/');
  160 |   await expect(page.getByText('Memuat laporan dari CRM Jakarta…')).toBeVisible();
  161 |   await expect(page.locator('.lj-report-row')).toHaveCount(0);
  162 |   await ready(page);
  163 |   release!();
  164 |   await expect(page.locator('.lj-report-row')).toHaveCount(3);
  165 |   await expect(page.locator('.lj-marker')).not.toHaveCount(0);
  166 | });
  167 | 
  168 | test('closing detail restores the collapsed mobile panel and its map context', async ({ page }, info) => {
  169 |   test.skip(info.project.name !== 'mobile', 'Mobile panel behavior');
  170 |   await prepare(page);
  171 |   const before = await mapState(page);
  172 |   await page.locator('[data-report-id="test-a"]').click();
  173 |   await expect(page.getByRole('button', { name: 'Lihat peta', exact: true })).toBeVisible();
  174 |   await page.getByRole('button', { name: 'Kembali ke daftar' }).click();
  175 |   await expect(page.getByRole('button', { name: 'Perluas daftar' })).toBeVisible();
  176 |   await ready(page);
> 177 |   expect((await mapState(page))?.center[0]).toBeCloseTo(before!.center[0], 5);
      |                                             ^ Error: expect(received).toBeCloseTo(expected, precision)
  178 |   expect((await mapState(page))?.center[1]).toBeCloseTo(before!.center[1], 5);
  179 | });
  180 | 
  181 | test('2D is initial and the 3D choice survives selection, search and return', async ({ page }) => {
  182 |   await prepare(page);
  183 |   const toggle = page.getByRole('button', { name: 'Mode 3D', exact: true });
  184 |   await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  185 |   expect((await mapState(page))?.pitch).toBe(0);
  186 |   await toggle.click();
  187 |   await ready(page);
  188 |   expect((await mapState(page))?.pitch).toBeCloseTo(56, 4);
  189 |   await page.getByLabel('Cari laporan', { exact: true }).fill('TEST-B');
  190 |   await page.locator('[data-report-id="test-b"]').click();
  191 |   await ready(page);
  192 |   expect((await mapState(page))?.pitch).toBeCloseTo(56, 4);
  193 |   await page.getByRole('button', { name: 'Kembali ke daftar' }).click();
  194 |   await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  195 |   expect((await mapState(page))?.pitch).toBeCloseTo(56, 4);
  196 |   await toggle.click();
  197 |   await ready(page);
  198 |   await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  199 |   expect((await mapState(page))?.pitch).toBe(0);
  200 |   await page.locator('[data-report-id="test-b"]').click();
  201 |   await ready(page);
  202 |   expect((await mapState(page))?.pitch).toBe(0);
  203 | });
  204 | 
  205 | test('rapid mode changes cancel old camera transitions and reuse the canvas', async ({ page }) => {
  206 |   await prepare(page);
  207 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  208 |   const toggle = page.getByRole('button', { name: 'Mode 3D', exact: true });
  209 |   const canvases = await page.locator('canvas').count();
  210 |   for (let i = 0; i < 10; i++) { await toggle.click(); await toggle.click(); }
  211 |   await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  212 |   expect((await mapState(page))?.pitch).toBe(0);
  213 |   await expect(page.locator('canvas')).toHaveCount(canvases);
  214 |   const map = await mapHandle(page);
  215 |   expect(await map.evaluate(instance => ({ maxPitch: instance.getMaxPitch(), rotate: instance.dragRotate.isEnabled(), touchPitch: instance.touchPitch.isEnabled() })))
  216 |     .toEqual({ maxPitch: 0, rotate: false, touchPitch: false });
  217 |   await map.dispose();
  218 | });
  219 | 
```