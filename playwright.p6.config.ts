/* Check P6 and existing citizen flows against local services only.
Todo:
-> retain evidence outside earlier frozen runs
*/
import { defineConfig } from '@playwright/test';
import community from './playwright.community.config';
const output = process.env.P6_OUTPUT || 'knowledge/crm-3d-plan-2026-10-28/implementation-p6/runs/checks';
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
    env: { VITE_API_URL: 'http://127.0.0.1:5005' },
  },
});
