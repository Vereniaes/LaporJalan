/* The Rute tab with a Google key: its own dev server, built with a dummy key; every Google request is mocked in the test.
Todo:
-> never a real key here: the tests must not reach Google
*/
import { defineConfig } from '@playwright/test';
const output = 'test-results/route';
export default defineConfig({
  testDir: './tests/route', timeout: 30_000, retries: 0, workers: 1,
  outputDir: `${output}/artifacts`,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:3007', storageState: { cookies: [], origins: [{ origin: 'http://127.0.0.1:3007', localStorage: [{ name: 'lj-map-mode', value: 'penuh' }] }] },
    locale: 'id-ID', timezoneId: 'Asia/Jakarta', deviceScaleFactor: 1, trace: 'retain-on-failure', screenshot: 'only-on-failure',
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
  projects: [
    { name: 'desktop', testMatch: /.*\.browser\.spec\.ts/, use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', testMatch: /.*\.browser\.spec\.ts/, use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: 'VITE_GOOGLE_MAPS_API_KEY=test-key-not-real npm run dev -- --host 127.0.0.1 --port 3007 --strictPort', url: 'http://127.0.0.1:3007', reuseExistingServer: false },
});
