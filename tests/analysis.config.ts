/* Run advisory helper checks without a browser server or model. */
import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: 'analysis.unit.spec.ts', workers: 1, reporter: 'list', outputDir: '../knowledge/crm-3d-plan-2026-10-28/implementation-p6/runs/frontend-unit/artifacts' });
