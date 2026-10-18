/* Full-stack citizen flow against a disposable local database.
Todo:
-> email is intercepted; report and media APIs use real persistence
*/
import { test, expect } from '@playwright/test';
import { snapshot, style } from './fixtures';
import { mapState, ready } from '../helpers/map';
import { randomUUID } from 'node:crypto';
import mongoose from '../../../laporjalan-be/node_modules/mongoose/index.js';
import type { Server } from 'node:http';

let server: Server, lastLink = '';
const nativeFetch = globalThis.fetch;
const databaseName = `lj_contributions_browser_${randomUUID().replaceAll('-', '')}`;
test.beforeAll(async () => {
  Object.assign(process.env, { PUBLIC_REPORTS_ONLY: 'true', COMMUNITY_REPORTS_ENABLED: 'true', NODE_ENV: 'test',
    CORS_ORIGIN: 'http://127.0.0.1:3005', APP_ORIGIN: 'http://127.0.0.1:3005', RESEND_API_KEY: 'test-only', EMAIL_FROM: 'test@example.test', GCS_BUCKET_NAME: '' });
  globalThis.fetch = async (input, init) => {
    if (String(input) === 'https://api.resend.com/emails') {
      lastLink = /#masuk=([\w-]+)/.exec(JSON.parse(String(init?.body)).text)![1];
      return new Response('{"id":"local-test"}');
    }
    return nativeFetch(input, init);
  };
  await mongoose.connect(`mongodb://127.0.0.1:27019/${databaseName}`);
  const { initCommunity } = await import('../../../laporjalan-be/dist/community/db.js'); await initCommunity();
  const { app } = await import('../../../laporjalan-be/dist/app.js');
  server = app.listen(5005, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
});
test.afterAll(async () => {
  if (mongoose.connection.name?.startsWith('lj_contributions_browser_')) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server?.closeAllConnections();
  if (server) await new Promise<void>(resolve => server.close(() => resolve()));
  globalThis.fetch = nativeFetch;
});

test('email login, map report, attachment and owner update survive reload', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/'); await ready(page);
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill(`browser-${info.project.name}@example.test`);
  await page.getByRole('button', { name: 'Kirim tautan masuk' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tautan masuk telah dikirim' })).toBeVisible();
  expect(lastLink).toHaveLength(43);
  await page.goto(`/#masuk=${lastLink}`);
  await page.getByRole('button', { name: 'Konfirmasi masuk' }).click();
  await expect(page.getByRole('heading', { name: 'Tambah laporan', exact: true })).toBeVisible();
  expect(page.url()).not.toContain(lastLink);
  await ready(page);
  await page.getByRole('button', { name: 'Mode 3D' }).click(); await ready(page);
  const modeBefore = (await mapState(page))?.pitch;
  await page.locator('.lj-map-canvas').click({ position: { x: 80, y: 75 } });
  await expect(page.getByLabel('Lintang', { exact: true })).not.toHaveValue('');
  await page.getByLabel('Lintang', { exact: true }).fill('-6.20');
  await page.getByLabel('Bujur', { exact: true }).fill('106.84');
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await page.getByLabel('Kategori', { exact: true }).selectOption('construction');
  await page.getByLabel('Judul laporan', { exact: true }).fill(`Pekerjaan jalan - uji ${info.project.name}`);
  await page.getByLabel('Uraian kejadian', { exact: true }).fill('Isian uji terisolasi, tidak menjadi data aplikasi produksi.');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  await page.locator('input[type=file]').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByAltText('Pratinjau fixture.png')).toBeVisible();
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await expect(page.getByText('Belum dikirim ke kanal pemerintah.', { exact: false })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.screenshot({ path: info.outputPath('review.png') });
  await page.getByRole('button', { name: 'Kirim laporan', exact: true }).click();
  await expect(page.locator('.lj-detail h2')).toHaveText(`Pekerjaan jalan - uji ${info.project.name}`);
  await expect(page.getByRole('heading', { name: 'Riwayat pembaruan' })).toBeVisible();
  await expect(page.locator('.lj-timeline li')).toHaveCount(1);
  await expect(page.locator('.lj-detail .lj-status')).toContainText('Dilaporkan');
  expect((await mapState(page))?.pitch).toBeCloseTo(modeBefore!, 2);
  await page.getByRole('button', { name: 'Tambah pembaruan', exact: true }).click();
  await page.getByLabel('Kondisi saat ini').selectOption('work_observed');
  await page.getByLabel('Catatan pembaruan').fill('Terlihat pekerjaan di lokasi. Catatan pengujian terisolasi.');
  await expect(page.getByLabel('Cari laporan', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Keluar', exact: true })).toBeDisabled();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Kembali ke daftar', exact: true }).click();
  await expect(page.getByLabel('Catatan pembaruan')).toContainText('Terlihat pekerjaan');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await expect(page.locator('.lj-timeline li')).toHaveCount(2);
  await expect(page.locator('.lj-detail .lj-status')).toContainText('Terlihat dikerjakan');
  await page.screenshot({ path: info.outputPath('history.png') });
  await page.reload();
  if (await page.getByRole('button', { name: 'Perluas daftar' }).isVisible()) await page.getByRole('button', { name: 'Perluas daftar' }).click();
  await page.getByRole('button', { name: 'Laporan sendiri', exact: true }).click();
  await expect(page.locator('.lj-report-row')).toHaveCount(1);
  await page.locator('.lj-report-row').click();
  await expect(page.locator('.lj-timeline li')).toHaveCount(2);
  await expect(page.getByAltText('Bukti laporan 1')).toBeVisible();
  expect(await page.getByAltText('Bukti laporan 1').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1);
  await page.getByRole('button', { name: 'Keluar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tambah pembaruan', exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('failed submission retains inputs and retries once without duplicate reports', async ({ page }) => {
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(`retry-${randomUUID()}@example.test`);
  await page.getByRole('button', { name: 'Kirim tautan masuk' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tautan masuk telah dikirim' })).toBeVisible();
  await page.goto(`/#masuk=${lastLink}`); await page.getByRole('button', { name: 'Konfirmasi masuk' }).click();
  await page.getByLabel('Lintang', { exact: true }).fill('-6.2'); await page.getByLabel('Bujur', { exact: true }).fill('106.84');
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await page.getByLabel('Judul laporan', { exact: true }).fill('Pengiriman terputus untuk pengujian');
  await page.getByLabel('Uraian kejadian', { exact: true }).fill('Data pengujian terisolasi; respons pertama sengaja diputus.');
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click(); await page.getByRole('checkbox').check();
  let first = true;
  await page.route('**/api/community/reports', async route => {
    if (route.request().method() === 'POST' && first) { first = false; await route.fetch(); await route.abort(); } else await route.continue();
  });
  await page.getByRole('button', { name: 'Kirim laporan', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Isi tetap tersedia');
  await page.getByRole('button', { name: 'Kirim laporan', exact: true }).click();
  await expect(page.locator('.lj-detail h2')).toHaveText('Pengiriman terputus untuk pengujian');
  expect(await mongoose.connection.db!.collection('citizen_reports').countDocuments({ title: 'Pengiriman terputus untuk pengujian' })).toBe(1);
});
