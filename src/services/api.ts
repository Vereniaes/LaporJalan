/* Todo:
-> query backend REST endpoints with offline fallback
-> submit damage reports to backend
-> query address suggestions from autocomplete proxy
*/

import { DamageReport } from '../types.js';
import { INITIAL_REPORTS } from './mockData.js';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

// --- Legacy Client API --------------------------------------------------------

// Purpose : Fetch reports from backend API with fallback to initial mock dataset
// Output  : Promise<DamageReport[]>
// Why/Note: Bypasses server errors gracefully when offline or in preview mode
export async function fetchReports(): Promise<DamageReport[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reports`, { method: 'GET' });
    if (!res.ok) throw new Error('Network error');
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : INITIAL_REPORTS;
  } catch (err) {
    console.log('[API Client] Server backend tidak terjangkau, menggunakan data lokal.');
    return INITIAL_REPORTS;
  }
}

// Purpose : Submit new damage report to backend API
// Input   : report (DamageReport)
// Output  : Promise<boolean> (true if successfully persisted on server)
export async function submitReportToBackend(report: DamageReport): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    return res.ok;
  } catch (err) {
    console.log('[API Client] Gagal sync ke backend, laporan tersimpan lokal.');
    return false;
  }
}

// Purpose : Fetch address autocomplete predictions from places endpoint
// Input   : input (string)
// Output  : Promise<any[]>
export async function searchPlacesApi(input: string): Promise<any[]> {
  if (!input || input.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/places/autocomplete?input=${encodeURIComponent(input.trim())}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.predictions || [];
  } catch {
    return [];
  }
}
// --- end of Legacy Client API -------------------------------------------------
