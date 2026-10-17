// Check the proposed navigation and inspection resolution policy without timing claims.
import { test, expect } from '@playwright/test';
import { fixture } from './fixtures';
import { prepare, ready, mapState, mapHandle } from './helpers/map';

for (const nativeDpr of [1, 2]) {
  test.describe(`native DPR ${nativeDpr}`, () => {
    test.use({ deviceScaleFactor: nativeDpr });

    test('resolution follows mode and resize while the physical cavity and map stay unchanged', async ({ page }, info) => {
      await prepare(page);
      const map = await mapHandle(page);
      const owned = await map.evaluateHandle(map => ({
        canvas: map.getCanvas(), context: map.getCanvas().getContext('webgl2'),
        traffic: map.getSource('traffic-flow'),
      }));
      const samples: unknown[] = [];
      let firstGeometry: unknown;
      const navigationRatio = Math.max(nativeDpr, 1.5);

      // Read public map/canvas values and compare the existing projection oracle.
      const sample = async (name: string, ratio: number, inspecting: boolean) => {
        await ready(page);
        if (inspecting) {
          await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
        }
        await expect.poll(() => map.evaluate(map => map.getPixelRatio())).toBe(ratio);
        await expect.poll(() => map.evaluate((map, expectedRatio) => {
          const canvas = map.getCanvas();
          return [canvas.width, canvas.height];
        }, ratio)).toEqual(await map.evaluate((map, expectedRatio) => {
          const canvas = map.getCanvas();
          return [Math.floor(canvas.clientWidth * expectedRatio), Math.floor(canvas.clientHeight * expectedRatio)];
        }, ratio));
        await map.evaluate(map => new Promise<void>(resolve => {
          map.once('render', () => resolve());
          map.triggerRepaint();
        }));
        const actual = await map.evaluate((map, original) => {
          const canvas = map.getCanvas();
          const context = canvas.getContext('webgl2')!;
          const layer = map.getLayer('inspection-damage')?.implementation;
          const inspection = layer?.getState();
          const point = inspection ? map.project(inspection.anchor) : null;
          return {
            nativeDpr: window.devicePixelRatio, requestedRatio: map.getPixelRatio(),
            css: [canvas.clientWidth, canvas.clientHeight], buffer: [canvas.width, canvas.height],
            drawingBuffer: [context.drawingBufferWidth, context.drawingBufferHeight],
            sameCanvas: canvas === original.canvas && canvas.isConnected &&
              document.querySelector('.maplibregl-canvas') === canvas,
            sameContext: context === original.context, sameSource: !!original.traffic && map.getSource('traffic-flow') === original.traffic,
            contextLost: context.isContextLost(), antialias: context.getContextAttributes()?.antialias,
            inspection, projected: point ? [point.x, point.y] : null,
          };
        }, owned);
        samples.push({ name, ...actual });
        expect(actual.nativeDpr).toBe(nativeDpr);
        expect(actual.requestedRatio).toBe(ratio);
        expect(actual.css.every(value => value > 0)).toBe(true);
        expect(actual.buffer).toEqual(actual.css.map(value => Math.floor(value * ratio)));
        expect(actual.drawingBuffer).toEqual(actual.buffer);
        expect(actual.sameCanvas).toBe(true);
        expect(actual.sameContext).toBe(true);
        expect(actual.sameSource).toBe(true);
        expect(actual.contextLost).toBe(false);
        expect(actual.antialias).toBe(false);
        await expect(page.locator('canvas')).toHaveCount(1);
        if (inspecting) {
          const inspection = actual.inspection;
          expect(inspection.canvasShared).toBe(true);
          expect(inspection.webgl2).toBe(true);
          expect(inspection.anchor).toEqual([fixture.report.lng, fixture.report.lat]);
          expect(inspection.widthM).toBe(0.52);
          expect(inspection.depthM).toBe(0.075);
          expect(inspection.geometry.minZ).toBeCloseTo(-0.075, 6);
          expect(inspection.geometry.supportDiameterM).toBeCloseTo(0.52, 6);
          if (!firstGeometry) firstGeometry = inspection.geometry;
          expect(inspection.geometry).toEqual(firstGeometry);
          // Same CSS-pixel projection oracle as geometry.browser.spec.ts.
          expect(Math.hypot(...inspection.projectedAnchorCss.map((value: number, index: number) =>
            value - actual.projected![index]))).toBeLessThanOrEqual(2);
        } else {
          expect(actual.inspection).toBeUndefined();
        }
        await page.screenshot({ path: info.outputPath(`${name}.png`), animations: 'disabled' });
      };

      const resize = async () => {
        const viewport = page.viewportSize()!;
        await page.setViewportSize({ width: viewport.width + 12, height: viewport.height + 8 });
      };

      try {
        await sample('navigation-3d', navigationRatio, false);
        await resize();
        await sample('navigation-3d-resized', navigationRatio, false);
        await page.getByRole('button', { name: 'Lihat Lapangan 3D', exact: true }).click();
        await sample('inspection-native', nativeDpr, true);
        await resize();
        await sample('inspection-native-resized', nativeDpr, true);
        await page.locator('#b-3d').click();
        await sample('navigation-2d', navigationRatio, false);
        expect((await mapState(page))!.pitch).toBe(0);
        await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
        await page.locator('#b-3d').click();
        await sample('navigation-3d-restored', navigationRatio, false);
        await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'true');
        await page.getByRole('button', { name: 'Lihat Lapangan 3D', exact: true }).click();
        await sample('inspection-native-restored', nativeDpr, true);
      } finally {
        await info.attach('resolution-state', { body: JSON.stringify({ viewport: page.viewportSize(), nativeDpr, samples }, null, 2), contentType: 'application/json' });
        await owned.dispose();
        await map.dispose();
      }
    });
  });
}
