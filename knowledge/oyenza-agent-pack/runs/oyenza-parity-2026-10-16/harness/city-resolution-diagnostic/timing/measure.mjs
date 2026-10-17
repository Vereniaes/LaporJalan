// Diagnostic only: paired real-city scheduling observations, not acceptance.
import { chromium } from 'playwright';
import ts from 'typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = process.cwd(), output = fileURLToPath(new URL('./', import.meta.url));
await mkdir(output, { recursive: true });
const compiled = ts.transpileModule(await readFile('tests/fixtures.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { fixture, snapshot } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const hash = value => createHash('sha256').update(value).digest('hex');
const files = ['src/App.tsx', 'src/components/Map3D.tsx', 'src/map/DamageLayer.ts', 'src/map/damageMaterial.ts', 'src/index.css', 'tests/fixtures.ts', 'tests/helpers/map.ts'];
const report = { startedAt: new Date().toISOString(), node: process.version, diagnostic: true, acceptance: 'not assessed',
  reuse: 'capture.mjs fixture transpilation, routing, getContext override, map-handle discovery, context observations and owned-server cleanup; existing harness Chromium flags',
  settings: { browserDpr: 1, samplesPerVariantViewport: 2, warmupMs: 2500, sampleMs: 10000, trace: false,
    pose: { center: [106.8232, -6.1965], zoom: 16.5, pitch: 56, bearing: -17 },
    trajectory: 'warmup and sample each restart at -17deg; bearing=-17+elapsedMs*0.002 (20deg over10s), duration0 easeTo around fixed center each RAF',
    order: ['reference', 'ssaa', 'ssaa', 'reference'], input: 'No trusted pointer-input measurement; RAF scheduling only' },
  sourceHashes: {}, samples: [] };
for (const file of files) report.sourceHashes[file] = hash(await readFile(file));
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '3006', '--strictPort'], { cwd: root, stdio: 'pipe' });
let serverOutput = '';
server.stdout.on('data', data => { serverOutput += data; }); server.stderr.on('data', data => { serverOutput += data; });
let browser;
const summarize = values => {
  const sorted = [...values].sort((a,b) => a-b);
  return { count: values.length, median: sorted[Math.floor(sorted.length * .5)] ?? null,
    p95: sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * .95) - 1)] ?? null };
};
try {
  const deadline = Date.now() + 15000;
  while (true) {
    try { if ((await fetch('http://127.0.0.1:3006')).ok) break; } catch {}
    if (Date.now() > deadline || server.exitCode !== null) throw new Error('Owned server not ready');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  report.browser = browser.version();
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    for (const [orderIndex, name] of report.settings.order.entries()) {
      const aa = name === 'reference', ratio = aa ? 1 : 1.5;
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: viewport.width === 390, hasTouch: viewport.width === 390, locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
      const result = { viewport, orderIndex, name, aa, ratio, errors: [] };
      page.on('pageerror', error => result.errors.push(String(error)));
      try {
        await page.addInitScript(antialias => {
          const get = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function(type, options, ...rest) {
            return get.call(this, type, (type === 'webgl2' || type === 'webgl') ? { ...options, antialias } : options, ...rest);
          };
        }, aa);
        await page.route('**/api/**', route => route.request().method() === 'GET'
          ? route.fulfill({ json: { data: [fixture.report, { ...fixture.report, id: 'fixture-second', title: 'Fixture second report', lng: 106.824 }] } })
          : route.fulfill({ status: 405, body: 'Diagnostic prevents writes' }));
        await page.route('**/*', route => route.request().resourceType() === 'image' ? route.fulfill({ contentType: 'image/svg+xml', body: snapshot }) : route.fallback());
        await page.goto('http://127.0.0.1:3006', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('.maplibregl-map');
        const map = await page.evaluateHandle(() => {
          const container = document.querySelector('.maplibregl-map');
          const key = Object.keys(container).find(key => key.startsWith('__reactFiber$'));
          for (let fiber = container[key]; fiber; fiber = fiber.return) for (let hook = fiber.memoizedState; hook; hook = hook.next) {
            const value = hook.memoizedState?.current;
            if (value && typeof value.getPitch === 'function') return value;
          }
          throw new Error('Map handle unavailable');
        });
        const readyUntil = Date.now() + 30000;
        while (!(await map.evaluate(map => map.isStyleLoaded() && !map.isMoving()))) {
          if (Date.now() > readyUntil) throw new Error('Readiness timeout'); await page.waitForTimeout(100);
        }
        await map.evaluate((map, ratio) => { map.setPixelRatio(ratio); map.jumpTo({ center: [106.8232,-6.1965], zoom: 16.5, pitch: 56, bearing: -17 }); }, ratio);
        const tilesUntil = Date.now() + 20000;
        while (!(await map.evaluate(map => map.areTilesLoaded()))) {
          if (Date.now() > tilesUntil) throw new Error('Tiles timeout'); await page.waitForTimeout(100);
        }
        result.before = await map.evaluate(map => {
          const c = map.getCanvas(), gl = c.getContext('webgl2');
          return { attrs: gl.getContextAttributes(), samples: gl.getParameter(gl.SAMPLES), buffer: [c.width,c.height], css: [c.clientWidth,c.clientHeight],
            pixelRatio: map.getPixelRatio(), features: map.querySourceFeatures('openmaptiles', { sourceLayer: 'building' }).length };
        });
        result.measurement = await map.evaluate(async (map, settings) => {
          const orbit = duration => new Promise(resolve => {
            map.jumpTo({ center: [106.8232,-6.1965], zoom: 16.5, pitch: 56, bearing: -17 });
            const start = performance.now(), raw = []; let previous = null;
            const step = now => {
              if (previous !== null) raw.push(now - previous);
              previous = now;
              const elapsed = now - start;
              map.easeTo({ bearing: -17 + Math.min(elapsed, duration) * .002, around: [106.8232,-6.1965], duration: 0 });
              if (elapsed < duration) requestAnimationFrame(step);
              else resolve({ elapsedMs: elapsed, frameIntervalsMs: raw, endBearing: map.getBearing(), sourceReady: map.areTilesLoaded() });
            };
            requestAnimationFrame(step);
          });
          await orbit(settings.warmupMs);
          return orbit(settings.sampleMs);
        }, report.settings);
        result.summary = summarize(result.measurement.frameIntervalsMs);
        await map.dispose();
        console.log(`${viewport.width} ${orderIndex} ${name}: p95=${result.summary.p95},frames=${result.summary.count}`);
      } catch (error) { result.error = String(error); console.log(`${viewport.width} ${name}: ${error}`); }
      finally { await page.close(); report.samples.push(result); await writeFile(`${output}results.json`, JSON.stringify(report,null,2)); }
    }
  }
} catch (error) { report.error = String(error); process.exitCode = 1; }
finally {
  await browser?.close(); server.kill('SIGTERM');
  await new Promise(resolve => { if (server.exitCode !== null) resolve(); else { server.once('exit', resolve); setTimeout(resolve,3000); } });
  report.cleanup = { browserClosed: !!browser, ownServerExitCode: server.exitCode, ownServerSignal: server.signalCode, userServerUntouched: true };
  report.finishedAt = new Date().toISOString(); report.sourceHashesAfter = {};
  for (const file of files) report.sourceHashesAfter[file] = hash(await readFile(file));
  report.sourceUnchanged = JSON.stringify(report.sourceHashes) === JSON.stringify(report.sourceHashesAfter);
  await writeFile(`${output}results.json`,JSON.stringify(report,null,2)); await writeFile(`${output}server.log`,serverOutput);
}
