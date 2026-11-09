/* Exercise private photo review with intercepted test responses only.
Todo:
-> preserve manual drafts when a saved suggestion is reopened
*/
import { test, expect, type Page } from '@playwright/test';
import { snapshot, style } from './public-reports/fixtures';
import type { CitizenReport } from '../src/public-reports/community';
import type { AnalysisJob } from '../src/public-reports/analysis';
const initial: CitizenReport = {
  id: '33333333-3333-4333-8333-333333333333', code: 'LJ-ANALYSIS-TEST', origin: 'community', category: 'road', sourceCategory: 'Jalan', title: 'Controlled photo review test', description: 'Controlled fixture only, not a real report.', address: '', lng: 106.84, lat: -6.2,
  createdAt: '2026-10-29T01:00:00Z', updatedAt: '2026-10-29T01:00:00Z', status: 'reported', sourceStatus: 'Dilaporkan', revision: 3, visibility: 'public', canManage: true, canUpdate: true,
  media: [{ id: '44444444-4444-4444-8444-444444444444', mime: 'image/jpeg', size: 100 }], updates: [],
  condition: { kind: 'pothole', observedAt: '2026-10-29T00:00:56.789Z', source: 'reporter', locationConfirmed: true, geometry: { type: 'Point', coordinates: [106.85, -6.21] }, dimensions: { method: 'measured', tool: 'Test ruler', widthM: 0.52, depthM: 0.075 } },
};
const completed: AnalysisJob = { analysisId: '55555555-5555-4555-8555-555555555555', reportId: initial.id, mediaId: initial.media[0].id, sourceEntryId: initial.id, baseReportRevision: 3, jobVersion: 2, execution: 'succeeded', freshness: 'fresh', review: 'pending', applicable: true, reason: null, createdAt: initial.createdAt, completedAt: initial.createdAt, expiresAt: '2099-01-01T00:00:00Z', pollAfterMs: 3000, revision: 3, suggestion: { kindSuggestion: 'crack', visibleEvidence: ['Controlled test evidence'], qualityFlags: [], captionSuggestion: 'Never copy this controlled test caption.', needsHumanReview: true } };
const field = (body: string, name: string) => new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)`).exec(body)?.[1];
async function setup(page: Page, available = true, job = completed) {
  const analysisRequests: string[] = [], updates: string[] = [], mediaRequests: string[] = []; let report = structuredClone(initial);
  let currentJob = job;
  await page.addInitScript(() => sessionStorage.setItem('lj-session', 'controlled-analysis-test'));
  await page.route('https://tiles.openfreemap.org/**', route => route.fulfill({ json: style }));
  await page.route('**/api/public-reports', route => route.fulfill({ json: { ...snapshot, reports: [] } }));
  await page.route('**/api/community/**', route => {
    const request = route.request(), url = new URL(request.url()), pathname = url.pathname;
    if (pathname.endsWith('/capabilities')) return route.fulfill({ json: { reports: true, write: true, login: true, reason: null, analysis: { available, reason: available ? null : 'model_disabled' } } });
    if (pathname.endsWith('/auth/session')) return route.fulfill({ json: { user: { id: 'controlled-owner', email: 'controlled@example.test' } } });
    if (pathname.includes('/analyses')) { analysisRequests.push(request.url()); return route.fulfill({ json: pathname.endsWith('/analyses') ? { analysis: currentJob } : currentJob }); }
    if (pathname.endsWith('/updates') && request.method() === 'POST') { const body = request.postData()!; updates.push(body); report = { ...report, revision: 4, ...(field(body, 'condition') ? { condition: JSON.parse(field(body, 'condition')!) } : {}) }; return route.fulfill({ json: report }); }
    if (pathname.includes('/media/')) { mediaRequests.push(request.url()); return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jU7sAAAAASUVORK5CYII=', 'base64') }); }
    return route.fulfill({ json: pathname.endsWith('/reports') ? { reports: [report], nextCursor: null } : report });
  });
  await page.goto('/'); await page.getByRole('button', { name: 'Akun', exact: true }).waitFor();
  await page.locator('.lj-report-row').click(); await page.getByRole('button', { name: 'Tambah pembaruan', exact: true }).click();
  return { analysisRequests, updates, mediaRequests, setAnalysis: (next: AnalysisJob) => { currentJob = next; } };
}
test('disabled capability hides assistance and manual saving has no analysis reference', async ({ page }) => {
  const { analysisRequests, updates } = await setup(page, false);
  await expect(page.getByRole('button', { name: 'Bantu kenali kondisi', exact: true })).toHaveCount(0);
  await page.getByLabel('Catatan pembaruan', { exact: true }).fill('Controlled manual update without analysis.');
  await page.getByLabel(/^Catatan dan lampiran boleh dipublikasikan/).check();
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await expect.poll(() => updates.length).toBe(1); expect(analysisRequests).toHaveLength(0); expect(field(updates[0], 'analysisReview')).toBeUndefined(); expect(field(updates[0], 'condition')).toBeUndefined();
});
test('reopened completed suggestion imports only kind and saves one explicit review', async ({ page }) => {
  const { analysisRequests, updates } = await setup(page);
  await expect(page.getByRole('button', { name: 'Gunakan jenis ini', exact: true })).toBeVisible();
  expect(analysisRequests.some(url => url.endsWith('/analyses?latest=true'))).toBe(true);
  await page.getByLabel('Catatan pembaruan', { exact: true }).fill('Controlled manual note stays unchanged.');
  await page.getByLabel('Kondisi saat ini', { exact: true }).selectOption('work_observed');
  page.once('dialog', dialog => dialog.accept()); await page.getByRole('button', { name: 'Gunakan jenis ini', exact: true }).click();
  await expect(page.getByLabel('Jenis kondisi', { exact: true })).toHaveValue('crack');
  await expect(page.getByRole('textbox', { name: 'Catatan pembaruan', exact: true })).toHaveValue('Controlled manual note stays unchanged.');
  await expect(page.getByLabel('Kondisi saat ini', { exact: true })).toHaveValue('work_observed');
  await expect(page.getByLabel('Lebar (m)', { exact: true })).toHaveValue('0.52');
  await expect(page.getByLabel('Kedalaman (m)', { exact: true })).toHaveValue('0.075');
  await expect(page.getByLabel('Lokasi dan bentuk telah diperiksa.', { exact: true })).not.toBeChecked();
  await expect(page.getByText('Titik kondisi: -6.210000, 106.850000.', { exact: true })).toBeVisible();
  await page.getByLabel('Lokasi dan bentuk telah diperiksa.', { exact: true }).check(); await page.getByLabel(/^Catatan dan lampiran boleh dipublikasikan/).check();
  await page.getByRole('button', { name: 'Simpan pembaruan', exact: true }).click();
  await expect.poll(() => updates.length).toBe(1);
  const body = updates[0], condition = JSON.parse(field(body, 'condition')!);
  expect(condition).toEqual({ ...initial.condition, kind: 'crack' }); expect(field(body, 'status')).toBe('work_observed');
  expect(JSON.parse(field(body, 'analysisReview')!)).toEqual({ analysisId: completed.analysisId, decision: 'accepted', acceptedFields: ['kind'], correctedFields: [] }); expect(body).not.toContain(completed.suggestion!.captionSuggestion);
});
test('stale completed result remains visible but cannot import', async ({ page }) => {
  await setup(page, true, { ...completed, baseReportRevision: 2, freshness: 'stale', applicable: false });
  await expect(page.getByText('Laporan berubah atau saran telah kedaluwarsa. Isi manual tetap tersedia.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Gunakan jenis ini', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Catat koreksi jenis secara manual', exact: true })).toHaveCount(0);
});
for (const review of ['accepted', 'corrected', 'rejected'] as const) test(`reopened ${review} receipt is already reviewed rather than a new stale suggestion`, async ({ page }) => {
  await setup(page, true, { ...completed, review, baseReportRevision: 2, applicable: false });
  await expect(page.getByText('Saran AI - telah ditinjau', { exact: true })).toBeVisible();
  await expect(page.getByText('Saran AI - belum disimpan', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Laporan berubah atau saran telah kedaluwarsa. Isi manual tetap tersedia.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Gunakan jenis ini', exact: true })).toHaveCount(0);
});
test('suppression removes an open preview and disables reuse even before report props refresh', async ({ page }) => {
  const running: AnalysisJob = { ...completed, execution: 'running', applicable: false, suggestion: undefined };
  const { setAnalysis } = await setup(page, true, running);
  await page.locator('.lj-photo-analysis').getByRole('button', { name: 'Perbesar foto', exact: true }).click();
  await expect(page.locator('.lj-photo-analysis .lj-attachments img')).toBeVisible();
  setAnalysis({ ...running, execution: 'succeeded', freshness: 'suppressed', reason: 'source_withdrawn' });
  await expect(page.getByText('Sumber foto tidak tersedia untuk saran ini.', { exact: true })).toBeVisible();
  await expect(page.locator('.lj-photo-analysis .lj-attachments')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Bantu kenali kondisi', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Foto tersimpan', { exact: true })).toBeDisabled();
});

test('source thumbnail is visible before use and keyboard expansion preserves the image and draft', async ({ page }, info) => {
  const { analysisRequests, updates, mediaRequests } = await setup(page);
  const panel = page.locator('.lj-photo-analysis'), image = panel.locator('.lj-attachments img');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  const original = await image.elementHandle(), originalSource = await image.getAttribute('src'), compactHeight = (await image.boundingBox())!.height;
  await expect(page.getByRole('button', { name: 'Gunakan jenis ini', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Bantu kenali kondisi', exact: true })).toHaveCount(0);
  const repeat = page.getByRole('button', { name: 'Periksa foto lagi', exact: true });
  await expect(repeat).toBeVisible();
  expect(await repeat.evaluate(el => !!(document.querySelector('.lj-photo-analysis .lj-primary')!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await page.getByRole('textbox', { name: 'Catatan pembaruan', exact: true }).fill('Draft manual tetap ada saat foto diperbesar.');
  const requestCounts = { analysis: analysisRequests.length, media: mediaRequests.length };
  const expand = panel.getByRole('button', { name: 'Perbesar foto', exact: true });
  await expect(expand).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`[id="${await expand.getAttribute('aria-controls')}"]`)).toBeVisible();
  await expand.focus(); await page.keyboard.press('Enter');
  await expect(panel.getByRole('button', { name: 'Perkecil foto', exact: true })).toHaveAttribute('aria-expanded', 'true');
  expect((await image.boundingBox())!.height).toBeGreaterThan(compactHeight);
  expect(await original!.evaluate(el => el === document.querySelector('.lj-photo-analysis .lj-attachments img'))).toBe(true);
  await page.keyboard.press('Space');
  await expect(panel.getByRole('button', { name: 'Perbesar foto', exact: true })).toHaveAttribute('aria-expanded', 'false');
  expect((await image.boundingBox())!.height).toBe(compactHeight);
  expect(await image.getAttribute('src')).toBe(originalSource);
  await expect(page.getByRole('textbox', { name: 'Catatan pembaruan', exact: true })).toHaveValue('Draft manual tetap ada saat foto diperbesar.');
  expect({ analysis: analysisRequests.length, media: mediaRequests.length }).toEqual(requestCounts); expect(updates).toHaveLength(0);
  await panel.screenshot({ path: info.outputPath('visible-source-thumbnail.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await original!.dispose();
});
