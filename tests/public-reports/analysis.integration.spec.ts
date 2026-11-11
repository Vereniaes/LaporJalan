/* Exercise the real P6 API and UI on a disposable database, without a model.
Todo:
-> replay controlled results only inside this test process
-> verify publication, stale evidence and default-off behavior
*/
import { test, expect, type Page } from '@playwright/test';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import type { Server } from 'node:http';
import express from '../../../laporjalan-be/node_modules/express/index.js';
import cors from '../../../laporjalan-be/node_modules/cors/lib/index.js';
import mongoose from '../../../laporjalan-be/node_modules/mongoose/index.js';
import { snapshot, style } from './fixtures';
const sharp=createRequire(new URL('../../../laporjalan-be/package.json',import.meta.url))('sharp');

const databaseName=`lj_p6_browser_${randomUUID().replaceAll('-','')}`,ownerId=randomUUID(),token=randomBytes(32).toString('base64url');
const policy={available:true,accountIds:[ownerId]},origin=process.env.P6_APP_ORIGIN||'http://127.0.0.1:3005';
const base='http://127.0.0.1:5005/api/community',hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
let server:Server,defaultServer:Server;
const nativeFetch=globalThis.fetch;
test.beforeAll(async()=>{
 Object.assign(process.env,{PUBLIC_REPORTS_ONLY:'true',COMMUNITY_REPORTS_ENABLED:'true',NODE_ENV:'test',CORS_ORIGIN:origin,APP_ORIGIN:origin,RESEND_API_KEY:'unused-test-only',EMAIL_FROM:'test@example.test',GCS_BUCKET_NAME:''});
 globalThis.fetch=async(input,init)=>{if(!String(input).startsWith('http://127.0.0.1:'))throw new Error('External requests are forbidden in the isolated P6 test');return nativeFetch(input,init);};
 await mongoose.connect(`mongodb://127.0.0.1:27019/${databaseName}`);
 const {initCommunity}=await import('../../../laporjalan-be/dist/community/db.js');await initCommunity();
 const {createCommunityRouter}=await import('../../../laporjalan-be/dist/community/index.js');
 await mongoose.connection.db!.collection<any>('citizen_accounts').insertOne({_id:ownerId,email:'p6-browser@example.test'});
 await mongoose.connection.db!.collection<any>('citizen_sessions').insertOne({_id:hash(token),accountId:ownerId,expiresAt:new Date(Date.now()+3600000)});
 const app=express();app.use(cors({origin}));app.use('/api/community',createCommunityRouter(policy));
 server=app.listen(5005,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 const defaultApp=express();defaultApp.use(cors({origin}));defaultApp.use('/api/community',createCommunityRouter());
 defaultServer=defaultApp.listen(5006,'127.0.0.1');await new Promise<void>(resolve=>defaultServer.once('listening',resolve));
});
test.afterAll(async()=>{
 if(mongoose.connection.name===databaseName&&/^lj_p6_browser_[a-f0-9]+$/.test(databaseName))await mongoose.connection.dropDatabase();
 await mongoose.disconnect();for(const owned of [server,defaultServer]){owned?.closeAllConnections();if(owned)await new Promise<void>(resolve=>owned.close(()=>resolve()));}globalThis.fetch=nativeFetch;
});
const json=(path:string,body:unknown,method='POST')=>nativeFetch(base+path,{method,headers:{Origin:origin,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
const detail=(id:string)=>nativeFetch(base+'/reports/'+id).then(response=>response.json());

// Test media and output are isolated fixtures, never produced by an enabled model. ----------------------
async function fixture(blurred=false,withJob=true){
 const requestId=randomUUID(),image=blurred?'image-008.jpg':'image-001.jpg';
 let bytes:Buffer;
 try{bytes=await readFile(new URL('../../knowledge/crm-3d-plan-2026-10-28/implementation-p5/runs/dataset-smoke/artifacts/processed/'+image,import.meta.url));}
 catch{bytes=await sharp({create:{width:640,height:360,channels:3,background:'#dce6e6'}}).jpeg().toBuffer();}
 const condition={kind:'crack',observedAt:'2026-10-28T09:34:56.789Z',source:'reporter',locationConfirmed:true,
  geometry:{type:'Point',coordinates:[106.8232095,-6.196562]},dimensions:{method:'measured',tool:'Alat ukur fixture uji',widthM:.52,depthM:.075}};
 const form=new FormData();for(const[k,v]of Object.entries({requestId,category:'road',title:'Tinjauan foto - uji terisolasi',description:'Fixture untuk pengujian aplikasi lokal, bukan laporan kejadian nyata.',address:'Lokasi uji',lng:106.8232095,lat:-6.196562,publicConsent:true,condition:JSON.stringify(condition)}))form.set(k,String(v));
 form.set('media',new Blob([new Uint8Array(bytes)],{type:'image/jpeg'}),'test-evidence.jpg');
 const response=await nativeFetch(base+'/reports',{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${token}`},body:form});expect(response.status).toBe(201);
 const report=await response.json();let analysisId='';
 if(withJob){
  const admitted=await json(`/reports/${report.id}/analyses`,{requestId:randomUUID(),mediaId:report.media[0].id,expectedRevision:report.revision});expect(admitted.status).toBe(202);analysisId=(await admitted.json()).analysisId;
  const output={kindSuggestion:blurred?'no_visible_issue':'pothole',visibleEvidence:['Fixture hasil terkontrol untuk uji alur privat.'],qualityFlags:blurred?['blurred']:[],captionSuggestion:'Teks uji privat yang tidak boleh menjadi catatan publik.',needsHumanReview:true};
  await mongoose.connection.db!.collection<any>('citizen_analyses').updateOne({_id:analysisId},{$set:{execution:'succeeded',active:false,attempt:1,completedAt:new Date().toISOString(),modelOutput:output,outputDigest:hash(JSON.stringify(output)),modelDigest:hash('controlled-test-adapter-no-model'),promptHash:hash('test-prompt'),schemaHash:hash('test-schema'),preprocessingVersion:'test-only-no-model',derivativeSha256:hash(bytes)},$inc:{jobVersion:1}});
 }
 return{report,condition,analysisId};
}
async function open(page:Page,id:string){
 await page.addInitScript(token=>sessionStorage.setItem('lj-session',token),token);
 await page.route('**/api/public-reports',route=>route.fulfill({json:{...snapshot,reports:[]}}));
 await page.route('https://tiles.openfreemap.org/**',route=>route.fulfill({json:style}));
 await page.goto('/akun?laporan='+id);await expect(page.locator('.lj-detail h2')).toHaveText('Tinjauan foto - uji terisolasi');
 await page.getByRole('button',{name:'Tambah pembaruan',exact:true}).click();
}
async function finishFields(page:Page){
 await page.getByRole('textbox',{name:'Catatan pembaruan',exact:true}).fill('Pengamatan pelapor untuk tes terisolasi, bukan teks model.');
 await page.getByLabel('Lokasi dan bentuk telah diperiksa.',{exact:true}).check();
 await page.getByLabel(/^Catatan dan lampiran boleh dipublikasikan/).check();
}

test('real P6 confirmation preserves draft and writes exactly one private receipt',async({page},info)=>{
 const{report,condition,analysisId}=await fixture();await open(page,report.id);
 await expect(page.getByText('Saran AI - belum disimpan',{exact:true})).toBeVisible();
 await page.getByRole('textbox',{name:'Catatan pembaruan',exact:true}).fill('Catatan manual tetap dipertahankan ketika jenis diimpor.');
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Gunakan jenis ini',exact:true}).click();
 await expect(page.getByLabel('Jenis kondisi',{exact:true})).toHaveValue('pothole');
 await expect(page.getByRole('textbox',{name:'Catatan pembaruan',exact:true})).toHaveValue('Catatan manual tetap dipertahankan ketika jenis diimpor.');
 expect((await detail(report.id)).condition).toEqual(condition);
 await expect(page.getByLabel('Lokasi dan bentuk telah diperiksa.',{exact:true})).not.toBeChecked();
 await finishFields(page);await page.screenshot({path:info.outputPath('p6-confirmation-draft.png')});
 await page.getByRole('button',{name:'Simpan pembaruan',exact:true}).click();
 await expect(page.getByText('Perubahan tersimpan.',{exact:true})).toBeVisible();
 const row=await mongoose.connection.db!.collection<any>('citizen_reports').findOne({_id:report.id});
 expect(row.updates).toHaveLength(2);expect(row.analysisReceipts).toHaveLength(1);expect(row.analysisReceipts[0].analysisId).toBe(analysisId);
 expect(row.condition.kind).toBe('pothole');expect(row.condition.geometry).toEqual(condition.geometry);expect(row.condition.dimensions).toEqual(condition.dimensions);expect(row.condition.observedAt).toBe(condition.observedAt);
 const publicText=JSON.stringify(await detail(report.id));for(const field of ['analysisReceipts','modelDigest','outputDigest','storedMediaSha256','Teks uji privat'])expect(publicText).not.toContain(field);
 await info.attach('p6-real-storage',{body:JSON.stringify({updates:row.updates.length,privateReceipts:row.analysisReceipts.length,realModelRequests:0,source:'controlled adapter on disposable Mongo'}),contentType:'application/json'});
});

test('blurred completed result cannot overwrite a stored condition',async({page},info)=>{
 const{report,condition}=await fixture(true);await open(page,report.id);
 await expect(page.getByText('Foto belum cukup jelas untuk memakai saran. Isi manual tetap tersedia.',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Gunakan jenis ini',exact:true})).toHaveCount(0);
 await page.getByRole('textbox',{name:'Catatan pembaruan',exact:true}).fill('Pembaruan manual tanpa memakai hasil foto yang kabur.');await page.getByLabel(/^Catatan dan lampiran boleh dipublikasikan/).check();
 await page.screenshot({path:info.outputPath('p6-blurred-manual.png')});await page.getByRole('button',{name:'Simpan pembaruan',exact:true}).click();
 await expect(page.getByText('Perubahan tersimpan.',{exact:true})).toBeVisible();
 const row=await mongoose.connection.db!.collection<any>('citizen_reports').findOne({_id:report.id});expect(row.condition).toEqual(condition);expect(row.analysisReceipts??[]).toHaveLength(0);
});

test('source withdrawal wins over a stale confirmation draft',async({page})=>{
 const{report}=await fixture();await open(page,report.id);page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Gunakan jenis ini',exact:true}).click();await finishFields(page);
 const withdrawn=await json(`/reports/${report.id}/publication`,{requestId:randomUUID(),revision:report.revision,withdrawMediaIds:[report.media[0].id]},'PATCH');expect(withdrawn.status).toBe(200);
 await page.getByRole('button',{name:'Simpan pembaruan',exact:true}).click();await expect(page.getByRole('alert').first()).toBeVisible();
 const row=await mongoose.connection.db!.collection<any>('citizen_reports').findOne({_id:report.id});expect(row.updates).toHaveLength(1);expect(row.analysisReceipts??[]).toHaveLength(0);expect(row.condition.kind).toBe('crack');
});

test('model-off capability keeps manual updates available without creating jobs',async({page},info)=>{
 const{report}=await fixture(false,false);
 await page.route('**/api/community/**',async route=>{const response=await route.fetch({url:route.request().url().replace(':5005',':5006')});await route.fulfill({response});});
 await open(page,report.id);
 await expect(page.getByRole('heading',{name:/Bantuan foto/})).toHaveCount(0);
 const denied=await nativeFetch(base.replace(':5005',':5006')+`/reports/${report.id}/analyses`,{method:'POST',headers:{Origin:origin,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({requestId:randomUUID(),mediaId:report.media[0].id,expectedRevision:report.revision})});expect(denied.status).toBe(503);
 await page.getByRole('textbox',{name:'Catatan pembaruan',exact:true}).fill('Laporan manual tetap berjalan ketika model nonaktif.');await page.getByLabel(/^Catatan dan lampiran boleh dipublikasikan/).check();await page.screenshot({path:info.outputPath('p6-model-off-manual.png')});
 await page.getByRole('button',{name:'Simpan pembaruan',exact:true}).click();await expect(page.getByText('Perubahan tersimpan.',{exact:true})).toBeVisible();
 expect(await mongoose.connection.db!.collection('citizen_analyses').countDocuments({reportId:report.id})).toBe(0);
});
