import { defineConfig } from '@playwright/test';

// Run pure helpers separately from browser behavior at fixed viewports.
const output = process.env.PW_OUTPUT || 'knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/latest';
export default defineConfig({
  testDir: './tests', timeout: 45000, retries: 0, workers: 1,
  outputDir: `${output}/artifacts`,
  reporter: [['list'], ['json', { outputFile: `${output}/results.json` }]],
  use: {
    baseURL: 'http://127.0.0.1:3002', locale: 'id-ID', timezoneId: 'Asia/Jakarta',
    deviceScaleFactor: 1, trace: 'on', screenshot: 'only-on-failure',
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  projects: [
    { name: 'unit', testMatch: /.*\.unit\.spec\.ts/ },
    { name: 'desktop', testMatch: /.*\.browser\.spec\.ts/, use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', testMatch: /.*\.browser\.spec\.ts/, use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 3002', url: 'http://127.0.0.1:3002', reuseExistingServer: true },
});
