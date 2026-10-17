import { chromium } from 'playwright';
import { createServer } from 'vite';
import { readFile,writeFile } from 'node:fs/promises';
import { cpus,release } from 'node:os';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const output=path.dirname(fileURLToPath(import.meta.url)),parent=path.dirname(output),root=process.cwd();
const manifest=JSON.parse(await readFile(path.join(parent,'performance-candidate-v6/manifest.json'),'utf8'));
const {fixture,style,snapshot}=await import(path.join(parent,'performance-candidate-v6/fixtures-frozen.mjs'));
const sourceHashes={};for(const name of Object.keys(manifest.sources.candidate.hashes))sourceHashes[name]=createHash('sha256').update(await readFile(path.join(root,name))).digest('hex');
await writeFile(path.join(output,'aa-source-hashes.json'),JSON.stringify({sourceHashes,reference:manifest.sources.candidate.hashes,sameAsV6:JSON.stringify(sourceHashes)===JSON.stringify(manifest.sources.candidate.hashes)},null,2));
function findMap(){const el=document.querySelector('.maplibregl-map');let f=el[Object.keys(el).find(k=>k.startsWith('__reactFiber$'))];while(f){let h=f.memoizedState;while(h){if(typeof h.memoizedState?.current?.getPitch==='function')return h.memoizedState.current;h=h.next;}f=f.return;}throw Error('map unavailable');}
const stats=v=>{const s=[...v].sort((a,b)=>a-b);return {count:s.length,mean:s.reduce((a,b)=>a+b,0)/(s.length||1),median:s[Math.ceil(s.length*.5)-1]??null,p95:s[Math.ceil(s.length*.95)-1]??null,total:s.reduce((a,b)=>a+b,0)};};
const server=await createServer({server:{host:'127.0.0.1',port:3006,strictPort:true,hmr:false},clearScreen:false});
await server.listen();
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const all=[];
try{
 for(const item of [1,2].flatMap(sample=>(sample===1?['aa-off','aa-on']:['aa-on','aa-off']).map(variant=>({variant,sample,profile:false})))){
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,locale:'id-ID',timezoneId:'Asia/Jakarta'}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const r=route.request(),u=new URL(r.url());if(u.pathname.includes('/api/'))return route.fulfill({json:r.method()==='GET'?{data:[fixture.report],predictions:[]}:{error:'writes blocked'},status:r.method()==='GET'?200:405});if(u.hostname==='tiles.openfreemap.org'&&u.pathname.includes('/styles/'))return route.fulfill({json:style});if(r.resourceType()==='image')return route.fulfill({contentType:'image/svg+xml',body:snapshot});if(u.hostname==='unpkg.com'&&u.pathname.endsWith('maplibre-gl.css'))return route.fulfill({contentType:'text/css',path:path.join(root,'node_modules/maplibre-gl/dist/maplibre-gl.css')});if(!['127.0.0.1','localhost'].includes(u.hostname))return route.abort();return route.continue();});
  await page.addInitScript(antialias => { const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,options){ return original.call(this,type, /^(webgl2?|experimental-webgl)$/.test(type)?{...options,antialias}:options); }; }, item.variant==='aa-on');
  await page.goto('http://127.0.0.1:3006');
  await page.waitForFunction(`(()=>{try{const m=(${findMap.toString()})();return m.isStyleLoaded()&&!m.isMoving()}catch{return false}})()`);
  await page.getByRole('button',{name:'Lihat Lapangan 3D',exact:true}).click();await page.waitForFunction(`!(${findMap.toString()})().isMoving()`);
  const map=await page.evaluateHandle(`(${findMap.toString()})()`);
  await map.evaluate(map=>{map.stop();map.jumpTo({center:[106.8232,-6.1965],zoom:19.2,pitch:60,bearing:0});});
  const setup=await map.evaluate((map,variant)=>{
    const layer=map.getLayer('inspection-damage').implementation,renderer=layer.renderer,gl=map.getCanvas().getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');
    const stages={customRender:[],depthQueries:[],resetState:[],threeRender:[],easeTo:[]};window.diagnosticStages=stages;
    const originalRender=layer.render.bind(layer),originalParameter=gl.getParameter.bind(gl),originalReset=renderer.resetState.bind(renderer),originalThreeRender=renderer.render.bind(renderer),originalEase=map.easeTo.bind(map);
    const cached=originalParameter(gl.DEPTH_RANGE);let inLayer=false;
    gl.getParameter=function(p){if(inLayer&&p===gl.DEPTH_RANGE){const start=performance.now();const value=variant==='aa-off-cached'?cached:originalParameter(p);stages.depthQueries.push(performance.now()-start);return value;}return originalParameter(p);};
    renderer.resetState=function(){const start=performance.now();try{return originalReset();}finally{if(inLayer)stages.resetState.push(performance.now()-start);}};
    renderer.render=function(...args){const start=performance.now();try{return originalThreeRender(...args);}finally{if(inLayer)stages.threeRender.push(performance.now()-start);}};
    layer.render=function(...args){if(variant==='no-custom-draw')return;const start=performance.now();inLayer=true;try{return originalRender(...args);}finally{inLayer=false;stages.customRender.push(performance.now()-start);}};
    map.easeTo=function(...args){const start=performance.now();try{return originalEase(...args);}finally{stages.easeTo.push(performance.now()-start);}};
    return {variant,contextAttributes:gl.getContextAttributes(),samples:originalParameter(gl.SAMPLES),renderer:ext?originalParameter(ext.UNMASKED_RENDERER_WEBGL):null,canvas:[gl.canvas.clientWidth,gl.canvas.clientHeight],anchor:layer.options.anchor,widthM:layer.options.widthM,depthM:layer.options.depthM};
  },item.variant==='profile-full'?'full':item.variant);
  await page.getByRole('button',{name:'Putar Orbit 360°',exact:true}).click();
  await page.evaluate(()=>new Promise(resolve=>{const start=performance.now();const next=()=>performance.now()-start>=2500?resolve():requestAnimationFrame(next);requestAnimationFrame(next);}));
  await page.evaluate(()=>{for(const key in window.diagnosticStages)window.diagnosticStages[key]=[];});
  const cdp=item.profile?await context.newCDPSession(page):null;
  if(cdp){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');}
  const before=await map.evaluate(map=>({bearing:map.getBearing(),zoom:map.getZoom(),renderCount:map.getLayer('inspection-damage').implementation.getState().renderCount}));
  const measured=page.evaluate(ms=>new Promise(resolve=>{const intervals=[],latencies=[],pending=[];let previous=null;const start=performance.now();const listener=e=>{if(e.isTrusted)pending.push(performance.now());};window.addEventListener('pointermove',listener,true);const next=time=>{if(previous!==null)intervals.push(time-previous);previous=time;while(pending.length)latencies.push(performance.now()-pending.shift());if(time-start>=ms){window.removeEventListener('pointermove',listener,true);resolve({intervals,latencies,stages:window.diagnosticStages,elapsed:time-start});}else requestAnimationFrame(next);};requestAnimationFrame(next);}),item.profile?5000:10000);
  const box=await page.locator('.maplibregl-canvas').boundingBox(),x=box.x+box.width*.6,y=box.y+box.height*.65;
  const interaction=(async()=>{for(let tick=0;tick<(item.profile?5:10);tick++){await page.mouse.move(x+(tick%2?2:0),y);await new Promise(r=>setTimeout(r,1000));}})();
  const [raw]=await Promise.all([measured,interaction]);
  if(cdp){const {profile}=await cdp.send('Profiler.stop');await writeFile(path.join(output,'unchanged-cpu-profile.json'),JSON.stringify(profile));await cdp.detach();}
  const after=await map.evaluate(map=>({bearing:map.getBearing(),zoom:map.getZoom(),renderCount:map.getLayer('inspection-damage').implementation.getState().renderCount}));
  const result={...item,setup,before,after,frames:stats(raw.intervals),latency:stats(raw.latencies),stages:Object.fromEntries(Object.entries(raw.stages).map(([k,v])=>[k,stats(v)])),errors,raw};
  await writeFile(path.join(output,`${item.variant}-${item.sample}.json`),JSON.stringify(result,null,2));all.push({...result,raw:undefined});await writeFile(path.join(output,'aa-summary.json'),JSON.stringify({diagnosticOnly:true,environment:{node:process.version,cpu:cpus()[0].model,os:release(),browser:browser.version()},results:all},null,2));
  console.log(JSON.stringify({variant:item.variant,sample:item.sample,p95:result.frames.p95,stages:result.stages}));await context.close();
 }
}finally{await browser.close();await server.close();}

