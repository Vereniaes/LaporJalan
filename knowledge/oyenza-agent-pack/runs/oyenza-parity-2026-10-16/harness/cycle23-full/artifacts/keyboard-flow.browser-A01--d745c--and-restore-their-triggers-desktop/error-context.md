# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: keyboard-flow.browser.spec.ts >> A01 keyboard profile and comparison contain focus and restore their triggers
- Location: tests/keyboard-flow.browser.spec.ts:142:1

# Error details

```
Error: Focus escaped the open native dialog after Tab

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
      - button "3D" [pressed] [ref=e115] [cursor=pointer]:
        - generic [ref=e116]: 3D
      - button "Reset Sudut Pandang" [ref=e117] [cursor=pointer]:
        - img [ref=e118]
    - generic [ref=e121]:
      - button "Perbesar peta" [ref=e122] [cursor=pointer]: +
      - button "Perkecil peta" [ref=e123] [cursor=pointer]: −
    - generic [ref=e124]:
      - generic [ref=e127]: Lubang Kritis
      - generic [ref=e130]: Galian Utilitas
      - generic [ref=e133]: Kerucut CCTV
      - generic [ref=e136]: Macet
  - dialog "Profil ilustratif" [ref=e137]:
    - banner [ref=e138]:
      - generic [ref=e139]:
        - heading "Profil ilustratif" [level=2] [ref=e140]
        - paragraph [ref=e141]: Fixture pothole 52 cm
      - button "Tutup profil" [ref=e142] [cursor=pointer]:
        - img [ref=e143]
    - generic "Model cekungan ilustratif" [ref=e146]
    - generic [ref=e148]:
      - generic [ref=e149]:
        - button "Putar kiri" [ref=e150] [cursor=pointer]
        - button "Putar kanan" [ref=e151] [cursor=pointer]
        - button "Atur ulang" [ref=e152] [cursor=pointer]
      - paragraph [ref=e153]: "Lebar: 52 cm · Kedalaman: 7.5 cm"
      - paragraph [ref=e154]: Estimasi laporan, belum terverifikasi. Model memakai skala 1:1 dan bentuk radial ilustratif. Panjang, arah, volume lapangan, dan lebar jalan belum tersedia.
      - button "Tutup profil" [ref=e155] [cursor=pointer]
```

# Test source

```ts
  1   | // Verify practical keyboard journeys and record the focus path without pointer shortcuts.
  2   | import { test, expect, type Page, type Locator, type TestInfo } from '@playwright/test';
  3   | import { INITIAL_CCTV_CAMERAS } from '../src/services/mockData';
  4   | import { prepare, ready, mapState } from './helpers/map';
  5   | 
  6   | type KeyboardJourney = {
  7   |   reach: (target: Locator, direction?: 'Tab' | 'Shift+Tab') => Promise<void>;
  8   |   checkpoint: (name: string) => Promise<void>;
  9   |   contain: (dialog: Locator) => Promise<void>;
  10  | };
  11  | 
  12  | // Read focus identity and its visible geometry; this helper never moves focus.
  13  | async function focusedState(page: Page) {
  14  |   return page.evaluate(() => {
  15  |     const element = document.activeElement as HTMLElement;
  16  |     const rect = element.getBoundingClientRect();
  17  |     const style = getComputedStyle(element);
  18  |     const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
  19  |     return {
  20  |       tag: element.tagName, id: element.id, role: element.getAttribute('role'),
  21  |       name: element.getAttribute('aria-label') || element.getAttribute('title') ||
  22  |         element.getAttribute('placeholder') || element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 160),
  23  |       rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
  24  |       focusVisible: element.matches(':focus-visible'), outline: style.outlineStyle,
  25  |       outlineWidth: style.outlineWidth, shadow: style.boxShadow,
  26  |       inViewport: rect.width > 0 && rect.height > 0 && rect.x >= 0 && rect.y >= 0 &&
  27  |         rect.right <= innerWidth && rect.bottom <= innerHeight,
  28  |       unobstructed: Boolean(hit && (hit === element || element.contains(hit))),
  29  |     };
  30  |   });
  31  | }
  32  | 
  33  | async function journey(page: Page, info: TestInfo, run: (keys: KeyboardJourney) => Promise<void>) {
  34  |   const records: unknown[] = [];
  35  |   const checkpoint = async (name: string) => {
  36  |     records.push({ checkpoint: name, ...await focusedState(page) });
  37  |     await page.screenshot({ path: info.outputPath(`${name}.png`), animations: 'disabled' });
  38  |   };
  39  |   const reach: KeyboardJourney['reach'] = async (target, direction = 'Tab') => {
  40  |     await expect(target).toHaveCount(1);
  41  |     for (let index = 0; index < 64; index++) {
  42  |       if (await target.evaluate(element => element === document.activeElement)) {
  43  |         const state = await focusedState(page);
  44  |         records.push({ reached: await target.getAttribute('aria-label') || await target.textContent(), ...state });
  45  |         expect(state.inViewport, `Focused control outside viewport: ${state.name}`).toBe(true);
  46  |         expect(state.unobstructed, `Focused control covered or clipped: ${state.name}`).toBe(true);
  47  |         expect(state.focusVisible, `No keyboard focus state: ${state.name}`).toBe(true);
  48  |         expect(state.outline !== 'none' && parseFloat(state.outlineWidth) > 0,
  49  |           `No computed focus indicator: ${state.name}`).toBe(true);
  50  |         return;
  51  |       }
  52  |       await page.keyboard.press(direction);
  53  |       records.push({ key: direction, ...await focusedState(page) });
  54  |     }
  55  |     throw new Error(`Control unreachable within 64 ${direction} presses: ${await target.textContent()}`);
  56  |   };
  57  |   const contain = async (dialog: Locator) => {
  58  |     for (const direction of ['Tab', 'Shift+Tab']) {
  59  |       for (let step = 0; step < 8; step++) {
  60  |         await page.keyboard.press(direction);
  61  |         records.push({ modalKey: direction, ...await focusedState(page) });
  62  |         expect(await dialog.evaluate(element => element.contains(document.activeElement)),
> 63  |           `Focus escaped the open native dialog after ${direction}`).toBe(true);
      |                                                                      ^ Error: Focus escaped the open native dialog after Tab
  64  |       }
  65  |     }
  66  |   };
  67  |   try { await run({ reach, checkpoint, contain }); }
  68  |   finally {
  69  |     await info.attach('keyboard-focus-path', { body: JSON.stringify({ viewport: page.viewportSize(), records }, null, 2), contentType: 'application/json' });
  70  |   }
  71  | }
  72  | 
  73  | test('A01 keyboard navigation filter selection search and map controls are reachable', async ({ page }, info) => {
  74  |   await prepare(page);
  75  |   await journey(page, info, async keys => {
  76  |     await keys.reach(page.getByRole('button', { name: /Daftar/ }));
  77  |     await page.keyboard.press('Enter');
  78  |     await keys.reach(page.getByRole('button', { name: 'Retak', exact: true }));
  79  |     await page.keyboard.press('Space');
  80  |     await expect(page.locator('.map-report-marker')).toHaveCount(0);
  81  |     await keys.reach(page.getByRole('button', { name: 'Semua', exact: true }), 'Shift+Tab');
  82  |     await page.keyboard.press('Enter');
  83  |     await keys.reach(page.locator('.control-panel button').filter({ hasText: 'Fixture second report' }));
  84  |     await page.keyboard.press('Enter');
  85  |     await expect(page.getByRole('heading', { name: 'Fixture second report' })).toBeVisible();
  86  |     const search = page.getByPlaceholder(/Cari jalan/);
  87  |     await keys.reach(search, 'Shift+Tab');
  88  |     await page.keyboard.insertText('Fixture');
  89  |     await keys.reach(page.getByRole('button', { name: /Fixture place/ }));
  90  |     await keys.checkpoint('search-suggestion-focus');
  91  |     await page.keyboard.press('Enter');
  92  |     await ready(page);
  93  |     expect((await mapState(page))!.center[0]).toBeCloseTo(106.824, 6);
  94  |     expect((await mapState(page))!.center[1]).toBeCloseTo(-6.197, 6);
  95  |     await keys.reach(page.locator('#b-3d'));
  96  |     await page.keyboard.press('Space');
  97  |     await ready(page);
  98  |     expect((await mapState(page))!.pitch).toBe(0);
  99  |     await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  100 |     const before = (await mapState(page))!.zoom;
  101 |     await keys.reach(page.getByRole('button', { name: 'Perbesar peta', exact: true }));
  102 |     await page.keyboard.press('Enter');
  103 |     await ready(page);
  104 |     expect((await mapState(page))!.zoom).toBeCloseTo(before + 1, 6);
  105 |     expect((await mapState(page))!.pitch).toBe(0);
  106 |     await keys.reach(page.getByRole('button', { name: 'Perkecil peta', exact: true }));
  107 |     await page.keyboard.press('Space');
  108 |     await ready(page);
  109 |     expect((await mapState(page))!.zoom).toBeCloseTo(before, 6);
  110 |     await keys.checkpoint('map-zoom-focus');
  111 |   });
  112 | });
  113 | 
  114 | test('A01 keyboard enters inspection operates orbit and returns to 2D', async ({ page }, info) => {
  115 |   await prepare(page);
  116 |   await journey(page, info, async keys => {
  117 |     await keys.reach(page.getByRole('button', { name: 'Lihat Lapangan 3D', exact: true }));
  118 |     await page.keyboard.press('Enter');
  119 |     await ready(page);
  120 |     await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toBeVisible();
  121 |     await keys.reach(page.getByRole('button', { name: 'Putar Orbit 360°', exact: true }));
  122 |     await keys.checkpoint('inspection-orbit-focus');
  123 |     await page.keyboard.press('Space');
  124 |     await expect(page.getByRole('button', { name: 'Berhenti Orbit', exact: true })).toBeFocused();
  125 |     await page.keyboard.press('Space');
  126 |     await expect(page.getByRole('button', { name: 'Putar Orbit 360°', exact: true })).toBeFocused();
  127 |     await keys.reach(page.getByRole('button', { name: 'Jalanan', exact: true }));
  128 |     await page.keyboard.press('Enter');
  129 |     await ready(page);
  130 |     await keys.reach(page.getByRole('button', { name: 'Atas', exact: true }));
  131 |     await page.keyboard.press('Enter');
  132 |     await ready(page);
  133 |     await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  134 |     await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  135 |     expect((await mapState(page))!.pitch).toBe(0);
  136 |     expect((await mapState(page))!.inspection).toBeUndefined();
  137 |     await keys.reach(page.locator('#b-3d'), 'Shift+Tab');
  138 |     await keys.checkpoint('inspection-exit-focus');
  139 |   });
  140 | });
  141 | 
  142 | test('A01 keyboard profile and comparison contain focus and restore their triggers', async ({ page }, info) => {
  143 |   await prepare(page);
  144 |   await journey(page, info, async keys => {
  145 |     const profile = page.getByRole('button', { name: 'Profil ilustratif', exact: true });
  146 |     await keys.reach(profile);
  147 |     await page.keyboard.press('Enter');
  148 |     const dialog = page.getByRole('dialog');
  149 |     await expect(dialog).toBeVisible();
  150 |     await keys.reach(dialog.getByRole('button', { name: 'Putar kanan', exact: true }));
  151 |     await page.keyboard.press('Space');
  152 |     await keys.contain(dialog);
  153 |     await keys.checkpoint('profile-modal-focus');
  154 |     await page.keyboard.press('Escape');
  155 |     await expect(dialog).toHaveCount(0);
  156 |     await expect(profile).toBeFocused();
  157 |     const compare = page.getByRole('button', { name: 'Sebelum vs Sesudah', exact: true });
  158 |     await keys.reach(compare);
  159 |     await page.keyboard.press('Enter');
  160 |     await expect(dialog).toBeVisible();
  161 |     const slider = dialog.getByRole('slider', { name: 'Batas perbandingan' });
  162 |     await keys.reach(slider);
  163 |     await page.keyboard.press('ArrowRight');
```