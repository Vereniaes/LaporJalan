// Validate local pilot responses and score first attempts without accessing images or models.
import { readFileSync } from 'node:fs';

const schema = JSON.parse(readFileSync(new URL('../../knowledge/crm-3d-plan-2026-10-28/implementation-p5/SCHEMA.json', import.meta.url), 'utf8')).$defs.modelOutput;
export const MODEL_LABELS = Object.freeze([...schema.properties.kindSuggestion.enum]);
export const KNOWN_LABELS = Object.freeze(MODEL_LABELS.filter(label => !['other', 'unknown'].includes(label)));
const outcomes = new Set(['valid', 'invalid_json', 'invalid_schema', 'timeout', 'oom', 'transport_error', 'decode_error', 'refused']);
const ratio = (numerator, denominator) => denominator ? numerator / denominator : null;
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// JSON.parse validates syntax first; this scan retains object keys before duplicates are lost.
function rejectDuplicateKeys(text) {
  const stack = [];
  for (const [token] of text.matchAll(/"(?:\\[\s\S]|[^"\\])*"|[{}\[\],]/g)) {
    if (token === '{') stack.push({ keys: new Set(), keyExpected: true });
    else if (token === '[') stack.push(null);
    else if (token === '}' || token === ']') stack.pop();
    else {
      const object = stack.at(-1);
      if (token === ',' && object) object.keyExpected = true;
      else if (token.startsWith('"') && object?.keyExpected) {
        const key = JSON.parse(token);
        if (object.keys.has(key)) throw new Error('Duplicate JSON object key');
        object.keys.add(key); object.keyExpected = false;
      }
    }
  }
}

function outputErrors(value) {
  if (!isObject(value)) return ['Response must be an object'];
  const errors = [];
  const keys = Object.keys(value);
  if (schema.required.some(key => !Object.hasOwn(value, key)) || keys.some(key => !Object.hasOwn(schema.properties, key))) errors.push('Response must contain exactly the required fields');
  for (const [key, rule] of Object.entries(schema.properties)) {
    const item = value[key];
    if (rule.type === 'string') {
      if (typeof item !== 'string') { errors.push(`${key} must be a string`); continue; }
      const length = Array.from(item).length;
      if (rule.enum && !rule.enum.includes(item)) errors.push(`${key} is not an allowed label`);
      if (rule.minLength !== undefined && length < rule.minLength || rule.maxLength !== undefined && length > rule.maxLength) errors.push(`${key} has an invalid length`);
    } else if (rule.type === 'boolean') {
      if (item !== rule.const) errors.push(`${key} must be true`);
    } else if (rule.type === 'array') {
      if (!Array.isArray(item)) { errors.push(`${key} must be an array`); continue; }
      if (item.length > rule.maxItems) errors.push(`${key} contains too many items`);
      if (new Set(item).size !== item.length) errors.push(`${key} contains duplicate items`);
      if (item.some(entry => typeof entry !== 'string' || rule.items.enum && !rule.items.enum.includes(entry) || rule.items.minLength !== undefined && Array.from(entry).length < rule.items.minLength || rule.items.maxLength !== undefined && Array.from(entry).length > rule.items.maxLength)) errors.push(`${key} contains an invalid item`);
    }
  }
  return errors;
}

function semanticWarnings(output) {
  const text = [...output.visibleEvidence, output.captionSuggestion].join('\n');
  const warnings = [];
  if (/\b\d+(?:[.,]\d+)?\s*(?:mm|cm|m|meters?|metres?|centimeters?|centimetres?|sentimeter|meter)\b/i.test(text)) warnings.push('measurement_claim');
  if (/\b(?:gps|latitude|longitude|koordinat|lintang|bujur)\b|[-+]?\d{1,3}\.\d+\s*[,;]\s*[-+]?\d{1,3}\.\d+/i.test(text)) warnings.push('location_claim');
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) warnings.push('email_reference');
  if (/\b(?:https?:\/\/|www\.)\S+/i.test(text)) warnings.push('url_reference');
  if (/\b(?:official(?:ly)?|government|municipal|crm|jaki|pemerintah|dinas|petugas|resmi)\b/i.test(text) && /\b(?:verified|approved|resolved|completed|closed|status|terverifikasi|disetujui|selesai|ditutup|dikerjakan)\b/i.test(text)) warnings.push('official_status_claim');
  if (/\b(?:fully|completely)\s+closed\b|ditutup\s+(?:penuh|total)|tertutup\s+total/i.test(text)) warnings.push('full_closure_claim');
  return warnings;
}

export function validateModelResponse(raw) {
  const fail = (errorCode, errors) => ({ valid: false, output: null, errorCode, errors, semanticWarnings: [] });
  if (typeof raw !== 'string' && !(raw instanceof Uint8Array)) return fail('invalid_json', ['Response must be UTF-8 text']);
  if ((typeof raw === 'string' ? Buffer.byteLength(raw, 'utf8') : raw.byteLength) > 16 * 1024) return fail('response_too_large', ['Response exceeds 16 KiB']);
  let value;
  try {
    const text = typeof raw === 'string' ? raw : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(raw);
    value = JSON.parse(text); rejectDuplicateKeys(text);
  } catch { return fail('invalid_json', ['Response is invalid JSON or contains duplicate object keys']); }
  const errors = outputErrors(value);
  if (errors.length) return fail('invalid_schema', errors);
  return { valid: true, output: value, errorCode: null, errors: [], semanticWarnings: semanticWarnings(value) };
}

// Eligibility covers sample counts only; the runner verifies licenses, groups and manifest completeness.
export function scoreAttempts(rows, { phase = 'smoke' } = {}) {
  if (!Array.isArray(rows) || !['smoke', 'full_evaluation'].includes(phase)) throw new TypeError('Invalid score input');
  const split = phase === 'smoke' ? 'smoke' : 'holdout';
  const primary = rows.filter(row => row?.split === split && (row.purpose === undefined || row.purpose === 'primary') && (row.attempt === undefined || row.attempt === 1));
  const ids = new Set();
  const predictionLabels = [...MODEL_LABELS, 'failure'];
  const confusion = Object.fromEntries(MODEL_LABELS.map(gold => [gold, Object.fromEntries(predictionLabels.map(label => [label, 0]))]));
  const labelCounts = Object.fromEntries(MODEL_LABELS.map(label => [label, 0]));
  const counts = { primary: primary.length, known: 0, negative: 0, unknown: 0, valid: 0, failure: 0, covered: 0, excluded: rows.length - primary.length, schemaMismatches: 0 };
  for (const row of primary) {
    if (typeof row.sampleId !== 'string' || !row.sampleId || !MODEL_LABELS.includes(row.goldLabel) || !outcomes.has(row.outcome)) throw new TypeError('Invalid primary attempt');
    if (ids.has(row.sampleId)) throw new Error('Duplicate primary sample ID');
    ids.add(row.sampleId);
    const valid = row.outcome === 'valid' && outputErrors(row.parsedOutput).length === 0;
    if (row.outcome === 'valid' && !valid) counts.schemaMismatches++;
    const prediction = valid ? row.parsedOutput.kindSuggestion : 'failure';
    confusion[row.goldLabel][prediction]++; labelCounts[row.goldLabel]++;
    counts[valid ? 'valid' : 'failure']++;
    if (KNOWN_LABELS.includes(row.goldLabel)) counts.known++;
    if (row.goldLabel === 'no_visible_issue') counts.negative++;
    if (row.goldLabel === 'unknown') counts.unknown++;
    if (KNOWN_LABELS.includes(prediction)) counts.covered++;
  }
  const perClass = Object.fromEntries(KNOWN_LABELS.map(label => {
    const tp = confusion[label][label], support = labelCounts[label];
    const fp = KNOWN_LABELS.filter(gold => gold !== label).reduce((sum, gold) => sum + confusion[gold][label], 0);
    const fn = support - tp;
    return [label, { support, tp, fp, fn, precision: ratio(tp, tp + fp), recall: ratio(tp, support), f1: support ? 2 * tp / (2 * tp + fp + fn) : null }];
  }));
  const macroF1 = KNOWN_LABELS.every(label => labelCounts[label] > 0) ? KNOWN_LABELS.reduce((sum, label) => sum + perClass[label].f1, 0) / KNOWN_LABELS.length : null;
  const knownCovered = KNOWN_LABELS.reduce((sum, gold) => sum + KNOWN_LABELS.reduce((n, prediction) => n + confusion[gold][prediction], 0), 0);
  const rawValidRate = ratio(counts.valid, counts.primary), knownCoverage = ratio(knownCovered, counts.known);
  const closureFalsePositiveRate = ratio(confusion.no_visible_issue.possible_closure, counts.negative);
  const unknownKnown = KNOWN_LABELS.reduce((sum, prediction) => sum + confusion.unknown[prediction], 0);
  const unknownRates = {
    total: counts.unknown, unknownRate: ratio(confusion.unknown.unknown, counts.unknown), otherRate: ratio(confusion.unknown.other, counts.unknown),
    abstentionRate: ratio(confusion.unknown.unknown + confusion.unknown.other, counts.unknown), knownPredictionRate: ratio(unknownKnown, counts.unknown), failureRate: ratio(confusion.unknown.failure, counts.unknown),
  };
  const reasons = [];
  if (phase !== 'full_evaluation') reasons.push('smoke_is_descriptive_only');
  for (const label of [...KNOWN_LABELS, 'unknown']) if (labelCounts[label] < 20) reasons.push(`requires_20_${label}`);
  const eligible = reasons.length === 0;
  if (eligible) {
    if (rawValidRate < .98) reasons.push('raw_valid_rate_below_0.98');
    if (knownCoverage < .70) reasons.push('known_coverage_below_0.70');
    if (macroF1 < .80) reasons.push('macro_f1_below_0.80');
    if (closureFalsePositiveRate > .05) reasons.push('closure_false_positive_rate_above_0.05');
  }
  return { counts, labelCounts, confusion, rawValidRate, coverage: ratio(counts.covered, counts.primary), knownCoverage, macroF1, perClass, closureFalsePositiveRate, unknownRates,
    fullEvaluation: { eligible, qualityStatus: !eligible ? 'not_reached' : reasons.length ? 'failed' : 'passed', reasons } };
}
