/* Check CRM-style reports without overwriting earlier test evidence.
Todo:
-> keep the isolated API and browser on dedicated local ports
*/
import { defineConfig } from '@playwright/test';
import base from './playwright.community.config';
const output = 'test-results/crm-p012';
export default defineConfig({
  ...base,
  outputDir: `${output}/artifacts`,
  reporter: [['list'], ['json', { outputFile: `${output}/results.json` }]],
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 3005 --strictPort',
    url: 'http://127.0.0.1:3005', reuseExistingServer: false,
    env: { VITE_API_URL: 'http://127.0.0.1:5005' } },
});
