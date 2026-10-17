# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: races.browser.spec.ts >> C05 late initial reports do not replace a newer selection
- Location: tests/races.browser.spec.ts:6:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

  Array [
-   106.8234,
-   -6.202,
+   106.82339999999999,
+   -6.201999999999998,
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
            - generic [ref=e11]: 3D Live
          - paragraph [ref=e12]: Sistem Deteksi Citra & Pantau Galian
      - button "Lapor" [ref=e13] [cursor=pointer]:
        - img [ref=e14]
        - generic [ref=e17]: Lapor
    - generic [ref=e18]:
      - button "Peta 3D" [ref=e19] [cursor=pointer]:
        - img [ref=e20]
        - generic [ref=e22]: Peta 3D
      - button "Daftar (4)" [ref=e23] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e25]: Daftar (4)
      - button "CCTV (4)" [ref=e26] [cursor=pointer]:
        - img [ref=e27]
        - generic [ref=e30]: CCTV (4)
    - generic [ref=e32]:
      - img [ref=e33]
      - textbox "Cari jalan seluruh Indonesia (Google Places)..." [ref=e36]
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - text: 🐱
            - img [ref=e42]
          - generic [ref=e47]:
            - generic [ref=e48]:
              - generic [ref=e49]: Miko Pantau Jalan
              - generic [ref=e50]: Real-Time
            - paragraph [ref=e51]:
              - text: Ada
              - strong [ref=e52]: 1 Lubang Kritis
              - text: "&"
              - strong [ref=e53]: 2 Galian Utilitas
              - text: di koridor Sudirman. Kurangi kecepatan motor saat hujan!
          - button [ref=e54] [cursor=pointer]:
            - img [ref=e55]
        - generic [ref=e58]:
          - button "Galian Pipa/Kabel Pantau jalan dibongkar" [ref=e59] [cursor=pointer]:
            - img [ref=e61]
            - generic [ref=e65]:
              - generic [ref=e66]: Galian Pipa/Kabel
              - text: Pantau jalan dibongkar
          - button "Miko CCTV 4 Kamera aktif" [ref=e67] [cursor=pointer]:
            - img [ref=e69]
            - generic [ref=e72]:
              - generic [ref=e73]: Miko CCTV
              - text: 4 Kamera aktif
      - generic [ref=e74] [cursor=pointer]:
        - generic [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]: 🌊
            - generic [ref=e78]:
              - generic [ref=e79]:
                - heading "Miko Pantau Genangan" [level=4] [ref=e80]
                - generic [ref=e81]: Siaga 3
              - paragraph [ref=e82]: Tinggi Air ~20 cm di Jl. Thamrin Barat
          - img [ref=e83]
        - generic [ref=e85]:
          - img [ref=e86]
          - generic [ref=e88]:
            - strong [ref=e89]: "Waspada Lubang Tak Kasat Mata:"
            - text: Genangan air hujan menutupi lubang sedalam 7.5 cm. Bahaya fatal bagi ban motor!
      - generic [ref=e90]:
        - generic [ref=e91]:
          - generic [ref=e94]: Jalan Provinsi (Bina Marga DKI)
          - generic [ref=e95]: PERHATIAN
        - generic [ref=e96]:
          - heading "Galian Kabel Utilitas Ambles Belum Di-overlay" [level=2] [ref=e97]
          - generic [ref=e98]:
            - img [ref=e99]
            - generic [ref=e102]: Jl. Jenderal Sudirman (Depan Gedung Chase Plaza)
        - generic [ref=e103]:
          - generic [ref=e104]:
            - generic [ref=e105]: Kedalaman
            - generic [ref=e106]: ~4.8 cm
          - generic [ref=e107]:
            - generic [ref=e108]: Estimasi Lebar
            - generic [ref=e109]: ~180 cm
          - generic [ref=e110]:
            - generic [ref=e111]: Bina Marga UP
            - text: "6.8"
        - generic [ref=e112]:
          - button "Inspeksi Potongan Melintang 3D (Putar 360°)" [ref=e113] [cursor=pointer]:
            - img [ref=e114]
            - generic [ref=e118]: Inspeksi Potongan Melintang 3D (Putar 360°)
          - generic [ref=e119]:
            - button "Lihat Lapangan 3D" [ref=e120] [cursor=pointer]:
              - img [ref=e121]
              - generic [ref=e124]: Lihat Lapangan 3D
            - button "Sebelum vs Sesudah" [ref=e125] [cursor=pointer]:
              - img [ref=e126]
              - generic [ref=e129]: Sebelum vs Sesudah
        - generic [ref=e130]:
          - generic [ref=e131]:
            - generic [ref=e132]:
              - img [ref=e133]
              - generic [ref=e136]: Dicocokkan dengan kamera
            - generic [ref=e139]: Aktif
          - generic [ref=e140] [cursor=pointer]:
            - generic [ref=e141]:
              - img "6B • CCTV Tosari Dukuh Atas" [ref=e142]
              - generic [ref=e143]: LIVE
            - generic [ref=e144]:
              - generic [ref=e145]: 09:43:10 WIB
              - paragraph [ref=e146]: Jl. Jenderal Sudirman • Halte Tosari 1
              - generic [ref=e147]: Ketuk untuk intip kamera →
        - generic [ref=e148]:
          - generic [ref=e149]: "Catatan Lapangan:"
          - text: Bekas galian melintang lajur lambat. Penimbunan pasir tidak rata dan turun setelah diguyur hujan deras semalam.
  - generic [ref=e150]:
    - generic [ref=e151]:
      - generic [ref=e152]:
        - generic:
          - region "Map" [ref=e153]
          - generic "Map marker" [ref=e154]:
            - generic [ref=e157]: Terlihat CCTV • 168m
          - generic "Map marker" [ref=e158] [cursor=pointer]:
            - generic [ref=e161]: 1 • CCTV Bundaran HI
          - generic "Map marker" [ref=e162] [cursor=pointer]:
            - generic [ref=e165]: 6B • CCTV Tosari Dukuh Atas
          - generic "Map marker" [ref=e166] [cursor=pointer]:
            - generic [ref=e169]: 4C • CCTV Simpang Semanggi
          - generic "Map marker" [ref=e170] [cursor=pointer]:
            - generic [ref=e173]: 9D • CCTV Rasuna Said Kuningan
          - generic "Map marker" [ref=e174] [cursor=pointer]:
            - generic [ref=e176]:
              - generic [ref=e177]: AMBLES
              - generic [ref=e178]: 9cm
          - generic "Map marker" [ref=e180] [cursor=pointer]:
            - generic [ref=e182]:
              - generic [ref=e183]: RETAK
              - generic [ref=e184]: 1.8cm
          - generic "Map marker" [ref=e186] [cursor=pointer]:
            - generic [ref=e187]:
              - generic:
                - generic:
                  - generic: "Kedalaman:"
                  - generic: 4.8 cm
                - generic:
                  - generic: "Lebar:"
                  - generic: 180 cm
                - generic:
                  - generic: "Lebar jalan:"
                  - generic: 7 m
              - generic [ref=e188]:
                - generic [ref=e189]: GALIAN
                - generic [ref=e190]: 4.8cm
          - generic "Map marker" [ref=e192] [cursor=pointer]:
            - generic [ref=e194]:
              - generic [ref=e195]: LUBANG
              - generic [ref=e196]: 7.5cm
        - group [ref=e198]:
          - generic "Toggle attribution" [ref=e199] [cursor=pointer]
          - link "MapLibre" [ref=e201] [cursor=pointer]:
            - /url: https://maplibre.org/
      - generic [ref=e202]:
        - button "3D" [pressed] [ref=e203] [cursor=pointer]:
          - generic [ref=e204]: 3D
        - button "Reset Sudut Pandang" [ref=e205] [cursor=pointer]:
          - img [ref=e206]
    - button "Lapor 1-Snap AI" [ref=e209] [cursor=pointer]:
      - img [ref=e210]
      - generic [ref=e213]: Lapor 1-Snap AI
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { INITIAL_REPORTS } from '../src/services/mockData';
  3  | import { style, snapshot } from './fixtures';
  4  | import { ready, mapState, evidence } from './helpers/map';
  5  | 
  6  | test('C05 late initial reports do not replace a newer selection', async ({ page }, info) => {
  7  |   let release!: () => void;
  8  |   const responseGate = new Promise<void>(resolve => { release = resolve; });
  9  |   await page.route('**/api/reports', async route => {
  10 |     await responseGate;
  11 |     await route.fulfill({ json: { data: [...INITIAL_REPORTS].reverse() } });
  12 |   });
  13 |   await page.route('**/tiles.openfreemap.org/styles/**', route => route.fulfill({ json: style }));
  14 |   await page.route('**/*', route => route.request().resourceType() === 'image'
  15 |     ? route.fulfill({ contentType: 'image/svg+xml', body: snapshot }) : route.fallback());
  16 |   await page.goto('/');
  17 |   await ready(page);
  18 |   await page.getByRole('button', { name: /Daftar/ }).click();
  19 |   const selected = INITIAL_REPORTS[1];
  20 |   await page.getByText(selected.title, { exact: true }).click();
  21 |   await ready(page);
  22 |   const received = page.waitForResponse(response => response.url().includes('/api/reports'));
  23 |   release();
  24 |   await received;
> 25 |   await expect.poll(async () => (await mapState(page))?.center).toEqual([selected.lng, selected.lat]);
     |                                                                 ^ Error: expect(received).toEqual(expected) // deep equality
  26 |   await ready(page);
  27 |   await expect(page.getByRole('heading', { name: selected.title })).toBeVisible();
  28 |   await evidence(page, info, 'latest-selection');
  29 | });
  30 | 
```