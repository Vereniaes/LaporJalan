/* Todo:
-> verify camera, depth, anchoring, and lifecycle with synthetic conditions
*/
import { createRequire } from 'node:module';
const sharp = createRequire(new URL('../../../laporjalan-be/package.json',import.meta.url))('sharp');
import { test,expect,type Page } from '@playwright/test';
import { snapshot,style } from './fixtures';
import { mapHandle,mapState,ready } from '../helpers/map';
import type { CitizenReport } from '../../src/public-reports/community';
const anchor:[number,number]=[106.8232095,-6.196562];
export const cavity:CitizenReport={id:'11111111-1111-4111-8111-111111111111',code:'LJ-FIXTURE',origin:'community',category:'road',sourceCategory:'Jalan',title:'MODEL UJI - cekungan berskala input',description:'Fixture pengujian, bukan laporan kerusakan nyata.',address:'Jalan terpetakan - ukuran sintetis',lng:anchor[0],lat:anchor[1],createdAt:'2026-10-28T10:00:00.000Z',updatedAt:'2026-10-28T10:00:00.000Z',status:'reported',sourceStatus:'Dilaporkan',revision:0,media:[],canManage:false,canUpdate:false,updates:[],condition:{kind:'pothole',observedAt:'2026-10-28T10:00:00.000Z',locationConfirmed:true,source:'reporter',geometry:{type:'Point',coordinates:anchor},dimensions:{method:'measured',tool:'Meteran fixture',widthM:.52,depthM:.075}}};
async function setup(page:Page,report:CitizenReport=cavity,real=false,motion:'reduce'|'no-preference'='reduce'){
 await page.emulateMedia({reducedMotion:motion});
 await page.clock.setFixedTime(new Date('2026-10-28T12:00:00.000Z'));
 await page.route('**/api/public-reports',r=>r.fulfill({json:{...snapshot,reports:[]}}));
 await page.route('**/api/community/**',r=>r.fulfill({json:r.request().url().endsWith('/capabilities')?{reports:true,write:true,login:true,reason:null}:r.request().url().includes('/reports/')?report:{reports:[report],nextCursor:null}}));
 if(!real)await page.route('https://tiles.openfreemap.org/**',r=>r.fulfill({json:style}));
 await page.goto('/peta');await expect(page.locator('.lj-report-row')).toHaveCount(1);
 await expect(page.getByRole('button',{name:'Mode 3D',exact:true})).toBeVisible();await ready(page);
 await page.locator('.lj-report-row').click();await expect(page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true})).toBeVisible();await ready(page);
}
async function inspect(page:Page){await page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true}).click();await expect.poll(async()=>(await mapState(page))?.inspection?.renderCount??0).toBeGreaterThan(0);await ready(page);}

test('one shared canvas renders physical cavity through four bearings and restores the complete pose',async({page},info)=>{
 test.setTimeout(60_000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await setup(page);const map=await mapHandle(page);
 await page.getByRole('button',{name:'Mode 3D',exact:true}).click();await ready(page);
 await map.evaluate(m=>m.jumpTo({pitch:43,bearing:27}));const before=await mapState(page);const padding=await map.evaluate(m=>m.getPadding());
 await inspect(page);await expect(page.locator('canvas')).toHaveCount(1);await expect(page.locator('.lj-marker')).toHaveCount(0);
 if(info.project.name==='mobile')expect((await page.locator('.lj-map').boundingBox())!.height).toBeGreaterThanOrEqual(300);
 for(const bearing of [0,90,180,270]){
  await map.evaluate((m,b)=>{m.jumpTo({bearing:b});m.triggerRepaint();},bearing);await ready(page);
  const actual=(await mapState(page))!.inspection!;expect(actual.canvasShared).toBe(true);expect(actual.widthM).toBe(.52);expect(actual.geometry.minZ).toBeCloseTo(-.075,6);
  const projection=await map.evaluate(m=>{const p=m.project(m.getLayer('inspection-damage').implementation.options.anchor);return[p.x,p.y];});
  expect(Math.hypot(...actual.projectedAnchorCss.map((n:number,i:number)=>n-projection[i]))).toBeLessThanOrEqual(2);
  const framing=await map.evaluate(m=>{const layer=m.getLayer('inspection-damage').implementation;const [lng,lat]=layer.options.anchor;const radius=layer.options.widthM/2;const canvas=m.getCanvas(),rect=canvas.getBoundingClientRect();return Array.from({length:32},(_,i)=>{const angle=i*Math.PI/16;const q=m.project([lng+radius*Math.cos(angle)/(111319.49*Math.cos(lat*Math.PI/180)),lat+radius*Math.sin(angle)/111319.49]);return {x:q.x,y:q.y,clear:document.elementFromPoint(rect.left+q.x,rect.top+q.y)===canvas};});});
  expect(framing.every(p=>p.clear),JSON.stringify(framing)).toBe(true);
  await page.screenshot({path:info.outputPath(`cavity-${bearing}.png`)});
 }
 await page.getByRole('button',{name:'Keluar inspeksi',exact:true}).click();await ready(page);
 const restored=await mapState(page);for(const key of ['zoom','pitch','bearing'] as const)expect(restored![key]).toBeCloseTo(before![key],5);
 expect(await map.evaluate(m=>m.getPadding())).toEqual(padding);expect(restored!.center[0]).toBeCloseTo(before!.center[0],7);
 expect(errors).toEqual([]);await map.dispose();
});

test('inspection reuses resources over 20 cycles and survives style reload',async({page},info)=>{
 test.setTimeout(90_000);await setup(page);const map=await mapHandle(page);const listenerCounts:Record<string,number>[]=[];
 for(let i=0;i<20;i++){
  await inspect(page);const layer=await map.evaluateHandle(m=>m.getLayer('inspection-damage').implementation);
  await page.getByRole('button',{name:'Keluar inspeksi',exact:true}).click();
  expect(await layer.evaluate(l=>l.getState().disposed)).toBe(true);
  expect(await layer.evaluate(l=>l.getState().resources)).toEqual({geometries:0,materials:0,textures:0,programs:0});await layer.dispose();
  await expect(page.locator('canvas')).toHaveCount(1);await ready(page);
  listenerCounts.push(await map.evaluate(m=>Object.fromEntries(Object.entries(m._listeners).map(([key,rows])=>[key,(rows as unknown[]).length]))));
 }
 for(const counts of listenerCounts.slice(5))expect(counts).toEqual(listenerCounts[5]);
 await info.attach('listener-plateau',{body:JSON.stringify(listenerCounts),contentType:'application/json'});
 await inspect(page);await map.evaluate((m,s)=>m.setStyle(s,{diff:false}),style);await expect.poll(async()=>(await mapState(page))?.inspection?.renderCount??0).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Mode 3D',exact:true}).click();await ready(page);expect((await mapState(page))?.pitch).toBe(0);expect((await mapState(page))?.inspection).toBeUndefined();await map.dispose();
});

test('24-hour closure shows stale observation and native symbols without a fake cavity',async({page},info)=>{
 const closure:CitizenReport={...cavity,id:'22222222-2222-4222-8222-222222222222',title:'MODEL UJI - pengamatan penutupan lama',condition:{kind:'closure',observedAt:'2026-10-27T11:59:00.000Z',locationConfirmed:true,source:'reporter',access:'closed',geometry:{type:'LineString',coordinates:[[anchor[0]-.0001,anchor[1]],[anchor[0]+.0001,anchor[1]]]}}};
 await setup(page,closure);await expect(page.locator('.lj-condition-summary')).toContainText('Perlu pembaruan');
 await page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true}).click();await expect(page.getByRole('region',{name:'Inspeksi kondisi'})).toContainText('Perlu pembaruan');await ready(page);
 expect((await mapState(page))?.inspection).toBeUndefined();const map=await mapHandle(page);const data=await map.evaluate(m=>m.getSource('condition-symbols').serialize().data);expect(data.features.length).toBeGreaterThan(0);
 await page.screenshot({path:info.outputPath('closure-symbol.png')});await map.dispose();
});

test('WebGL1 fallback keeps public report and 2D camera available',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:string,...args:any[]){if(type==='webgl2')return null;return original.call(this,type,...args);} as any;});
 await setup(page);await page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true}).click();await expect(page.getByText('Representasi 3D belum tersedia pada perangkat ini.',{exact:false})).toBeVisible();
 await ready(page);expect((await mapState(page))?.pitch).toBe(0);await expect(page.locator('.lj-detail h2')).toContainText('MODEL UJI');await expect(page.locator('canvas')).toHaveCount(1);
});


test('closing inspected detail restores overview pose instead of inspection pitch',async({page})=>{
 await setup(page);await page.getByRole('button',{name:'Kembali ke daftar',exact:true}).click();await ready(page);
 await page.getByRole('button',{name:'Mode 3D',exact:true}).click();await ready(page);
 const map=await mapHandle(page);await map.evaluate(m=>m.jumpTo({center:[106.824,-6.197],zoom:16,pitch:43,bearing:27}));
 const before=await mapState(page);
 await page.locator('.lj-report-row').click();await inspect(page);
 await page.getByRole('button',{name:'Kembali ke daftar',exact:true}).click();await ready(page);
 const after=await mapState(page);expect(after!.inspection).toBeUndefined();expect(after!.pitch).toBeCloseTo(before!.pitch,5);expect(after!.bearing).toBeCloseTo(before!.bearing,5);expect(after!.zoom).toBeCloseTo(before!.zoom,5);
 expect(after!.center[0]).toBeCloseTo(before!.center[0],7);expect(after!.center[1]).toBeCloseTo(before!.center[1],7);await map.dispose();
});


test('real road surface, near-rim depth and building occlusion remain visible with context recovery',async({page},info)=>{
 test.setTimeout(120_000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await setup(page,cavity,true,'no-preference');const map=await mapHandle(page);await map.evaluate(m=>m.jumpTo({zoom:18,pitch:0}));await ready(page);
 expect(await map.evaluate(m=>Object.keys(m.getStyle().sources))).toContain('openmaptiles');
 const roadDebug=await map.evaluate(m=>{const q=m.project([106.8232095,-6.196562]);return {point:q,at:m.queryRenderedFeatures(q).map(f=>({layer:f.layer.id,sourceLayer:f.sourceLayer})),source:m.querySourceFeatures('openmaptiles',{sourceLayer:'transportation'}).slice(0,5).map(f=>({type:f.geometry.type,properties:f.properties})),style:m.getStyle().layers.filter(l=>l.id.includes('road')).map(l=>({id:l.id,minzoom:l.minzoom,maxzoom:l.maxzoom}))};});
 await info.attach('road-query-debug',{body:JSON.stringify(roadDebug),contentType:'application/json'});
 await expect.poll(()=>map.evaluate(m=>m.queryRenderedFeatures(m.project([106.8232095,-6.196562])).some(f=>f.sourceLayer==='transportation'||f.layer.id.includes('road'))),{timeout:30000}).toBe(true);
 await inspect(page);
 for(const bearing of [0,90,180,270]){
  await map.evaluate((m,b)=>new Promise<void>(r=>{m.once('render',()=>r());m.jumpTo({bearing:b});m.triggerRepaint();}),bearing);
  const state=(await mapState(page))!.inspection!;expect(state.geometry.maxZ).toBeCloseTo(0,5);expect(state.geometry.minZ).toBeCloseTo(-.075,5);expect(state.canvasShared).toBe(true);
  await page.screenshot({path:info.outputPath(`real-road-${bearing}.png`)});
 }
 await map.evaluate(m=>m.jumpTo({bearing:0}));await ready(page);
 const countGreen=async()=>{const png=await page.locator('.maplibregl-canvas').screenshot();const {data,info}=await sharp(png).removeAlpha().raw().toBuffer({resolveWithObject:true});let count=0;for(let i=0;i<data.length;i+=info.channels)if(data[i+1]>data[i]*1.25&&data[i+1]>data[i+2]*1.1)count++;return count;};
 const visible=await countGreen();expect(visible).toBeGreaterThan(500);
 await map.evaluate(m=>{const [x,y]=m.getLayer('inspection-damage').implementation.options.anchor;const delta=.6/111319.49;const dx=delta/Math.cos(y*Math.PI/180);m.addSource('occlusion-fixture',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[x-dx,y-delta],[x+dx,y-delta],[x+dx,y+delta],[x-dx,y+delta],[x-dx,y-delta]]]}}});m.addLayer({id:'occlusion-fixture',type:'fill-extrusion',source:'occlusion-fixture',paint:{'fill-extrusion-color':'#521e8b','fill-extrusion-height':.8,'fill-extrusion-opacity':1}});});
 await expect.poll(()=>map.evaluate(m=>m.isSourceLoaded('occlusion-fixture'))).toBe(true);await ready(page);
 await page.screenshot({path:info.outputPath('real-road-blocker.png')});const hidden=await countGreen();expect(hidden).toBeLessThan(visible*.15);
 await map.evaluate(m=>{m.removeLayer('occlusion-fixture');m.removeSource('occlusion-fixture');});
 await map.evaluate(m=>new Promise<void>(resolve=>{const extension=m.getCanvas().getContext('webgl2').getExtension('WEBGL_lose_context');if(!extension)throw new Error('Controlled context loss unavailable');m.once('webglcontextrestored',()=>resolve());m.once('webglcontextlost',()=>setTimeout(()=>extension.restoreContext(),100));extension.loseContext();}));
 await expect.poll(async()=>(await mapState(page))?.inspection?.renderCount??0).toBeGreaterThan(0);await ready(page);await expect(page.locator('canvas')).toHaveCount(1);
 await page.screenshot({path:info.outputPath('real-road-context-restored.png')});
 await page.getByRole('button',{name:'Putar mengelilingi',exact:true}).click();const start=(await mapState(page))!.bearing;
 await expect.poll(async()=>Math.abs((await mapState(page))!.bearing-start)).toBeGreaterThan(20);
 await page.getByRole('button',{name:'Hentikan putaran',exact:true}).click();const stopped=(await mapState(page))!;
 const anchorPosition=await map.evaluate(m=>{const p=m.project(m.getLayer('inspection-damage').implementation.options.anchor);const c=m.getCanvas(),r=c.getBoundingClientRect();return {clear:document.elementFromPoint(r.left+p.x,r.top+p.y)===c};});expect(anchorPosition.clear).toBe(true);
 await page.screenshot({path:info.outputPath('real-road-orbit-stopped.png')});
 await page.getByRole('button',{name:'Keluar inspeksi',exact:true}).click();await ready(page);expect((await mapState(page))!.pitch).toBe(0);
 expect(errors).toEqual([]);await info.attach('depth-and-orbit',{body:JSON.stringify({visible,hidden,stopped,provenance:'OSM node4466350567/way449551306 checked2026-10-28; synthetic cavity and blocker',browser:page.context().browser()?.version()}),contentType:'application/json'});await map.dispose();
});

test('style reload preserves manually positioned normal detail camera',async({page})=>{
 await setup(page);await page.getByRole('button',{name:'Mode 3D',exact:true}).click();await ready(page);const map=await mapHandle(page);
 await map.evaluate(m=>m.jumpTo({center:[106.824,-6.197],zoom:16,pitch:43,bearing:27}));const before=await mapState(page);
 await map.evaluate((m,s)=>new Promise<void>(resolve=>{m.once('style.load',()=>resolve());m.setStyle(s,{diff:false});}),style);await ready(page);
 const after=await mapState(page);for(const k of ['zoom','pitch','bearing'] as const)expect(after![k]).toBeCloseTo(before![k],5);expect(after!.center).toEqual(before!.center);await map.dispose();
});


for(const real of [false,true])test(`non-cardinal bearings keep the full radial surface visible (${real?'real-road':'background'})`,async({page},info)=>{
 await setup(page,cavity,real);await inspect(page);const map=await mapHandle(page);const counts:number[]=[];
 if(real){await map.evaluate(m=>new Promise<void>(resolve=>{const e=m.getCanvas().getContext('webgl2').getExtension('WEBGL_lose_context');m.once('webglcontextrestored',()=>resolve());m.once('webglcontextlost',()=>setTimeout(()=>e.restoreContext(),100));e.loseContext();}));await expect.poll(async()=>(await mapState(page))?.inspection?.renderCount??0).toBeGreaterThan(0);await ready(page);}
 for(const bearing of [0,22.5,45,67.5,90]){
  await map.evaluate((m,b)=>new Promise<void>(resolve=>{m.once('render',()=>resolve());m.jumpTo({bearing:b});m.triggerRepaint();}),bearing);
  const png=await page.screenshot({path:info.outputPath(`radial-${bearing}.png`)});const {data,info:meta}=await sharp(png).removeAlpha().raw().toBuffer({resolveWithObject:true});let green=0;
  for(let i=0;i<data.length;i+=meta.channels)if(data[i+1]>data[i]*1.25&&data[i+1]>data[i+2]*1.1)green++;counts.push(green);
 }
 await info.attach('radial-coverage',{body:JSON.stringify(counts),contentType:'application/json'});expect(Math.min(...counts)/Math.max(...counts)).toBeGreaterThan(.9);await map.dispose();
});


test('viewport resize keeps the inspection framed and a hidden-state event stops orbit',async({page},info)=>{
 await setup(page,cavity,false,'no-preference');await inspect(page);const map=await mapHandle(page);
 const original=page.viewportSize()!;await page.setViewportSize({width:320,height:740});await ready(page);
 expect((await page.locator('.lj-map').boundingBox())!.height).toBeGreaterThanOrEqual(300);
 const point=await map.evaluate(m=>{const p=m.project(m.getLayer('inspection-damage').implementation.options.anchor),c=m.getCanvas(),r=c.getBoundingClientRect();return {clear:document.elementFromPoint(r.left+p.x,r.top+p.y)===c};});expect(point.clear).toBe(true);
 await page.screenshot({path:info.outputPath('inspection-resized-320.png')});
 await page.getByRole('button',{name:'Putar mengelilingi',exact:true}).click();await expect(page.getByRole('button',{name:'Hentikan putaran',exact:true})).toBeVisible();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(page.getByRole('button',{name:'Putar mengelilingi',exact:true})).toBeVisible();
 const before=(await mapState(page))!.bearing;await page.evaluate(()=>new Promise<void>(resolve=>{let n=0;const tick=()=>++n===8?resolve():requestAnimationFrame(tick);requestAnimationFrame(tick);}));expect((await mapState(page))!.bearing).toBe(before);
 await page.evaluate(()=>{delete (document as any).hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.setViewportSize(original);await ready(page);await expect(page.getByRole('button',{name:'Putar mengelilingi',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Mode 3D',exact:true}).click();await ready(page);expect((await mapState(page))!.pitch).toBe(0);expect((await mapState(page))!.inspection).toBeUndefined();
 await info.attach('visibility-scope',{body:'Synthetic document.hidden + visibilitychange verifies the app stop handler; physical tab suspension and OS GPU scheduling are not asserted.',contentType:'text/plain'});await map.dispose();
});


test('physical scissor pixels preserve the cavity on a retina canvas',async({browser},info)=>{
 const viewport=info.project.use.viewport??{width:1440,height:900};const context=await browser.newContext({viewport,deviceScaleFactor:2,locale:'id-ID',timezoneId:'Asia/Jakarta'});const page=await context.newPage();
 try{
  await setup(page);await inspect(page);const map=await mapHandle(page);
  const state=await map.evaluate(m=>{const canvas=m.getCanvas(),renderer=m.getLayer('inspection-damage').implementation.renderer;return {pixels:[canvas.width,canvas.height],css:[canvas.clientWidth,canvas.clientHeight],scissor:renderer.getScissor({copy:(v:any)=>[v.x,v.y,v.z,v.w]}),enabled:renderer.getScissorTest()};});
  expect(state.pixels[0]).toBe(state.css[0]*2);expect(state.pixels[1]).toBe(state.css[1]*2);expect(state.enabled).toBe(false);
  expect(state.scissor[2]).toBeGreaterThan(0);expect(state.scissor[3]).toBeGreaterThan(0);expect(state.scissor[2]*state.scissor[3]).toBeLessThan(state.pixels[0]*state.pixels[1]);
  const actual=(await mapState(page))!.inspection!;expect(actual.widthM).toBe(.52);expect(actual.depthM).toBe(.075);expect(actual.canvasShared).toBe(true);
  await page.screenshot({path:info.outputPath('retina-scissor.png'),scale:'css'});await map.dispose();
 }finally{await context.close();}
});
