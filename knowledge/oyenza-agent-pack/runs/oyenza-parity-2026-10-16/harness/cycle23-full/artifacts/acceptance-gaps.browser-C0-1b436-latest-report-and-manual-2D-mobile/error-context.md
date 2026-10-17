# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: acceptance-gaps.browser.spec.ts >> C05 rapid report B then A during flight preserves latest report and manual 2D
- Location: tests/acceptance-gaps.browser.spec.ts:25:1

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 106.8232
Received: 106.82321558945682

Expected precision:    6
Expected difference: < 0.0000005
Received difference:   0.000015589456822340253
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
        - button "2D" [active] [ref=e115] [cursor=pointer]:
          - generic [ref=e116]: 2D
        - button "Reset Sudut Pandang" [ref=e117] [cursor=pointer]:
          - img [ref=e118]
      - generic [ref=e121]:
        - button "Perbesar peta" [ref=e122] [cursor=pointer]: +
        - button "Perkecil peta" [ref=e123] [cursor=pointer]: −
    - button "Lapor jalan" [ref=e124] [cursor=pointer]:
      - img [ref=e125]
      - generic [ref=e128]: Lapor jalan
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
  31  |   await page.locator(`.map-report-marker[title="${fixture.report.title}"]`).dispatchEvent('click');
  32  |   await page.locator('#b-3d').click();
  33  |   await assert2D(page);
  34  |   await expect(page.getByRole('heading', { name: fixture.report.title })).toBeVisible();
  35  |   const center = (await mapState(page))!.center;
> 36  |   expect(center[0]).toBeCloseTo(fixture.report.lng, 6);
      |                     ^ Error: expect(received).toBeCloseTo(expected, precision)
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
  125 |   await expect(popup.getByRole('img', { name: `Gambar contoh untuk ${b.name}`, exact: true })).toHaveAttribute('src', b.snapshotUrl);
  126 |   await expect(popup.getByRole('img', { name: `Gambar contoh untuk ${b.name}`, exact: true })).toHaveJSProperty('naturalWidth', 640);
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
```