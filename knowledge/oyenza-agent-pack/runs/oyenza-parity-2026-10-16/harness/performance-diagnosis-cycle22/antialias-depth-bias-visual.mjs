import { chromium } from 'playwright';
import { readFile,writeFile } from 'node:fs/promises';
import { cpus,release } from 'node:os';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const output=path.dirname(fileURLToPath(import.meta.url)),parent=path.dirname(output),root=process.cwd();
const manifest=JSON.parse(await readFile(path.join(parent,'performance-candidate-v5/manifest.json'),'utf8'));
const {fixture,style,snapshot}=await import(path.join(parent,'performance-candidate-v5/fixtures-frozen.mjs'));
const sourceHashes={};for(const name of Object.keys(manifest.sources.candidate.hashes))sourceHashes[name]=createHash('sha256').update(await readFile(path.join(root,name))).digest('hex');
await writeFile(path.join(output,'aa-bias-source-hashes.json'),JSON.stringify({sourceHashes,reference:manifest.sources.candidate.hashes,sameAsV5:JSON.stringify(sourceHashes)===JSON.stringify(manifest.sources.candidate.hashes)},null,2));
function findMap(){const el=document.querySelector('.maplibregl-map');let f=el[Object.keys(el).find(k=>k.startsWith('__reactFiber$'))];while(f){let h=f.memoizedState;while(h){if(typeof h.memoizedState?.current?.getPitch==='function')return h.memoizedState.current;h=h.next;}f=f.return;}throw Error('map unavailable');}
const stats=v=>{const s=[...v].sort((a,b)=>a-b);return {count:s.length,mean:s.reduce((a,b)=>a+b,0)/(s.length||1),median:s[Math.ceil(s.length*.5)-1]??null,p95:s[Math.ceil(s.length*.95)-1]??null,total:s.reduce((a,b)=>a+b,0)};};
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const all=[];
try{
 for(const item of [{variant:'aa-off-full',sample:1,viewport:{width:1440,height:900}},{variant:'aa-off-full',sample:2,viewport:{width:390,height:844}}]){
  const context=await browser.newContext({viewport:item.viewport,deviceScaleFactor:1,isMobile:item.viewport.width===390,hasTouch:item.viewport.width===390,locale:'id-ID',timezoneId:'Asia/Jakarta'}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const r=route.request(),u=new URL(r.url());if(u.pathname.includes('/api/'))return route.fulfill({json:r.method()==='GET'?{data:[fixture.report],predictions:[]}:{error:'writes blocked'},status:r.method()==='GET'?200:405});if(u.hostname==='tiles.openfreemap.org'&&u.pathname.includes('/styles/'))return route.fulfill({json:style});if(r.resourceType()==='image')return route.fulfill({contentType:'image/svg+xml',body:snapshot});if(u.hostname==='unpkg.com'&&u.pathname.endsWith('maplibre-gl.css'))return route.fulfill({contentType:'text/css',path:path.join(root,'node_modules/maplibre-gl/dist/maplibre-gl.css')});if(!['127.0.0.1','localhost'].includes(u.hostname))return route.abort();return route.continue();});
  await page.addInitScript(() => { const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,options){ return original.call(this,type, /^(webgl2?|experimental-webgl)$/.test(type)?{...options,antialias:false}:options); }; });
  await page.goto('http://127.0.0.1:3002');
  await page.waitForFunction(`(()=>{try{const m=(${findMap.toString()})();return m.isStyleLoaded()&&!m.isMoving()}catch{return false}})()`);
  await page.getByRole('button',{name:'Lihat Lapangan 3D',exact:true}).click();await page.waitForFunction(`!(${findMap.toString()})().isMoving()`);
  const map=await page.evaluateHandle(`(${findMap.toString()})()`);
  
  const setup=await map.evaluate((map,variant)=>{
    const layer=map.getLayer('inspection-damage').implementation,renderer=layer.renderer,gl=map.getCanvas().getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');
    const stages={customRender:[],depthQueries:[],resetState:[],threeRender:[],easeTo:[]};window.diagnosticStages=stages;
    const originalRender=layer.render.bind(layer),originalParameter=gl.getParameter.bind(gl),originalReset=renderer.resetState.bind(renderer),originalThreeRender=renderer.render.bind(renderer),originalEase=map.easeTo.bind(map);
    const cached=originalParameter(gl.DEPTH_RANGE);let inLayer=false;
    for(const material of layer.materials){if(material.isMeshStandardMaterial){material.polygonOffset=true;material.polygonOffsetFactor=1;material.polygonOffsetUnits=1;material.needsUpdate=true;}}
    gl.getParameter=function(p){if(inLayer&&p===gl.DEPTH_RANGE){const start=performance.now();const value=variant==='aa-off-cached'?cached:originalParameter(p);stages.depthQueries.push(performance.now()-start);return value;}return originalParameter(p);};
    renderer.resetState=function(){const start=performance.now();try{return originalReset();}finally{if(inLayer)stages.resetState.push(performance.now()-start);}};
    renderer.render=function(...args){const start=performance.now();try{return originalThreeRender(...args);}finally{if(inLayer)stages.threeRender.push(performance.now()-start);}};
    layer.render=function(...args){if(variant==='no-custom-draw')return;const start=performance.now();inLayer=true;try{return originalRender(...args);}finally{inLayer=false;stages.customRender.push(performance.now()-start);}};
    map.easeTo=function(...args){const start=performance.now();try{return originalEase(...args);}finally{stages.easeTo.push(performance.now()-start);}};
    return {variant,contextAttributes:gl.getContextAttributes(),samples:originalParameter(gl.SAMPLES),renderer:ext?originalParameter(ext.UNMASKED_RENDERER_WEBGL):null,canvas:[gl.canvas.clientWidth,gl.canvas.clientHeight],anchor:layer.options.anchor,widthM:layer.options.widthM,depthM:layer.options.depthM};
  },item.variant==='profile-full'?'full':item.variant);
  await map.evaluate(map=>new Promise(resolve=>{map.once('render',resolve);map.triggerRepaint();}));
  await page.screenshot({path:path.join(output,`aa-off-depth-bias-${item.viewport.width}.png`)});
  const state=await map.evaluate(map=>({zoom:map.getZoom(),pitch:map.getPitch(),center:map.getCenter().toArray(),inspection:map.getLayer('inspection-damage').implementation.getState()}));
  await writeFile(path.join(output,`aa-off-depth-bias-${item.viewport.width}.json`),JSON.stringify({diagnosticOnly:true,bias:{target:'solid bowl material',polygonOffset:true,factor:1,units:1},viewport:item.viewport,setup,state,errors},null,2));
  console.log(JSON.stringify({viewport:item.viewport,setup,zoom:state.zoom}));await context.close();
 }
}finally{await browser.close();}

