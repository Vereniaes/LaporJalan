/* Keep photo suggestions separate from confirmed reporter conditions.
Todo:
-> allow kind review only for fresh, supported results
*/
import { CONDITION_KINDS, type ConditionKind, type RoadCondition } from './condition';
import type { CitizenReport } from './community';

export type AnalysisLabel = 'pothole' | 'crack' | 'excavation' | 'construction' | 'possible_closure' | 'no_visible_issue' | 'other' | 'unknown';
export interface AnalysisJob {
  analysisId: string; reportId: string; mediaId: string; sourceEntryId: string; baseReportRevision: number; jobVersion: number;
  execution: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'; freshness: 'fresh' | 'stale' | 'suppressed';
  review: 'pending' | 'accepted' | 'corrected' | 'rejected'; applicable: boolean; reason: string | null;
  createdAt: string; startedAt?: string; completedAt?: string; expiresAt: string; pollAfterMs: number; revision: number;
  suggestion?: { kindSuggestion: AnalysisLabel; visibleEvidence: string[]; qualityFlags: ('blurred' | 'low_light' | 'occluded' | 'no_road')[]; captionSuggestion: string; needsHumanReview: true };
}
export type AnalysisReview = { analysisId: string; decision: 'accepted' | 'corrected'; acceptedFields: ['kind'] | []; correctedFields: ['kind'] | [] };
export type KindImport = { id: string; kind: ConditionKind };
const positives = ['pothole', 'crack', 'excavation', 'construction'];

export function reviewableAnalysis(job: AnalysisJob, report: CitizenReport, now = Date.now()) {
  const media = [...report.media, ...(report.updates ?? []).flatMap(entry => entry.media)];
  return job.reportId === report.id && job.baseReportRevision === report.revision && report.visibility !== 'withdrawn' && report.visibility !== 'hidden'
    && media.some(file => file.id === job.mediaId && file.mime.startsWith('image/')) && job.execution === 'succeeded' && job.freshness === 'fresh'
    && job.review === 'pending' && Date.parse(job.expiresAt) > now && !!job.suggestion && job.suggestion.qualityFlags.length === 0
    && [...positives, 'possible_closure'].includes(job.suggestion.kindSuggestion);
}
export function suggestedKind(job: AnalysisJob, report: CitizenReport): ConditionKind | null {
  const kind = job.suggestion?.kindSuggestion;
  return reviewableAnalysis(job, report) && job.applicable && kind && positives.includes(kind) && CONDITION_KINDS[report.category].includes(kind as ConditionKind) ? kind as ConditionKind : null;
}
export function conditionAnalysisReview(job: AnalysisJob | null, report: CitizenReport, condition?: RoadCondition | null): AnalysisReview | null {
  if (!job || !condition || !reviewableAnalysis(job, report) || !CONDITION_KINDS[report.category].includes(condition.kind)) return null;
  const label = job.suggestion!.kindSuggestion;
  if (label === 'possible_closure' && condition.kind !== 'closure') return null;
  const accepted = label === condition.kind && suggestedKind(job, report) !== null;
  return { analysisId: job.analysisId, decision: accepted ? 'accepted' : 'corrected', acceptedFields: accepted ? ['kind'] : [], correctedFields: accepted ? [] : ['kind'] };
}
