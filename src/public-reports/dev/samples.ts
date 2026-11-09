/* Todo:
-> answer community GET requests with labelled Contoh reports
    -> only in npm run dev with ?contoh=1 (see api() in community.ts)
-> never ship: Vite drops the import in production builds
*/
import type { Capabilities, CitizenReport } from '../community';
import data from './contoh-warga.json';

// --- dev sample reports ---

// Why/Note: titles start with "Contoh" so a sample never reads as a real report
const reports = data.reports.map(row => ({
  ...row, title: `Contoh: ${row.title}`, description: '', address: row.condition.geometry.road, media: [],
  updatedAt: row.createdAt, sourceStatus: null, condition: { ...row.condition, locationConfirmed: true, source: 'reporter' },
})) as unknown as CitizenReport[];

// read only - the samples cannot be written or logged into
const capabilities: Capabilities = { reports: true, write: false, login: false, reason: null, analysis: { available: false, reason: 'model_disabled' } };

// Purpose : mock body for one community GET path
// Input   : path, e.g. /capabilities, /reports, /reports?cursor=x, /reports/contoh-02
// Output  : response body, or undefined so api() falls back to the real server
export function sampleAnswer(path: string): unknown {
  if (path === '/capabilities') return capabilities;
  if (/^\/reports(\?|$)/.test(path)) return { reports: path.includes('mine=true') ? [] : reports, nextCursor: null };
  const id = /^\/reports\/([^/?]+)$/.exec(path)?.[1];
  return id ? reports.find(row => row.id === decodeURIComponent(id)) : undefined;
}

// --- end of dev sample reports ---
