/* Check local request boundaries and keep failed latency visible.
Todo:
-> stop before inference when residency or warmup separation differs
*/
import { isDeepStrictEqual } from 'node:util';

export function assertWarmupDisjoint(warmup, entries) {
  const keys = ['id', 'incidentGroupId', 'locationGroupId', 'nearDuplicateGroupId'];
  for (const entry of entries) {
    if (keys.some(key => warmup[key] === entry[key]) || warmup.asset.sha256 === entry.asset.sha256 || warmup.source.sourceSha256 === entry.source.sourceSha256) {
      throw new Error('Warmup overlaps a scored sample or group');
    }
  }
}

export function assertResidency(loaded, config, expectation = 'any') {
  if (!Array.isArray(loaded?.models)) throw new Error('Runtime residency is unavailable');
  if (loaded.models.length > 1 || loaded.models.some(model => model.digest !== config.modelDigest)) throw new Error('Unexpected model is resident; leave it untouched');
  if (expectation === 'cold' && loaded.models.length !== 0) throw new Error('Cold probe requires an empty isolated runtime');
  if (expectation === 'warm' && loaded.models.length !== 1) throw new Error('Warm request requires the pinned model to be resident');
}

export function assertFrozenInputs(frozen, current) {
  const stored = JSON.parse(JSON.stringify(current));
  for (const key of ['id', 'phase', 'config', 'dataset', 'modelOutputSchema', 'prompt', 'provenance']) {
    if (!isDeepStrictEqual(frozen[key], stored[key])) throw new Error(`Frozen input changed: ${key}`);
  }
}

// Failed attempts retain their wall time and also incur the fixed failure latency. ---------------------------
// input param : primary attempt records, request deadline
// output : observed and failure-penalized distributions
export function summarizeLatency(rows, deadlineMs) {
  const summary = values => {
    if (!values.length) return { count: 0, median: null, p95: null };
    const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
    return { count: sorted.length, median: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2, p95: sorted[Math.ceil(sorted.length * .95) - 1] };
  };
  if (rows.some(row => !Number.isFinite(row.wallMs) || row.wallMs < 0)) throw new Error('Invalid attempt latency');
  return {
    observedWallMs: summary(rows.map(row => row.wallMs)),
    failurePenalizedWallMs: summary(rows.map(row => row.outcome === 'valid' ? row.wallMs : deadlineMs)),
    successfulOnlyWallMs: summary(rows.filter(row => row.outcome === 'valid').map(row => row.wallMs)),
    failurePenaltyMs: deadlineMs,
  };
}
// end of helper ------------------------------------------------------------------------------------------

export async function localFetch(url, options = {}, fetcher = fetch) {
  const target = new URL(url);
  if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1' || !['11434', '11435'].includes(target.port) || target.username || target.password || target.search || target.hash) throw new Error('Only local pilot runtime requests are allowed');
  return fetcher(target, { ...options, redirect: 'error' });
}

export async function preserveAttempt(record, checkAfter, persist) {
  let guardError;
  try { record.residencyAfter = (await checkAfter()).loaded; }
  catch (error) { guardError = error; record.guardFailure = String(error); record.residencyAfter = null; }
  await persist(record);
  if (guardError) throw guardError;
  return record;
}
