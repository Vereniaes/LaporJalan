// Diagnostic only: compare public canvas pixel ratios without editing the app.
import { chromium } from 'playwright';
import ts from 'typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = process.cwd();
const output = fileURLToPath(new URL('./', import.meta.url));
await mkdir(output, { recursive: true });
const fixtureModule = ts.transpileModule(await readFile('tests/fixtures.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { fixture, snapshot } = await import(`data:text/javascript;base64,${Buffer.from(fixtureModule).toString('base64')}`);
const hash = value => createHash('sha256').update(value).digest('hex');
const files = ['src/App.tsx', 'src/components/Map3D.tsx', 'src/map/DamageLayer.ts', 'src/map/damageMaterial.ts', 'src/index.css', 'tests/fixtures.ts', 'tests/helpers/map.ts'];
const manifest = { startedAt: new Date().toISOString(), node: process.version, sourceHashes: {},
  reuse: 'Fixture report/snapshot from tests/fixtures.ts; read-only React map-handle discovery adapted from tests/helpers/map.ts; launch flags match existing harness. No oracle changed.',
  server: 'Own Vite on 127.0.0.1:3006; user server3000 untouched', trace: false, results: [] };
for (const file of files) manifest.sourceHashes[file] = hash(await readFile(file));
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '3006', '--strictPort'], { cwd: root, stdio: 'pipe' });
let serverOutput = '';
server.stdout.on('data', data => { serverOutput += data; });
server.stderr.on('data', data => { serverOutput += data; });
let browser;
try {
  const deadline = Date.now() + 15000;
  while (true) {
    try { if ((await fetch('http://127.0.0.1:3006')).ok) break; } catch {}
    if (Date.now() > deadline || server.exitCode !== null) throw new Error('Diagnostic server not ready');
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  manifest.browser = browser.version();
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    for (const variant of [{ id: 'aa-on-native', aa: true, ratio: 1 }, { id: 'aa-off-native', aa: false, ratio: 1 }, { id: 'aa-off-ratio15', aa: false, ratio: 1.5 }]) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: viewport.width === 390, hasTouch: viewport.width === 390, locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
      const result = { viewport, variant, errors: [], networkFailures: [] };
      page.on('pageerror', error => result.errors.push(String(error)));
      page.on('requestfailed', request => result.networkFailures.push({ origin: new URL(request.url()).origin, error: request.failure()?.errorText }));
      try {
        await page.addInitScript(antialias => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, options, ...rest) {
            return original.call(this, type, (type === 'webgl2' || type === 'webgl') ? { ...options, antialias } : options, ...rest);
          };
        }, variant.aa);
        await page.route('**/api/**', route => route.request().method() === 'GET'
          ? route.fulfill({ json: { data: [fixture.report, { ...fixture.report, id: 'fixture-second', title: 'Fixture second report', lng: 106.824 }] } })
          : route.fulfill({ status: 405, body: 'Diagnostic prevents writes' }));
        await page.route('**/*', route => route.request().resourceType() === 'image'
          ? route.fulfill({ contentType: 'image/svg+xml', body: snapshot }) : route.fallback());
        await page.goto('http://127.0.0.1:3006', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(() => !!document.querySelector('.maplibregl-map'), { timeout: 30000 });
        const map = await page.evaluateHandle(() => {
          const container = document.querySelector('.maplibregl-map');
          const key = Object.keys(container).find(key => key.startsWith('__reactFiber$'));
          for (let fiber = container[key]; fiber; fiber = fiber.return) {
            for (let hook = fiber.memoizedState; hook; hook = hook.next) {
              const value = hook.memoizedState?.current;
              if (value && typeof value.getPitch === 'function') return value;
            }
          }
          throw new Error('Map handle unavailable');
        });
        const readyDeadline = Date.now() + 30000;
        while (!(await map.evaluate(map => map.isStyleLoaded() && !map.isMoving()))) {
          if (Date.now() > readyDeadline) throw new Error('Map readiness timeout');
          await page.waitForTimeout(100);
        }
        await map.evaluate((map, ratio) => {
          map.setPixelRatio(ratio);
          map.jumpTo({ center: [106.8232, -6.1965], zoom: 16.5, pitch: 56, bearing: -17 });
          map.triggerRepaint();
        }, variant.ratio);
        const settleDeadline = Date.now() + 20000;
        while (!(await map.evaluate(map => map.areTilesLoaded() && !map.isMoving()))) {
          if (Date.now() > settleDeadline) throw new Error('City tile readiness timeout');
          await page.waitForTimeout(100);
        }
        await page.waitForTimeout(600);
        result.state = await map.evaluate(map => {
          const canvas = map.getCanvas(), gl = canvas.getContext('webgl2');
          return { center: map.getCenter().toArray(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing(), padding: map.getPadding(),
            pixelRatio: map.getPixelRatio(), attributes: gl.getContextAttributes(), samples: gl.getParameter(gl.SAMPLES),
            drawingBuffer: [gl.drawingBufferWidth, gl.drawingBufferHeight], cssSize: [canvas.clientWidth, canvas.clientHeight],
            sourceIds: Object.keys(map.getStyle().sources), buildingFeatures: map.getSource('openmaptiles') ? map.querySourceFeatures('openmaptiles', { sourceLayer: 'building' }).length : 0 };
        });
        result.image = `${variant.id}-${viewport.width}.png`;
        await page.screenshot({ path: `${output}${result.image}`, animations: 'disabled' });
        await map.dispose();
        console.log(`${variant.id} ${viewport.width}: captured ${result.state.buildingFeatures} building features`);
      } catch (error) { result.error = String(error); console.log(`${variant.id} ${viewport.width}: ${error}`); }
      finally { await page.close(); manifest.results.push(result); await writeFile(`${output}results.json`, JSON.stringify(manifest, null, 2)); }
    }
  }
} catch (error) { manifest.error = String(error); process.exitCode = 1; }
finally {
  await browser?.close();
  server.kill('SIGTERM');
  await new Promise(resolve => { if (server.exitCode !== null) resolve(); else { server.once('exit', resolve); setTimeout(resolve, 3000); } });
  manifest.cleanup = { ownServerExitCode: server.exitCode, ownServerSignal: server.signalCode, browserClosed: !!browser, userServerUntouched: true };
  manifest.finishedAt = new Date().toISOString();
  manifest.sourceHashesAfter = {};
  for (const file of files) manifest.sourceHashesAfter[file] = hash(await readFile(file));
  manifest.sourceUnchanged = JSON.stringify(manifest.sourceHashes) === JSON.stringify(manifest.sourceHashesAfter);
  await writeFile(`${output}server.log`, serverOutput);
  await writeFile(`${output}results.json`, JSON.stringify(manifest, null, 2));
}
