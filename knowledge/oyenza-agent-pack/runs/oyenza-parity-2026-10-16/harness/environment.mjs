import { chromium } from 'playwright';
import os from 'node:os';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page = await browser.newPage();
const gpu = await page.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return {webgl2:false};
  const ext=gl.getExtension('WEBGL_debug_renderer_info');
  return {webgl2:true,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),vendor:ext?gl.getParameter(ext.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR)};
});
await writeFile(new URL('./environment.json',import.meta.url),JSON.stringify({time:new Date().toISOString(),node:process.version,executable:process.execPath,os:os.release(),platform:os.platform(),cpus:os.cpus()[0].model,browser:browser.version(),gpu,performanceNote:'Software rendering. No FPS, latency or memory pass claimed.'},null,2));
await browser.close();
