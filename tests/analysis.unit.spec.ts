/* Check advisory review rules with controlled test data only.
Todo:
-> keep uncertain results outside confirmed report fields
*/
import { test, expect } from '@playwright/test';
import { type AnalysisJob, conditionAnalysisReview, suggestedKind } from '../src/public-reports/analysis';
import type { CitizenReport } from '../src/public-reports/community';
const report: CitizenReport = { id: 'report-test', code: 'TEST', origin: 'community', category: 'road', sourceCategory: 'Jalan', title: 'Controlled test only', description: 'Not a public report', address: '', lat: -6.2, lng: 106.8, createdAt: '2026-10-29T00:00:00Z', updatedAt: '2026-10-29T00:00:00Z', sourceStatus: null, status: 'reported', revision: 3, visibility: 'public', media: [{ id: 'media-test', mime: 'image/jpeg', size: 100 }] };
const job: AnalysisJob = { analysisId: 'analysis-test', reportId: report.id, mediaId: 'media-test', sourceEntryId: report.id, baseReportRevision: 3, jobVersion: 2, execution: 'succeeded', freshness: 'fresh', review: 'pending', applicable: true, reason: null, createdAt: report.createdAt, expiresAt: '2099-01-01T00:00:00Z', pollAfterMs: 3000, revision: 3, suggestion: { kindSuggestion: 'pothole', visibleEvidence: ['Controlled test observation'], qualityFlags: [], captionSuggestion: 'Not copied', needsHumanReview: true } };
const condition = { kind: 'pothole' as const, observedAt: report.createdAt, source: 'reporter' as const, locationConfirmed: true as const, geometry: { type: 'Point' as const, coordinates: [106.8, -6.2] as [number, number] } };
test('a positive import has kind-only review and reporter changes remain corrected', () => {
  expect(suggestedKind(job, report)).toBe('pothole');
  expect(conditionAnalysisReview(job, report, condition)).toEqual({ analysisId: job.analysisId, decision: 'accepted', acceptedFields: ['kind'], correctedFields: [] });
  expect(conditionAnalysisReview(job, report, { ...condition, kind: 'crack' })?.decision).toBe('corrected');
  expect(conditionAnalysisReview(job, report, undefined)).toBeNull();
  expect(conditionAnalysisReview(job, report, null)).toBeNull();
});
test('negative, other, unknown and flagged results never link a condition', () => {
  for (const kindSuggestion of ['unknown', 'other', 'no_visible_issue'] as const) {
    const current = { ...job, suggestion: { ...job.suggestion!, kindSuggestion } };
    expect(suggestedKind(current, report)).toBeNull(); expect(conditionAnalysisReview(current, report, condition)).toBeNull();
  }
  for (const flag of ['blurred', 'low_light', 'occluded', 'no_road'] as const) {
    const current = { ...job, suggestion: { ...job.suggestion!, qualityFlags: [flag] } };
    expect(suggestedKind(current, report)).toBeNull(); expect(conditionAnalysisReview(current, report, condition)).toBeNull();
  }
});
test('closure and category mismatch require manual correction', () => {
  const closure = { ...job, applicable: false, suggestion: { ...job.suggestion!, kindSuggestion: 'possible_closure' as const } };
  expect(suggestedKind(closure, report)).toBeNull(); expect(conditionAnalysisReview(closure, report, condition)).toBeNull();
  expect(conditionAnalysisReview(closure, report, { ...condition, kind: 'closure', access: 'unknown' })?.decision).toBe('corrected');
  const work = { ...job, applicable: false, suggestion: { ...job.suggestion!, kindSuggestion: 'construction' as const } };
  expect(suggestedKind(work, report)).toBeNull(); expect(conditionAnalysisReview(work, report, { ...condition, kind: 'excavation' })?.decision).toBe('corrected');
});
test('revision, identity, access, expiry and previous decisions invalidate review', () => {
  for (const change of [{ baseReportRevision: 2 }, { reportId: 'another' }, { mediaId: 'another' }, { freshness: 'stale' as const }, { freshness: 'suppressed' as const }, { review: 'accepted' as const }, { execution: 'running' as const }, { expiresAt: '2000-01-01T00:00:00Z' }]) expect(conditionAnalysisReview({ ...job, ...change }, report, condition)).toBeNull();
  expect(conditionAnalysisReview(job, { ...report, visibility: 'withdrawn' }, condition)).toBeNull();
  expect(conditionAnalysisReview(job, { ...report, media: [] }, condition)).toBeNull();
});
