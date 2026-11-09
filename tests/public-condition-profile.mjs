/* Diagnose frozen inspection rendering by hiding one component at a time.
Todo:
-> keep runtime ablations and CPU traces separate from acceptance benchmarks
*/
import ts from 'typescript';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { cpus, release } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const knowledge = path.join(root, 'knowledge/crm-3d-plan-2026-10-28/implementation-p34');
const reference = path.join(knowledge, 'runs/performance-public-condition-20261028-a');
const scissorRun = process.argv.includes('--scissor');
const prefix = scissorRun ? 'profile-before-scissor' : 'profile-before';
const output = path.join(knowledge, 'runs/profile-before/artifacts', ...(scissorRun ? ['scissor'] : []));
const evidence = path.join(knowledge, 'evidence');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
async function save(name, value, directory = output) { await writeFile(path.join(directory, name), json(value), { flag: 'wx' }); }
async function hashes(directory, prefix = '') {
  const result = {};
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, entry.name), full = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(result, await hashes(full, relative));
    else if (entry.isFile()) result[relative] = hash(await readFile(full));
    else throw new Error('Unexpected frozen artifact type');
  }
  return result;
}
const frozen = JSON.parse(await readFile(path.join(reference, 'manifest.json'), 'utf8'));
const fixture = JSON.parse(await readFile(path.join(reference, 'fixture.json'), 'utf8'));
const settings = { ...frozen.settings, samples: 3, sampleMs: 10000, warmupMs: 3000 };
const scenario = settings.scenarios.find(value => value.id === 'inspection-orbit');
const viewport = { width: 1440, height: 900 };
const comparisons = scissorRun ? ['scissor'] : ['no-road', 'no-bowl', 'no-contours', 'native'];
const harnessPath = path.join(root, 'tests/public-condition-performance.mjs');
const harnessSource = await readFile(harnessPath, 'utf8');
assert(hash(harnessSource) === frozen.provenance.runnerHash, 'Acceptance harness changed');
const tree = ts.createSourceFile(harnessPath, harnessSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
function extract(name) {
  const node = tree.statements.find(item => ts.isFunctionDeclaration(item) && item.name?.text === name);
  assert(node, 'Missing harness helper: ' + name);
  return node.getText(tree);
}
const findMap = Function('return (' + extract('findMap') + ')')();
const snapshot = Function('return (' + extract('snapshot') + ')')();
const sameCamera = (a, b) => a.center.every((n, i) => Math.abs(n - b.center[i]) < 1e-7) &&
  ['zoom', 'pitch', 'bearing'].every(key => Math.abs(a[key] - b[key]) < 1e-7) &&
  JSON.stringify(a.padding) === JSON.stringify(b.padding);
const serve = Function('createServer', 'path', 'stat', 'createReadStream', 'return (' + extract('serve') + ')')(createServer, path, stat, createReadStream);
const setup = Function('settings', 'assert', 'findMap', 'snapshot', 'sameCamera', 'json', 'return (' + extract('setup') + ')')(settings, assert, findMap, snapshot, sameCamera, json);
const measure = Function('settings', 'return (' + extract('measure') + ')')(settings);
const percentile = (values, q) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.ceil(sorted.length * q) - 1] : null; };
const stats = values => ({ count: values.length, median: percentile(values, .5), p95: percentile(values, .95) });

async function instrument(map, variant) {
  return map.evaluateHandle((instance, variant) => {
    const layer = instance.getLayer('inspection-damage')?.implementation;
    if (!layer?.scene || !layer.renderer) throw new Error('Frozen layer internals unavailable');
    const objects = layer.scene.children.filter(object => object.isMesh || object.isLine);
    const describe = () => objects.map(object => ({ type: object.type, renderOrder: object.renderOrder, visible: object.visible,
      vertices: object.geometry.attributes.position.count, indices: object.geometry.index?.count ?? 0,
      material: object.material.type, colorWrite: object.material.colorWrite, depthWrite: object.material.depthWrite }));
    const before = describe(), visibility = objects.map(object => object.visible);
    const profiler = { layer, objects, visibility, original: layer.render, cpu: [], draw: null, before,
      start: performance.now() + 3000, native: variant === 'native', gpuTimer: false, captureGpu: false, gpu: [], queries: [], disjoint: false, scissor: [], fallbacks: 0, rendererOriginal: layer.renderer.render };
    const gl = instance.getCanvas().getContext('webgl2');
    const timer = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    profiler.gpuTimer = Boolean(timer);
    profiler.gl = gl; profiler.timer = timer;
    const orders = { 'no-road': 0, 'no-bowl': 1, 'no-contours': 3 };
    if (variant === 'native') instance.removeLayer(layer.id);
    else {
      for (const object of objects) if (object.renderOrder === orders[variant]) object.visible = false;
      if (variant === 'scissor') {
        const renderer = layer.renderer, width = layer.options.widthM, depth = layer.options.depthM;
        renderer.render = function(scene, camera) {
          const e = camera.projectionMatrix.elements, canvas = instance.getCanvas();
          const projected = [];
          for (const x of [-width / 2, width / 2]) for (const y of [-width / 2, width / 2]) for (const z of [-depth, 0]) {
            const w = e[3] * x + e[7] * y + e[11] * z + e[15];
            const px = (e[0] * x + e[4] * y + e[8] * z + e[12]) / w;
            const py = (e[1] * x + e[5] * y + e[9] * z + e[13]) / w;
            if (w <= 0 || ![w, px, py].every(Number.isFinite)) {
              profiler.fallbacks++; return profiler.rendererOriginal.call(this, scene, camera);
            }
            projected.push([(px + 1) * canvas.width / 2, (py + 1) * canvas.height / 2]);
          }
          const x = Math.max(0, Math.floor(Math.min(...projected.map(point => point[0]))) - 2);
          const y = Math.max(0, Math.floor(Math.min(...projected.map(point => point[1]))) - 2);
          const right = Math.min(canvas.width, Math.ceil(Math.max(...projected.map(point => point[0]))) + 2);
          const top = Math.min(canvas.height, Math.ceil(Math.max(...projected.map(point => point[1]))) + 2);
          const rectangle = [x, y, Math.max(0, right - x), Math.max(0, top - y)];
          profiler.scissor.push({ rectangle, fraction: rectangle[2] * rectangle[3] / (canvas.width * canvas.height) });
          this.setScissor(...rectangle); this.setScissorTest(true);
          try { return profiler.rendererOriginal.call(this, scene, camera); }
          finally { this.setScissorTest(false); }
        };
      }
      layer.render = (...args) => {
        let query;
        if (profiler.captureGpu && timer) {
          if (gl.getParameter(timer.GPU_DISJOINT_EXT)) profiler.disjoint = true;
          profiler.queries = profiler.queries.filter(pending => {
            if (!gl.getQueryParameter(pending, gl.QUERY_RESULT_AVAILABLE)) return true;
            if (!profiler.disjoint) profiler.gpu.push(gl.getQueryParameter(pending, gl.QUERY_RESULT) / 1000000);
            gl.deleteQuery(pending); return false;
          });
          if (profiler.queries.length < 4 && !gl.getQuery(timer.TIME_ELAPSED_EXT, gl.CURRENT_QUERY)) {
            query = gl.createQuery(); gl.beginQuery(timer.TIME_ELAPSED_EXT, query);
          }
        }
        const started = performance.now();
        const result = profiler.original.apply(layer, args);
        if (query) { gl.endQuery(timer.TIME_ELAPSED_EXT); profiler.queries.push(query); }
        if (started >= profiler.start) profiler.cpu.push(performance.now() - started);
        profiler.draw = { ...layer.renderer.info.render, programs: layer.renderer.info.programs?.length ?? 0 };
        return result;
      };
    }
    profiler.after = describe();
    instance.triggerRepaint();
    return profiler;
  }, variant);
}
async function restore(map, profiler) {
  return map.evaluate((instance, profiler) => {
    const { layer, objects, visibility, original, native } = profiler;
    if (native) instance.addLayer(layer);
    else { layer.render = original; layer.renderer.render = profiler.rendererOriginal; objects.forEach((object, index) => { object.visible = visibility[index]; }); }
    for (const query of profiler.queries) profiler.gl.deleteQuery(query);
    instance.triggerRepaint();
    const current = layer.scene.children.filter(object => object.isMesh || object.isLine);
    const restored = current.every((object, index) => object.visible === visibility[index]);
    if (!restored || !instance.getLayer(layer.id)) throw new Error('Runtime layer restoration failed');
    return { restored, before: profiler.before, after: profiler.after, cpu: profiler.cpu, draw: profiler.draw,
      scissor: profiler.scissor, scissorFallbacks: profiler.fallbacks, gpuTimerAvailable: profiler.gpuTimer, gpuMs: profiler.disjoint ? [] : profiler.gpu, gpuDisjoint: profiler.disjoint, gpuTiming: profiler.gpuTimer ? 'Available; not inserted into paired samples to avoid timing instrumentation bias' : 'Unavailable in this SwiftShader context' };
  }, profiler);
}
async function cpuTrace(browser, manifest, variant) {
  const current = await setup(browser, manifest, fixture, scenario, viewport, 'candidate');
  let profiler, client;
  try {
    profiler = await instrument(current.map, variant);
    await profiler.evaluate(value => { value.captureGpu = true; });
    client = await current.context.newCDPSession(current.page);
    await client.send('Profiler.enable'); await client.send('Profiler.setSamplingInterval', { interval: 1000 }); await client.send('Profiler.start');
    await current.map.evaluate((instance, pose) => new Promise(resolve => {
      const start = performance.now();
      const frame = time => { const elapsed = time - start; instance.jumpTo({ ...pose, bearing: elapsed / 1000 * 12 }); instance.triggerRepaint();
        if (elapsed >= 2000) resolve(); else requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
    }), scenario.pose);
    const { profile } = await client.send('Profiler.stop');
    await save('cpu-' + variant + '.cpuprofile', profile);
    const nodes = new Map(profile.nodes.map(node => [node.id, node])), counts = new Map();
    for (const id of profile.samples ?? []) {
      const frame = nodes.get(id)?.callFrame; if (!frame) continue;
      const key = frame.functionName + ' @ ' + frame.url + ':' + frame.lineNumber;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const gpu = await profiler.evaluate(value => ({ available: value.gpuTimer, disjoint: value.disjoint, milliseconds: value.disjoint ? [] : value.gpu }));
    return { variant, gpu: { ...gpu, statistics: stats(gpu.milliseconds) }, durationUs: profile.endTime - profile.startTime, samples: profile.samples?.length,
      topFrames: [...counts].sort((a, b) => b[1] - a[1]).slice(0, 15), diagnostics: current.diagnostics };
  } finally { if (profiler) await restore(current.map, profiler); await client?.detach(); await current.context.close(); }
}
let browser, server;
const results = [];
await mkdir(path.dirname(output), { recursive: true }); await mkdir(output);
const sourceDist = path.join(reference, 'artifacts/candidate-dist');
const buildHashes = await hashes(sourceDist);
assert(JSON.stringify(buildHashes) === JSON.stringify(frozen.sources.candidate.hashes), 'Frozen candidate A no longer matches its recorded hash');
await cp(sourceDist, path.join(output, 'dist'), { recursive: true, force: false, errorOnExist: true });
const manifest = { sources: { candidate: { directory: path.join(output, 'dist'), port: 3009 } } };
await save(prefix + '-manifest.json', { createdAt: new Date().toISOString(), settings, scenario, viewport, comparisons,
  sourceCandidateHashes: buildHashes, fixtureHash: hash(await readFile(path.join(reference, 'fixture.json'))),
  profileRunnerHash: hash(await readFile(fileURLToPath(import.meta.url))), acceptanceHarnessHash: hash(harnessSource),
  browserBinaryHash: hash(await readFile(chromium.executablePath())),
  methodology: 'Three alternating paired samples per ablation. Temporary scene visibility plus render CPU timer only. Same frozen production, viewport, pose, UI and scripted motion. CPU traces separate after timing samples.',
  limitations: ['Diagnostic only; does not change acceptance thresholds', 'SwiftShader synthetic scene, not hardware GPU/device FPS', 'CPU timer measures JavaScript submission, not asynchronous raster completion'] }, evidence);
try {
  server = await serve(manifest.sources.candidate.directory, 3009);
  browser = await chromium.launch({ executablePath: chromium.executablePath(), args: settings.browserArgs });
  await save(prefix + '-environment.json', { browser: browser.version(), node: process.version, os: release(),
    cpu: cpus()[0]?.model, logicalCpus: cpus().length }, evidence);
  for (const comparison of comparisons) for (let sample = 1; sample <= 3; sample++) {
    const pair = [];
    try {
      for (const variant of ['full', comparison]) {
        const current = await setup(browser, manifest, fixture, scenario, viewport, 'candidate');
        current.variant = variant; current.profiler = await instrument(current.map, variant);
        pair.push(current);
      }
      assert(JSON.stringify(pair[0].state.canvas) === JSON.stringify(pair[1].state.canvas) && sameCamera(pair[0].state.camera, pair[1].state.camera) &&
        pair[0].state.inspectorText === pair[1].state.inspectorText, 'Paired setup diverged');
      for (const current of sample % 2 ? pair : [...pair].reverse()) {
        await current.page.bringToFront();
        await current.profiler.evaluate(profiler => { profiler.start = performance.now() + 3000; profiler.cpu = []; });
        let deadline;
        const raw = await Promise.race([measure(current.map, scenario), new Promise((_resolve, reject) => {
          deadline = setTimeout(() => reject(new Error('Profile measurement deadline exceeded')), 45000);
        })]).finally(() => clearTimeout(deadline));
        if (scissorRun && sample === 1) {
          for (const pitch of [60, 75]) {
            await current.map.evaluate((instance, { pose, pitch }) => { instance.setMaxPitch(75); instance.jumpTo({ ...pose, pitch, bearing: 22.5 }); instance.triggerRepaint(); }, { pose: scenario.pose, pitch });
            await current.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            await current.page.screenshot({ path: path.join(output, current.variant + '-pitch' + pitch + '-bearing22.5.png') });
          }
          await current.map.evaluate((instance, pose) => { instance.setMaxPitch(60); instance.jumpTo(pose); }, scenario.pose);
        }
        const details = await restore(current.map, current.profiler); await current.profiler.dispose(); current.profiler = null;
        assert(!Object.values(current.diagnostics).some(values => values.length), 'Diagnostic or network guard failed');
        const result = { comparison, sample, variant: current.variant, frames: stats(raw.intervals),
          mapRenders: stats(raw.renderIntervals), cameraToRender: stats(raw.renderLatencies), layerCpu: stats(details.cpu),
          draw: details.draw, environment: current.state.environment, diagnostics: current.diagnostics, restored: details.restored,
          scissor: { frames: details.scissor.length, areaFraction: stats(details.scissor.map(row => row.fraction)), fallbacks: details.scissorFallbacks }, gpuTimerAvailable: details.gpuTimerAvailable, gpuTiming: details.gpuTiming };
        await save(comparison + '-' + sample + '-' + current.variant + '.json', { ...result, setup: current.state, before: details.before, after: details.after, raw, layerCpuRaw: details.cpu });
        results.push(result);
        console.log(comparison + ' sample' + sample + ' ' + current.variant + ': render p95=' + result.mapRenders.p95 + ', CPU p95=' + result.layerCpu.p95);
      }
    } finally { for (const current of pair) {
      if (current.profiler) { await restore(current.map, current.profiler); await current.profiler.dispose(); }
      await current.map.dispose(); await current.context.close();
    } }
  }
  const traces = [];
  for (const variant of ['full', scissorRun ? 'scissor' : 'native']) traces.push(await cpuTrace(browser, manifest, variant));
  const comparisonsResult = comparisons.map(comparison => {
    const median = (variant, metric) => percentile(results.filter(row => row.comparison === comparison && row.variant === variant).map(row => row[metric].p95).filter(value => value !== null), .5);
    const value = { comparison };
    for (const metric of ['frames', 'mapRenders', 'cameraToRender', 'layerCpu']) {
      const full = median('full', metric), ablated = median(comparison, metric);
      value[metric] = { full, ablated, ablatedToFull: full && ablated !== null ? ablated / full : null };
    }
    return value;
  });
  await save(prefix + '-result.json', { status: 'completed', finishedAt: new Date().toISOString(), comparisons: comparisonsResult,
    results, cpuTraces: traces, note: 'Component removal is a diagnostic ablation, not a valid visual optimization or acceptance pass.' }, evidence);
} catch (error) {
  await save(prefix + '-error.json', { at: new Date().toISOString(), error: String(error), stack: error.stack, completed: results.length }, evidence); throw error;
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}

