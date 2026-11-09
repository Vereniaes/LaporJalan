/* Freeze licensed smoke inputs, then call only the isolated local vision runtime.
Todo:
-> retain every first attempt and keep smoke separate from a quality gate
*/
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { freemem,totalmem } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateModelResponse,scoreAttempts } from './contract.mjs';
import { validateDataset } from './manifest.mjs';
import { assertWarmupDisjoint,assertResidency,assertFrozenInputs,summarizeLatency,localFetch,preserveAttempt } from './runtime.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const pilot=path.join(root,'knowledge/crm-3d-plan-2026-10-28/implementation-p5');
const json=value=>JSON.stringify(value,null,2),hash=value=>createHash('sha256').update(value).digest('hex');
const arg=flag=>{const i=process.argv.indexOf(flag);return i<0?undefined:process.argv[i+1];};
const mode=process.argv.includes('--prepare')?'prepare':process.argv.includes('--run')?'run':'';
const id=arg('--id');
if(!mode||!/^smoke-[a-z0-9-]{1,70}$/.test(id??''))throw new Error('Use --prepare|--run --id smoke-unique-name');
const output=path.join(pilot,'runs',id),manifestPath=path.join(output,'manifest.json');
const schemaPath=path.join(pilot,'SCHEMA.json'),schema=JSON.parse(await readFile(schemaPath,'utf8'));
const save=(name,data)=>writeFile(path.join(output,name),json(data),{flag:'wx'});
const command=promisify(execFile);
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
async function api(endpoint,payload,base,timeout=20000){
 const url=new URL(base);assert(url.protocol==='http:'&&url.hostname==='127.0.0.1'&&url.port==='11435'&&url.pathname==='/'&&!url.username&&!url.password&&!url.search&&!url.hash,'Only the isolated loopback runtime is allowed');
 const response=await localFetch(new URL('/api/'+endpoint,url),{method:payload?'POST':'GET',headers:payload?{'Content-Type':'application/json'}:{},body:payload?JSON.stringify(payload):undefined,signal:AbortSignal.timeout(timeout)});
 const text=await response.text();assert(Buffer.byteLength(text)<=4*1024*1024,'Runtime response too large');let data;
 try{data=JSON.parse(text);}catch{throw new Error('Runtime returned non-JSON');}
 if(!response.ok||data.error)throw new Error(`Runtime HTTP${response.status}: ${data.error??'request failed'}`);return data;
}
async function provenance(config,dataset,checked){
 const files=['SCHEMA.json','PROMPT.txt','dataset/smoke-manifest.json','runtime-config.json','dataset/commons-processing.json','dataset/addendum-crop-negative.json','evidence/model-show.json'];
 const hashes=Object.fromEntries(await Promise.all(files.map(async name=>[name,hash(await readFile(path.join(pilot,name)))])));
 for(const name of ['contract.mjs','manifest.mjs','runtime.mjs','run.mjs'])hashes['runner/'+name]=hash(await readFile(new URL(name,import.meta.url)));
 assert(hash(await readFile(config.runtimeBinary))===config.runtimeBinarySha256,'Runtime binary changed');
 return {files:hashes,assets:checked.hashes,model:config.model,modelDigest:config.modelDigest,phase:dataset.phase};
}
async function assertRuntime(config,expectation='any'){
 const main=await localFetch('http://127.0.0.1:11434/api/ps',{signal:AbortSignal.timeout(5000)}).then(r=>r.json());
 assert(Array.isArray(main.models)&&main.models.length===0,'Another model is active in the existing runtime; leave it untouched and stop this pilot');
 const version=await api('version',null,config.endpoint);assert(version.version===config.ollamaVersion,'Runtime version changed');
 const tags=await api('tags',null,config.endpoint);const model=tags.models.find(m=>m.name===config.model);assert(model?.digest===config.modelDigest,'Pinned model digest missing or changed');
 const loaded=await api('ps',null,config.endpoint);assertResidency(loaded,config,expectation);
 return {version:version.version,model,loaded};
}
async function loadInputs(){
 const config=JSON.parse(await readFile(path.join(pilot,'runtime-config.json'),'utf8'));
 const dataset=JSON.parse(await readFile(path.join(pilot,'dataset/smoke-manifest.json'),'utf8'));
 assert(dataset.phase==='smoke','This bounded runner only executes the approved smoke phase');
 const checked=await validateDataset(dataset,{datasetRoot:pilot,schemaPath});
 assert(config.settings?.num_ctx===4096&&config.settings?.num_predict===512&&config.settings?.temperature===0&&config.deadlineMs===90000,'Frozen generation limits differ');
 const warmupManifest={...dataset,entries:[config.warmup,...dataset.entries.slice(1)]};
 const warmup=await validateDataset(warmupManifest,{datasetRoot:pilot,schemaPath});
 assertWarmupDisjoint(config.warmup,dataset.entries);
 return {config,dataset,checked,warmup:warmup.entries[0],prompt:await readFile(path.join(pilot,'PROMPT.txt'),'utf8')};
}
async function prepare(){
 const {config,dataset,checked,warmup,prompt}=await loadInputs();const runtime=await assertRuntime(config);
 assert((await api('show',{model:config.model},config.endpoint)).capabilities.includes('vision'),'Model lacks vision capability');
 await mkdir(path.dirname(output),{recursive:true});await mkdir(output);await mkdir(path.join(output,'artifacts'));await mkdir(path.join(output,'artifacts/raw'));
 const immutable=await provenance(config,dataset,checked);
 immutable.warmupAssets=(await validateDataset({...dataset,entries:[config.warmup,...dataset.entries.slice(1)]},{datasetRoot:pilot,schemaPath})).hashes;
 await save('manifest.json',{createdAt:new Date().toISOString(),id,phase:'smoke',config,dataset,modelOutputSchema:schema.$defs.modelOutput,prompt,provenance:immutable,runtime,limits:['Eight provisional assistant-reviewed public photos; not independent human ground truth','No full140-image quality gate or Jakarta accuracy claim','No application/database/API integration']});
 console.log('Smoke frozen before inference: '+id);
}
async function sampleMemory(){
 let gpu=null;
 try{const result=await command('/usr/lib/wsl/lib/nvidia-smi',['--query-gpu=memory.used,memory.free,utilization.gpu','--format=csv,noheader,nounits'],{timeout:3000});const values=result.stdout.trim().split(',').map(Number);gpu={usedMiB:values[0],freeMiB:values[1],utilizationPercent:values[2]};}catch{}
 return {at:new Date().toISOString(),gpu,systemUsedBytes:totalmem()-freemem(),systemAvailableBytes:freemem()};
}
async function run(){
 const frozen=JSON.parse(await readFile(manifestPath,'utf8'));const {config,dataset,checked,warmup,prompt}=await loadInputs();
 const expected=await provenance(config,dataset,checked);expected.warmupAssets=(await validateDataset({...dataset,entries:[config.warmup,...dataset.entries.slice(1)]},{datasetRoot:pilot,schemaPath})).hashes;
 assertFrozenInputs(frozen,{id,phase:'smoke',config,dataset,modelOutputSchema:schema.$defs.modelOutput,prompt,provenance:expected});await assertRuntime(config,'cold');
 await save('started.json',{at:new Date().toISOString(),manifestSha256:hash(await readFile(manifestPath))});
 const attempts=[],memory=[];let memoryPending=null;const recordMemory=()=>{if(memoryPending)return memoryPending;memoryPending=sampleMemory().then(row=>memory.push(row)).finally(()=>{memoryPending=null;});return memoryPending;};
 await recordMemory();const timer=setInterval(()=>void recordMemory(),1000);
 async function infer(entry,purpose){
  const before=await assertRuntime(config,purpose==='cold_probe'?'cold':'warm');const startedAt=new Date().toISOString(),start=performance.now();
  const relative=`artifacts/raw/${purpose}-${entry.id}.json`;let parsedOutput=null,outcome='transport_error',errorCode=null,semanticWarnings=[],timing=null,rawSaved=false;
  try{
   const image=await readFile(entry.assetAbsolutePath);
   const response=await api('chat',{model:config.model,messages:[{role:'system',content:prompt+'\nRequired JSON schema: '+JSON.stringify(frozen.modelOutputSchema)},{role:'user',content:'Inspect the dominant visible road condition in this image. Return only the required JSON object.',images:[image.toString('base64')]}],format:frozen.modelOutputSchema,stream:false,options:config.settings,keep_alive:'2m',...(config.disableThinking?{think:false}:{})},config.endpoint,config.deadlineMs);
   await save(relative,response);rawSaved=true;timing=Object.fromEntries(['total_duration','load_duration','prompt_eval_count','prompt_eval_duration','eval_count','eval_duration','done','done_reason'].map(k=>[k,response[k]??null]));
   if(!response.done)throw new Error('Incomplete runtime response');
   const valid=validateModelResponse(response.message?.content??'');
   parsedOutput=valid.output;semanticWarnings=valid.semanticWarnings;errorCode=valid.errorCode;
   outcome=valid.valid?'valid':valid.errorCode==='invalid_json'?'invalid_json':'invalid_schema';
  }catch(error){
   const message=String(error);outcome=/timeout|timed out|aborted/i.test(message)?'timeout':/out of memory|\boom\b|unable to allocate/i.test(message)?'oom':'transport_error';errorCode=outcome;
   if(!rawSaved)await save(relative,{errorCode,message});
  }
  const wallMs=performance.now()-start;
  const record={runId:id,sampleId:entry.id,split:entry.split,attempt:1,purpose,startedAt,wallMs,outcome,rawResponsePath:relative,parsedOutput,errorCode};
  const result=await preserveAttempt({...record,goldLabel:entry.goldLabel,semanticWarnings,timing,residencyBefore:before.loaded},()=>assertRuntime(config,outcome==='valid'?'warm':'any'),async row=>{attempts.push(row);await save(`${purpose}-${entry.id}.json`,row);});
  await recordMemory();console.log(`${purpose} ${entry.id} ${outcome} ${(wallMs/1000).toFixed(2)}s`);return result;
 }
 try{
  for(const purpose of ['cold_probe','warmup']){
   const result=await infer(warmup,purpose);
   if(['timeout','oom','transport_error'].includes(result.outcome))throw new Error('Runtime smoke probe failed; scored requests not run');
  }
  for(const entry of checked.entries){const result=await infer(entry,'primary');if(['timeout','oom','transport_error'].includes(result.outcome))throw new Error('Primary runtime failure; remaining requests not run');}
  const scored=scoreAttempts(attempts,{phase:'smoke'}),primary=attempts.filter(r=>r.purpose==='primary');
  const latency={...summarizeLatency(primary,config.deadlineMs),coldProbeMs:attempts.find(r=>r.purpose==='cold_probe')?.wallMs,warmupMs:attempts.find(r=>r.purpose==='warmup')?.wallMs};
  const checkedAgain=await loadInputs(),after=await provenance(config,dataset,checkedAgain.checked);after.warmupAssets=(await validateDataset({...dataset,entries:[config.warmup,...dataset.entries.slice(1)]},{datasetRoot:pilot,schemaPath})).hashes;assert(json(after)===json(frozen.provenance),'Frozen inputs changed during smoke');
  await save('result.json',{status:'smoke_completed',finishedAt:new Date().toISOString(),scored,latency,attempts,memory,semanticWarnings:primary.flatMap(r=>r.semanticWarnings.map(warning=>({sampleId:r.sampleId,warning}))),qualityGate:'not_reached',limitations:frozen.limits});
 }catch(error){await save('error.json',{status:'incomplete',error:String(error),attempts,memory});throw error;}
 finally{clearInterval(timer);await recordMemory();await save('memory.json',memory);}
}
if(mode==='prepare')await prepare();else await run();
