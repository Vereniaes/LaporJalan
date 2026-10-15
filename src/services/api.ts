/*
file ini client api buat nyambungin frontend ke backend laporjalan-be
kalo server backend cloud run / localhost nyala, fetch dari api
kalo server mati atau offline, otomatis fallback ke data lokal
Todo:
-> fetch /api/reports
-> post /api/reports buat kirim laporan baru
*/

import { DamageReport } from '../types.js';
import { INITIAL_REPORTS } from './mockData.js';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

// helper fetch laporan jalan dengan fallback lokal --------------------------------------------------------------------------
export async function fetchReports(): Promise<DamageReport[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reports`, { method: 'GET' });
    if (!res.ok) throw new Error('Network error');
    const json = await res.json();
    return json.data || INITIAL_REPORTS;
  } catch (err) {
    console.log('[API Client] Server backend tidak terjangkau, menggunakan data lokal.');
    return INITIAL_REPORTS;
  }
}
// end of helper ------------------------------------------------------------------

// helper kirim laporan baru ke backend --------------------------------------------------------------------------
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
// end of helper ------------------------------------------------------------------

// helper cari alamat autocomplete via google places / nominatim --------------------------------------------------------------------------
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
// end of helper ------------------------------------------------------------------
