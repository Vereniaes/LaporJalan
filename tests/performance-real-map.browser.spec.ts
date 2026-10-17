// Observe real-map orbit timing; no paired threshold or device FPS verdict.
import { test, expect } from '@playwright/test';
import { cpus, release } from 'node:os';
import { fixture } from './fixtures';
import mappedRoad from './mapped-road.json' with { type: 'json' };
import { prepare, ready, mapState, mapHandle, evidence } from './helpers/map';

const stats = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (fraction: number) => sorted.length ? sorted[Math.ceil(sorted.length * fraction) - 1] : null;
  return { count: sorted.length, median: at(0.5), p95: at(0.95) };
};

test('U03 observe live mapped-road inspection orbit timing', async ({ page }, info) => {
  test.setTimeout(150000);
  const errors: string[] = [], network: object[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => { if (request.url().includes('openfreemap.org')) network.push({ url: request.url(), error: request.failure()?.errorText }); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await prepare(page, true);
  const report = { ...fixture.report, id: mappedRoad.id, lng: mappedRoad.anchor[0], lat: mappedRoad.anchor[1],
    title: 'Model uji pada jalan terpetakan', address: `${mappedRoad.road} - dimensi sintetis` };
  // Preserve live map sprites/tiles; helper image mocks remain only for example media.
  await page.route('https://tiles.openfreemap.org/**', route => route.continue());
  await page.route('**/api/reports', route => route.request().method() === 'GET'
    ? route.fulfill({ json: { data: [report] } }) : route.fulfill({ status: 405, body: 'No writes allowed' }));
  await page.reload();
  await ready(page);
  await page.getByRole('button', { name: 'Lihat Lapangan 3D', exact: true }).click();
  await ready(page);
  await expect.poll(async () => (await mapState(page))?.inspection?.renderCount ?? 0).toBeGreaterThan(0);
  const beforeOrbit = (await mapState(page))!;
  expect(beforeOrbit.zoom).toBeCloseTo(info.project.name === 'mobile' ? 25 : 25.5, 1);
  expect(beforeOrbit.inspection.widthM).toBe(0.52);
  expect(beforeOrbit.inspection.depthM).toBe(0.075);
  const map = await mapHandle(page);
  const environment = await map.evaluate(map => {
    const gl = map.getCanvas().getContext('webgl2'), extension = gl.getExtension('WEBGL_debug_renderer_info');
    return { dpr: devicePixelRatio, webgl2: true, renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      styleSources: Object.keys(map.getStyle().sources), canvas: [map.getCanvas().width, map.getCanvas().height] };
  });
  expect(environment.styleSources).toContain('openmaptiles');
  const box = (await page.locator('.maplibregl-canvas').boundingBox())!;
  const input = { x: box.x + box.width * 0.6, y: box.y + Math.min(box.height * 0.65, 350) };
  expect(await page.evaluate(({ x, y }) => [x, x + 2].every(px => document.elementFromPoint(px, y) === document.querySelector('.maplibregl-canvas')), input)).toBe(true);
  await page.getByRole('button', { name: 'Putar Orbit 360°', exact: true }).click();
  await page.evaluate(ms => new Promise<void>(resolve => {
    const start = performance.now();
    const frame = () => performance.now() - start >= ms ? resolve() : requestAnimationFrame(frame);
    requestAnimationFrame(frame);
  }), 5000);
  const samples = [];
  for (let sample = 1; sample <= 3; sample++) {
    const start = (await mapState(page))!;
    const measurement = page.evaluate(ms => new Promise<{ intervals: number[]; latencies: number[]; elapsedMs: number; trustedEvents: number }>(resolve => {
      const intervals: number[] = [], latencies: number[] = [], pending: number[] = [];
      let previous: number | null = null, trustedEvents = 0;
      const start = performance.now();
      const record = (event: PointerEvent) => { if (event.isTrusted) { trustedEvents++; pending.push(performance.now()); } };
      window.addEventListener('pointermove', record, true);
      const frame = (time: number) => {
        if (previous !== null) intervals.push(time - previous);
        previous = time;
        while (pending.length) latencies.push(performance.now() - pending.shift()!);
        if (time - start >= ms) { window.removeEventListener('pointermove', record, true); resolve({ intervals, latencies, elapsedMs: time - start, trustedEvents }); }
        else requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }), 30000);
    const interaction = (async () => {
      for (let tick = 0; tick < 30; tick++) {
        await page.mouse.move(input.x + (tick % 2 ? 2 : 0), input.y);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    })();
    const [raw] = await Promise.all([measurement, interaction]);
    const end = (await mapState(page))!;
    const result = { sample, raw, raf: stats(raw.intervals), inputLatency: stats(raw.latencies),
      rendererFrames: end.inspection.renderCount - start.inspection.renderCount,
      before: start, after: end, errors: [...errors], networkFailures: [...network] };
    await info.attach(`real-map-sample-${sample}`, { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
    expect(raw.intervals.length).toBeGreaterThan(1);
    expect(raw.trustedEvents).toBeGreaterThan(0);
    expect(result.rendererFrames).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    samples.push({ sample, raf: result.raf, inputLatency: result.inputLatency, rendererFrames: result.rendererFrames });
  }
  await evidence(page, info, 'real-map-orbit-timing');
  await info.attach('real-map-observation', { body: JSON.stringify({ scope: 'Observed timing only - no performance threshold verdict',
    provenance: mappedRoad, dimensions: 'synthetic 0.52m / 0.075m', browser: page.context().browser()?.version(),
    node: process.version, cpu: cpus()[0].model, os: release(), environment, viewport: page.viewportSize(), box, input,
    clock: 'prepare fixes Date only; performance.now and RAF remain real', warmupMs: 5000, sampleMs: 30000,
    scenario: 'Actual application Orbit action at normal inspection zoom; trusted pointer hover by 2 CSS px each second',
    samples, networkFailures: network, limitations: ['SwiftShader', 'No paired baseline', 'RAF is not display FPS', 'Pointer-to-RAF is not presentation latency'] }, null, 2), contentType: 'application/json' });
  await page.getByRole('button', { name: 'Berhenti Orbit', exact: true }).click();
  await map.dispose();
});
