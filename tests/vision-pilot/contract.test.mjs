// Check strict pilot responses and failure-aware scores using synthetic text only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_LABELS, KNOWN_LABELS, validateModelResponse, scoreAttempts } from './contract.mjs';

const output = (label = 'pothole', patch = {}) => ({ kindSuggestion: label, visibleEvidence: ['A visible road surface depression.'], qualityFlags: [], captionSuggestion: 'A road condition needs human review.', needsHumanReview: true, ...patch });
const row = (sampleId, goldLabel, prediction = goldLabel, patch = {}) => ({ sampleId, goldLabel, split: 'smoke', purpose: 'primary', attempt: 1, outcome: 'valid', parsedOutput: output(prediction), ...patch });
const validate = value => validateModelResponse(JSON.stringify(value));
const full = () => [...KNOWN_LABELS, 'unknown'].flatMap(label => Array.from({ length: 20 }, (_, i) => row(`${label}-${i}`, label, label, { split: 'holdout' })));

test('accepts all eight labels and true human review without changing unknown to a known label', () => {
  assert.equal(MODEL_LABELS.length, 8); assert.equal(KNOWN_LABELS.length, 6);
  for (const label of MODEL_LABELS) assert.equal(validate(output(label)).output.kindSuggestion, label);
  assert.equal(validate(output('unknown', { visibleEvidence: [], qualityFlags: ['blurred'] })).valid, true);
});

test('rejects duplicate object keys including escaped equivalents and nested duplicates', () => {
  const duplicate = '{"kindSuggestion":"pothole","kind\\u0053uggestion":"crack","visibleEvidence":[],"qualityFlags":[],"captionSuggestion":"Visible road.","needsHumanReview":true}';
  assert.equal(validateModelResponse(duplicate).errorCode, 'invalid_json');
  assert.equal(validateModelResponse('{"extra":{"x":1,"x":2}}').errorCode, 'invalid_json');
  assert.equal(validateModelResponse('{"a":{"x":1},"b":{"x":2}}').errorCode, 'invalid_schema');
  assert.equal(validate(output('pothole', { captionSuggestion: 'A sign reads {"kindSuggestion":"other"}.' })).valid, true);
});

test('rejects fences, prose, trailing JSON, invalid UTF-8 and nontext input', () => {
  for (const raw of ['```json\n{}\n```', 'Result: {}', '{} {}', new Uint8Array([255]), {}, null]) assert.equal(validateModelResponse(raw).errorCode, 'invalid_json');
});

test('enforces the 16 KiB UTF-8 byte cap before parsing', () => {
  assert.equal(validateModelResponse('x'.repeat(16385)).errorCode, 'response_too_large');
  assert.equal(validateModelResponse('😀'.repeat(4097)).errorCode, 'response_too_large');
  assert.equal(validateModelResponse(new Uint8Array(16385)).errorCode, 'response_too_large');
});

test('requires exact keys, labels and types with no coercion', () => {
  for (const value of [null, [], 'unknown', output('invalid'), output('pothole', { needsHumanReview: false }), output('pothole', { needsHumanReview: 'true' }), output('pothole', { confidence: .9 }), output('pothole', { visibleEvidence: 'road' }), output('pothole', { captionSuggestion: 1 })]) assert.equal(validate(value).errorCode, 'invalid_schema');
  const missing = output(); delete missing.captionSuggestion; assert.equal(validate(missing).errorCode, 'invalid_schema');
});

test('rejects duplicate array items, unknown flags, invalid element types and oversize arrays', () => {
  for (const patch of [{ visibleEvidence: ['road', 'road'] }, { qualityFlags: ['blurred', 'blurred'] }, { qualityFlags: ['verified'] }, { visibleEvidence: [1] }, { visibleEvidence: [''] }, { visibleEvidence: ['a', 'b', 'c', 'd', 'e'] }]) assert.equal(validate(output('pothole', patch)).errorCode, 'invalid_schema');
});

test('string bounds count Unicode code points rather than UTF-16 code units', () => {
  assert.equal(validate(output('pothole', { visibleEvidence: ['😀'.repeat(160)], captionSuggestion: '😀'.repeat(240) })).valid, true);
  assert.equal(validate(output('pothole', { visibleEvidence: ['😀'.repeat(161)] })).errorCode, 'invalid_schema');
  assert.equal(validate(output('pothole', { captionSuggestion: '😀'.repeat(241) })).errorCode, 'invalid_schema');
});

test('obvious prohibited claims produce semantic warnings while schema remains valid', () => {
  const result = validate(output('possible_closure', { captionSuggestion: 'Depth 52 cm. GPS -6.2,106.8. Contact road@example.test or https://example.test. Government status completed; fully closed.' }));
  assert.equal(result.valid, true);
  assert.deepEqual(result.semanticWarnings, ['measurement_claim', 'location_claim', 'email_reference', 'url_reference', 'official_status_claim', 'full_closure_claim']);
  assert.deepEqual(validate(output()).semanticWarnings, []);
});

test('unknown, timeout and incorrect known predictions stay in known coverage denominators', () => {
  const result = scoreAttempts([row('a', 'pothole', 'unknown'), row('b', 'crack', 'crack', { outcome: 'timeout', parsedOutput: null }), row('c', 'no_visible_issue', 'possible_closure')]);
  assert.equal(result.counts.primary, 3); assert.equal(result.counts.failure, 1);
  assert.equal(result.rawValidRate, 2 / 3); assert.equal(result.knownCoverage, 1 / 3); assert.equal(result.coverage, 1 / 3);
  assert.equal(result.closureFalsePositiveRate, 1); assert.equal(result.confusion.crack.failure, 1);
  assert.equal(result.macroF1, null); assert.equal(result.fullEvaluation.qualityStatus, 'not_reached');
});

test('phase selects the correct split and never promotes a retry over the first failure', () => {
  const rows = [row('smoke', 'pothole'), row('holdout', 'crack', 'crack', { split: 'holdout' }), row('pilot', 'pothole', 'pothole', { split: 'pilot' }), row('failed', 'crack', 'crack', { outcome: 'oom', parsedOutput: null }), row('failed', 'crack', 'crack', { purpose: 'infrastructure_retry', attempt: 2 }), row('warmup', 'pothole', 'pothole', { purpose: 'warmup' })];
  const smoke = scoreAttempts(rows); assert.equal(smoke.counts.primary, 2); assert.equal(smoke.rawValidRate, .5);
  const holdout = scoreAttempts(rows, { phase: 'full_evaluation' }); assert.equal(holdout.counts.primary, 1); assert.equal(holdout.labelCounts.crack, 1);
  assert.equal(smoke.counts.excluded, 4);
});

test('duplicate primary sample IDs and malformed scoring inputs throw', () => {
  assert.throws(() => scoreAttempts([row('same', 'pothole'), row('same', 'crack')]), /Duplicate primary/);
  assert.throws(() => scoreAttempts([row('a', 'invalid')]), /Invalid primary/);
  assert.throws(() => scoreAttempts([], { phase: 'other' }), /Invalid score/);
});

test('a claimed valid record with a malformed parsed output counts as failure', () => {
  const result = scoreAttempts([row('a', 'pothole', 'pothole', { parsedOutput: { kindSuggestion: 'pothole' } })]);
  assert.equal(result.rawValidRate, 0); assert.equal(result.knownCoverage, 0); assert.equal(result.counts.schemaMismatches, 1);
});

test('macro-F1 includes wrong known predictions, abstention and failures; unknown gold stays separate', () => {
  const rows = KNOWN_LABELS.map(label => row(label, label, label === 'crack' ? 'pothole' : label));
  rows.push(row('unknown', 'unknown', 'pothole'));
  const result = scoreAttempts(rows);
  assert.ok(Math.abs(result.macroF1 - 7 / 9) < 1e-12);
  assert.equal(result.perClass.pothole.fp, 1); assert.equal(result.unknownRates.knownPredictionRate, 1);
});

test('unknown rates include failures and preserve separate other and unknown abstentions', () => {
  const result = scoreAttempts([row('a', 'unknown', 'unknown'), row('b', 'unknown', 'other'), row('c', 'unknown', 'pothole'), row('d', 'unknown', 'unknown', { outcome: 'transport_error', parsedOutput: null })]);
  assert.equal(result.unknownRates.unknownRate, .25); assert.equal(result.unknownRates.otherRate, .25);
  assert.equal(result.unknownRates.abstentionRate, .5); assert.equal(result.unknownRates.knownPredictionRate, .25); assert.equal(result.unknownRates.failureRate, .25);
});

test('missing labels or fewer than 20 per class cannot reach the full quality gate', () => {
  const missing = scoreAttempts([row('a', 'pothole', 'pothole', { split: 'holdout' })], { phase: 'full_evaluation' });
  assert.equal(missing.macroF1, null); assert.equal(missing.perClass.crack.f1, null); assert.equal(missing.fullEvaluation.qualityStatus, 'not_reached');
  const small = scoreAttempts(KNOWN_LABELS.map(label => row(label, label, label, { split: 'holdout' })), { phase: 'full_evaluation' });
  assert.equal(small.macroF1, 1); assert.equal(small.fullEvaluation.eligible, false);
  assert.equal(scoreAttempts(full().map(record => ({ ...record, split: 'smoke' }))).fullEvaluation.qualityStatus, 'not_reached');
});

test('full 140 counts can meet quality targets without claiming latency or rights approval', () => {
  const result = scoreAttempts(full(), { phase: 'full_evaluation' });
  assert.equal(result.counts.primary, 140); assert.equal(result.knownCoverage, 1); assert.equal(result.macroF1, 1);
  assert.equal(result.rawValidRate, 1); assert.equal(result.closureFalsePositiveRate, 0); assert.equal(result.unknownRates.abstentionRate, 1);
  assert.equal(result.fullEvaluation.qualityStatus, 'passed');
});

test('negative closure FP uses every negative first attempt including failures', () => {
  const records = full();
  records.find(record => record.goldLabel === 'no_visible_issue').parsedOutput = output('possible_closure');
  assert.equal(scoreAttempts(records, { phase: 'full_evaluation' }).closureFalsePositiveRate, .05);
  records.filter(record => record.goldLabel === 'no_visible_issue')[1].parsedOutput = output('possible_closure');
  const result = scoreAttempts(records, { phase: 'full_evaluation' });
  assert.equal(result.closureFalsePositiveRate, .1); assert.equal(result.fullEvaluation.qualityStatus, 'failed');
  assert.ok(result.fullEvaluation.reasons.includes('closure_false_positive_rate_above_0.05'));
  const negativeFailure = scoreAttempts([row('a', 'no_visible_issue', 'possible_closure'), row('b', 'no_visible_issue', 'no_visible_issue', { outcome: 'timeout', parsedOutput: null })]);
  assert.equal(negativeFailure.closureFalsePositiveRate, .5);
});

test('raw valid gate retains timeout/OOM outcomes even when known F1 remains perfect', () => {
  const records = full();
  for (const record of records.filter(record => record.goldLabel === 'unknown').slice(0, 3)) { record.outcome = 'timeout'; record.parsedOutput = null; }
  const result = scoreAttempts(records, { phase: 'full_evaluation' });
  assert.equal(result.rawValidRate, 137 / 140); assert.equal(result.macroF1, 1); assert.equal(result.fullEvaluation.qualityStatus, 'failed');
  assert.ok(result.fullEvaluation.reasons.includes('raw_valid_rate_below_0.98'));
  const empty = scoreAttempts([]); assert.equal(empty.rawValidRate, null); assert.equal(empty.knownCoverage, null); assert.equal(empty.closureFalsePositiveRate, null);
});
