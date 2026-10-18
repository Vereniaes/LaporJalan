/* Read and write citizen reports using the owner's email session.
Todo:
-> keep public data and private access separate
*/
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE, PublicReport, ReportCategory } from './data';

export const CATEGORY_LABELS: Record<ReportCategory, string> = { road: 'Jalan', construction: 'Pembangunan', drain: 'Saluran', burning: 'Pembakaran' };
export const OBSERVATIONS = { unchanged: 'Belum berubah', work_observed: 'Terlihat dikerjakan', resolved_observed: 'Terlihat selesai' };
export interface Media { id: string; mime: string; size: number }
export interface CitizenReport extends PublicReport {
  origin: 'community'; title: string; description: string; address: string; media: Media[];
  status: 'reported' | keyof typeof OBSERVATIONS; updatedAt: string;
  revision?: number; canUpdate?: boolean;
  updates?: { id: string; note: string; status: CitizenReport['status']; createdAt: string; actor: string; media: Media[] }[];
}
export interface User { id: string; email: string }
let token = '';
try { token = sessionStorage.getItem('lj-session') ?? ''; } catch { /* Session can stay in memory when storage is unavailable. */ }
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const cancel = () => controller.abort();
  if (init.signal?.aborted) controller.abort();
  init.signal?.addEventListener('abort', cancel, { once: true });
  try {
    const response = await fetch(`${API_BASE}/api/community${path}`, { ...init,
      signal: controller.signal, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(response.status, data?.message ?? 'Layanan laporan belum tersedia.');
    return data as T;
  } finally { clearTimeout(timeout); init.signal?.removeEventListener('abort', cancel); }
}
export const postJson = <T,>(path: string, body: unknown) => api<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const setToken = (value: string) => { token = value; try { value ? sessionStorage.setItem('lj-session', value) : sessionStorage.removeItem('lj-session'); } catch { /* Memory session still works. */ } };
export function useEmailSession() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!token) return;
    let active = true;
    api<{ user: User }>('/auth/session').then(result => { if (active) setUser(result.user); }).catch(error => {
      if (active && error instanceof ApiError && error.status === 401) setToken('');
    });
    return () => { active = false; };
  }, []);
  async function exchange(link: string) {
    const result = await postJson<{ token: string; user: User }>('/auth/exchange', { token: link });
    setToken(result.token); setUser(result.user);
  }
  async function logout() { await postJson('/auth/logout', {}); setToken(''); setUser(null); }
  return { user, exchange, logout };
}

export function useCitizenReports(mine: boolean, user: User | null) {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scope = useRef(''), generation = useRef(0);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  const merge = useCallback((report: CitizenReport) => setReports(rows => [report, ...rows.filter(row => row.id !== report.id)]), []);
  useEffect(() => {
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
  }, [mine, user?.id, revision]);
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
  return { reports, cursor, error, loading, refresh, merge, more };
}
export const mediaUrl = (reportId: string, mediaId: string) => `${API_BASE}/api/community/reports/${encodeURIComponent(reportId)}/media/${encodeURIComponent(mediaId)}`;
export const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : 'Koneksi terputus. Isi tetap tersedia; silakan coba lagi.';
