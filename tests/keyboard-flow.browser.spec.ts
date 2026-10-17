// Verify practical keyboard journeys and record the focus path without pointer shortcuts.
import { test, expect, type Page, type Locator, type TestInfo } from '@playwright/test';
import { INITIAL_CCTV_CAMERAS } from '../src/services/mockData';
import { prepare, ready, mapState } from './helpers/map';

type KeyboardJourney = {
  reach: (target: Locator, direction?: 'Tab' | 'Shift+Tab') => Promise<void>;
  checkpoint: (name: string) => Promise<void>;
  contain: (dialog: Locator) => Promise<void>;
};

// Read focus identity and its visible geometry; this helper never moves focus.
async function focusedState(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return {
      tag: element.tagName, id: element.id, role: element.getAttribute('role'),
      name: element.getAttribute('aria-label') || element.getAttribute('title') ||
        element.getAttribute('placeholder') || element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 160),
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      focusVisible: element.matches(':focus-visible'), outline: style.outlineStyle,
      outlineWidth: style.outlineWidth, shadow: style.boxShadow,
      inViewport: rect.width > 0 && rect.height > 0 && rect.x >= 0 && rect.y >= 0 &&
        rect.right <= innerWidth && rect.bottom <= innerHeight,
      unobstructed: Boolean(hit && (hit === element || element.contains(hit))),
    };
  });
}

async function journey(page: Page, info: TestInfo, run: (keys: KeyboardJourney) => Promise<void>) {
  const records: unknown[] = [];
  const checkpoint = async (name: string) => {
    records.push({ checkpoint: name, ...await focusedState(page) });
    await page.screenshot({ path: info.outputPath(`${name}.png`), animations: 'disabled' });
  };
  const reach: KeyboardJourney['reach'] = async (target, direction = 'Tab') => {
    await expect(target).toHaveCount(1);
    for (let index = 0; index < 64; index++) {
      if (await target.evaluate(element => element === document.activeElement)) {
        const state = await focusedState(page);
        records.push({ reached: await target.getAttribute('aria-label') || await target.textContent(), ...state });
        expect(state.inViewport, `Focused control outside viewport: ${state.name}`).toBe(true);
        expect(state.unobstructed, `Focused control covered or clipped: ${state.name}`).toBe(true);
        expect(state.focusVisible, `No keyboard focus state: ${state.name}`).toBe(true);
        expect(state.outline !== 'none' && parseFloat(state.outlineWidth) > 0,
          `No computed focus indicator: ${state.name}`).toBe(true);
        return;
      }
      await page.keyboard.press(direction);
      records.push({ key: direction, ...await focusedState(page) });
    }
    throw new Error(`Control unreachable within 64 ${direction} presses: ${await target.textContent()}`);
  };
  const contain = async (dialog: Locator) => {
    for (const direction of ['Tab', 'Shift+Tab']) {
      for (let step = 0; step < 8; step++) {
        await page.keyboard.press(direction);
        records.push({ modalKey: direction, ...await focusedState(page) });
        expect(await dialog.evaluate(element => element.contains(document.activeElement)),
          `Focus escaped the open native dialog after ${direction}`).toBe(true);
      }
    }
  };
  try { await run({ reach, checkpoint, contain }); }
  finally {
    await info.attach('keyboard-focus-path', { body: JSON.stringify({ viewport: page.viewportSize(), records }, null, 2), contentType: 'application/json' });
  }
}

test('A01 keyboard navigation filter selection search and map controls are reachable', async ({ page }, info) => {
  await prepare(page);
  await journey(page, info, async keys => {
    await keys.reach(page.getByRole('button', { name: /Daftar/ }));
    await page.keyboard.press('Enter');
    await keys.reach(page.getByRole('button', { name: 'Retak', exact: true }));
    await page.keyboard.press('Space');
    await expect(page.locator('.map-report-marker')).toHaveCount(0);
    await keys.reach(page.getByRole('button', { name: 'Semua', exact: true }), 'Shift+Tab');
    await page.keyboard.press('Enter');
    await keys.reach(page.locator('.control-panel button').filter({ hasText: 'Fixture second report' }));
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Fixture second report' })).toBeVisible();
    const search = page.getByPlaceholder(/Cari jalan/);
    await keys.reach(search, 'Shift+Tab');
    await page.keyboard.insertText('Fixture');
    await keys.reach(page.getByRole('button', { name: /Fixture place/ }));
    await keys.checkpoint('search-suggestion-focus');
    await page.keyboard.press('Enter');
    await ready(page);
    expect((await mapState(page))!.center[0]).toBeCloseTo(106.824, 6);
    expect((await mapState(page))!.center[1]).toBeCloseTo(-6.197, 6);
    await keys.reach(page.locator('#b-3d'));
    await page.keyboard.press('Space');
    await ready(page);
    expect((await mapState(page))!.pitch).toBe(0);
    await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
    const before = (await mapState(page))!.zoom;
    await keys.reach(page.getByRole('button', { name: 'Perbesar peta', exact: true }));
    await page.keyboard.press('Enter');
    await ready(page);
    expect((await mapState(page))!.zoom).toBeCloseTo(before + 1, 6);
    expect((await mapState(page))!.pitch).toBe(0);
    await keys.reach(page.getByRole('button', { name: 'Perkecil peta', exact: true }));
    await page.keyboard.press('Space');
    await ready(page);
    expect((await mapState(page))!.zoom).toBeCloseTo(before, 6);
    await keys.checkpoint('map-zoom-focus');
  });
});

test('A01 keyboard enters inspection operates orbit and returns to 2D', async ({ page }, info) => {
  await prepare(page);
  await journey(page, info, async keys => {
    await keys.reach(page.getByRole('button', { name: 'Lihat Lapangan 3D', exact: true }));
    await page.keyboard.press('Enter');
    await ready(page);
    await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toBeVisible();
    await keys.reach(page.getByRole('button', { name: 'Putar Orbit 360°', exact: true }));
    await keys.checkpoint('inspection-orbit-focus');
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Berhenti Orbit', exact: true })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Putar Orbit 360°', exact: true })).toBeFocused();
    await keys.reach(page.getByRole('button', { name: 'Jalanan', exact: true }));
    await page.keyboard.press('Enter');
    await ready(page);
    await keys.reach(page.getByRole('button', { name: 'Atas', exact: true }));
    await page.keyboard.press('Enter');
    await ready(page);
    await expect(page.getByText('Inspeksi Lapangan 3D', { exact: true })).toHaveCount(0);
    await expect(page.locator('#b-3d')).toHaveAttribute('aria-pressed', 'false');
    expect((await mapState(page))!.pitch).toBe(0);
    expect((await mapState(page))!.inspection).toBeUndefined();
    await keys.reach(page.locator('#b-3d'), 'Shift+Tab');
    await keys.checkpoint('inspection-exit-focus');
  });
});

test('A01 keyboard profile and comparison contain focus and restore their triggers', async ({ page }, info) => {
  await prepare(page);
  await journey(page, info, async keys => {
    const profile = page.getByRole('button', { name: 'Profil ilustratif', exact: true });
    await keys.reach(profile);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await keys.reach(dialog.getByRole('button', { name: 'Putar kanan', exact: true }));
    await page.keyboard.press('Space');
    await keys.contain(dialog);
    await keys.checkpoint('profile-modal-focus');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(profile).toBeFocused();
    const compare = page.getByRole('button', { name: 'Sebelum vs Sesudah', exact: true });
    await keys.reach(compare);
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    const slider = dialog.getByRole('slider', { name: 'Batas perbandingan' });
    await keys.reach(slider);
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '55');
    await keys.checkpoint('comparison-slider-focus');
    await keys.contain(dialog);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(compare).toBeFocused();
  });
});

test('A01 keyboard report dialog can close return and save an example', async ({ page }, info) => {
  await prepare(page);
  await journey(page, info, async keys => {
    const report = page.getByRole('button', { name: 'Lapor', exact: true });
    await keys.reach(report);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await keys.contain(dialog);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(report).toBeFocused();
    await page.keyboard.press('Enter');
    await keys.reach(dialog.getByRole('button', { name: 'Lubang Aspal' }));
    await page.keyboard.press('Space');
    const save = dialog.getByRole('button', { name: 'Simpan Laporan Contoh', exact: true });
    await expect(save).toBeEnabled({ timeout: 15000 });
    await keys.reach(save);
    await keys.checkpoint('report-save-focus');
    await page.keyboard.press('Enter');
    await expect(dialog).toHaveCount(0);
    await expect(report).toBeFocused();
    await expect(page.getByRole('heading', { name: /estimasi contoh/ })).toBeVisible();
  });
});

test('A01 keyboard CCTV selection expanded preview and Escape restore focus', async ({ page }, info) => {
  await prepare(page);
  await journey(page, info, async keys => {
    await keys.reach(page.getByRole('button', { name: /^CCTV \(/ }));
    await page.keyboard.press('Enter');
    const camera = INITIAL_CCTV_CAMERAS[0];
    const cameraControl = page.locator('.control-panel button').filter({ hasText: camera.name });
    await keys.reach(cameraControl);
    await page.keyboard.press('Space');
    await ready(page);
    const popup = page.getByRole('region', { name: 'Pratinjau CCTV' });
    await expect(popup).toContainText(camera.name);
    const expand = popup.getByRole('button', { name: 'Layar Penuh', exact: true });
    await keys.reach(expand);
    await keys.checkpoint('cctv-expand-focus');
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading')).toHaveText(camera.name);
    await expect(dialog.getByRole('img', { name: `Gambar contoh untuk ${camera.name}`, exact: true })).toHaveAttribute('src', camera.snapshotUrl);
    await keys.contain(dialog);
    await keys.checkpoint('cctv-modal-focus');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(expand).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    await expect(cameraControl).toBeFocused();
  });
});

