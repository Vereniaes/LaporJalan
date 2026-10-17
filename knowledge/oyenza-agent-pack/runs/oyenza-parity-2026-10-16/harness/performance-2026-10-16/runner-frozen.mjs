// Measure paired synthetic scenarios with real RAF time; never infer device FPS.
import { chromium } from 'playwright';
import { createServer } from 'vite';
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { tmpdir, cpus, release } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/performance-2026-10-16');
const manifestPath = path.join(output, 'manifest.json');
const settings = { samples: 3, sampleMs: 30000, warmupMs: 5000, dpr: 1, threshold: 1.20,
  viewports: [{ width: 1440, height: 900 }, { width: 390, height: 844 }],
  scenarios: ['idle', 'inspection-orbit', 'pan-in-inspection'],
  pose: { center: [106.8232, -6.1965], zoom: 19.2, pitch: 60, bearing: 0 },
  note: 'Same synthetic inputs and calibrated equal camera pose. Baseline has decorative buildings; candidate uses new cavity. Real tiles, mapped-road workloads, production build and device FPS are not measured.',
  latency: 'Trusted pointer events to first subsequent browser RAF callback; idle/orbit hover by 2px each second, inspection-pan drags by 40px each second. This is browser event-to-frame scheduling, not display presentation latency.' };
const hash = data => createHash('sha256').update(data).digest('hex');
async function hashes(directory, prefix = '') {
  const result = {};
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    if (['node_modules', '.vite-benchmark'].includes(entry.name)) continue;
    const relative = path.join(prefix, entry.name), full = path.join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(result, await hashes(full, relative));
    else if (entry.isFile()) result[relative] = hash(await readFile(full));
  }
  return result;
}
async function prepare() {
  await mkdir(output, { recursive: true });
  try { await readFile(manifestPath); throw new Error('Manifest already exists; refusing to replace frozen copies'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temp = await mkdtemp(path.join(tmpdir(), 'laporjalan-performance-'));
  const sources = {};
  for (const [name, source, port] of [['baseline', path.join(root,'knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/before'),3004], ['candidate',root,3005]]) {
    const target = path.join(temp,name);
    await mkdir(target);
    for (const file of ['src','index.html','package.json','package-lock.json','vite.config.ts','tsconfig.json','tsconfig.node.json','tailwind.config.js','postcss.config.js']) {
      await cp(path.join(source,file),path.join(target,file),{recursive:true});
    }
    await symlink(path.join(root,'node_modules'),path.join(target,'node_modules'),'dir');
    sources[name] = { root: target, port, hashes: await hashes(target) };
  }
  const fixtureSource = await readFile(path.join(root,'tests/fixtures.ts'),'utf8');
  await writeFile(path.join(output,'fixtures-frozen.mjs'),ts.transpileModule(fixtureSource,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText);
  const manifest = { createdAt:new Date().toISOString(), settings, sources,
    fixtureSourceHash:hash(fixtureSource), runnerHash:hash(await readFile(fileURLToPath(import.meta.url))),
    fixtureModuleHash:hash(await readFile(path.join(output,'fixtures-frozen.mjs'))) };
  await writeFile(manifestPath,JSON.stringify(manifest,null,2));
  console.log(`Prepared frozen copies at ${temp}; measurements NOT started.`);
}
// Traverse only the map owner's existing React ref; no app instrumentation.
function findMap() {
  const element=document.querySelector('.maplibregl-map');
  const key=element && Object.keys(element).find(key=>key.startsWith('__reactFiber$'));
  let fiber=key && element[key];
  while(fiber) {
    let hook=fiber.memoizedState;
    while(hook) { if(typeof hook.memoizedState?.current?.getPitch==='function') return hook.memoizedState.current; hook=hook.next; }
    fiber=fiber.return;
  }
  throw new Error('Map ref not ready');
}
const percentile = (values,p) => { const sorted=[...values].sort((a,b)=>a-b); return sorted.length?sorted[Math.ceil(sorted.length*p)-1]:null; };
function statistics(values) { return { count:values.length, median:percentile(values,.5), p95:percentile(values,.95) }; }
async function run() {
  const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  if(JSON.stringify(manifest.settings)!==JSON.stringify(settings)) throw new Error('Settings differ from frozen manifest');
  for(const source of Object.values(manifest.sources)) {
    if(JSON.stringify(await hashes(source.root))!==JSON.stringify(source.hashes)) throw new Error('Frozen source hash mismatch');
  }
  if(hash(await readFile(fileURLToPath(import.meta.url)))!==manifest.runnerHash) throw new Error('Runner changed after freeze');
  if(hash(await readFile(path.join(output,'fixtures-frozen.mjs')))!==manifest.fixtureModuleHash) throw new Error('Frozen fixture changed');
  const { fixture,style,snapshot }=await import(path.join(output,'fixtures-frozen.mjs'));
  const servers=[];
  let browser;
  const results=[];
  await writeFile(path.join(output,'started.json'),JSON.stringify({startedAt:new Date().toISOString(),settings},null,2),{flag:'wx'});
  try {
    for(const source of Object.values(manifest.sources)) {
      const server=await createServer({root:source.root,configFile:path.join(source.root,'vite.config.ts'),cacheDir:path.join(source.root,'.vite-benchmark'),server:{host:'127.0.0.1',port:source.port,strictPort:true,hmr:false},clearScreen:false});
      await server.listen(); servers.push(server);
    }
    browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    for(const viewport of settings.viewports) for(const scenario of settings.scenarios) for(let sample=0;sample<settings.samples;sample++) {
      // Alternate ordering to limit consistent warmup/thermal bias.
      for(const name of sample%2?['candidate','baseline']:['baseline','candidate']) {
        const source=manifest.sources[name];
        const context=await browser.newContext({viewport,deviceScaleFactor:1,locale:'id-ID',timezoneId:'Asia/Jakarta',isMobile:viewport.width===390,hasTouch:viewport.width===390});
        const page=await context.newPage();
        const errors=[]; page.on('pageerror',error=>errors.push(error.message));
        await page.route('**/*',route=> {
          const request=route.request(),url=new URL(request.url());
          if(url.pathname.includes('/api/')) return route.fulfill({json:request.method()==='GET'?{data:[fixture.report],predictions:[]}:{error:'benchmark writes blocked'},status:request.method()==='GET'?200:405});
          if(url.hostname==='tiles.openfreemap.org' && url.pathname.includes('/styles/')) return route.fulfill({json:style});
          if(request.resourceType()==='image') return route.fulfill({contentType:'image/svg+xml',body:snapshot});
          if(url.hostname==='unpkg.com' && url.pathname.endsWith('maplibre-gl.css')) return route.fulfill({contentType:'text/css',path:path.join(root,'node_modules/maplibre-gl/dist/maplibre-gl.css')});
          if(!['127.0.0.1','localhost'].includes(url.hostname)) return route.abort();
          return route.continue();
        });
        await page.goto(`http://127.0.0.1:${source.port}`);
        await page.waitForFunction(`(() => {try {const m=(${findMap.toString()})(); return m.isStyleLoaded()&&!m.isMoving()} catch{return false}})()`);
        if(scenario!=='idle') {
          await page.getByRole('button',{name:'Lihat Lapangan 3D'}).click();
          await page.waitForFunction(`!(${findMap.toString()})().isMoving()`);
        }
        await page.evaluate(({find,pose})=>{const map=(0,eval)(`(${find})`)();map.stop();map.jumpTo(pose);}, {find:findMap.toString(),pose:settings.pose});
        if(scenario==='inspection-orbit') await page.getByRole('button',{name:'Putar Orbit 360°'}).click();
        const environment=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return {webgl2:!!gl,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,dpr:devicePixelRatio};});
        // Warm the scenario using real RAF timestamps, without a fake clock.
        await page.evaluate(ms=>new Promise(resolve=>{const start=performance.now();const frame=()=>performance.now()-start>=ms?resolve():requestAnimationFrame(frame);requestAnimationFrame(frame);}),settings.warmupMs);
        const box=await page.locator('.maplibregl-canvas').boundingBox();
        const x=box.x+box.width*.6,y=box.y+(viewport.width===390?Math.min(box.height-20,350):box.height*.65);
        const measurement=page.evaluate(ms=>new Promise(resolve=>{
          const intervals=[],latencies=[],pending=[];let previous=null;const start=performance.now();
          const record=()=>pending.push(performance.now());
          for(const event of ['pointerdown','pointermove','wheel']) window.addEventListener(event,record,true);
          const frame=time=>{
            if(previous!==null) intervals.push(time-previous);previous=time;
            while(pending.length) latencies.push(performance.now()-pending.shift());
            if(time-start>=ms){for(const event of ['pointerdown','pointermove','wheel']) window.removeEventListener(event,record,true);resolve({intervals,latencies,elapsedMs:time-start});}
            else requestAnimationFrame(frame);
          };requestAnimationFrame(frame);
        }),settings.sampleMs);
        const interaction=(async()=>{
          for(let tick=0;tick<settings.sampleMs/1000;tick++) {
            if(scenario==='pan-in-inspection') {await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+(tick%2?40:-40),y,{steps:5});await page.mouse.up();}
            else await page.mouse.move(x+(tick%2?2:0),y);
            await new Promise(resolve=>setTimeout(resolve,1000));
          }
        })();
        const [raw]=await Promise.all([measurement,interaction]);
        if(raw.intervals.length<2 || raw.latencies.length<1) throw new Error('Insufficient frame/input samples');
        const result={name,viewport,scenario,sample:sample+1,at:new Date().toISOString(),environment,elapsedMs:raw.elapsedMs,frames:statistics(raw.intervals),inputLatency:statistics(raw.latencies),errors};
        await writeFile(path.join(output,`${name}-${viewport.width}-${scenario}-${sample+1}.json`),JSON.stringify({...result,raw},null,2));
        results.push(result);await writeFile(path.join(output,'progress.json'),JSON.stringify(results,null,2));
        console.log(`${name} ${viewport.width} ${scenario} sample${sample+1}: p95=${result.frames.p95}`);
        await context.close();
      }
    }
    const comparisons=[];
    for(const viewport of settings.viewports) for(const scenario of settings.scenarios) {
      const grouped=name=>results.filter(result=>result.name===name&&result.viewport.width===viewport.width&&result.scenario===scenario);
      const baseline=percentile(grouped('baseline').map(result=>result.frames.p95),.5),candidate=percentile(grouped('candidate').map(result=>result.frames.p95),.5);
      comparisons.push({viewport,scenario,baselineMedianSampleP95:baseline,candidateMedianSampleP95:candidate,ratio:candidate/baseline,status:candidate<=settings.threshold*baseline?'passed':'failed'});
    }
    await writeFile(path.join(output,'result.json'),JSON.stringify({status:comparisons.every(c=>c.status==='passed')?'passed':'failed',finishedAt:new Date().toISOString(),environment:{node:process.version,os:release(),cpu:cpus()[0].model,browser:browser.version()},settings,comparisons,results,limitations:['SwiftShader synthetic fixture only','Real map tiles and mapped-road performance unmeasured','RAF scheduling is not presentation FPS or total GPU/heap memory']},null,2));
  } catch(error) {
    await writeFile(path.join(output,'error.json'),JSON.stringify({at:new Date().toISOString(),error:String(error),stack:error.stack,completedSamples:results.length},null,2));throw error;
  } finally {await browser?.close();for(const server of servers) await server.close();}
}
if(process.argv.includes('--prepare')) await prepare();
else if(process.argv.includes('--run')) await run();
else console.log('Use --prepare to freeze copies without measurement; --run only after root confirms benchmarks may start.');
