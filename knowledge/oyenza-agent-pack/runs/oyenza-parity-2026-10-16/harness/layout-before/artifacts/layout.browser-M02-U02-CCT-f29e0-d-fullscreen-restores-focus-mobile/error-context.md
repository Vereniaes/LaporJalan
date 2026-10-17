# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout.browser.spec.ts >> M02 U02 CCTV is visible after flight and fullscreen restores focus
- Location: tests/layout.browser.spec.ts:19:1

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 0
Received:    -38.875
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
        - generic [ref=e41] [cursor=pointer]:
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
        - generic [ref=e54] [cursor=pointer]:
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
        - generic [ref=e67] [cursor=pointer]:
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
        - generic [ref=e80] [cursor=pointer]:
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
              - heading "1 • CCTV Bundaran HI" [level=4] [ref=e112]
              - paragraph [ref=e113]: Bundaran HI • Sisi Hotel Indonesia • Simpang C09
            - button "Tutup CCTV" [active] [ref=e114] [cursor=pointer]:
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
    - button "Lapor jalan" [ref=e143] [cursor=pointer]:
      - img [ref=e144]
      - generic [ref=e147]: Lapor jalan
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
  9  |     expect(panel.width).toBe(400);
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
> 29 |   expect(rect.y).toBeGreaterThanOrEqual(0);
     |                  ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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