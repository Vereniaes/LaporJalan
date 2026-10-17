# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: acceptance-gaps.browser.spec.ts >> M03 camera B remains current after camera A late image error
- Location: tests/acceptance-gaps.browser.spec.ts:104:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: getByRole('region', { name: 'Pratinjau CCTV' }).getByRole('img')
Expected: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80"
Error: strict mode violation: getByRole('region', { name: 'Pratinjau CCTV' }).getByRole('img') resolved to 4 elements:
    1) <svg width="24" height="24" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4" xmlns="http://www.w3.org/2000/svg">…</svg> aka getByRole('button', { name: 'Tutup CCTV' })
    2) <img class="h-full w-full object-contain" alt="Gambar contoh untuk 6B • CCTV Tosari Dukuh Atas" src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80"/> aka getByRole('img', { name: 'Gambar contoh untuk 6B • CCTV' })
    3) <svg width="24" height="24" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" class="lucide lucide-copy h-3 w-3">…</svg> aka getByRole('button', { name: 'Salin lokasi contoh' })
    4) <svg width="24" height="24" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" class="lucide lucide-maximize2 h-3 w-3">…</svg> aka getByRole('button', { name: 'Layar Penuh' })

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for getByRole('region', { name: 'Pratinjau CCTV' }).getByRole('img')

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
    - generic [ref=e38]:
      - generic [ref=e39]: "Kamera Pengawas Lalu Lintas & Galian:"
      - generic [ref=e40]:
        - button "1 • CCTV Bundaran HI DEMO 1 • CCTV Bundaran HI Contoh Bundaran HI • Sisi Hotel Indonesia • Simpang C09 Media statis • Belum diverifikasi" [ref=e41] [cursor=pointer]:
          - generic [ref=e42]:
            - img "1 • CCTV Bundaran HI" [ref=e43]
            - generic [ref=e44]: DEMO
          - generic [ref=e45]:
            - generic [ref=e46]:
              - generic [ref=e47]: 1 • CCTV Bundaran HI
              - generic [ref=e48]: Contoh
            - paragraph [ref=e49]: Bundaran HI • Sisi Hotel Indonesia • Simpang C09
            - generic [ref=e50]:
              - generic [ref=e51]: Media statis
              - generic [ref=e52]: •
              - generic [ref=e53]: Belum diverifikasi
        - button "6B • CCTV Tosari Dukuh Atas DEMO 6B • CCTV Tosari Dukuh Atas Contoh Jl. Jenderal Sudirman • Halte Tosari 1 Media statis • Belum diverifikasi" [ref=e54] [cursor=pointer]:
          - generic [ref=e55]:
            - img "6B • CCTV Tosari Dukuh Atas" [ref=e56]
            - generic [ref=e57]: DEMO
          - generic [ref=e58]:
            - generic [ref=e59]:
              - generic [ref=e60]: 6B • CCTV Tosari Dukuh Atas
              - generic [ref=e61]: Contoh
            - paragraph [ref=e62]: Jl. Jenderal Sudirman • Halte Tosari 1
            - generic [ref=e63]:
              - generic [ref=e64]: Media statis
              - generic [ref=e65]: •
              - generic [ref=e66]: Belum diverifikasi
        - button "4C • CCTV Simpang Semanggi DEMO 4C • CCTV Simpang Semanggi Contoh Plaza Semanggi • Sudirman Loop B Media statis • Belum diverifikasi" [ref=e67] [cursor=pointer]:
          - generic [ref=e68]:
            - img "4C • CCTV Simpang Semanggi" [ref=e69]
            - generic [ref=e70]: DEMO
          - generic [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]: 4C • CCTV Simpang Semanggi
              - generic [ref=e74]: Contoh
            - paragraph [ref=e75]: Plaza Semanggi • Sudirman Loop B
            - generic [ref=e76]:
              - generic [ref=e77]: Media statis
              - generic [ref=e78]: •
              - generic [ref=e79]: Belum diverifikasi
        - button "9D • CCTV Rasuna Said Kuningan DEMO 9D • CCTV Rasuna Said Kuningan Contoh HR Rasuna Said • Depan Menara Kadin Media statis • Belum diverifikasi" [ref=e80] [cursor=pointer]:
          - generic [ref=e81]:
            - img "9D • CCTV Rasuna Said Kuningan" [ref=e82]
            - generic [ref=e83]: DEMO
          - generic [ref=e84]:
            - generic [ref=e85]:
              - generic [ref=e86]: 9D • CCTV Rasuna Said Kuningan
              - generic [ref=e87]: Contoh
            - paragraph [ref=e88]: HR Rasuna Said • Depan Menara Kadin
            - generic [ref=e89]:
              - generic [ref=e90]: Media statis
              - generic [ref=e91]: •
              - generic [ref=e92]: Belum diverifikasi
  - generic [ref=e93]:
    - generic [ref=e94]:
      - generic [ref=e95]:
        - generic:
          - region "Map" [ref=e96]
          - button "Map marker" [ref=e97] [cursor=pointer]: CCTV hi-01
          - button "Map marker" [ref=e98] [cursor=pointer]: CCTV sudirman-6b
          - button "Map marker" [ref=e99] [cursor=pointer]: CCTV semanggi-4c
          - button "Map marker" [ref=e100] [cursor=pointer]: CCTV kuningan-9d
          - button "Map marker" [pressed] [ref=e101] [cursor=pointer]: LUBANG
          - button "Map marker" [ref=e102] [cursor=pointer]: LUBANG
        - group [ref=e103]:
          - generic "Toggle attribution" [ref=e104] [cursor=pointer]
          - link "MapLibre" [ref=e106] [cursor=pointer]:
            - /url: https://maplibre.org/
        - region "Pratinjau CCTV" [ref=e109]:
          - generic [ref=e110]:
            - generic [ref=e111]:
              - heading "6B • CCTV Tosari Dukuh Atas" [level=4] [ref=e112]
              - paragraph [ref=e113]: Jl. Jenderal Sudirman • Halte Tosari 1
            - button "Tutup CCTV" [active] [ref=e114] [cursor=pointer]:
              - img [ref=e115]
          - generic [ref=e118]:
            - img "Gambar contoh untuk 6B • CCTV Tosari Dukuh Atas" [ref=e119]
            - generic [ref=e120]: Gambar contoh
          - paragraph [ref=e121]: Media statis - sumber dan waktu belum diverifikasi.
          - generic [ref=e122]:
            - button "Salin lokasi contoh" [ref=e123] [cursor=pointer]:
              - img [ref=e124]
              - text: Salin lokasi contoh
            - button "Layar Penuh" [ref=e127] [cursor=pointer]:
              - img [ref=e128]
              - text: Layar Penuh
      - generic [ref=e133]:
        - button "3D" [pressed] [ref=e134] [cursor=pointer]:
          - generic [ref=e135]: 3D
        - button "Reset Sudut Pandang" [ref=e136] [cursor=pointer]:
          - img [ref=e137]
      - generic [ref=e140]:
        - button "Perbesar peta" [ref=e141] [cursor=pointer]: +
        - button "Perkecil peta" [ref=e142] [cursor=pointer]: −
    - button "Lapor jalan" [ref=e143] [cursor=pointer]:
      - img [ref=e144]
      - generic [ref=e147]: Lapor jalan
```

# Test source

```ts
  25  | test('C05 rapid report B then A during flight preserves latest report and manual 2D', async ({ page }, info) => {
  26  |   await prepare(page);
  27  |   await page.getByRole('button', { name: /Daftar/ }).click();
  28  |   await page.getByText('Fixture second report', { exact: true }).click();
  29  |   expect((await mapState(page))!.moving).toBe(true);
  30  |   // Dispatch the second marker action before flight completion, regardless of visual overlap.
  31  |   await page.locator(`.map-report-marker[aria-label="${fixture.report.title}"]`).dispatchEvent('click');
  32  |   await page.locator('#b-3d').click();
  33  |   await assert2D(page);
  34  |   await expect(page.getByRole('heading', { name: fixture.report.title })).toBeVisible();
  35  |   const center = (await mapState(page))!.center;
  36  |   expect(center[0]).toBeCloseTo(fixture.report.lng, 6);
  37  |   expect(center[1]).toBeCloseTo(fixture.report.lat, 6);
  38  |   await evidence(page, info, 'rapid-reports-2d');
  39  | });
  40  | 
  41  | for (const target of ['search', 'cctv'] as const) {
  42  |   test(`C05 pending report refresh cannot replace latest ${target} target or manual 2D`, async ({ page }, info) => {
  43  |     await prepare(page);
  44  |     const pending = gate();
  45  |     await page.route('**/api/reports', async route => {
  46  |       await pending.promise;
  47  |       await route.fulfill({ json: { data: [{ ...INITIAL_REPORTS[0], lng: 106.84, lat: -6.21 }] } });
  48  |     });
  49  |     await page.reload();
  50  |     await ready(page);
  51  |     if (target === 'search') {
  52  |       await page.getByPlaceholder(/Cari jalan/).fill('Fixture');
  53  |       await page.getByRole('button', { name: /Fixture place/ }).click();
  54  |     } else {
  55  |       await openCamera(page, INITIAL_CCTV_CAMERAS[1].name);
  56  |     }
  57  |     await page.locator('#b-3d').click();
  58  |     await assert2D(page);
  59  |     const before = (await mapState(page))!.center;
  60  |     const response = page.waitForResponse(r => r.url().endsWith('/api/reports'));
  61  |     pending.release();
  62  |     await (await response).finished();
  63  |     await expect(page.getByRole('button', { name: 'Daftar (1)' })).toBeVisible();
  64  |     await assert2D(page);
  65  |     const after = (await mapState(page))!.center;
  66  |     expect(after[0]).toBeCloseTo(before[0], 6);
  67  |     expect(after[1]).toBeCloseTo(before[1], 6);
  68  |     if (target === 'search') {
  69  |       expect(after[0]).toBeCloseTo(106.824, 6);
  70  |       expect(after[1]).toBeCloseTo(-6.197, 6);
  71  |     } else {
  72  |       await expect(page.getByRole('region', { name: 'Pratinjau CCTV' })).toContainText(INITIAL_CCTV_CAMERAS[1].name);
  73  |     }
  74  |     await evidence(page, info, `late-refresh-${target}`);
  75  |   });
  76  | }
  77  | 
  78  | test('G06 reports received before delayed style are present when map becomes ready', async ({ page }, info) => {
  79  |   await prepare(page);
  80  |   const pending = gate();
  81  |   const requested = gate();
  82  |   await page.route('**/tiles.openfreemap.org/styles/**', async route => {
  83  |     requested.release();
  84  |     await pending.promise;
  85  |     await route.fulfill({ json: style });
  86  |   });
  87  |   await page.reload({ waitUntil: 'domcontentloaded' });
  88  |   await requested.promise;
  89  |   await expect(page.getByRole('button', { name: 'Daftar (2)' })).toBeVisible();
  90  |   expect((await mapState(page))!.styleReady).toBe(false);
  91  |   pending.release();
  92  |   await ready(page);
  93  |   await expect(page.locator('.map-report-marker')).toHaveCount(2);
  94  |   const map = await mapHandle(page);
  95  |   const ids = await map.evaluate(map => (map.getStyle().sources['road-damage-decals'] as any).data.features.map((f: any) => f.properties.id).sort());
  96  |   expect(ids).toEqual([fixture.report.id, 'fixture-second'].sort());
  97  |   await map.dispose();
  98  |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  99  |   await ready(page);
  100 |   await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  101 |   await evidence(page, info, 'reports-before-style');
  102 | });
  103 | 
  104 | test('M03 camera B remains current after camera A late image error', async ({ page }, info) => {
  105 |   await prepare(page);
  106 |   const [a, b] = INITIAL_CCTV_CAMERAS;
  107 |   const pending = gate();
  108 |   const requested = gate();
  109 |   await page.route(a.snapshotUrl, async route => {
  110 |     requested.release();
  111 |     await pending.promise;
  112 |     await route.abort('failed');
  113 |   });
  114 |   // Routing disables cache so the list and popup request the delayed source again.
  115 |   await openCamera(page, a.name);
  116 |   await requested.promise;
  117 |   await page.getByText(b.name, { exact: true }).first().click();
  118 |   const popup = page.getByRole('region', { name: 'Pratinjau CCTV' });
  119 |   await expect(popup).toContainText(b.name);
  120 |   const failed = page.waitForEvent('requestfailed', { predicate: request => request.url() === a.snapshotUrl });
  121 |   pending.release();
  122 |   await failed;
  123 |   await ready(page);
  124 |   await expect(page.locator('.cctv-oyenza-popup')).toHaveCount(1);
> 125 |   await expect(popup.getByRole('img')).toHaveAttribute('src', b.snapshotUrl);
      |                                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  126 |   await expect(popup.getByRole('img')).toHaveJSProperty('naturalWidth', 640);
  127 |   await expect(popup.getByRole('status')).toHaveCount(0);
  128 |   const map = await mapHandle(page);
  129 |   const error = await map.evaluate((map, camera) => {
  130 |     const tip = document.querySelector('.cctv-oyenza-popup')!.getBoundingClientRect();
  131 |     const origin = map.getContainer().getBoundingClientRect();
  132 |     const anchor = map.project([camera.lng, camera.lat]);
  133 |     return Math.hypot((tip.left + tip.right) / 2 - origin.left - anchor.x,
  134 |       tip.bottom - origin.top - (anchor.y - 28));
  135 |   }, b);
  136 |   expect(error).toBeLessThanOrEqual(2);
  137 |   await map.dispose();
  138 |   await popup.getByRole('button', { name: 'Layar Penuh' }).click();
  139 |   const dialog = page.getByRole('dialog');
  140 |   await expect(dialog.getByRole('heading')).toHaveText(b.name);
  141 |   await expect(dialog.getByRole('img')).toHaveAttribute('src', b.snapshotUrl);
  142 |   await expect(dialog).toContainText('Gambar contoh - media statis');
  143 |   await page.keyboard.press('Escape');
  144 |   await expect(popup.getByRole('button', { name: 'Layar Penuh' })).toBeFocused();
  145 |   await evidence(page, info, 'camera-b-after-a-error');
  146 | });
  147 | 
  148 | test('M01 unavailable static image stays honestly labelled and closes with Escape', async ({ page }) => {
  149 |   await prepare(page);
  150 |   await page.route(INITIAL_CCTV_CAMERAS[0].snapshotUrl, route => route.abort('failed'));
  151 |   await openCamera(page, INITIAL_CCTV_CAMERAS[0].name);
  152 |   const popup = page.getByRole('region', { name: 'Pratinjau CCTV' });
  153 |   await expect(popup.getByRole('status')).toHaveText('Gambar tidak tersedia.');
  154 |   await expect(popup).toContainText('Media statis - sumber dan waktu belum diverifikasi.');
  155 |   await expect(popup.getByText(/LIVE/i)).toHaveCount(0);
  156 |   await popup.getByRole('button', { name: 'Layar Penuh' }).click();
  157 |   await expect(page.getByRole('dialog').getByRole('status')).toHaveText('Gambar tidak tersedia.');
  158 |   await page.keyboard.press('Escape');
  159 |   await page.keyboard.press('Escape');
  160 |   await expect(popup).toHaveCount(0);
  161 | });
  162 | 
  163 | test('R02 traffic geometry status and colors survive report filter and style replacement', async ({ page }) => {
  164 |   await prepare(page);
  165 |   const map = await mapHandle(page);
  166 |   const traffic = () => map.evaluate(map => ({
  167 |     features: (map.getStyle().sources['traffic-flow'] as any).data.features.map((f: any) => ({ id: f.properties.id, status: f.properties.status, color: f.properties.color, geometry: f.geometry })),
  168 |     color: map.getPaintProperty('traffic-lines', 'line-color'),
  169 |     count: map.getStyle().layers.filter((l: any) => l.id === 'traffic-lines').length,
  170 |   }));
  171 |   const expected = {
  172 |     features: [
  173 |       { id: 'tr-01', status: 'macet', color: '#ef4444', geometry: { type: 'LineString', coordinates: [[106.8228, -6.192], [106.8231, -6.1955], [106.8233, -6.197]] } },
  174 |       { id: 'tr-02', status: 'padat', color: '#f59e0b', geometry: { type: 'LineString', coordinates: [[106.8233, -6.197], [106.8235, -6.2025], [106.822, -6.21]] } },
  175 |       { id: 'tr-03', status: 'lancar', color: '#10b981', geometry: { type: 'LineString', coordinates: [[106.829, -6.215], [106.8305, -6.223], [106.832, -6.23]] } },
  176 |     ], color: ['get', 'color'], count: 1,
  177 |   };
  178 |   expect(await traffic()).toEqual(expected);
  179 |   await page.getByRole('button', { name: /Daftar/ }).click();
  180 |   await page.getByRole('button', { name: 'Retak', exact: true }).click();
  181 |   await expect(page.locator('.map-report-marker')).toHaveCount(0);
  182 |   expect(await traffic()).toEqual(expected);
  183 |   await map.evaluate((map, next) => map.setStyle(next, { diff: false }), style);
  184 |   await ready(page);
  185 |   expect(await traffic()).toEqual(expected);
  186 |   await map.dispose();
  187 | });
  188 | 
  189 | for (const failure of ['abort', '503', 'malformed'] as const) {
  190 |   test(`R02 reports GET ${failure} retains usable demo fallback`, async ({ page }) => {
  191 |     await prepare(page);
  192 |     await page.route('**/api/reports', route => failure === 'abort' ? route.abort('failed') :
  193 |       route.fulfill(failure === '503' ? { status: 503, body: 'Unavailable' } : { contentType: 'application/json', body: '{broken' }));
  194 |     await page.reload();
  195 |     await ready(page);
  196 |     await expect(page.getByText('Demo', { exact: true })).toBeVisible();
  197 |     await expect(page.getByRole('button', { name: `Daftar (${INITIAL_REPORTS.length})` })).toBeVisible();
  198 |     await expect(page.getByRole('heading', { name: INITIAL_REPORTS[0].title })).toBeVisible();
  199 |     await page.locator('#b-3d').click();
  200 |     await assert2D(page);
  201 |   });
  202 | }
  203 | 
  204 | test('R02 failed geocoder clears old suggestions and leaves the map usable', async ({ page }) => {
  205 |   await prepare(page);
  206 |   await page.getByPlaceholder(/Cari jalan/).fill('Fixture');
  207 |   await expect(page.getByRole('button', { name: /Fixture place/ })).toBeVisible();
  208 |   await page.route('**/api/places/**', route => route.abort('failed'));
  209 |   const failed = page.waitForEvent('requestfailed', { predicate: request => request.url().includes('/api/places/') });
  210 |   await page.getByPlaceholder(/Cari jalan/).fill('Unavailable');
  211 |   await failed;
  212 |   await expect(page.getByRole('button', { name: /Fixture place/ })).toHaveCount(0);
  213 |   await page.getByPlaceholder(/Cari jalan/).clear();
  214 |   await page.locator('#b-3d').click();
  215 |   await assert2D(page);
  216 | });
  217 | 
  218 | for (const failure of ['405', 'abort'] as const) {
  219 |   test(`R02 rejected report POST ${failure} keeps local example visibly labelled`, async ({ page }) => {
  220 |     await prepare(page);
  221 |     await page.route('**/api/reports', route => route.request().method() === 'POST' ?
  222 |       (failure === 'abort' ? route.abort('failed') : route.fulfill({ status: 405, body: 'No writes allowed' })) : route.fallback());
  223 |     await page.getByRole('button', { name: 'Lapor', exact: true }).click();
  224 |     const dialog = page.getByRole('dialog');
  225 |     await dialog.getByRole('button', { name: 'Lubang Aspal' }).click();
```