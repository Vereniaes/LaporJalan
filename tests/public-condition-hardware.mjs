/* Validate two frozen map workloads on a proven Windows hardware GPU.
Todo:
-> keep one measurement round and reject software fallback
*/
import ts from 'typescript';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { arch, cpus, platform, release, totalmem } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const knowledge=path.join(root,'knowledge/crm-3d-plan-2026-10-28/implementation-p34');
const reference=path.join(knowledge,'runs/performance-public-condition-20261028-b');
const value=flag=>{const index=process.argv.indexOf(flag);return index<0?undefined:process.argv[index+1];};
const mode=process.argv.includes('--prepare')?'prepare':process.argv.includes('--run')?'run':'';
const runId=value('--id');
if(!mode || !/^hardware-[a-z0-9-]{1,70}$/.test(runId??''))throw new Error('Use --prepare|--run --id hardware-unique-name; prepare also requires --browser');
if(process.platform!=='win32')throw new Error('Use native Windows Node; WSL software rendering is outside this round.');
const output=path.join(knowledge,'runs',runId),manifestPath=path.join(output,'manifest.json');
const json=v=>JSON.stringify(v,null,2),digest=v=>createHash('sha256').update(v).digest('hex');
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const save=(name,data)=>writeFile(path.join(output,name),json(data),{flag:'wx'});
const fileHash=async filename=>{const hash=createHash('sha256');for await(const chunk of createReadStream(filename))hash.update(chunk);return hash.digest('hex');};
async function hashes(directory,prefix=''){
 const result={};for(const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
  const key=path.posix.join(prefix,entry.name),full=path.join(directory,entry.name);
  if(entry.isDirectory())Object.assign(result,await hashes(full,key));else if(entry.isFile())result[key]=await fileHash(full);else throw new Error('Frozen builds require regular files.');
 }return result;
}
const frozen=JSON.parse(await readFile(path.join(reference,'manifest.json'),'utf8'));
const fixtureBytes=await readFile(path.join(reference,'fixture.json'));
assert(digest(fixtureBytes)===frozen.fixtureHash,'B fixture changed');
const fixture=JSON.parse(fixtureBytes),harnessPath=path.join(root,'tests/public-condition-performance.mjs');
const harnessSource=await readFile(harnessPath,'utf8');
assert(digest(harnessSource)===frozen.provenance.runnerHash,'Original acceptance harness changed');
const tree=ts.createSourceFile(harnessPath,harnessSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const functionText=name=>{const node=tree.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert(node,'Missing helper '+name);return node.getText(tree);};
const initializer=name=>{for(const statement of tree.statements)if(ts.isVariableStatement(statement)){const node=statement.declarationList.declarations.find(n=>n.name.getText(tree)===name);if(node)return node.initializer.getText(tree);}throw new Error('Missing constant '+name);};
const stable=Function('return ('+initializer('stable')+')')();
const percentile=Function('return ('+initializer('percentile')+')')();
const stats=Function('percentile','return ('+initializer('stats')+')')(percentile);
const settings={...frozen.settings,viewports:[{width:1440,height:900}],scenarios:frozen.settings.scenarios.filter(s=>['public-pan','inspection-pan'].includes(s.id)),browserArgs:['--disable-software-rasterizer'],headless:true,
 scope:'One native Windows hardware-WebGL round; no presentation/display FPS claim. No absolute comparison to SwiftShader A/B.'};
const findMap=Function('return ('+functionText('findMap')+')')();
const snapshot=Function('return ('+functionText('snapshot')+')')();
const sameCamera=Function('settings','stable','return ('+functionText('sameCamera')+')')(settings,stable);
const serve=Function('createServer','path','stat','createReadStream','return ('+functionText('serve')+')')(createServer,path,stat,createReadStream);
const setup=Function('settings','assert','findMap','snapshot','sameCamera','json','return ('+functionText('setup')+')')(settings,assert,findMap,snapshot,sameCamera,json);
const measure=Function('settings','return ('+functionText('measure')+')')(settings);
const launch=executablePath=>chromium.launch({executablePath,headless:settings.headless,args:settings.browserArgs,timeout:20000});

// Prove the actual canvas adapter, rather than counting installed GPUs. ------------------------
// input param : CDP GPU state and the canvas WebGL renderer
// output : stable hardware identity; ambiguous/software paths throw
function hardwareIdentity(gpu,environment){
 const renderer=environment.renderer,aux=gpu.auxAttributes;
 assert(typeof renderer==='string'&&typeof aux?.glRenderer==='string','Unmasked renderer proof unavailable');
 assert(!/swiftshader|llvmpipe|softpipe|software|microsoft basic|\bwarp\b/i.test(renderer+' '+aux.glRenderer),'Software rendering rejected');
 assert(/WebGL 2/i.test(environment.webglVersion),'Actual map requires WebGL2');
 assert(gpu.featureStatus?.webgl==='enabled'&&gpu.featureStatus?.gpu_compositing==='enabled','Hardware WebGL/compositing not enabled');
 assert(aux.displayType==='ANGLE_D3D11'&&aux.glImplementationParts?.includes('angle=d3d11'),'Expected native D3D11 hardware backend');
 const id=/0x([0-9a-f]+)/i.exec(renderer);assert(id,'Actual renderer device ID missing');
 const device=gpu.devices.find(d=>d.deviceId===parseInt(id[1],16)&&[0x8086,0x10de,0x1002].includes(d.vendorId));
 assert(device&&aux.glRenderer.toLowerCase().includes(id[0].toLowerCase()),'Canvas and CDP physical adapter do not match');
 assert(environment.vendor===aux.glVendor,'Canvas and CDP vendors differ');
 assert(Number.isInteger(aux.processCrashCount),'GPU crash counter unavailable');
 return {vendorId:device.vendorId,deviceId:device.deviceId,name:device.deviceString,driverVersion:device.driverVersion,renderer,vendor:environment.vendor,displayType:aux.displayType,glImplementationParts:aux.glImplementationParts,processCrashCount:aux.processCrashCount};
}
// end of helper ------------------------------------------------------------------------------
async function proof(browser,map){
 const session=await browser.newBrowserCDPSession();
 try{const {gpu}=await session.send('SystemInfo.getInfo');const state=await map.evaluate(snapshot);return {identity:hardwareIdentity(gpu,state.environment),gpu:{devices:gpu.devices,featureStatus:gpu.featureStatus,auxAttributes:{glRenderer:gpu.auxAttributes.glRenderer,glVendor:gpu.auxAttributes.glVendor,displayType:gpu.auxAttributes.displayType,glImplementationParts:gpu.auxAttributes.glImplementationParts,processCrashCount:gpu.auxAttributes.processCrashCount}},state};}
 finally{await session.detach();}
}
async function runtimeFiles(executable,version){
 const dll=path.join(path.dirname(executable),version,'chrome.dll');
 assert((await stat(dll)).isFile(),'Chrome runtime DLL unavailable');
 return {[executable]:await fileHash(executable),[dll]:await fileHash(dll)};
}
async function provenance(runtime){
 const files=['package-lock.json','knowledge/crm-3d-plan-2026-10-28/implementation-p34/CONTRACT.md','knowledge/crm-3d-plan-2026-10-28/implementation-p34/evidence/performance-baseline.json'];
 return {runnerHash:await fileHash(fileURLToPath(import.meta.url)),originalRunnerHash:digest(harnessSource),BManifestHash:await fileHash(path.join(reference,'manifest.json')),fixtureHash:digest(fixtureBytes),files:Object.fromEntries(await Promise.all(files.map(async name=>[name,await fileHash(path.join(root,name))]))),browserFiles:await runtimeFiles(runtime.executable,runtime.version)};
}
async function prepare(){
 const executable=value('--browser');assert(executable&&path.isAbsolute(executable),'Prepare needs an installed --browser absolute path');
 await mkdir(path.dirname(output),{recursive:true});await mkdir(output);await mkdir(path.join(output,'artifacts'));
 let browser;
 try{
  browser=await launch(executable);const page=await browser.newPage();await page.setContent('<canvas width="32" height="32"></canvas>');
  const environment=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');if(!gl)return {};const ext=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):null,webglVersion:gl.getParameter(gl.VERSION)};});
  const session=await browser.newBrowserCDPSession();const {gpu}=await session.send('SystemInfo.getInfo');await session.detach();const identity=hardwareIdentity(gpu,environment);
  const runtime={executable,version:browser.version()};const sources={};
  for(const [name,port] of [['baseline',3010],['candidate',3011]]){
   const relative=path.posix.join('knowledge/crm-3d-plan-2026-10-28/implementation-p34/runs/performance-public-condition-20261028-b/artifacts',name+'-dist');
   const actual=await hashes(path.join(root,relative));assert(stable(actual)===stable(frozen.sources[name].hashes),'Frozen B '+name+' changed');sources[name]={relative,port,hashes:actual};
  }
  assert(stable(sources.baseline.hashes)===stable(frozen.baselineReference.files),'Original P0-P2 baseline differs');
  await save('capability.json',{runtime,identity,gpu,environment,headless:settings.headless});
  await save('manifest.json',{createdAt:new Date().toISOString(),runId,settings,sources,runtime,identity,provenance:await provenance(runtime),limitations:['Desktop only, native Chrome headless with hardware D3D11','Synthetic API/background, one measured round','No physical display presentation, phone, real-tile performance, or absolute SwiftShader comparison']});
  console.log('Hardware round prepared; no measurements started. '+identity.name);
 }catch(error){await save('capability-error.json',{status:'not_run',reason:String(error)});throw error;}
 finally{await browser?.close();}
}
async function run(){
 const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
 assert(stable(manifest.settings)===stable(settings),'Frozen settings changed');
 assert(stable(manifest.provenance)===stable(await provenance(manifest.runtime)),'Frozen runner/runtime/files changed');
 const sources={};for(const [name,source] of Object.entries(manifest.sources)){
  const directory=path.join(root,source.relative);assert(stable(await hashes(directory))===stable(source.hashes),'Build changed');sources[name]={...source,directory};
 }
 await save('started.json',{at:new Date().toISOString(),manifestHash:await fileHash(manifestPath)});
 const servers=[],results=[];let browser;
 try{
  for(const source of Object.values(sources))servers.push(await serve(source.directory,source.port));
  browser=await launch(manifest.runtime.executable);assert(browser.version()===manifest.runtime.version,'Browser version changed');
  await save('environment.json',{node:process.version,browser:browser.version(),os:{platform:platform(),release:release(),arch:arch(),memoryBytes:totalmem()},cpu:{model:cpus()[0]?.model,count:cpus().length},customArgs:settings.browserArgs,headless:settings.headless});
  for(const scenario of settings.scenarios)for(let sample=1;sample<=settings.samples;sample++){
   const pair=[];
   try{
    for(const variant of [scenario.control,'candidate'])pair.push(await setup(browser,{sources},fixture,scenario,settings.viewports[0],variant));
    assert(stable(pair[0].state.canvas)===stable(pair[1].state.canvas)&&sameCamera(pair[0].state.camera,pair[1].state.camera),'Paired canvas/camera differ');
    assert(pair[0].state.inspectorText===pair[1].state.inspectorText,'Paired inspection UI differs');
    for(const current of sample%2?pair:[...pair].reverse()){
     await current.page.bringToFront();await current.map.evaluate(m=>m.on('webglcontextlost',()=>console.error('BENCHMARK_MAP_ERROR: context lost')));
     const before=await proof(browser,current.map);assert(stable(before.identity)===stable(manifest.identity),'GPU identity/reset state changed before sample');assert(before.state.visible==='visible','Measured page hidden');
     await save(`setup-${scenario.id}-${sample}-${current.variant}.json`,before);
     let timeout;const raw=await Promise.race([measure(current.map,scenario),new Promise((_resolve,reject)=>{timeout=setTimeout(()=>reject(new Error('Measurement deadline exceeded')),settings.measurementDeadlineMs);})]).finally(()=>clearTimeout(timeout));
     const after=await proof(browser,current.map);assert(stable(after.identity)===stable(before.identity),'GPU changed or reset during sample');assert(after.state.visible==='visible','Measured page hidden after sample');
     assert(raw.intervals.length>=2&&raw.renderIntervals.length>=2&&raw.renderLatencies.length>=1,'Insufficient samples');
     const dg=current.diagnostics;assert(!dg.pageErrors.length&&!dg.mapErrors.length&&!dg.console.some(row=>row.type==='error'&&!row.text.includes('ERR_BLOCKED_BY_CLIENT'))&&!dg.blockedWrites.length&&!dg.unexpectedApi.length&&!dg.failedLocal.length,'Browser/network/write diagnostics failed: '+json(dg));
     const result={scenario:scenario.id,sample,variant:current.variant,frames:stats(raw.intervals),mapRenders:stats(raw.renderIntervals),cameraToRender:stats(raw.renderLatencies),stalls:{over25ms:raw.intervals.filter(n=>n>25).length,over40ms:raw.intervals.filter(n=>n>40).length,maxMs:Math.max(...raw.intervals)},elapsedMs:raw.elapsedMs,diagnostics:dg,before,after};
     await save(`sample-${scenario.id}-${sample}-${current.variant}.json`,{...result,raw});results.push(result);
     if(sample===3)await current.page.screenshot({path:path.join(output,'artifacts',`${scenario.id}-${current.variant}.png`)});
     console.log(`${scenario.id} ${current.variant} sample${sample} RAFp95=${result.frames.p95} renderp95=${result.mapRenders.p95}`);
    }
   }finally{for(const current of pair){await current.map.dispose();await current.context.close();}}
  }
  assert(stable(manifest.provenance)===stable(await provenance(manifest.runtime)),'Frozen runtime/files changed during round');
  for(const source of Object.values(sources))assert(stable(await hashes(source.directory))===stable(source.hashes),'Frozen build changed during round');
  const comparisons=settings.scenarios.map(scenario=>{
   const median=(variant,metric)=>percentile(results.filter(r=>r.scenario===scenario.id&&r.variant===variant).map(r=>r[metric].p95),.5);
   const control=median(scenario.control,'frames'),candidate=median('candidate','frames');return {scenario:scenario.id,control:scenario.control,controlMedianSampleP95:control,candidateMedianSampleP95:candidate,ratio:candidate/control,threshold:settings.threshold,status:candidate/control<=settings.threshold?'passed':'failed',mapRenders:{control:median(scenario.control,'mapRenders'),candidate:median('candidate','mapRenders')},cameraToRender:{control:median(scenario.control,'cameraToRender'),candidate:median('candidate','cameraToRender')}};
  });
  const status=comparisons.every(r=>r.status==='passed')?'passed':'failed';await save('result.json',{status,finishedAt:new Date().toISOString(),settings,comparisons,results,limitations:manifest.limitations});if(status==='failed')process.exitCode=1;
 }catch(error){await save('error.json',{status:'invalid_or_incomplete',at:new Date().toISOString(),reason:String(error),stack:error.stack,completedSamples:results.length,diagnostics:error.diagnostics??null});throw error;}
 finally{await browser?.close();for(const server of servers)await new Promise(resolve=>server.close(resolve));}
}
if(mode==='prepare')await prepare();else await run();
