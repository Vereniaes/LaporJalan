# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: empty-mode.browser.spec.ts >> C06 removed selected report restores the mode before inspection
- Location: tests/empty-mode.browser.spec.ts:4:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('#b-3d')
Expected: "false"
Received: "true"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('#b-3d')
    14 × locator resolved to <button id="b-3d" aria-pressed="true" title="Perspektif 3D / 2D" class="px-3.5 py-2.5 rounded-2xl shadow-floating font-black text-xs transition-all border flex items-center justify-center space-x-1 active:scale-95 bg-white text-slate-900 border-slate-200">…</button>
       - unexpected value "true"

```

```yaml
- button "3D" [pressed]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { prepare, ready, mapState } from './helpers/map';
  3  | 
  4  | test('C06 removed selected report restores the mode before inspection', async ({ page }) => {
  5  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  6  |   await prepare(page);
  7  |   let release!: () => void;
  8  |   const gate = new Promise<void>(resolve => { release = resolve; });
  9  |   await page.route('**/api/reports', async route => { await gate; await route.fulfill({ json: { data: [] } }); });
  10 |   await page.reload();
  11 |   await ready(page);
  12 |   await page.locator('#b-3d').click();
  13 |   await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  14 |   await ready(page);
  15 |   release();
  16 |   await expect(page.getByRole('button', { name: 'Daftar (0)' })).toBeVisible();
> 17 |   await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
     |                                       ^ Error: expect(locator).toHaveAttribute(expected) failed
  18 |   await expect.poll(async () => (await mapState(page))!.pitch).toBe(0);
  19 |   await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  20 | });
  21 | 
```