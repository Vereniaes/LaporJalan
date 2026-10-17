# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mapped-road.browser.spec.ts >> G03 G04 mapped road integration keeps synthetic damage at the verified map anchor
- Location: tests/mapped-road.browser.spec.ts:6:1

# Error details

```
Error: Bearing 0 must reach its pose and render a newer cavity frame

Bearing 0 must reach its pose and render a newer cavity frame

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
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
    - generic [ref=e32]:
      - img [ref=e33]
      - textbox "Cari jalan atau laporan..." [ref=e36]
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - img [ref=e40]
          - generic [ref=e45]:
            - paragraph [ref=e46]: Pantau kondisi jalan
            - paragraph [ref=e47]: 1 laporan tersedia. Pilih titik untuk melihat detail.
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
          - heading "Model uji pada jalan terpetakan" [level=2] [ref=e77]
          - generic [ref=e78]: berat
        - paragraph [ref=e79]:
          - img [ref=e80]
          - text: Jalan Jenderal Sudirman - dimensi sintetis
        - generic [ref=e83]:
          - generic [ref=e84]:
            - paragraph [ref=e85]: Kedalaman
            - paragraph [ref=e86]: 7.5 cm
          - generic [ref=e87]:
            - paragraph [ref=e88]: Lebar
            - paragraph [ref=e89]: 52 cm
        - paragraph [ref=e90]: Estimasi laporan - metode pengukuran belum diverifikasi.
        - button "Lihat Lapangan 3D" [active] [ref=e91] [cursor=pointer]:
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
      - group [ref=e108]:
        - generic "Toggle attribution" [ref=e109] [cursor=pointer]
        - generic [ref=e110]:
          - link "MapLibre" [ref=e111] [cursor=pointer]:
            - /url: https://maplibre.org/
          - text: "|"
          - link "OpenFreeMap" [ref=e112] [cursor=pointer]:
            - /url: https://openfreemap.org
          - link "© OpenMapTiles" [ref=e113] [cursor=pointer]:
            - /url: https://www.openmaptiles.org/
          - text: Data from
          - link "OpenStreetMap" [ref=e114] [cursor=pointer]:
            - /url: https://www.openstreetmap.org/copyright
    - generic [ref=e115]:
      - button "3D" [pressed] [ref=e116] [cursor=pointer]:
        - generic [ref=e117]: 3D
      - button "Reset Sudut Pandang" [ref=e118] [cursor=pointer]:
        - img [ref=e119]
    - generic [ref=e122]:
      - button "Perbesar peta" [ref=e123] [cursor=pointer]: +
      - button "Perkecil peta" [ref=e124] [cursor=pointer]: −
    - generic [ref=e125]:
      - generic [ref=e126]:
        - generic [ref=e129]: Inspeksi Lapangan 3D
        - button "✕ Tutup" [ref=e130] [cursor=pointer]
      - generic [ref=e131]:
        - heading "Model uji pada jalan terpetakan" [level=4] [ref=e132]
        - paragraph [ref=e133]: Jalan Jenderal Sudirman - dimensi sintetis
      - generic [ref=e134]:
        - generic [ref=e135]:
          - text: "Kedalaman:"
          - generic [ref=e136]: 7.5 cm
        - generic [ref=e137]:
          - text: "Lebar:"
          - generic [ref=e138]: 52 cm
      - paragraph [ref=e139]: Model estimasi 1:1 - bentuk ilustratif
      - status [ref=e140]: Detail dibatasi pembesaran peta; ukuran model tetap 1:1.
      - generic [ref=e141]:
        - button "Putar Orbit 360°" [ref=e142] [cursor=pointer]:
          - img [ref=e143]
          - generic [ref=e146]: Putar Orbit 360°
        - button "Jalanan" [ref=e147] [cursor=pointer]
        - button "Atas" [ref=e148] [cursor=pointer]
    - generic [ref=e149]:
      - generic [ref=e152]: Lubang Kritis
      - generic [ref=e155]: Galian Utilitas
      - generic [ref=e158]: Kerucut CCTV
      - generic [ref=e161]: Macet
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { fixture } from './fixtures';
  3  | import mappedRoad from './mapped-road.json' with { type: 'json' };
  4  | import { prepare, ready, mapState, mapHandle, evidence } from './helpers/map';
  5  | 
  6  | test('G03 G04 mapped road integration keeps synthetic damage at the verified map anchor', async ({ page }, info) => {
  7  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  8  |   await prepare(page, true);
  9  |   const report = { ...fixture.report, id: mappedRoad.id, lng: mappedRoad.anchor[0], lat: mappedRoad.anchor[1],
  10 |     title: 'Model uji pada jalan terpetakan', address: `${mappedRoad.road} - dimensi sintetis` };
  11 |   await page.route('**/api/reports', route => route.fulfill({ json: { data: [report] } }));
  12 |   await page.reload();
  13 |   await ready(page);
  14 |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  15 |   await ready(page);
  16 |   await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  17 |   const map = await mapHandle(page);
  18 |   for (const bearing of [0, 90, 180, 270]) {
  19 |     const before = await mapState(page);
  20 |     await info.attach(`before-bearing-${bearing}`, { body: JSON.stringify(before, null, 2), contentType: 'application/json' });
  21 |     await map.evaluate((map, bearing) => {
  22 |       map.setBearing(bearing);
  23 |       map.triggerRepaint();
  24 |     }, bearing);
  25 |     try {
  26 |       await expect.poll(async () => {
  27 |         const current = await mapState(page);
  28 |         const difference = Math.abs(((current!.bearing - bearing + 540) % 360) - 180);
  29 |         return difference < 0.001 && (current?.inspection?.renderCount ?? 0) > before!.inspection!.renderCount;
> 30 |       }, { timeout: 10000, message: `Bearing ${bearing} must reach its pose and render a newer cavity frame` }).toBe(true);
     |                                                                                                                 ^ Error: Bearing 0 must reach its pose and render a newer cavity frame
  31 |     } finally {
  32 |       await info.attach(`after-bearing-${bearing}`, { body: JSON.stringify({
  33 |         state: await mapState(page),
  34 |         renderer: await map.evaluate(map => ({ removed: !!map._removed,
  35 |           framePending: !!map._frameRequest, contextLost: map.getCanvas().getContext('webgl2')?.isContextLost(),
  36 |           canvas: [map.getCanvas().width, map.getCanvas().height] })),
  37 |       }, null, 2), contentType: 'application/json' });
  38 |       await info.attach(`direct-render-diagnostic-${bearing}`, { body: JSON.stringify(await map.evaluate(map => {
  39 |         try {
  40 |           map._render(0);
  41 |           return { error: null, renderCount: map.getLayer('inspection-damage')?.implementation?.getState().renderCount };
  42 |         } catch (error) {
  43 |           return { error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error) };
  44 |         }
  45 |       }), null, 2), contentType: 'application/json' });
  46 |     }
  47 |     await evidence(page, info, `mapped-road-${bearing}`);
  48 |   }
  49 |   const actual = (await mapState(page))!.inspection!;
  50 |   expect(actual.anchor).toEqual(mappedRoad.anchor);
  51 |   expect(actual.widthM).toBe(0.52);
  52 |   expect(actual.depthM).toBe(0.075);
  53 |   await info.attach('road-provenance', { body: JSON.stringify(mappedRoad, null, 2), contentType: 'application/json' });
  54 |   await map.dispose();
  55 | });
  56 | 
```