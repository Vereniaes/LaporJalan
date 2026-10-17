import { test, expect } from '@playwright/test';
import { prepare, ready, mapState } from './helpers/map';

test('C06 removed selected report restores the mode before inspection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/reports', async route => { await gate; await route.fulfill({ json: { data: [] } }); });
  await page.reload();
  await ready(page);
  await page.locator('#b-3d').click();
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  release();
  await expect(page.getByRole('button', { name: 'Daftar (0)' })).toBeVisible();
  await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => (await mapState(page))!.pitch).toBe(0);
  await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
});
