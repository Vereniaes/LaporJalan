/* Check real production chunk requests without a development server. */
import { defineConfig } from '@playwright/test';
import base from './playwright.condition.config';
const output='knowledge/crm-3d-plan-2026-10-28/implementation-p34/runs/production-loading';
export default defineConfig({...base,testDir:'./tests/production',outputDir:`${output}/artifacts`,reporter:[['list'],['json',{outputFile:`${output}/results.json`}]],
 projects:base.projects!.filter(project=>project.name!=='unit').map(project=>({...project,testMatch:/inspection-bundle\.browser\.spec\.ts/})),
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 3005 --strictPort',url:'http://127.0.0.1:3005',reuseExistingServer:false},
});
