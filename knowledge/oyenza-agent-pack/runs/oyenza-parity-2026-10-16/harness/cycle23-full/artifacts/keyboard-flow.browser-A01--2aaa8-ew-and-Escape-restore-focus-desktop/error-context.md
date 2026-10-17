# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: keyboard-flow.browser.spec.ts >> A01 keyboard CCTV selection expanded preview and Escape restore focus
- Location: tests/keyboard-flow.browser.spec.ts:199:1

# Error details

```
Error: Focus escaped the open native dialog after Tab

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
              - heading "1 • CCTV Bundaran HI" [level=4] [ref=e112]
              - paragraph [ref=e113]: Bundaran HI • Sisi Hotel Indonesia • Simpang C09
            - button "Tutup CCTV" [ref=e114] [cursor=pointer]:
              - img [ref=e115]
          - generic [ref=e118]:
            - img "Gambar contoh untuk 1 • CCTV Bundaran HI" [ref=e119]
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
      - generic [ref=e143]:
        - generic [ref=e146]: Lubang Kritis
        - generic [ref=e149]: Galian Utilitas
        - generic [ref=e152]: Kerucut CCTV
        - generic [ref=e155]: Macet
  - dialog "1 • CCTV Bundaran HI" [ref=e156]:
    - generic [ref=e157]:
      - banner [ref=e158]:
        - generic [ref=e159]:
          - heading "1 • CCTV Bundaran HI" [level=2] [ref=e160]
          - paragraph [ref=e161]: Gambar contoh - media statis
        - generic [ref=e162]:
          - button "Mode layar perangkat" [ref=e163] [cursor=pointer]:
            - img [ref=e164]
          - button "Tutup layar penuh" [ref=e169] [cursor=pointer]:
            - img [ref=e170]
      - img "Gambar contoh untuk 1 • CCTV Bundaran HI" [ref=e174]
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