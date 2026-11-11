/* Check P6 and existing citizen flows against local services only.
Todo:
-> retain evidence outside earlier frozen runs
*/
import { defineConfig } from '@playwright/test';
import community from './playwright.community.config';
const output = process.env.P6_OUTPUT || 'test-results/p6-checks';
const port = Number(process.env.P6_PORT || 3016);
const origin = `http://127.0.0.1:${port}`;
process.env.P6_APP_ORIGIN = origin;
export default defineConfig(community, {
  testDir: './tests',
  outputDir: `${output}/artifacts`,
  reporter: [['list'], ['json', { outputFile: `${output}/results.json` }]],
  use: { baseURL: origin },
  webServer: {
    command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${port} --strictPort`,
    url: origin, reuseExistingServer: false,
    env: { VITE_API_URL: 'http://127.0.0.1:5005', VITE_GOOGLE_MAPS_API_KEY: '' }, // never the owner's Google key from .env.local
  },
});
