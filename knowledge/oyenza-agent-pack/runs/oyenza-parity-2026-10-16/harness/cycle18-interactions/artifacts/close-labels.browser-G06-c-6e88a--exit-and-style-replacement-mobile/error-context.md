# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: close-labels.browser.spec.ts >> G06 close labels restore original visibility after zoom, exit and style replacement
- Location: tests/close-labels.browser.spec.ts:5:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Array [
    null,
    "visible",
    "none",
-   null,
+   "none",
  ]

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
        - button "3D" [pressed] [ref=e115] [cursor=pointer]:
          - generic [ref=e116]: 3D
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
  1  | import { test, expect } from '@playwright/test';
  2  | import { style } from './fixtures';
  3  | import { prepare, ready, mapHandle, mapState } from './helpers/map';
  4  | 
  5  | test('G06 close labels restore original visibility after zoom, exit and style replacement', async ({ page }) => {
  6  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  7  |   await prepare(page);
  8  |   const map = await mapHandle(page);
  9  |   const labels = {
  10 |     ...style,
  11 |     sources: { labels: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } },
  12 |     layers: [...style.layers,
  13 |       { id: 'label-default', type: 'symbol', source: 'labels', layout: { 'symbol-placement': 'line' } },
  14 |       { id: 'label-visible', type: 'symbol', source: 'labels', layout: { 'symbol-placement': 'line-center', visibility: 'visible' } },
  15 |       { id: 'label-hidden', type: 'symbol', source: 'labels', layout: { 'symbol-placement': 'line', visibility: 'none' } },
  16 |       { id: 'label-point', type: 'symbol', source: 'labels', layout: { 'symbol-placement': 'point' } },
  17 |     ],
  18 |   };
  19 |   const visibility = () => map.evaluate(map => ['label-default', 'label-visible', 'label-hidden', 'label-point']
  20 |     .map(id => map.getLayoutProperty(id, 'visibility') ?? null));
  21 |   const ordinary = [null, 'visible', 'none', null];
  22 |   const close = ['none', 'none', 'none', null];
  23 |   await map.evaluate((map, style) => map.setStyle(style, { diff: false }), labels);
  24 |   await ready(page);
> 25 |   await expect.poll(visibility).toEqual(ordinary);
     |                                 ^ Error: expect(received).toEqual(expected) // deep equality
  26 |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  27 |   await ready(page);
  28 |   await expect.poll(visibility).toEqual(close);
  29 |   await map.evaluate(map => map.jumpTo({ zoom: 21 }));
  30 |   await ready(page);
  31 |   await expect.poll(visibility).toEqual(ordinary);
  32 |   await page.getByRole('button', { name: 'Jalanan', exact: true }).click();
  33 |   await ready(page);
  34 |   await expect.poll(visibility).toEqual(close);
  35 |   await map.evaluate((map, style) => map.setStyle(style, { diff: false }), labels);
  36 |   await ready(page);
  37 |   await expect.poll(visibility).toEqual(close);
  38 |   await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  39 |   await page.getByRole('button', { name: '✕ Tutup', exact: true }).click();
  40 |   await ready(page);
  41 |   await expect.poll(visibility).toEqual(ordinary);
  42 |   expect((await mapState(page))!.zoom).toBe(16.5);
  43 |   expect((await mapState(page))!.inspection).toBeUndefined();
  44 |   await map.dispose();
  45 | });
  46 | 
```