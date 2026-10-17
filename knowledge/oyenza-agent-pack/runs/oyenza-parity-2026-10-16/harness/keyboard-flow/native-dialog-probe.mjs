// Compare native modal and nonmodal Tab behavior without application code.
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const result = { startedAt: new Date().toISOString(), browser: browser.version(), cases: [] };
try {
  for (const modal of [true, false]) {
    const page = await browser.newPage();
    await page.setContent('<button id="outside-before">Outside before</button><dialog><button id="inside-a">A</button><button id="inside-b">B</button></dialog><button id="outside-after">Outside after</button>');
    await page.evaluate(modal => { const dialog = document.querySelector('dialog'); modal ? dialog.showModal() : dialog.show(); }, modal);
    const states = [];
    for (const direction of ['Tab', 'Shift+Tab']) {
      for (let index = 0; index < 8; index++) {
        await page.keyboard.press(direction);
        states.push(await page.evaluate(direction => ({ direction, tag: document.activeElement.tagName, id: document.activeElement.id, documentFocused: document.hasFocus(), inside: document.querySelector('dialog').contains(document.activeElement) }), direction));
      }
    }
    result.cases.push({ modal, states });
    await page.close();
  }
} finally {
  await browser.close();
  result.finishedAt = new Date().toISOString();
  await writeFile(new URL('./native-dialog-probe.json', import.meta.url), JSON.stringify(result,null,2));
}
