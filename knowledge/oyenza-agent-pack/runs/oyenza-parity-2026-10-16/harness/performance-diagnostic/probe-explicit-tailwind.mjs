import { chromium } from 'playwright';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const output=path.dirname(fileURLToPath(import.meta.url));
const parent=path.dirname(output), manifest=JSON.parse(await readFile(path.join(parent,'performance-candidate-v4/manifest.json'),'utf8'));
const {fixture,style,snapshot}=await import(path.join(parent,'performance-candidate-v4/fixtures-frozen.mjs'));
const source=manifest.sources.baseline;
const tw = (await import(path.join(source.root,'tailwind.config.js'))).default;
const server=await createServer({root:source.root,configFile:false,plugins:[react()],css:{postcss:{plugins:[tailwind({...tw,content:[path.join(source.root,'index.html'),path.join(source.root,'src/**/*.{js,ts,jsx,tsx}')]}),autoprefixer()]}},cacheDir:path.join(output,'vite-cache-explicit'),server:{host:'127.0.0.1',port:3004,strictPort:true,hmr:false},clearScreen:false});
let browser;
try {
 await server.listen();browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,locale:'id-ID',timezoneId:'Asia/Jakarta'});
 await page.route('**/*',route=>{
  const r=route.request(),u=new URL(r.url());
  if(u.pathname.includes('/api/'))return route.fulfill({json:{data:[fixture.report],predictions:[]}});
  if(u.hostname==='tiles.openfreemap.org'&&u.pathname.includes('/styles/'))return route.fulfill({json:style});
  if(r.resourceType()==='image')return route.fulfill({contentType:'image/svg+xml',body:snapshot});
  if(u.hostname==='unpkg.com'&&u.pathname.endsWith('maplibre-gl.css'))return route.fulfill({contentType:'text/css',path:path.resolve('node_modules/maplibre-gl/dist/maplibre-gl.css')});
  if(!['127.0.0.1','localhost'].includes(u.hostname))return route.abort();return route.continue();
 });
 await page.goto('http://127.0.0.1:3004');await page.locator('#b-3d').waitFor();
 const box=await page.locator('.maplibregl-canvas').boundingBox();
 const samples=[];
 for(const mode of ['original-names','event-instance-names']) {
  const measurement=page.evaluate(({ms,mode})=>new Promise(resolve=>{
   const intervals=[],latencies=[],pending=[],events=[];let previous=null;const start=performance.now();
   const record=event=>{pending.push(performance.now());events.push({type:event.type,trusted:event.isTrusted,at:performance.now()});};
   const names=mode==='original-names'?['pointerdown','pointermove','wheel']:['pointerdown','pointermove','mousemove','wheel'];
   for(const event of names)window.addEventListener(event,record,true);
   const frame=time=>{if(previous!==null)intervals.push(time-previous);previous=time;while(pending.length)latencies.push(performance.now()-pending.shift());
    if(time-start>=ms){for(const event of names)window.removeEventListener(event,record,true);resolve({intervals,latencies,events,elapsed:time-start});}else requestAnimationFrame(frame);};requestAnimationFrame(frame);
  }),{ms:3000,mode});
  const interaction=(async()=>{for(let tick=0;tick<3;tick++){await page.mouse.move(box.x+box.width*.6+(tick%2?2:0),box.y+box.height*.65);await new Promise(r=>setTimeout(r,1000));}})();
  const [raw]=await Promise.all([measurement,interaction]);samples.push({mode,raw});
 }
 await writeFile(path.join(output,'probe-explicit-result.json'),JSON.stringify({diagnosticOnly:true,box,samples,browser:browser.version()},null,2));
 console.log(JSON.stringify(samples.map(s=>({mode:s.mode,frames:s.raw.intervals.length,latencies:s.raw.latencies.length,events:s.raw.events}))));
}finally{await browser?.close();await server.close();}

