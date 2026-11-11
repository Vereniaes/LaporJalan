/* Todo:
-> dark mode on /peta (owner, 11 Nov): follows the device first, the header button decides after and is remembered; the basemap follows
-> Miko on the map page: looking around beside the title, flying over the map while reports load (never with reduced motion)
*/
import { test, expect, Page } from '@playwright/test';
import { snapshot, style } from './fixtures';
import { ready } from '../helpers/map';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/community/capabilities', route => route.fulfill({ json: { reports: true, write: true, login: true, reason: null } }));
  await page.route('**/api/community/reports*', route => route.fulfill({ json: { reports: [], nextCursor: null } }));
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
});

// the basemap background colour, read from the live map (same fiber walk as helpers/map.ts)
const background = (page: Page) => page.evaluate(() => {
  const container = document.querySelector('.lj-map .maplibregl-map');
  const key = container && Object.keys(container).find(k => k.startsWith('__reactFiber$'));
  let fiber = key && (container as any)[key];
  while (fiber) {
    for (let hook = fiber.memoizedState; hook; hook = hook.next) {
      const map = hook.memoizedState?.current;
      if (map && typeof map.getPaintProperty === 'function') return map.getPaintProperty('background', 'background-color');
    }
    fiber = fiber.return;
  }
  return null;
});

test('the page follows a dark device, the button switches and is remembered, and the map follows', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/peta');
  const app = page.locator('.lj-app'), toggle = page.getByRole('button', { name: 'Mode gelap', exact: true });
  await expect(app).toHaveClass(/lj-theme-dark/);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await ready(page);
  await expect.poll(() => background(page)).toBe('#161b21');
  // the light logo would vanish on the dark header
  await expect(page.locator('.lj-brand img')).toHaveAttribute('src', '/brand/lockup-horizontal-dark.svg');

  await toggle.click();
  await expect(app).toHaveClass(/lj-theme-light/);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => background(page)).toBe('#e8ede7'); // the style's own colour comes back
  await page.reload();
  await expect(app).toHaveClass(/lj-theme-light/); // the choice beats the device
  // text on the yellow action stays dark in both themes
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Tambah laporan' })).toHaveCSS('color', 'rgb(29, 32, 35)');
});

test('Miko looks around beside the title and flies over the map while reports load', async ({ page }) => {
  await page.goto('/peta');
  await expect(page.locator('.lj-panel-intro .lj-intro-miko .miko-still')).toHaveAttribute('src', '/home/miko/look-192.webp');
  await expect(page.locator('.lj-intro-miko')).toHaveAttribute('aria-hidden', 'true');
  await ready(page);
  const flight = page.locator('.lj-flight');
  await expect(flight).toHaveCount(0, { timeout: 6000 }); // the first load's flight, if any, is over
  await page.getByRole('button', { name: 'Perbarui laporan' }).click();
  await expect(flight).toHaveCount(1);
  await expect(flight).toHaveAttribute('aria-hidden', 'true');
  await expect(flight).toHaveCount(0, { timeout: 6000 }); // one pass, then gone
});

test('with reduced motion Miko stays still and never flies', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/peta');
  await ready(page);
  await page.getByRole('button', { name: 'Perbarui laporan' }).click();
  await page.waitForTimeout(800);
  await expect(page.locator('.lj-flight')).toHaveCount(0);
  await expect(page.locator('.lj-intro-miko .miko-anim')).toHaveCount(0);
  await expect(page.locator('.lj-intro-miko .miko-still')).toBeVisible();
});
