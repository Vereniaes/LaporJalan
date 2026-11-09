/* Todo:
-> verify production network order with synthetic API conditions
*/
import { test,expect } from '@playwright/test';
import { snapshot,style } from '../public-reports/fixtures';
import { mapHandle,mapState,ready } from '../helpers/map';
for(const kind of ['pothole','closure'] as const)test(`production loads Three only for the physical ${kind} inspection`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});const requests:string[]=[];
 page.on('request',request=>{if(/\/assets\/DamageLayer-.*\.js$/.test(request.url()))requests.push(request.url());});
 const report={id:'55555555-5555-4555-8555-555555555555',code:'MODEL-UJI-CHUNK',origin:'community',category:'road',sourceCategory:'Jalan',title:'MODEL UJI pemuatan ilustrasi',description:'Fixture pengujian produksi lokal, bukan laporan aktual.',address:'',lng:106.8232095,lat:-6.196562,createdAt:'2026-10-28T10:00:00Z',updatedAt:'2026-10-28T10:00:00Z',status:'reported',sourceStatus:'Dilaporkan',revision:0,media:[],updates:[],canManage:false,canUpdate:false,condition:{kind,observedAt:'2026-10-28T10:00:00Z',locationConfirmed:true,source:'reporter',geometry:{type:'Point',coordinates:[106.8232095,-6.196562]},...(kind==='pothole'?{dimensions:{method:'measured',tool:'Meteran fixture',widthM:.52,depthM:.075}}:{access:'closed'})}};
 await page.route('**/api/public-reports',r=>r.fulfill({json:{...snapshot,reports:[]}}));
 await page.route('**/api/community/**',r=>r.fulfill({json:r.request().url().endsWith('/capabilities')?{reports:true,write:true,login:true,reason:null}:r.request().url().includes('/reports/')?report:{reports:[report],nextCursor:null}}));
 await page.route('https://tiles.openfreemap.org/**',r=>r.fulfill({json:style}));await page.goto('/peta');await ready(page);
 await expect(page.locator('.lj-report-row')).toHaveCount(1);expect(requests).toHaveLength(0);
 await page.getByRole('button',{name:'Mode 3D',exact:true}).click();await ready(page);expect(requests).toHaveLength(0);
 await page.locator('.lj-report-row').click();await ready(page);expect(requests).toHaveLength(0);
 await page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true}).click();const map=await mapHandle(page);
 if(kind==='pothole'){
  await expect.poll(async()=>(await mapState(page))?.inspection?.renderCount??0).toBeGreaterThan(0);expect(requests).toHaveLength(1);
 }else{
  await expect.poll(()=>map.evaluate(m=>m.getSource('condition-symbols').serialize().data.features.length)).toBeGreaterThan(0);expect(requests).toHaveLength(0);
 }
 await page.screenshot({path:info.outputPath(`production-${kind}.png`)});
 await page.getByRole('button',{name:'Keluar inspeksi',exact:true}).click();await ready(page);
 await page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true}).click();await ready(page);
 if(kind==='pothole')await expect.poll(async()=>(await mapState(page))?.inspection?.renderCount??0).toBeGreaterThan(0);
 expect(requests).toHaveLength(kind==='pothole'?1:0);await expect(page.locator('canvas')).toHaveCount(1);await map.dispose();
});
