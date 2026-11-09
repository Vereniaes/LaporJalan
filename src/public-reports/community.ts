/* Todo:
-> read and write citizen reports with the owner session
-> keep public data and private access separate
*/
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE, PublicReport, ReportCategory } from './data';
import type { RoadCondition } from './condition';

export const CATEGORY_LABELS: Record<ReportCategory, string> = { road: 'Jalan', construction: 'Pembangunan', drain: 'Saluran', burning: 'Pembakaran' };
export const OBSERVATIONS = { unchanged: 'Belum berubah', work_observed: 'Terlihat dikerjakan', resolved_observed: 'Terlihat selesai' };
export interface Media { id: string; mime: string; size: number }
export interface CitizenReport extends PublicReport {
  origin: 'community'; title: string; description: string; address: string; media: Media[];
  status: 'reported' | keyof typeof OBSERVATIONS; updatedAt: string;
  revision?: number; canUpdate?: boolean; canManage?: boolean; reporterName?: string;
  visibility?: 'public' | 'withdrawn' | 'hidden';
  updates?: { id: string; note: string; status: CitizenReport['status']; createdAt: string; actor: string; media: Media[]; condition?: RoadCondition | null }[];
}
export interface User { id: string; email: string; displayName?: string }
const EMPTY_REPORTS: CitizenReport[] = [];
export type LoginIntent = 'new' | 'mine' | string;
export interface Capabilities { reports: boolean; write: boolean; login: boolean; reason: 'disabled' | 'storage_unavailable' | 'email_unconfigured' | 'origin_unconfigured' | null; analysis?: { available: boolean; reason: string | null } }
export const isReportId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export const capabilityMessage = (capabilities: Capabilities | null) => !capabilities ? 'Kesiapan laporan warga belum dapat diperiksa.' : capabilities.reason ? { disabled: 'Laporan warga belum diaktifkan.', storage_unavailable: 'Penyimpanan laporan warga belum tersedia.', email_unconfigured: 'Masuk melalui email belum tersedia.', origin_unconfigured: 'Pengiriman laporan belum tersedia.' }[capabilities.reason] : '';
let token = '';
try { token = sessionStorage.getItem('lj-session') ?? ''; } catch { /* Session can stay in memory when storage is unavailable. */ }
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
// dev only - ?contoh=1 at page load answers community GETs from labelled samples (dev/samples.ts)
const devSamples = Boolean(import.meta.env?.DEV) && new URLSearchParams(location.search).get('contoh') === '1';
export async function api<T>(path: string, init: RequestInit = {}, timeoutMs = 30_000): Promise<T> {
  if (import.meta.env.DEV && devSamples && (init.method ?? 'GET') === 'GET') {
    const answer = (await import('./dev/samples')).sampleAnswer(path);
    if (answer !== undefined) return answer as T;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const cancel = () => controller.abort();
  if (init.signal?.aborted) controller.abort();
  init.signal?.addEventListener('abort', cancel, { once: true });
  try {
    const response = await fetch(`${API_BASE}/api/community${path}`, { ...init,
      signal: controller.signal, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && path !== '/auth/exchange' && path !== '/auth/link') window.dispatchEvent(new Event('lj-session-expired'));
      throw new ApiError(response.status, data?.message ?? 'Layanan laporan belum tersedia.');
    }
    return data as T;
  } finally { clearTimeout(timeout); init.signal?.removeEventListener('abort', cancel); }
}
export const writeJson = <T,>(path: string, body: unknown, method = 'POST', signal?: AbortSignal) => api<T>(path, { method, signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const postJson = <T,>(path: string, body: unknown) => writeJson<T>(path, body);
const setToken = (value: string) => { token = value; try { value ? sessionStorage.setItem('lj-session', value) : sessionStorage.removeItem('lj-session'); } catch { /* Memory session still works. */ } };
/** Purpose: Restore and manage the email session.
 * Input: none. Output: user, loading state, and account actions.
 * Note: Report entry waits for restoration before choosing login or the form.
 */
export function useEmailSession() {
  const [user, setUser] = useState<User | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  useEffect(() => { const expire = () => { setToken(''); setUser(null); setExpired(true); }; window.addEventListener('lj-session-expired', expire); return () => window.removeEventListener('lj-session-expired', expire); }, []);
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    let active = true;
    api<{ user: User }>('/auth/session').then(result => { if (active) setUser(result.user); }).catch(error => {
      if (active && error instanceof ApiError && error.status === 401) { setToken(''); setExpired(true); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function exchange(link: string) {
    const result = await postJson<{ token: string; user: User; returnTo?: string }>('/auth/exchange', { token: link });
    setToken(result.token); setUser(result.user); setExpired(false);
    return result.returnTo === 'new' || isReportId(result.returnTo ?? '') ? result.returnTo! : 'mine';
  }
  async function profile(displayName: string) { const result = await writeJson<{ user: User }>('/auth/profile', { displayName }, 'PATCH'); setUser(result.user); }
  async function logout() { await postJson('/auth/logout', {}); setToken(''); setUser(null); }
  return { user, expired, loading, exchange, logout, profile };
}

export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true);
    api<Capabilities>('/capabilities', { signal: controller.signal }).then(result => { if (!controller.signal.aborted) setCapabilities(result); }).catch(() => { if (!controller.signal.aborted) setCapabilities(null); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  return { capabilities, loading, refresh };
}

export function useCitizenReports(mine: boolean, user: User | null, enabled = true) {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scope = useRef(''), generation = useRef(0);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  const merge = useCallback((report: CitizenReport) => setReports(rows => [...(mine || !report.visibility || report.visibility === 'public' ? [report] : []), ...rows.filter(row => row.id !== report.id)]), [mine]);
  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    const controller = new AbortController();
    generation.current++;
    const key = `${mine}:${user?.id ?? ''}`;
    setLoading(true); setError('');
    if (scope.current !== key) { setReports([]); setCursor(null); scope.current = key; }
    api<{ reports: CitizenReport[]; nextCursor: string | null }>(`/reports${mine ? '?mine=true' : ''}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) { setReports(result.reports); setCursor(result.nextCursor); } })
      .catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); generation.current++; };
  }, [mine, user?.id, revision, enabled]);
  async function more() {
    if (!cursor || loading) return;
    const active = generation.current;
    setLoading(true); setError('');
    try {
      const result = await api<{ reports: CitizenReport[]; nextCursor: string | null }>(`/reports?cursor=${encodeURIComponent(cursor)}${mine ? '&mine=true' : ''}`);
      if (active !== generation.current) return;
      setReports(rows => [...rows, ...result.reports.filter(row => !rows.some(existing => existing.id === row.id))]); setCursor(result.nextCursor);
    } catch (error) { if (active === generation.current) setError(errorMessage(error)); }
    finally { if (active === generation.current) setLoading(false); }
  }
  return { reports: scope.current === `${mine}:${user?.id ?? ''}` ? reports : EMPTY_REPORTS, cursor, error, loading, refresh, merge, more };
}
export const mediaUrl = (reportId: string, mediaId: string) => `${API_BASE}/api/community/reports/${encodeURIComponent(reportId)}/media/${encodeURIComponent(mediaId)}`;
export async function privateMedia(reportId: string, mediaId: string, signal: AbortSignal) {
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 30_000);
  const cancel = () => controller.abort(); signal.addEventListener('abort', cancel, { once: true }); if (signal.aborted) cancel();
  try {
    const response = await fetch(mediaUrl(reportId, mediaId), { signal: controller.signal, headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) throw new ApiError(response.status, 'Lampiran tidak tersedia.');
    return await response.blob();
  } finally { clearTimeout(timeout); signal.removeEventListener('abort', cancel); }
}
export const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : 'Koneksi terputus. Isi tetap tersedia; silakan coba lagi.';
