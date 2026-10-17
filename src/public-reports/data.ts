/* Read public report metadata and keep source dates visible.
Todo:
-> validate responses and share map/list filters
*/
import { isMapCoordinate } from '../map/coordinates';

export type ReportCategory = 'road' | 'construction' | 'drain' | 'burning';
export interface PublicReport {
  id: string;
  code: string;
  lng: number;
  lat: number;
  category: 'road';
  sourceCategory: 'Jalan';
  createdAt: string;
  sourceStatus: string | null;
}
export interface PublicReportsSnapshot {
  reports: PublicReport[];
  source: { name: string; url: string; retrievedAt: string; dateStart: string; dateEnd: string };
}
export type MapArea = { west: number; south: number; east: number; north: number };
export const SOURCE_URL = 'https://crm.jakarta.go.id/peta/';
const API_BASE = (import.meta.env?.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
const text = (value: unknown, limit: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= limit;
const date = (value: unknown): value is string => text(value, 40) && Number.isFinite(Date.parse(value));

export function parseSnapshot(value: unknown): PublicReportsSnapshot {
  const data = object(value);
  const source = object(data.source);
  if (!Array.isArray(data.reports) || data.reports.length > 20_000 || source.url !== SOURCE_URL ||
    !text(source.name, 100) || !date(source.retrievedAt) || !date(source.dateStart) || !date(source.dateEnd)) {
    throw new Error('Invalid reports');
  }
  const ids = new Set<string>();
  const reports = data.reports.map(value => {
    const row = object(value);
    if (!text(row.id, 100) || !text(row.code, 80) || ids.has(row.id) ||
      !isMapCoordinate(row.lng, row.lat) || row.category !== 'road' || row.sourceCategory !== 'Jalan' ||
      !date(row.createdAt) || !(row.sourceStatus === null || text(row.sourceStatus, 100))) {
      throw new Error('Invalid report');
    }
    ids.add(row.id);
    return { id: row.id, code: row.code, lng: row.lng as number, lat: row.lat as number,
      category: 'road' as const, sourceCategory: 'Jalan' as const,
      createdAt: row.createdAt, sourceStatus: row.sourceStatus as string | null };
  });
  return { reports, source: { name: source.name, url: SOURCE_URL, retrievedAt: source.retrievedAt,
    dateStart: source.dateStart, dateEnd: source.dateEnd } };
}

export async function fetchPublicReports(signal: AbortSignal): Promise<PublicReportsSnapshot> {
  const response = await fetch(`${API_BASE}/api/public-reports`, { signal });
  if (!response.ok) throw new Error('Reports unavailable');
  return parseSnapshot(await response.json());
}

export function filterReports(reports: PublicReport[], category: ReportCategory | 'all', query: string, area: MapArea | null) {
  const term = query.trim().toLocaleLowerCase('id');
  return reports.filter(report => (category === 'all' || report.category === category) &&
    `${report.code} ${report.sourceCategory} ${report.sourceStatus ?? ''}`.toLocaleLowerCase('id').includes(term) &&
    (!area || (report.lng >= area.west && report.lng <= area.east && report.lat >= area.south && report.lat <= area.north)));
}

export function reportDate(value: string, withTime = true) {
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } as const : {}) }).format(new Date(value));
}
