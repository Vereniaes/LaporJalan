/* Describe reported conditions without inventing dimensions or observation times. */
import { useEffect, useState } from 'react';
import type { ReportCategory } from './data';
import { lineLength, ringArea } from '../map/geo';

export type ConditionPosition = [number, number];
export type ConditionGeometry = { type: 'Point'; coordinates: ConditionPosition } | { type: 'LineString'; coordinates: ConditionPosition[] } | { type: 'Polygon'; coordinates: ConditionPosition[][] };
export const CONDITION_LABELS = { pothole: 'Lubang', subsidence: 'Ambles', crack: 'Retak', excavation: 'Galian', construction: 'Pekerjaan', closure: 'Penutupan jalan', blocked_drain: 'Saluran tersumbat', burning: 'Pembakaran', other: 'Kondisi lain' };
export type ConditionKind = keyof typeof CONDITION_LABELS;
export interface RoadCondition {
  kind: ConditionKind; observedAt: string; locationConfirmed: true; source: 'reporter'; geometry: ConditionGeometry;
  dimensions?: { method: 'measured' | 'estimated'; tool?: string; widthM?: number; depthM?: number; lengthM?: number };
  access?: 'unknown' | 'partial' | 'closed';
}
export type GeometryDrawingStarter = (mode: 'line' | 'area', complete: (geometry: ConditionGeometry) => void) => void;
export const CONDITION_KINDS: Record<ReportCategory, ConditionKind[]> = {
  road: ['pothole', 'subsidence', 'crack', 'excavation', 'closure', 'other'],
  construction: ['construction', 'excavation', 'closure', 'other'], drain: ['blocked_drain', 'other'], burning: ['burning', 'other'],
};
export const conditionLabel = (condition: RoadCondition) => CONDITION_LABELS[condition.kind];
// size of what the reporter drew - computed from the drawing, never measured on site
// output : { short: 'ruas 210 m', drawn: 'garis' }, or null for a point
const wholeNumber = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
export function conditionSize(condition: RoadCondition) {
  const geometry = condition.geometry;
  if (geometry.type === 'LineString') return { short: `ruas ${wholeNumber.format(lineLength(geometry.coordinates))} m`, drawn: 'garis' };
  if (geometry.type === 'Polygon') return { short: `area ${wholeNumber.format(ringArea(geometry.coordinates[0]))} m²`, drawn: 'area' };
  return null;
}
export const closureNeedsUpdate = (condition: RoadCondition | null | undefined, now = Date.now()) => condition?.kind === 'closure' && now - Date.parse(condition.observedAt) >= 24 * 60 * 60 * 1000;
export const conditionDimensionLabel = (condition: RoadCondition) => !condition.dimensions ? 'Ilustrasi - ukuran belum diukur' : condition.dimensions.method === 'measured' ? 'Dimensi pengukuran pelapor' : 'Dimensi perkiraan pelapor';
export const accessLabel = (access: RoadCondition['access']) => ({ unknown: 'Akses belum diketahui', partial: 'Sebagian akses terhalang', closed: 'Tampak tertutup' }[access ?? 'unknown']);
export function getInspectionRepresentation(condition: RoadCondition | null | undefined) {
  if (!condition) return null;
  const { widthM, depthM, lengthM } = condition.dimensions ?? {};
  const bowl = ['pothole', 'subsidence'].includes(condition.kind) && condition.geometry.type === 'Point' && typeof widthM === 'number' && widthM > 0 && typeof depthM === 'number' && depthM > 0;
  return { kind: (bowl ? 'bowl' : condition.geometry.type === 'LineString' ? 'line' : condition.geometry.type === 'Polygon' ? 'area' : 'symbol') as 'bowl' | 'line' | 'area' | 'symbol', geometry: condition.geometry, label: conditionDimensionLabel(condition), widthM, depthM, lengthM };
}
export function useConditionClock() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer); }, []);
  return now;
}
