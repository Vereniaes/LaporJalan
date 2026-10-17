# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orbit-framing.browser.spec.ts >> U02 explicit orbit keeps the cavity inside the unobstructed map
- Location: tests/orbit-framing.browser.spec.ts:4:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 390
Received:    409.78498324515226
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
          - button "Map marker" [ref=e108] [cursor=pointer]: LUBANG
        - group [ref=e109]:
          - generic "Toggle attribution" [ref=e110] [cursor=pointer]
          - link "MapLibre" [ref=e112] [cursor=pointer]:
            - /url: https://maplibre.org/
      - generic [ref=e113]:
        - button "3D" [pressed] [ref=e114] [cursor=pointer]:
          - generic [ref=e115]: 3D
        - button "Reset Sudut Pandang" [ref=e116] [cursor=pointer]:
          - img [ref=e117]
      - generic [ref=e120]:
        - button "Perbesar peta" [ref=e121] [cursor=pointer]: +
        - button "Perkecil peta" [ref=e122] [cursor=pointer]: −
      - generic [ref=e123]:
        - generic [ref=e124]:
          - generic [ref=e127]: Inspeksi Lapangan 3D
          - button "✕ Tutup" [ref=e128] [cursor=pointer]
        - generic [ref=e129]:
          - generic [ref=e130]:
            - text: "Kedalaman:"
            - generic [ref=e131]: 7.5 cm
          - generic [ref=e132]:
            - text: "Lebar:"
            - generic [ref=e133]: 52 cm
        - paragraph [ref=e134]: Model estimasi 1:1 - bentuk ilustratif
        - generic [ref=e135]:
          - button "Putar Orbit 360°" [active] [ref=e136] [cursor=pointer]:
            - img [ref=e137]
            - generic [ref=e140]: Putar Orbit 360°
          - button "Jalanan" [ref=e141] [cursor=pointer]
          - button "Atas" [ref=e142] [cursor=pointer]
    - button "Lapor jalan" [ref=e143] [cursor=pointer]:
      - img [ref=e144]
      - generic [ref=e147]: Lapor jalan
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { prepare, ready, mapHandle, evidence } from './helpers/map';
  3  | 
  4  | test('U02 explicit orbit keeps the cavity inside the unobstructed map', async ({ page }, info) => {
  5  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  6  |   await prepare(page);
  7  |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  8  |   await ready(page);
  9  |   const map = await mapHandle(page);
  10 |   await page.getByRole('button', { name: 'Putar Orbit 360°' }).click();
  11 |   await expect.poll(() => map.evaluate(map => map.getBearing()), { timeout: 15000 }).toBeGreaterThan(90);
  12 |   await page.getByRole('button', { name: 'Berhenti Orbit' }).click();
  13 |   const bounds = await map.evaluate(map => {
  14 |     const { anchor, widthM } = map.getLayer('inspection-damage').implementation.options;
  15 |     const canvas = map.getContainer().getBoundingClientRect();
  16 |     const radius = widthM / 2;
  17 |     const points = Array.from({ length: 64 }, (_, i) => {
  18 |       const angle = i / 64 * Math.PI * 2;
  19 |       const point = map.project([anchor[0] + radius * Math.cos(angle) / (111319.49 * Math.cos(anchor[1] * Math.PI / 180)),
  20 |         anchor[1] + radius * Math.sin(angle) / 111319.49]);
  21 |       return [point.x + canvas.left, point.y + canvas.top];
  22 |     });
  23 |     return { left: Math.min(...points.map(p => p[0])), right: Math.max(...points.map(p => p[0])),
  24 |       top: Math.min(...points.map(p => p[1])), bottom: Math.max(...points.map(p => p[1])),
  25 |       mapLeft: canvas.left, mapRight: canvas.right, bearing: map.getBearing() };
  26 |   });
  27 |   await info.attach('orbit-rim-bounds', { body: JSON.stringify(bounds), contentType: 'application/json' });
  28 |   await evidence(page, info, 'orbit-framing');
  29 |   expect(bounds.left).toBeGreaterThanOrEqual(bounds.mapLeft);
> 30 |   expect(bounds.right).toBeLessThanOrEqual(bounds.mapRight);
     |                        ^ Error: expect(received).toBeLessThanOrEqual(expected)
  31 |   await map.dispose();
  32 | });
  33 | 
  34 | test('U02 map attribution links remain unobstructed by app overlays', async ({ page }, info) => {
  35 |   await prepare(page, true);
  36 |   const links = await page.locator('.maplibregl-ctrl-attrib a').evaluateAll(links => links.map(link => {
  37 |     const box = link.getBoundingClientRect();
  38 |     const x = (box.left + box.right) / 2, y = (box.top + box.bottom) / 2;
  39 |     const hit = document.elementFromPoint(x, y);
  40 |     return { text: link.textContent, visible: box.width > 0 && box.height > 0,
  41 |       unobstructed: !!hit && link.contains(hit), coveredBy: hit?.className, x, y };
  42 |   }));
  43 |   await info.attach('attribution-hit-test', { body: JSON.stringify(links), contentType: 'application/json' });
  44 |   await evidence(page, info, 'attribution-overlays');
  45 |   expect(links.some(link => link.visible)).toBe(true);
  46 |   expect(links.filter(link => link.visible && !link.unobstructed)).toEqual([]);
  47 | });
  48 | 
```