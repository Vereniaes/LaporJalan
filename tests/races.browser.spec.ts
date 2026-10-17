import { test, expect } from '@playwright/test';
import { INITIAL_REPORTS } from '../src/services/mockData';
import { style, snapshot } from './fixtures';
import { ready, mapState, evidence } from './helpers/map';

test('C05 late initial reports do not replace a newer selection', async ({ page }, info) => {
  let release!: () => void;
  const responseGate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/reports', async route => {
    await responseGate;
    await route.fulfill({ json: { data: [...INITIAL_REPORTS].reverse() } });
  });
  await page.route('**/tiles.openfreemap.org/styles/**', route => route.fulfill({ json: style }));
  await page.route('**/*', route => route.request().resourceType() === 'image'
    ? route.fulfill({ contentType: 'image/svg+xml', body: snapshot }) : route.fallback());
  await page.goto('/');
  await ready(page);
  await page.getByRole('button', { name: /Daftar/ }).click();
  const selected = INITIAL_REPORTS[1];
  await page.getByText(selected.title, { exact: true }).click();
  await ready(page);
  const received = page.waitForResponse(response => response.url().includes('/api/reports'));
  release();
  await received;
  await expect.poll(async () => {
    const center = (await mapState(page))?.center;
    return center ? Math.hypot(center[0] - selected.lng, center[1] - selected.lat) : Infinity;
  }).toBeLessThan(1e-9);
  await ready(page);
  await expect(page.getByRole('heading', { name: selected.title })).toBeVisible();
  await evidence(page, info, 'latest-selection');
});
