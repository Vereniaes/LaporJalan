/* Todo:
-> check email, reports, and media with disposable local persistence
*/
import { test, expect, type Page } from '@playwright/test';
import { snapshot, style } from './fixtures';
import { mapHandle, mapState, ready } from '../helpers/map';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import mongoose from '../../../laporjalan-be/node_modules/mongoose/index.js';
import type { Server } from 'node:http';

let server: Server, lastLink = '';
const nativeFetch = globalThis.fetch;
const databaseName = `lj_contributions_browser_${randomUUID().replaceAll('-', '')}`;
test.beforeAll(async () => {
  Object.assign(process.env, { PUBLIC_REPORTS_ONLY: 'true', COMMUNITY_REPORTS_ENABLED: 'true', NODE_ENV: 'test',
    CORS_ORIGIN: process.env.P6_APP_ORIGIN || 'http://127.0.0.1:3005', APP_ORIGIN: process.env.P6_APP_ORIGIN || 'http://127.0.0.1:3005', RESEND_API_KEY: 'test-only', EMAIL_FROM: 'test@example.test', GCS_BUCKET_NAME: '' });
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
  await page.goto('/peta'); await ready(page);
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
  await page.locator('input[type=checkbox][required]:enabled').check();
  await page.screenshot({ path: info.outputPath('review.png') });
  await page.getByRole('button', { name: 'Kirim laporan', exact: true }).click();
  await expect(page.locator('.lj-detail h2')).toHaveText(`Pekerjaan jalan - uji ${info.project.name}`);
  await page.getByRole('tab', { name: /^Riwayat/ }).click();
  await expect(page.getByRole('heading', { name: 'Riwayat pengamatan' })).toBeVisible();
  await expect(page.locator('.lj-timeline li')).toHaveCount(1);
  await expect(page.locator('.lj-detail .lj-status')).toContainText('Dilaporkan');
  expect((await mapState(page))?.pitch).toBeCloseTo(modeBefore!, 2);
  await page.getByRole('button', { name: 'Tambah pembaruan', exact: true }).click();
  await page.getByLabel('Kondisi saat ini').selectOption('work_observed');
  await page.getByLabel('Catatan pembaruan').fill('Terlihat pekerjaan di lokasi. Catatan pengujian terisolasi.');
  await expect(page.getByLabel('Cari laporan', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Tambah laporan', exact: true })).toBeDisabled();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Kembali ke daftar', exact: true }).click();
  await expect(page.getByLabel('Catatan pembaruan')).toContainText('Terlihat pekerjaan');
  await page.locator('input[type=checkbox][required]:enabled').check();
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await expect(page.locator('.lj-timeline li')).toHaveCount(2);
  await expect(page.locator('.lj-detail .lj-status')).toContainText('Terlihat dikerjakan');
  await page.screenshot({ path: info.outputPath('history.png') });
  await page.reload();
  await expect(page.locator('.lj-detail h2')).toHaveText(`Pekerjaan jalan - uji ${info.project.name}`);
  await page.getByRole('button', { name: 'Kembali ke daftar', exact: true }).click();
  if (await page.getByRole('button', { name: 'Perluas daftar' }).isVisible()) await page.getByRole('button', { name: 'Perluas daftar' }).click();
  await page.getByRole('button', { name: 'Laporan sendiri', exact: true }).click();
  await expect(page.locator('.lj-report-row')).toHaveCount(1);
  await page.locator('.lj-report-row').click();
  await page.getByRole('tab', { name: /^Riwayat/ }).click();
  await expect(page.locator('.lj-timeline li')).toHaveCount(2);
  await expect(page.locator('#citizen-history').getByAltText('Bukti laporan 1')).toBeVisible();
  expect(await page.locator('#citizen-history').getByAltText('Bukti laporan 1').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1);
  await page.getByRole('button', { name: 'Kembali ke daftar', exact: true }).click();
  await page.getByRole('button', { name: 'Keluar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tambah pembaruan', exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('failed submission retains inputs and retries once without duplicate reports', async ({ page }) => {
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.goto('/peta');
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(`retry-${randomUUID()}@example.test`);
  await page.getByRole('button', { name: 'Kirim tautan masuk' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tautan masuk telah dikirim' })).toBeVisible();
  await page.goto(`/#masuk=${lastLink}`); await page.getByRole('button', { name: 'Konfirmasi masuk' }).click();
  await page.getByLabel('Lintang', { exact: true }).fill('-6.2'); await page.getByLabel('Bujur', { exact: true }).fill('106.84');
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await page.getByLabel('Judul laporan', { exact: true }).fill('Pengiriman terputus untuk pengujian');
  await page.getByLabel('Uraian kejadian', { exact: true }).fill('Data pengujian terisolasi; respons pertama sengaja diputus.');
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click(); await page.locator('input[type=checkbox][required]:enabled').check();
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


async function publicFixture(page: Page) {
  await page.route('**/api/public-reports', route => route.fulfill({ json: snapshot }));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
}
async function reportFields(page: Page, title: string, image = false) {
  await page.getByLabel('Lintang', { exact: true }).fill('-6.20');
  await page.getByLabel('Bujur', { exact: true }).fill('106.84');
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await page.getByLabel('Judul laporan', { exact: true }).fill(title);
  await page.getByLabel('Uraian kejadian', { exact: true }).fill('Bukti pengujian terisolasi untuk memeriksa laporan, bukan kejadian produksi.');
  if (image) {
    const encoded = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360; const c = canvas.getContext('2d')!; c.fillStyle = '#e4eae8'; c.fillRect(0, 0, 640, 360); c.fillStyle = '#0b5b70'; c.font = 'bold 34px sans-serif'; c.fillText('MEDIA UJI', 40, 130); c.font = '22px sans-serif'; c.fillText('Fixture pengujian - bukan foto kejadian', 40, 180); return canvas.toDataURL('image/png').split(',')[1]; });
    await page.locator('input[type=file]').setInputFiles({ name: 'test-only.png', mimeType: 'image/png', buffer: Buffer.from(encoded, 'base64') });
  }
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
}

test('management email opened in another tab preserves intent and private name preference', async ({ page, context }, info) => {
  test.setTimeout(60_000);
  await publicFixture(page); await page.goto('/peta');
  const expand = page.getByRole('button', { name: 'Perluas daftar', exact: true });
  if (await expand.isVisible()) await expand.click();
  await page.getByRole('button', { name: 'Masuk untuk mengelola laporan', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(`manage-${randomUUID()}@example.test`);
  await page.getByRole('button', { name: 'Kirim tautan masuk', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tautan masuk telah dikirim' })).toBeVisible();
  const tab = await context.newPage(); await publicFixture(tab);
  await tab.goto(`/#masuk=${lastLink}`);
  await tab.getByRole('button', { name: 'Konfirmasi masuk', exact: true }).click();
  await expect(tab.locator('.lj-account-row').getByRole('button', { name: 'Lihat semua laporan', exact: true })).toBeVisible();
  await expect(tab.getByRole('heading', { name: 'Tambah laporan', exact: true })).toHaveCount(0);
  await expect(tab.locator('.lj-empty')).toBeVisible();
  await tab.locator('.lj-empty').getByRole('button', { name: 'Lihat semua laporan', exact: true }).click();
  await expect(tab.locator('.lj-report-row')).not.toHaveCount(0);
  await tab.locator('.lj-account-row').getByRole('button', { name: 'Laporan sendiri', exact: true }).click();
  await tab.getByRole('button', { name: 'Akun', exact: true }).click();
  await tab.getByRole('dialog').getByRole('textbox', { name: 'Nama tampilan (opsional)', exact: true }).fill('Nama Pilihan Uji');
  await tab.getByRole('button', { name: 'Simpan nama pilihan', exact: true }).click();
  await expect(tab.getByRole('dialog')).toHaveCount(0);
  await tab.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await reportFields(tab, `Anonim opt-in - ${info.project.name}`);
  await expect(tab.getByLabel('Tampilkan nama pada laporan ini.', { exact: true })).not.toBeChecked();
  await tab.locator('input[type=checkbox][required]').check();
  await tab.getByRole('button', { name: 'Kirim laporan', exact: true }).click();
  await expect(tab.locator('.lj-detail h2')).toHaveText(`Anonim opt-in - ${info.project.name}`);
  await expect(tab.locator('.lj-facts')).toContainText('Pelapor');
  await expect(tab.locator('.lj-detail')).not.toContainText('Nama Pilihan Uji');
  await tab.close();
});

test('named history, deep link, withdrawal and restoration keep private access separate', async ({ page, browser }, info) => {
  test.setTimeout(90_000);
  await publicFixture(page); await page.goto('/peta');
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(`identity-${randomUUID()}@example.test`);
  await page.getByRole('button', { name: 'Kirim tautan masuk', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tautan masuk telah dikirim' })).toBeVisible();
  await page.goto(`/#masuk=${lastLink}`); await page.getByRole('button', { name: 'Konfirmasi masuk', exact: true }).click();
  const title = `Identitas dan publikasi - ${info.project.name}`;
  await reportFields(page, title, true);
  await page.getByLabel('Tampilkan nama pada laporan ini.', { exact: true }).check();
  await page.getByLabel('Nama tampilan', { exact: true }).fill('Pelapor Uji Nama');
  await page.locator('input[type=checkbox][required]:enabled').check();
  await page.getByRole('button', { name: 'Kirim laporan', exact: true }).click();
  await expect(page.locator('.lj-detail h2')).toHaveText(title);
  await expect(page.locator('.lj-detail-date')).toContainText('Pelapor Uji Nama');
  const url = page.url(); expect(url).toContain('?laporan=');
  const reportId = new URL(url).searchParams.get('laporan')!;
  const guestContext = await browser.newContext({ viewport: info.project.use.viewport });
  const guest = await guestContext.newPage(); await publicFixture(guest);
  await guest.route('**/api/community/reports', route => route.fulfill({ json: { reports: [], nextCursor: null } }));
  await guest.goto(url);
  await expect(guest.locator('.lj-detail h2')).toHaveText(title);
  await expect(guest.getByRole('heading', { name: 'Kelola publikasi' })).toHaveCount(0);
  const media = page.locator('#citizen-summary').getByAltText('Bukti laporan 1');
  await expect(media).toBeVisible();
  const mediaPath = await media.getAttribute('src');
  expect(mediaPath).toContain('/media/');
  await page.getByRole('button', { name: 'Tambah pembaruan', exact: true }).click();
  await page.getByLabel('Kondisi saat ini', { exact: true }).selectOption('work_observed');
  await page.getByLabel('Catatan pembaruan').fill('Perkembangan uji - bukti tambahan dari pemilik laporan.');
  const video = execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=0x0b5b70:s=320x180:d=1', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', '-movflags', 'frag_keyframe+empty_moov', '-f', 'mp4', 'pipe:1']);
  await page.locator('input[type=file]').setInputFiles({ name: 'video-uji.mp4', mimeType: 'video/mp4', buffer: video });
  await page.locator('input[type=checkbox][required]:enabled').check();
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await page.getByRole('tab', { name: /^Riwayat/ }).click();
  await expect(page.locator('.lj-timeline li')).toHaveCount(2);
  await expect(page.locator('.lj-timeline li').first()).toContainText('Terlihat dikerjakan');
  const savedVideo = page.locator('.lj-timeline li').first().locator('video');
  await expect(savedVideo).toBeVisible();
  await expect.poll(() => savedVideo.evaluate((el: HTMLVideoElement) => el.readyState)).toBeGreaterThan(0);
  await savedVideo.evaluate((el: HTMLVideoElement) => { el.muted = true; return el.play(); });
  await expect.poll(() => savedVideo.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(0);
  await savedVideo.evaluate((el: HTMLVideoElement) => el.pause());
  await expect(page.locator('.lj-timeline li').last()).toContainText('Laporan dibuat');
  await expect(page.locator('.lj-timeline li .lj-entry-meta').first()).toContainText('Pelapor Uji Nama');
  await page.getByRole('button', { name: 'Ubah nama publik', exact: true }).click();
  await page.getByLabel('Tampilkan nama pada laporan ini.', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Simpan nama', exact: true }).click();
  await expect(page.locator('.lj-detail')).not.toContainText('Pelapor Uji Nama');
  await page.locator('.lj-detail').evaluate(el => el.scrollTop = 0);
  await page.screenshot({ path: info.outputPath('citizen-history.png') });
  await page.getByRole('tab', { name: 'Ringkasan', exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Tarik laporan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Publikasikan kembali', exact: true })).toBeVisible();
  expect((await guest.request.get(`http://127.0.0.1:5005/api/community/reports/${reportId}`)).status()).toBe(404);
  expect((await guest.request.get(mediaPath!)).status()).toBe(404);
  await expect(page.locator('#citizen-summary').getByAltText('Bukti laporan 1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tambah pembaruan', exact: true })).toHaveCount(0);
  await page.locator('.lj-detail').evaluate(el => el.scrollTop = 0);
  await page.screenshot({ path: info.outputPath('withdrawn-report.png') });
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Publikasikan kembali', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tarik laporan', exact: true })).toBeVisible();
  expect((await guest.request.get(mediaPath!)).status()).toBe(200);
  await page.getByText('Kelola lampiran (2)', { exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Tarik lampiran', exact: true }).first().click();
  await expect(page.locator('#citizen-summary')).toContainText('Tanpa lampiran');
  expect((await guest.request.get(mediaPath!)).status()).toBe(404);
  await guest.reload(); await expect(guest.locator('.lj-detail')).not.toContainText('Pelapor Uji Nama');
  await guestContext.close();
  await page.setViewportSize({ width: 320, height: 740 });
  await page.locator('.lj-detail').evaluate(el => el.scrollTop = 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.lj-detail h2')).toBeVisible();
  await page.screenshot({ path: info.outputPath('citizen-narrow.png') });
});


test('expired owner session preserves note and file through login and retry', async ({ page }, info) => {
  test.setTimeout(60_000);
  await publicFixture(page); await page.goto('/peta');
  const email = `expiry-${randomUUID()}@example.test`, title = `Draft sesi habis - ${info.project.name}`;
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Kirim tautan masuk', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tautan masuk telah dikirim' })).toBeVisible();
  await page.goto(`/#masuk=${lastLink}`); await page.getByRole('button', { name: 'Konfirmasi masuk', exact: true }).click();
  await reportFields(page, title); await page.locator('input[type=checkbox][required]:enabled').check();
  await page.getByRole('button', { name: 'Kirim laporan', exact: true }).click();
  await expect(page.locator('.lj-detail h2')).toHaveText(title);
  await page.goto('/peta');
  await expect(page.locator('.lj-report-row').filter({ hasText: title })).toBeVisible();
  await page.locator('.lj-report-row').filter({ hasText: title }).click();
  await page.getByRole('button', { name: 'Tambah pembaruan', exact: true }).click();
  const note = 'Catatan dan lampiran tetap tersedia setelah sesi berakhir.';
  await page.getByLabel('Catatan pembaruan').fill(note);
  await page.locator('input[type=file]').setInputFiles({ name: 'draft-tersimpan.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
  await page.locator('input[type=checkbox][required]:enabled').check();
  const row = await mongoose.connection.db!.collection('citizen_reports').findOne({ title });
  await mongoose.connection.db!.collection('citizen_sessions').deleteMany({ accountId: row!.ownerId });
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Masuk untuk mengelola laporan', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Masuk untuk mengelola laporan', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Kirim tautan masuk', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tautan masuk telah dikirim' })).toBeVisible();
  // Hash changes emulate clicking the emailed link without unloading the unsaved draft.
  await page.evaluate(token => { location.hash = `masuk=${token}`; }, lastLink);
  await page.getByRole('button', { name: 'Konfirmasi masuk', exact: true }).click();
  await expect(page.getByLabel('Catatan pembaruan')).toHaveValue(note);
  await expect(page.getByAltText('Pratinjau draft-tersimpan.png')).toBeVisible();
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await page.getByRole('tab', { name: /^Riwayat/ }).click();
  await expect(page.locator('.lj-timeline li')).toHaveCount(2);
  await expect(page.locator('.lj-timeline li').first()).toContainText(note);
});


async function conditionLogin(page: Page, email: string) {
  await publicFixture(page); await page.goto('/peta');
  await page.getByRole('button', { name: 'Tambah laporan', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Kirim tautan masuk', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tautan masuk telah dikirim' })).toBeVisible();
  await page.goto(`/#masuk=${lastLink}`); await page.getByRole('button', { name: 'Konfirmasi masuk', exact: true }).click();
  await page.getByLabel('Lintang', { exact: true }).fill('-6.196562');
  await page.getByLabel('Bujur', { exact: true }).fill('106.8232095');
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
}
async function drawCondition(page: Page, shape: 'line'|'area') {
  await page.getByLabel('Bentuk lokasi', { exact: true }).selectOption(shape);
  await page.getByRole('button', { name: shape==='line'?'Gambar ruas':'Gambar area', exact: true }).click();
  const canvas=page.locator('.lj-map-canvas');
  await canvas.click({position:{x:80,y:95}});await canvas.click({position:{x:140,y:115}});
  if(shape==='area')await canvas.click({position:{x:100,y:155}});
  await page.getByRole('button',{name:'Selesai menggambar',exact:true}).click();
  await expect(page.getByLabel('Lokasi dan bentuk telah diperiksa.',{exact:true})).not.toBeChecked();
  const map=await mapHandle(page);
  await expect.poll(async()=>map.evaluate(m=>m.getSource('condition-sketch').serialize().data.features[0]?.geometry.type)).toBe(shape==='line'?'LineString':'Polygon');
  await map.dispose();
  await page.getByLabel('Lokasi dan bentuk telah diperiksa.',{exact:true}).check();
}

test('confirmed line and area persist; ordinary notes preserve closure observation time',async({page},info)=>{
  test.setTimeout(90_000);await conditionLogin(page,`condition-shape-${randomUUID()}@example.test`);
  const title=`MODEL UJI - penutupan ruas ${info.project.name}`;
  await page.getByLabel('Judul laporan',{exact:true}).fill(title);
  await page.getByLabel('Uraian kejadian',{exact:true}).fill('Data pengujian terisolasi untuk kondisi penutupan, bukan laporan aktual.');
  await page.getByLabel('Jenis kondisi',{exact:true}).selectOption('closure');
  const oldLocal=await page.evaluate(()=>{const d=new Date(Date.now()-25*3600_000);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);});
  await page.getByLabel('Waktu pengamatan',{exact:true}).fill(oldLocal);
  await page.getByLabel('Pengamatan akses',{exact:true}).selectOption('closed');
  await drawCondition(page,'line');
  await page.screenshot({path:info.outputPath('confirmed-line-form.png')});
  await page.getByRole('button',{name:'Lanjutkan',exact:true}).click();
  await page.locator('input[type=checkbox][required]:enabled').check();
  await page.getByRole('button',{name:'Kirim laporan',exact:true}).click();
  await expect(page.locator('.lj-detail h2')).toHaveText(title);
  await expect(page.locator('#citizen-summary .lj-condition-summary')).toContainText('Perlu pembaruan');
  const id=new URL(page.url()).searchParams.get('laporan')!;
  const read=async()=> (await page.request.get(`http://127.0.0.1:5005/api/community/reports/${id}`)).json();
  const created=await read();expect(created.condition.geometry.type).toBe('LineString');
  await page.reload();await expect(page.locator('.lj-detail h2')).toHaveText(title);
  await page.getByRole('button',{name:'Tambah pembaruan',exact:true}).click();
  await page.getByLabel('Catatan pembaruan').fill('Catatan biasa tidak memperbarui umur pengamatan kondisi.');
  await page.getByLabel('Catatan dan lampiran boleh dipublikasikan. Lampiran telah diperiksa agar tidak memuat data pribadi.',{exact:true}).check();
  await page.getByRole('button',{name:'Simpan pembaruan',exact:true}).click();
  await expect(page.getByRole('status').filter({hasText:'Perubahan tersimpan.'})).toBeVisible();
  expect((await read()).condition).toEqual(created.condition);
  await page.getByRole('button',{name:'Tambah pembaruan',exact:true}).click();
  await page.getByLabel('Catatan pembaruan').fill('Bentuk area digambar ulang sebagai pengamatan pelapor.');
  await page.getByLabel('Ubah kondisi dan bentuk',{exact:true}).check();
  await drawCondition(page,'area');
  await page.getByLabel('Catatan dan lampiran boleh dipublikasikan. Lampiran telah diperiksa agar tidak memuat data pribadi.',{exact:true}).check();
  await page.getByRole('button',{name:'Simpan pembaruan',exact:true}).click();
  await expect(page.getByRole('button',{name:'Tambah pembaruan',exact:true})).toBeVisible();
  const updated=await read();expect(updated.condition.geometry.type).toBe('Polygon');expect(updated.condition.observedAt).toBe(created.condition.observedAt);
  await page.getByRole('tab',{name:/^Riwayat/}).click();
  await expect(page.locator('.lj-timeline li')).toHaveCount(3);
  await expect(page.locator('.lj-timeline li').last()).toContainText('Ruas dikonfirmasi pelapor');
  await expect(page.locator('.lj-timeline li').first()).toContainText('Area dikonfirmasi pelapor');
  await page.screenshot({path:info.outputPath('line-area-history.png')});
});

test('measured point feeds in-map geometry and explicit removal retains historical condition',async({page},info)=>{
  test.setTimeout(60_000);await conditionLogin(page,`condition-bowl-${randomUUID()}@example.test`);
  const title=`MODEL UJI - dimensi pelapor ${info.project.name}`;
  await page.getByLabel('Judul laporan',{exact:true}).fill(title);
  await page.getByLabel('Uraian kejadian',{exact:true}).fill('Ukuran sintetis untuk menguji konversi visual; bukan hasil survei lapangan.');
  await page.getByLabel('Jenis kondisi',{exact:true}).selectOption('pothole');
  await page.getByLabel('Waktu pengamatan',{exact:true}).fill('2026-10-28T10:00');
  await page.locator('.lj-dimension-fields summary').click();
  await page.getByLabel('Metode dimensi',{exact:true}).selectOption('measured');
  await page.getByLabel('Alat pengukuran',{exact:true}).fill('Meteran fixture');
  await page.getByLabel('Lebar (m)',{exact:true}).fill('0.52');
  await page.getByLabel('Kedalaman (m)',{exact:true}).fill('0.075');
  await page.getByLabel('Lokasi dan bentuk telah diperiksa.',{exact:true}).check();
  await page.getByRole('button',{name:'Lanjutkan',exact:true}).click();await page.locator('input[type=checkbox][required]:enabled').check();
  await page.getByRole('button',{name:'Kirim laporan',exact:true}).click();await expect(page.locator('.lj-detail h2')).toHaveText(title);
  await page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true}).click();
  await expect.poll(async()=>(await mapState(page))?.inspection?.renderCount??0).toBeGreaterThan(0);
  expect((await mapState(page))!.inspection!.widthM).toBe(.52);expect((await mapState(page))!.inspection!.depthM).toBe(.075);
  await page.screenshot({path:info.outputPath('persisted-condition-inspection.png')});
  await page.getByRole('button',{name:'Keluar inspeksi',exact:true}).click();
  await page.getByRole('button',{name:'Tambah pembaruan',exact:true}).click();
  await page.getByLabel('Catatan pembaruan').fill('Kondisi dihapus secara eksplisit; riwayat pengamatan tetap tersedia.');
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Hapus kondisi dan bentuk',exact:true}).click();
  await page.getByLabel('Catatan dan lampiran boleh dipublikasikan. Lampiran telah diperiksa agar tidak memuat data pribadi.',{exact:true}).check();
  await page.getByRole('button',{name:'Simpan pembaruan',exact:true}).click();
  await expect(page.getByRole('button',{name:'Tambah pembaruan',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true})).toHaveCount(0);
  expect((await mapState(page))?.inspection).toBeUndefined();
  await page.getByRole('tab',{name:/^Riwayat/}).click();
  await expect(page.locator('.lj-timeline li').first()).toContainText('Kondisi dan bentuk dihapus');
  await expect(page.locator('.lj-timeline li').last()).toContainText('Lebar 0.52 m');
  await page.reload();await expect(page.getByRole('button',{name:'Lihat ilustrasi 3D',exact:true})).toHaveCount(0);
});
