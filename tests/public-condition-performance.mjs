/* Freeze production builds, then compare real RAF scheduling on paired synthetic maps.
Todo:
-> keep public regression separate from the new inspection control
*/
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { arch, cpus, platform, release, totalmem } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const runner = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(runner), '..');
const knowledge = path.join(root, 'knowledge/crm-3d-plan-2026-10-28/implementation-p34');
const idIndex = process.argv.indexOf('--id'), runId = process.argv[idIndex + 1];
const mode = process.argv.includes('--prepare') ? 'prepare' : process.argv.includes('--run') ? 'run' : '';
if (!mode || idIndex < 0 || !/^performance-[a-z0-9][a-z0-9-]{0,79}$/.test(runId ?? '')) {
  console.log('Usage: node tests/public-condition-performance.mjs --prepare|--run --id performance-unique-name');
  process.exit(mode ? 1 : 0);
}
const output = path.join(knowledge, 'runs', runId), manifestPath = path.join(output, 'manifest.json');
const anchor = [106.8232095, -6.196562];
const padding = { top: 0, bottom: 0, left: 0, right: 0 };
const settings = {
  samples: 3, sampleMs: 10_000, warmupMs: 3_000, threshold: 1.20, dpr: 1, cameraTolerance: 1e-7, measurementDeadlineMs: 45_000,
  browserArgs: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  context: { locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce', serviceWorkers: 'block' },
  viewports: [{ width: 1440, height: 900 }, { width: 390, height: 844 }],
  scenarios: [
    { id: 'public-pan', inspection: false, motion: 'pan', control: 'baseline', pose: { center: anchor, zoom: 16, pitch: 0, bearing: 0, padding }, panDegrees: [0.00015, 0.00008] },
    { id: 'public-orbit', inspection: false, motion: 'orbit', control: 'baseline', pose: { center: anchor, zoom: 16, pitch: 55, bearing: 0, padding } },
    { id: 'inspection-orbit', inspection: true, motion: 'orbit', control: 'control', pose: { center: anchor, zoom: 25, pitch: 60, bearing: 0, padding: { top: 20, bottom: 150, left: 20, right: 20 } } },
    { id: 'inspection-pan', inspection: true, motion: 'pan', control: 'control', pose: { center: anchor, zoom: 25, pitch: 60, bearing: 0, padding: { top: 20, bottom: 150, left: 20, right: 20 } }, panDegrees: [0.000001, 0.0000006] },
  ],
  orbitDegreesPerSecond: 12, panPeriodMs: 4_000, pairOrder: 'control-first on samples 1/3, candidate-first on sample 2',
  metric: 'Median and p95 real browser RAF intervals; verdict uses ratio of medians of three sample p95 values.',
  latency: 'Scripted jumpTo call to next MapLibre render event; scheduling only, not pointer or presentation latency.',
  input: 'Camera motion uses the existing React map ref; no pointer gestures, app instrumentation, or fake RAF clocks.',
};
const report = {
  id: '11111111-1111-4111-8111-111111111111', code: 'LJ-MODEL-UJI', origin: 'community', category: 'road',
  sourceCategory: 'Jalan', title: 'MODEL UJI - cekungan untuk pengukuran performa',
  description: 'Fixture sintetis khusus pengujian. Bukan laporan atau ukuran lapangan.', address: 'MODEL UJI',
  lng: anchor[0], lat: anchor[1], createdAt: '2026-10-28T10:00:00.000Z', updatedAt: '2026-10-28T10:00:00.000Z',
  status: 'reported', sourceStatus: 'Dilaporkan', revision: 0, visibility: 'public', canManage: false, canUpdate: false,
  media: [], updates: [], condition: { kind: 'pothole', observedAt: '2026-10-28T10:00:00.000Z',
    locationConfirmed: true, source: 'reporter', geometry: { type: 'Point', coordinates: anchor },
    dimensions: { method: 'measured', tool: 'Meteran MODEL UJI', widthM: 0.52, depthM: 0.075 } },
};
const fixture = {
  report, capabilities: { reports: true, write: true, login: true, reason: null },
  public: { reports: [], source: { name: 'MODEL UJI - metadata CRM', url: 'https://crm.jakarta.go.id/peta/',
    retrievedAt: '2026-10-28T10:00:00.000Z', dateStart: '2026-10-27', dateEnd: '2026-10-28' } },
  style: { version: 8, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#e8ede7' } }] },
};
const digest = value => createHash('sha256').update(value).digest('hex');
const json = value => JSON.stringify(value, null, 2);
const save = (filename, value) => writeFile(path.join(output, filename), json(value), { flag: 'wx' });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const stable = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ?
  Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
function sameCamera(actual, expected) {
  return actual.center.every((value, index) => Math.abs(value - expected.center[index]) <= settings.cameraTolerance) &&
    ['zoom', 'pitch', 'bearing'].every(key => Math.abs(actual[key] - expected[key]) <= settings.cameraTolerance) &&
    stable(actual.padding) === stable(expected.padding);
}
async function fileHash(filename) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest('hex');
}
async function hashes(directory, prefix = '') {
  const result = {};
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, entry.name), full = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(result, await hashes(full, relative));
    else if (entry.isFile()) result[relative] = await fileHash(full);
    else throw new Error('Frozen builds must contain only regular files and directories');
  }
  return result;
}
async function provenance() {
  const files = ['package-lock.json', 'knowledge/crm-3d-plan-2026-10-28/implementation-p34/CONTRACT.md',
    'knowledge/crm-3d-plan-2026-10-28/implementation-p34/evidence/performance-baseline.json'];
  return { runnerHash: await fileHash(runner), files: Object.fromEntries(await Promise.all(files.map(async name => [name, await fileHash(path.join(root, name))]))),
    browserBinaryHash: await fileHash(chromium.executablePath()) };
}
async function prepare() {
  const reference = JSON.parse(await readFile(path.join(knowledge, 'evidence/performance-baseline.json'), 'utf8'));
  const baseline = path.join(knowledge, 'runs/performance-baseline/artifacts/dist');
  const candidate = path.join(root, 'dist');
  assert(stable(await hashes(baseline)) === stable(reference.files), 'Frozen baseline differs from its original recorded hashes');
  for (const source of [baseline, candidate]) {
    const html = await readFile(path.join(source, 'index.html'), 'utf8');
    assert(html.includes('/assets/') && !html.includes('/@vite/client') && !html.includes('/src/'), 'A production dist is required');
  }
  await mkdir(path.dirname(output), { recursive: true });
  await mkdir(output);
  const sources = {};
  for (const [name, directory, port] of [['baseline', baseline, 3007], ['candidate', candidate, 3008]]) {
    const frozen = path.join(output, 'artifacts', name + '-dist');
    const before = await hashes(directory);
    await cp(directory, frozen, { recursive: true, errorOnExist: true, force: false });
    assert(JSON.stringify(before) === JSON.stringify(await hashes(frozen)), 'Build changed while being frozen');
    sources[name] = { directory: frozen, port, hashes: before };
  }
  await save('fixture.json', fixture);
  await save('manifest.json', { createdAt: new Date().toISOString(), runId, settings, sources,
    fixtureHash: digest(json(fixture)), provenance: await provenance(),
    baselineReference: reference, limitations: ['Synthetic API and background basemap only', 'SwiftShader software rendering',
      'No hardware GPU, real tiles, physical display presentation, or real-world device performance claim'] });
  console.log('Prepared ' + output + '; no measurements started.');
}
async function serve(directory, port) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' };
  const server = createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      let filename = path.resolve(directory, '.' + pathname);
      if (filename !== directory && !filename.startsWith(directory + path.sep)) { response.writeHead(403).end(); return; }
      if (filename === directory) filename = path.join(directory, 'index.html');
      let info = await stat(filename).catch(() => null);
      if (!info?.isFile() && !path.extname(pathname)) { filename = path.join(directory, 'index.html'); info = await stat(filename); }
      if (!info?.isFile()) { response.writeHead(404).end(); return; }
      response.writeHead(200, { 'Content-Type': types[path.extname(filename)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      if (request.method === 'HEAD') response.end(); else createReadStream(filename).on('error', () => response.destroy()).pipe(response);
    } catch { response.writeHead(400).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}
// Read the map owner's existing ref. This does not add a field or hook to the application.
function findMap() {
  const element = document.querySelector('.maplibregl-map');
  const key = element && Object.keys(element).find(name => name.startsWith('__reactFiber$'));
  let fiber = key && element[key];
  while (fiber) {
    let hook = fiber.memoizedState;
    while (hook) {
      if (typeof hook.memoizedState?.current?.getPitch === 'function') return hook.memoizedState.current;
      hook = hook.next;
    }
    fiber = fiber.return;
  }
  throw new Error('Map ref unavailable');
}
function snapshot(map) {
  const canvas = map.getCanvas(), rect = canvas.getBoundingClientRect(), gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  const extension = gl?.getExtension('WEBGL_debug_renderer_info');
  const state = map.getLayer('inspection-damage')?.implementation?.getState();
  return { camera: { center: map.getCenter().toArray(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing(), padding: map.getPadding() },
    canvas: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bufferWidth: canvas.width, bufferHeight: canvas.height, count: document.querySelectorAll('canvas').length },
    sharedCanvas: document.querySelector('.maplibregl-canvas') === canvas, visible: document.visibilityState,
    inspection: state ? { widthM: state.widthM, depthM: state.depthM, minZ: state.geometry?.minZ, renderCount: state.renderCount } : null,
    inspectorText: document.querySelector('.lj-inspection-controls')?.textContent ?? '',
    environment: { userAgent: navigator.userAgent, dpr: devicePixelRatio, concurrency: navigator.hardwareConcurrency,
      renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : null, vendor: extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : null, webglVersion: gl?.getParameter(gl.VERSION) } };
}
async function setup(browser, manifest, frozenFixture, scenario, viewport, variant) {
  const source = manifest.sources[scenario.inspection || variant === 'candidate' ? 'candidate' : 'baseline'];
  const context = await browser.newContext({ ...settings.context, viewport, deviceScaleFactor: settings.dpr, isMobile: viewport.width === 390, hasTouch: viewport.width === 390 });
  const diagnostics = { pageErrors: [], console: [], mapErrors: [], blockedNetwork: [], blockedWrites: [], unexpectedApi: [], failedLocal: [] };
  try {
    const page = await context.newPage(), origin = 'http://127.0.0.1:' + source.port;
    page.on('pageerror', error => diagnostics.pageErrors.push(error.message));
    page.on('console', message => {
      if (['warning', 'error'].includes(message.type())) diagnostics.console.push({ type: message.type(), text: message.text() });
      if (message.text().startsWith('BENCHMARK_MAP_ERROR:')) diagnostics.mapErrors.push(message.text());
    });
    page.on('requestfailed', request => { if (request.url().startsWith(origin)) diagnostics.failedLocal.push({ url: request.url(), error: request.failure()?.errorText }); });
    await page.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      if (!['GET', 'HEAD'].includes(request.method())) { diagnostics.blockedWrites.push({ method: request.method(), url: request.url() }); return route.fulfill({ status: 405, body: 'Benchmark writes blocked' }); }
      const headers = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
      if (url.pathname === '/api/public-reports') return route.fulfill({ json: frozenFixture.public, headers });
      if (url.pathname === '/api/community/capabilities') return route.fulfill({ json: frozenFixture.capabilities, headers });
      if (url.pathname === '/api/community/reports') return route.fulfill({ json: { reports: [frozenFixture.report], nextCursor: null }, headers });
      if (url.pathname === '/api/community/reports/' + frozenFixture.report.id) return route.fulfill({ json: frozenFixture.report, headers });
      if (url.pathname.startsWith('/api/')) { diagnostics.unexpectedApi.push(request.url()); return route.fulfill({ status: 404, body: 'No fixture for API read' }); }
      if (url.hostname === 'tiles.openfreemap.org' && url.pathname.startsWith('/styles/')) return route.fulfill({ json: frozenFixture.style });
      if (url.origin === origin) return route.continue();
      diagnostics.blockedNetwork.push(request.url()); return route.abort('blockedbyclient');
    });
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.locator('.lj-report-row').first().waitFor();
    await page.waitForFunction('(() => {try {const map=(' + findMap.toString() + ')();return map.isStyleLoaded()&&!map.isMoving();}catch{return false;}})()');
    if (scenario.inspection) {
      await page.locator('.lj-report-row').first().click();
      await page.getByRole('button', { name: 'Lihat ilustrasi 3D', exact: true }).click();
      await page.waitForFunction('!!(' + findMap.toString() + ')().getLayer("inspection-damage")?.implementation?.getState().renderCount');
    } else if (scenario.motion === 'orbit') await page.getByRole('button', { name: 'Mode 3D', exact: true }).click();
    const map = await page.evaluateHandle(findMap);
    await map.evaluate((instance, pose) => { instance.stop(); instance.jumpTo(pose); }, scenario.pose);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await map.evaluate(instance => { instance.stop(); });
    const beforeRemoval = await map.evaluate(snapshot);
    if (scenario.inspection && variant === 'control') {
      const removed = await map.evaluate(instance => {
        const layer = instance.getLayer('inspection-damage')?.implementation;
        if (!layer) throw new Error('DamageLayer missing before control removal');
        instance.removeLayer('inspection-damage'); instance.triggerRepaint();
        return { disposed: layer.getState().disposed, absent: !instance.getLayer('inspection-damage') };
      });
      assert(removed.disposed && removed.absent, 'Control did not release only DamageLayer');
    }
    await map.evaluate((instance, pose) => instance.jumpTo(pose), scenario.pose);
    const state = await map.evaluate(snapshot);
    await map.evaluate(instance => { instance.on('error', event => console.error('BENCHMARK_MAP_ERROR: ' + String(event.error?.message ?? event.error))); });
    assert(state.sharedCanvas && state.canvas.count === 1 && state.canvas.width > 0 && state.canvas.height > 0, 'A single visible shared map canvas is required');
    assert(state.environment.dpr === settings.dpr, 'DPR differs from frozen settings');
    assert(sameCamera(state.camera, scenario.pose), 'Camera differs from frozen pose: ' + json(state.camera));
    if (scenario.inspection) assert(beforeRemoval.inspection?.widthM === 0.52 && beforeRemoval.inspection?.depthM === 0.075 && Math.abs(beforeRemoval.inspection?.minZ + 0.075) < 1e-6, 'Fixture dimensions differ from input');
    assert(Boolean(state.inspection) === Boolean(scenario.inspection && variant === 'candidate'), 'Unexpected inspection layer state');
    return { context, page, map, state, diagnostics, variant };
  } catch (error) { error.diagnostics = diagnostics; await context.close(); throw error; }
}
async function measure(map, scenario) {
  return map.evaluate((instance, { settings, scenario }) => new Promise((resolve, reject) => {
    const raw = { intervals: [], renderIntervals: [], renderLatencies: [] };
    const start = performance.now(), duration = settings.warmupMs + settings.sampleMs;
    let previous = null, previousRender = null, pending = [], frames = 0;
    const render = () => {
      const time = performance.now(), elapsed = time - start;
      if (elapsed >= settings.warmupMs && elapsed <= duration) {
        if (previousRender !== null) raw.renderIntervals.push(time - previousRender);
        previousRender = time;
        for (const request of pending) raw.renderLatencies.push(time - request);
      }
      pending = [];
    };
    instance.on('render', render);
    const finish = () => instance.off('render', render);
    const frame = time => {
      try {
        const elapsed = time - start, seconds = elapsed / 1000;
        if (elapsed >= settings.warmupMs) { if (previous !== null) raw.intervals.push(time - previous); previous = time; frames++; }
        const phase = elapsed / settings.panPeriodMs * Math.PI * 2;
        const center = scenario.motion === 'pan' ? [scenario.pose.center[0] + Math.sin(phase) * scenario.panDegrees[0], scenario.pose.center[1] + Math.cos(phase) * scenario.panDegrees[1]] : scenario.pose.center;
        const bearing = scenario.motion === 'orbit' ? scenario.pose.bearing + seconds * settings.orbitDegreesPerSecond : scenario.pose.bearing;
        if (elapsed >= settings.warmupMs) pending.push(performance.now());
        instance.jumpTo({ ...scenario.pose, center, bearing }); instance.triggerRepaint();
        const actual = instance.getCenter();
        if (Math.abs(actual.lng - center[0]) > 1e-7 || Math.abs(actual.lat - center[1]) > 1e-7 ||
          Math.abs(instance.getPitch() - scenario.pose.pitch) > 1e-7 || Math.abs(instance.getZoom() - scenario.pose.zoom) > 1e-7 ||
          Math.abs(instance.getBearing() - bearing) > 1e-7) throw new Error('Scripted camera motion diverged');
        if (elapsed >= duration) { finish(); resolve({ ...raw, elapsedMs: elapsed - settings.warmupMs, frames, motionEnd: { center, bearing } }); }
        else requestAnimationFrame(frame);
      } catch (error) { finish(); reject(error); }
    };
    requestAnimationFrame(frame);
  }), { settings, scenario });
}
const percentile = (values, p) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.ceil(sorted.length * p) - 1] : null; };
const stats = values => ({ count: values.length, median: percentile(values, 0.5), p95: percentile(values, 0.95) });
async function run() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert(JSON.stringify(manifest.settings) === JSON.stringify(settings), 'Frozen settings changed');
  assert(JSON.stringify(manifest.provenance) === JSON.stringify(await provenance()), 'Runner, browser, dependency lock or contract changed after freeze');
  for (const source of Object.values(manifest.sources)) assert(JSON.stringify(source.hashes) === JSON.stringify(await hashes(source.directory)), 'Frozen production build changed');
  const fixtureBytes = await readFile(path.join(output, 'fixture.json'));
  assert(digest(fixtureBytes) === manifest.fixtureHash, 'Frozen fixture changed');
  const frozenFixture = JSON.parse(fixtureBytes);
  await save('started.json', { at: new Date().toISOString(), manifestHash: await fileHash(manifestPath) });
  const servers = [], results = [];
  let browser;
  try {
    for (const source of Object.values(manifest.sources)) servers.push(await serve(source.directory, source.port));
    browser = await chromium.launch({ executablePath: chromium.executablePath(), args: settings.browserArgs });
    await save('environment.json', { node: process.version, browser: browser.version(), executable: chromium.executablePath(),
      os: { platform: platform(), release: release(), arch: arch(), memoryBytes: totalmem() },
      cpu: { model: cpus()[0]?.model, count: cpus().length } });
    for (const viewport of settings.viewports) for (const scenario of settings.scenarios) for (let sample = 1; sample <= settings.samples; sample++) {
      const pair = [];
      try {
        for (const variant of [scenario.control, 'candidate']) pair.push(await setup(browser, manifest, frozenFixture, scenario, viewport, variant));
        assert(JSON.stringify(pair[0].state.canvas) === JSON.stringify(pair[1].state.canvas), 'Paired canvas dimensions differ');
        assert(sameCamera(pair[0].state.camera, pair[1].state.camera), 'Paired camera poses differ');
        assert(pair[0].state.inspectorText === pair[1].state.inspectorText, 'Paired inspection UI differs');
        const order = sample % 2 ? pair : [...pair].reverse();
        for (const current of order) {
          await current.page.bringToFront();
          await save('setup-' + viewport.width + '-' + scenario.id + '-' + sample + '-' + current.variant + '.json', current.state);
          let timeout;
          const raw = await Promise.race([measure(current.map, scenario), new Promise((_resolve, reject) => {
            timeout = setTimeout(() => reject(new Error('Measurement exceeded its wall-clock deadline')), settings.measurementDeadlineMs);
          })]).finally(() => clearTimeout(timeout));
          assert(raw.intervals.length >= 2 && raw.renderIntervals.length >= 2 && raw.renderLatencies.length >= 1, 'Insufficient RAF or real MapLibre render samples');
          assert(!current.diagnostics.pageErrors.length && !current.diagnostics.mapErrors.length && !current.diagnostics.console.some(row => row.type === 'error' && !row.text.includes('ERR_BLOCKED_BY_CLIENT')) && !current.diagnostics.blockedWrites.length && !current.diagnostics.unexpectedApi.length && !current.diagnostics.failedLocal.length, 'Browser, network or write guard failed: ' + json(current.diagnostics));
          const result = { viewport, scenario: scenario.id, sample, variant: current.variant, frames: stats(raw.intervals),
            mapRenders: stats(raw.renderIntervals), cameraToRender: stats(raw.renderLatencies), elapsedMs: raw.elapsedMs,
            diagnostics: current.diagnostics, environment: current.state.environment };
          await save('sample-' + viewport.width + '-' + scenario.id + '-' + sample + '-' + current.variant + '.json', { ...result, raw });
          results.push(result);
          console.log(scenario.id + ' ' + viewport.width + ' ' + current.variant + ' sample' + sample + ' p95=' + result.frames.p95);
        }
      } finally { for (const current of pair) { await current.map.dispose(); await current.context.close(); } }
    }
    const comparisons = settings.viewports.flatMap(viewport => settings.scenarios.map(scenario => {
      const medianP95 = variant => percentile(results.filter(row => row.viewport.width === viewport.width && row.scenario === scenario.id && row.variant === variant).map(row => row.frames.p95), 0.5);
      const control = medianP95(scenario.control), candidate = medianP95('candidate');
      return { viewport, scenario: scenario.id, control: scenario.control, controlMedianSampleP95: control, candidateMedianSampleP95: candidate,
        ratio: candidate / control, threshold: settings.threshold, status: candidate / control <= settings.threshold ? 'passed' : 'failed' };
    }));
    const status = comparisons.every(row => row.status === 'passed') ? 'passed' : 'failed';
    await save('result.json', { status, finishedAt: new Date().toISOString(), settings, comparisons, results,
      environment: { node: process.version, browser: browser.version(), os: { platform: platform(), release: release(), arch: arch(), memoryBytes: totalmem() },
        cpu: { model: cpus()[0]?.model, count: cpus().length } }, limitations: manifest.limitations });
    if (status === 'failed') process.exitCode = 1;
  } catch (error) {
    await save('error.json', { at: new Date().toISOString(), message: String(error), stack: error.stack, diagnostics: error.diagnostics ?? null, completedSamples: results.length }); throw error;
  } finally {
    await browser?.close();
    for (const server of servers) await new Promise(resolve => server.close(resolve));
  }
}
if (mode === 'prepare') await prepare(); else await run();

