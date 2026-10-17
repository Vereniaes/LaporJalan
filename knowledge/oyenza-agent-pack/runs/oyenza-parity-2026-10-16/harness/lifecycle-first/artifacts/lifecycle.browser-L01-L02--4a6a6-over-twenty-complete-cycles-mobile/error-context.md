# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lifecycle.browser.spec.ts >> L01 L02 L03 application resources plateau over twenty complete cycles
- Location: tests/lifecycle.browser.spec.ts:41:1

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for getByTitle('Tutup CCTV')
    - locator resolved to <button title="Tutup CCTV" class="rounded-lg p-1 text-slate-500 hover:bg-slate-100">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
      - waiting 100ms
    346 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - element is outside of the viewport
      - retrying click action
        - waiting 500ms

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
        - button "2D" [ref=e134] [cursor=pointer]:
          - generic [ref=e135]: 2D
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
  2  | import { prepare, ready, mapHandle, mapState, evidence } from './helpers/map';
  3  | import { style } from './fixtures';
  4  | 
  5  | test('G05 G06 style reload and context recovery preserve inspection', async ({ page }, info) => {
  6  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  7  |   await prepare(page);
  8  |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  9  |   await ready(page);
  10 |   const map = await mapHandle(page);
  11 |   await map.evaluate((map, style) => new Promise<void>(resolve => {
  12 |     map.once('style.load', () => resolve());
  13 |     map.setStyle(style, { diff: false });
  14 |   }), style);
  15 |   await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  16 |   await ready(page);
  17 |   await map.evaluate(map => new Promise<void>(resolve => {
  18 |     const gl = map.getCanvas().getContext('webgl2');
  19 |     const extension = gl.getExtension('WEBGL_lose_context');
  20 |     if (!extension) throw new Error('Controlled context loss unavailable');
  21 |     map.once('webglcontextrestored', () => resolve());
  22 |     map.once('webglcontextlost', () => setTimeout(() => extension.restoreContext(), 100));
  23 |     extension.loseContext();
  24 |   }));
  25 |   const count = (await mapState(page))!.inspection!.renderCount;
  26 |   await map.evaluate(map => map.triggerRepaint());
  27 |   await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(count);
  28 |   for (const pose of [{ bearing: 90, pitch: 35, zoom: 24.5 }, { bearing: 180, pitch: 60, zoom: 25 }]) {
  29 |     await map.evaluate((map, pose) => new Promise<void>(resolve => {
  30 |       map.once('render', () => resolve()); map.jumpTo(pose); map.panBy([15, -10], { duration: 0 }); map.triggerRepaint();
  31 |     }), pose);
  32 |     const actual = (await mapState(page))!.inspection!;
  33 |     const projected = await map.evaluate(map => { const p = map.project(map.getLayer('inspection-damage').implementation.options.anchor); return [p.x, p.y]; });
  34 |     expect(Math.hypot(...actual.projectedAnchorCss.map((value: number, index: number) => value - projected[index]))).toBeLessThanOrEqual(2);
  35 |   }
  36 |   await evidence(page, info, 'context-restored');
  37 |   expect(await page.locator('canvas').count()).toBe(1);
  38 |   await map.dispose();
  39 | });
  40 | 
  41 | test('L01 L02 L03 application resources plateau over twenty complete cycles', async ({ page }, info) => {
  42 |   test.setTimeout(180000);
  43 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  44 |   await page.addInitScript(() => {
  45 |     const pending = new Set<number>();
  46 |     const request = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
  47 |     window.requestAnimationFrame = callback => {
  48 |       const id = request(time => { pending.delete(id); callback(time); });
  49 |       pending.add(id); return id;
  50 |     };
  51 |     window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
  52 |     (window as any).pendingFixtureFrames = () => pending.size;
  53 |   });
  54 |   await prepare(page, false, '/tests/lifecycle/index.html');
  55 |   const cycles = [];
  56 |   for (let index = 0; index < 20; index++) {
  57 |     await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  58 |     await ready(page);
  59 |     const map = await mapHandle(page);
  60 |     const layer = await map.evaluateHandle(map => map.getLayer('inspection-damage').implementation);
  61 |     await expect.poll(() => layer.evaluate(layer => layer.getState().renderCount)).toBeGreaterThan(0);
  62 |     const resources = await layer.evaluate(layer => layer.getState().resources);
  63 |     await page.getByRole('button', { name: 'Putar Orbit 360°' }).click();
  64 |     await page.locator('#b-3d').click();
  65 |     await ready(page);
  66 |     expect(await layer.evaluate(layer => layer.getState().resources)).toEqual({ geometries: 0, materials: 0, textures: 0, programs: 0 });
  67 |     await page.getByRole('button', { name: /^CCTV/ }).click();
  68 |     await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  69 |     await ready(page);
> 70 |     await page.getByTitle('Tutup CCTV').click();
     |                                         ^ Error: locator.click: Test timeout of 180000ms exceeded.
  71 |     const listeners = await map.evaluate(map => Object.fromEntries(Object.entries(map._listeners).map(([key, list]) => [key, (list as any[]).length])));
  72 |     cycles.push({ cycle: index + 1, resources, listeners, canvas: await page.locator('canvas').count() });
  73 |     await page.evaluate(() => (window as any).mountFixtureApp(false));
  74 |     await expect(page.locator('canvas')).toHaveCount(0);
  75 |     await expect.poll(() => page.evaluate(() => (window as any).pendingFixtureFrames())).toBe(0);
  76 |     expect(await map.evaluate(map => map._removed)).toBe(true);
  77 |     await map.dispose(); await layer.dispose();
  78 |     if (index < 19) {
  79 |       await page.evaluate(() => (window as any).mountFixtureApp(true));
  80 |       await expect(page.locator('#b-3d')).toBeVisible();
  81 |       await ready(page);
  82 |     }
  83 |   }
  84 |   for (const cycle of cycles.slice(5)) {
  85 |     expect(cycle.resources).toEqual(cycles[5].resources);
  86 |     expect(cycle.listeners).toEqual(cycles[5].listeners);
  87 |     expect(cycle.canvas).toBe(1);
  88 |   }
  89 |   await info.attach('complete-cycles', { body: JSON.stringify({ cycles, unavailable: ['GPU total memory', 'garbage-collected heap retention'] }, null, 2), contentType: 'application/json' });
  90 | });
  91 | 
```