import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const output = new URL('./', import.meta.url).pathname;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor:1, locale:'id-ID', timezoneId:'Asia/Jakarta' });
  try {
    const response = await page.goto('https://transit.oyenza.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('body').waitFor({state:'visible'});
    await page.screenshot({path:`${output}/oyenza-${viewport.width}.png`});
    results.push({viewport,status:response.status(),url:page.url(),body:(await page.locator('body').innerText()).slice(0,2000),canvasCount:await page.locator('canvas').count(),note:'ordinary navigation; remote tiles not verified'});
  } catch(error) { results.push({viewport,error:String(error)}); }
  await page.close();
}
await writeFile(`${output}/reference-results.json`,JSON.stringify(results,null,2));
await browser.close();

