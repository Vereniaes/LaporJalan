# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout.browser.spec.ts >> U02 panel and map use one responsive boundary
- Location: tests/layout.browser.spec.ts:4:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 460
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
        - generic [ref=e112]:
          - link "MapLibre" [ref=e113] [cursor=pointer]:
            - /url: https://maplibre.org/
          - text: "|"
          - link "OpenFreeMap" [ref=e114] [cursor=pointer]:
            - /url: https://openfreemap.org
          - link "© OpenMapTiles" [ref=e115] [cursor=pointer]:
            - /url: https://www.openmaptiles.org/
          - text: Data from
          - link "OpenStreetMap" [ref=e116] [cursor=pointer]:
            - /url: https://www.openstreetmap.org/copyright
    - generic [ref=e117]:
      - button "3D" [pressed] [ref=e118] [cursor=pointer]:
        - generic [ref=e119]: 3D
      - button "Reset Sudut Pandang" [ref=e120] [cursor=pointer]:
        - img [ref=e121]
    - generic [ref=e124]:
      - button "Perbesar peta" [ref=e125] [cursor=pointer]: +
      - button "Perkecil peta" [ref=e126] [cursor=pointer]: −
    - generic [ref=e127]:
      - generic [ref=e130]: Lubang Kritis
      - generic [ref=e133]: Galian Utilitas
      - generic [ref=e136]: Kerucut CCTV
      - generic [ref=e139]: Macet
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { prepare, ready, evidence } from './helpers/map';
  3  | 
  4  | test('U02 panel and map use one responsive boundary', async ({ page }, info) => {
  5  |   await prepare(page, true);
  6  |   const panel = (await page.locator('.control-panel').boundingBox())!;
  7  |   const map = (await page.locator('.map-region').boundingBox())!;
  8  |   if (page.viewportSize()!.width >= 900) {
> 9  |     expect(panel.width).toBe(400);
     |                         ^ Error: expect(received).toBe(expected) // Object.is equality
  10 |     expect(map.x).toBe(panel.width);
  11 |   } else {
  12 |     expect(panel.width).toBe(page.viewportSize()!.width);
  13 |     expect(panel.y).toBeGreaterThan(page.viewportSize()!.height / 2);
  14 |   }
  15 |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
  16 |   await evidence(page, info, 'responsive-map');
  17 | });
  18 | 
  19 | test('M02 U02 CCTV is visible after flight and fullscreen restores focus', async ({ page }, info) => {
  20 |   await prepare(page);
  21 |   await page.getByRole('button', { name: /^CCTV/ }).click();
  22 |   await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  23 |   await ready(page);
  24 |   const popup = page.getByRole('region', { name: 'Pratinjau CCTV' });
  25 |   await expect(popup).toBeVisible();
  26 |   const rect = (await popup.boundingBox())!;
  27 |   const viewport = page.viewportSize()!;
  28 |   await evidence(page, info, 'settled-cctv');
  29 |   expect(rect.y).toBeGreaterThanOrEqual(0);
  30 |   expect(rect.x).toBeGreaterThanOrEqual(viewport.width < 900 ? 0 : 400);
  31 |   expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width);
  32 |   expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height < 900 ? viewport.height * 0.55 : viewport.height);
  33 |   const expand = popup.getByRole('button', { name: 'Layar Penuh' });
  34 |   await expand.click();
  35 |   await expect(page.getByRole('dialog')).toBeVisible();
  36 |   await page.screenshot({ path: info.outputPath('cctv-expanded.png') });
  37 |   await page.keyboard.press('Escape');
  38 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  39 |   await expect(expand).toBeFocused();
  40 |   await page.keyboard.press('Escape');
  41 |   await expect(popup).toHaveCount(0);
  42 | });
  43 | 
```