import { test, expect } from '@playwright/test';
import { prepare, ready, mapState } from './helpers/map';

test('A01 R03 optional profile and comparison support keyboard close', async ({ page }, info) => {
  await prepare(page);
  const profile = page.getByRole('button', { name: 'Profil ilustratif', exact: true });
  await profile.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('canvas')).toHaveCount(1);
  await expect(dialog.getByText(/Lebar: 52 cm/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Putar kanan' }).click();
  await page.screenshot({ path: info.outputPath('optional-profile.png') });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(profile).toBeFocused();
  await expect(page.locator('canvas')).toHaveCount(1);
  const compare = page.getByRole('button', { name: 'Sebelum vs Sesudah', exact: true });
  await compare.focus();
  await page.keyboard.press('Enter');
  const slider = page.getByRole('slider', { name: 'Batas perbandingan' });
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '55');
  await page.screenshot({ path: info.outputPath('comparison-demo.png') });
  await page.keyboard.press('Escape');
  await expect(compare).toBeFocused();
});

test('D04 R02 report flow labels heuristics and example location', async ({ page }, info) => {
  await prepare(page);
  await page.getByRole('button', { name: 'Lapor', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Lubang Aspal' }).click();
  await expect(dialog.getByText(/Skor heuristik/)).toBeVisible({ timeout: 15000 });
  await expect(dialog.getByText(/Akurasi/)).toHaveCount(0);
  await expect(dialog.getByText(/Alamat contoh - koordinat demo, bukan GPS/)).toBeVisible();
  await page.screenshot({ path: info.outputPath('report-example.png') });
  const request = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/api/reports'));
  await dialog.getByRole('button', { name: 'Simpan Laporan Contoh' }).click();
  const sent = (await request).postDataJSON();
  expect(sent.lat).toBe(-6.1985);
  expect(sent.lng).toBe(106.8235);
  expect(sent.description).toContain('bukan GPS');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /estimasi contoh/ })).toBeVisible();
});

test('C02 A02 reset exits inspection and reduced motion stays idle', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await prepare(page);
  await page.locator('#b-3d').click();
  await page.getByRole('button', { name: 'Lihat Lapangan 3D' }).click();
  await ready(page);
  const before = (await mapState(page))!;
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect((await mapState(page))!.bearing).toBe(before.bearing);
  await page.getByTitle('Reset Sudut Pandang').click();
  await ready(page);
  await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
  expect((await mapState(page))!.pitch).toBe(0);
});
