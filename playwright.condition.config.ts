/* Verify confirmed condition data and in-map inspection without overwriting P0-P2 evidence.
Todo:
-> use the isolated API and dedicated result folder
*/
import { defineConfig } from '@playwright/test';
import base from './playwright.crm.config';
const output='knowledge/crm-3d-plan-2026-10-28/implementation-p34/runs/checks';
export default defineConfig({...base,outputDir:`${output}/artifacts`,reporter:[['list'],['json',{outputFile:`${output}/results.json`}]]});
