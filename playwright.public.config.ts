/* Check the public map separately from the paused inspection UI.
Todo:
-> preserve deterministic browser evidence for desktop and mobile
*/
import { defineConfig } from '@playwright/test';
const output = 'test-results/public-map-list';
// tests never use the owner's Google key from .env.local: Rute shows its no-key state (playwright.route.config.ts fakes Google)
export default defineConfig({
  testDir: './tests/public-reports', timeout: 30_000, retries: 0, workers: 1,
  outputDir: `${output}/artifacts`,
  reporter: [['list'], ['json', { outputFile: `${output}/results.json` }]],
  use: { baseURL: 'http://127.0.0.1:3004', storageState: { cookies: [], origins: [{ origin: 'http://127.0.0.1:3004', localStorage: [{ name: 'lj-map-mode', value: 'penuh' }] }] }, // full map: headless WebGL is software, which the app would treat as a weak device
    locale: 'id-ID', timezoneId: 'Asia/Jakarta',
    deviceScaleFactor: 1, trace: 'retain-on-failure', screenshot: 'only-on-failure',
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
  projects: [
    { name: 'unit', testMatch: /.*\.unit\.spec\.ts/ },
    { name: 'desktop', testMatch: /.*\.browser\.spec\.ts/, use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', testMatch: /.*\.browser\.spec\.ts/, use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 3004 --strictPort', url: 'http://127.0.0.1:3004', reuseExistingServer: true, env: { VITE_GOOGLE_MAPS_API_KEY: '' } },
});
