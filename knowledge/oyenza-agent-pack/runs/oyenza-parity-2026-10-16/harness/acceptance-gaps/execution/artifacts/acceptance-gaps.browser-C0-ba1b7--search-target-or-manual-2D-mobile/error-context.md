# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: acceptance-gaps.browser.spec.ts >> C05 pending report refresh cannot replace latest search target or manual 2D
- Location: tests/acceptance-gaps.browser.spec.ts:42:3

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 106.824
Received: 106.82329555286367

Expected precision:    6
Expected difference: < 0.0000005
Received difference:   0.0007044471363286675
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
      - button "Daftar (1)" [ref=e23] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e25]: Daftar (1)
      - button "CCTV (4)" [ref=e26] [cursor=pointer]:
        - img [ref=e27]
        - generic [ref=e30]: CCTV (4)
    - generic [ref=e31]:
      - generic [ref=e32]:
        - img [ref=e33]
        - textbox "Cari jalan atau laporan..." [ref=e36]: Fixture place
      - button "Fixture place Synthetic place" [ref=e38] [cursor=pointer]:
        - generic [ref=e39]: Fixture place
        - generic [ref=e40]: Synthetic place
    - generic [ref=e41]:
      - generic [ref=e42]:
        - generic [ref=e43]:
          - img [ref=e44]
          - generic [ref=e49]:
            - paragraph [ref=e50]: Pantau kondisi jalan
            - paragraph [ref=e51]: 1 laporan tersedia. Pilih titik untuk melihat detail.
            - button "Tambahkan laporan" [ref=e52] [cursor=pointer]
          - button "Tutup ringkasan" [ref=e53] [cursor=pointer]:
            - img [ref=e54]
        - generic [ref=e57]:
          - button "Galian utilitas" [ref=e58] [cursor=pointer]:
            - img [ref=e59]
            - generic [ref=e63]: Galian utilitas
          - button "4 kamera contoh" [ref=e64] [cursor=pointer]:
            - img [ref=e65]
            - generic [ref=e68]: 4 kamera contoh
      - button "Pantauan genangan Data ketinggian air belum tersedia." [ref=e69] [cursor=pointer]:
        - img [ref=e70]
        - generic [ref=e74]:
          - paragraph [ref=e75]: Pantauan genangan
          - paragraph [ref=e76]: Data ketinggian air belum tersedia.
        - img [ref=e77]
      - generic [ref=e79]: Pilih titik kerusakan di peta untuk melihat detail dimensi 3D dan kamera pantau.
  - generic [ref=e80]:
    - generic [ref=e81]:
      - generic [ref=e82]:
        - generic:
          - region "Map" [ref=e83]
          - button "Map marker" [ref=e84] [cursor=pointer]: CCTV hi-01
          - button "Map marker" [ref=e85] [cursor=pointer]: CCTV sudirman-6b
          - button "Map marker" [ref=e86] [cursor=pointer]: CCTV semanggi-4c
          - button "Map marker" [ref=e87] [cursor=pointer]: CCTV kuningan-9d
        - group [ref=e88]:
          - generic "Toggle attribution" [ref=e89] [cursor=pointer]
          - link "MapLibre" [ref=e91] [cursor=pointer]:
            - /url: https://maplibre.org/
      - generic [ref=e92]:
        - button "2D" [active] [ref=e93] [cursor=pointer]:
          - generic [ref=e94]: 2D
        - button "Reset Sudut Pandang" [ref=e95] [cursor=pointer]:
          - img [ref=e96]
      - generic [ref=e99]:
        - button "Perbesar peta" [ref=e100] [cursor=pointer]: +
        - button "Perkecil peta" [ref=e101] [cursor=pointer]: −
    - button "Lapor jalan" [ref=e102] [cursor=pointer]:
      - img [ref=e103]
      - generic [ref=e106]: Lapor jalan
```

# Test source

```ts
  1   | // Check remaining race, static media and offline behavior with fixed inputs.
  2   | import { test, expect, type Page } from '@playwright/test';
  3   | import { fixture, style } from './fixtures';
  4   | import { INITIAL_CCTV_CAMERAS, INITIAL_REPORTS } from '../src/services/mockData';
  5   | import { prepare, ready, mapState, mapHandle, evidence } from './helpers/map';
  6   | 
  7   | function gate() {
  8   |   let release!: () => void;
  9   |   const promise = new Promise<void>(resolve => { release = resolve; });
  10  |   return { promise, release };
  11  | }
  12  | 
  13  | async function assert2D(page: Page) {
  14  |   await ready(page);
  15  |   expect((await mapState(page))!.pitch).toBe(0);
  16  |   expect((await mapState(page))!.inspection).toBeUndefined();
  17  |   await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  18  | }
  19  | 
  20  | async function openCamera(page: Page, name: string) {
  21  |   await page.getByRole('button', { name: /^CCTV \(/ }).click();
  22  |   await page.getByText(name, { exact: true }).first().click();
  23  | }
  24  | 
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
> 69  |       expect(after[0]).toBeCloseTo(106.824, 6);
      |                        ^ Error: expect(received).toBeCloseTo(expected, precision)
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
  125 |   await expect(popup.getByRole('img')).toHaveAttribute('src', b.snapshotUrl);
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
```