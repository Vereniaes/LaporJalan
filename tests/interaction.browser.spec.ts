import { test, expect } from '@playwright/test';
import { prepare, ready, mapState, mapHandle } from './helpers/map';

test('C05 an older geocoder response cannot replace a newer query', async ({ page }) => {
  await prepare(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let oldStarted!: () => void;
  const started = new Promise<void>(resolve => { oldStarted = resolve; });
  await page.route('**/api/places/**', async route => {
    const old = new URL(route.request().url()).searchParams.get('input') === 'Older';
    if (old) { oldStarted(); await gate; }
    await route.fulfill({ json: { predictions: [{ id: old ? 'old' : 'new', name: old ? 'Older result' : 'Newer result', address: 'Fixture', lng: 106.825, lat: -6.197 }] } });
  });
  await page.getByPlaceholder(/Cari jalan/).fill('Older');
  await started;
  await page.getByPlaceholder(/Cari jalan/).fill('Newer');
  await expect(page.getByRole('button', { name: /Newer result/ })).toBeVisible();
  const response = page.waitForResponse(response => response.url().includes('input=Older'));
  release();
  await (await response).finished();
  await expect(page.getByRole('button', { name: /Older result/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Newer result/ })).toBeVisible();
});

test('C02 late flight and zoom callbacks cannot override manual 2D', async ({ page }) => {
  await prepare(page);
  for (const control of ['Perbesar peta', 'Perkecil peta']) {
    await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
    await page.locator('#b-3d').click();
    await page.getByRole('button', { name: control }).click();
    await ready(page);
    expect((await mapState(page))!.pitch).toBe(0);
    await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
    expect((await mapState(page))!.inspection).toBeUndefined();
  }
});

test('M02 device fullscreen rejection retains an accessible preview', async ({ page }) => {
  await page.addInitScript(() => { Element.prototype.requestFullscreen = () => Promise.reject(new Error('Fixture fullscreen denied')); });
  await prepare(page);
  await page.getByRole('button', { name: /^CCTV/ }).click();
  await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  await ready(page);
  await page.getByRole('region', { name: 'Pratinjau CCTV' }).getByRole('button', { name: 'Layar Penuh' }).click();
  await page.getByTitle('Mode layar perangkat').click();
  await expect(page.getByRole('dialog').getByRole('status')).toContainText('Pratinjau tetap dapat digunakan');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('M03 popup anchor tracks pan zoom and resize within two CSS pixels', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  await page.getByRole('button', { name: /^CCTV/ }).click();
  await page.getByText('1 • CCTV Bundaran HI', { exact: true }).first().click();
  await ready(page);
  const map = await mapHandle(page);
  const samples = [];
  for (const step of ['initial', 'pan', 'zoom', 'resize']) {
    if (step === 'pan') await map.evaluate(map => { map.panBy([30, 20], { duration: 0 }); });
    if (step === 'zoom') await map.evaluate(map => { map.zoomTo(map.getZoom() + 0.2, { duration: 0 }); });
    if (step === 'resize') {
      const viewport = page.viewportSize()!;
      await page.setViewportSize({ width: viewport.width + 10, height: viewport.height });
    }
    await ready(page);
    const result = await map.evaluate(map => {
      const container = map.getContainer();
      const key = Object.keys(container).find(key => key.startsWith('__reactFiber$'))!;
      let fiber = container[key];
      while (fiber) {
        let hook = fiber.memoizedState;
        while (hook) {
          const popup = hook.memoizedState?.current;
          if (typeof popup?.getLngLat === 'function' && typeof popup.getElement === 'function'
            && typeof popup.isOpen === 'function' && popup.isOpen()
            && popup.getElement().classList.contains('cctv-oyenza-popup')) {
            const point = map.project(popup.getLngLat());
            const box = popup.getElement().getBoundingClientRect();
            const origin = container.getBoundingClientRect();
            const offset = popup.options.offset;
            return { point: [point.x + offset[0], point.y + offset[1]],
              actual: [(box.left + box.right) / 2 - origin.left, box.bottom - origin.top],
              offset, anchor: popup.options.anchor };
          }
          hook = hook.next;
        }
        fiber = fiber.return;
      }
      throw new Error('Open CCTV popup ref unavailable');
    });
    expect(Math.hypot(result.actual[0] - result.point[0], result.actual[1] - result.point[1])).toBeLessThanOrEqual(2);
    expect(result.offset).toEqual([0, -28]);
    expect(result.anchor).toBe('bottom');
    samples.push({ step, ...result });
  }
  await info.attach('popup-projections', { body: JSON.stringify(samples), contentType: 'application/json' });
  await map.dispose();
});
