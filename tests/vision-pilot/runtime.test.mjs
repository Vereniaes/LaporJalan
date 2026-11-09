/* Exercise pilot safety boundaries without loading any model or photo.
Todo:
-> retain completed attempts when a post-request guard stops the run
*/
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertWarmupDisjoint, assertResidency, assertFrozenInputs, summarizeLatency, localFetch, preserveAttempt } from './runtime.mjs';

const entry = id => ({ id, incidentGroupId: 'incident-' + id, locationGroupId: 'location-' + id, nearDuplicateGroupId: 'duplicate-' + id, asset: { sha256: 'processed-' + id }, source: { sourceSha256: 'source-' + id } });
test('warmup separation covers the first scored entry and every group/hash', () => {
  const samples = [entry('first'), entry('last')];
  assert.doesNotThrow(() => assertWarmupDisjoint(entry('warmup'), samples));
  for (const key of ['id', 'incidentGroupId', 'locationGroupId', 'nearDuplicateGroupId', 'asset', 'source']) {
    const warmup = entry('warmup'); warmup[key] = samples[0][key];
    assert.throws(() => assertWarmupDisjoint(warmup, samples), /overlaps/);
  }
});
test('cold and warm residency require the pinned digest', () => {
  const config = { modelDigest: 'pinned' }, resident = { models: [{ digest: 'pinned' }] };
  assert.doesNotThrow(() => assertResidency({ models: [] }, config, 'cold'));
  assert.doesNotThrow(() => assertResidency(resident, config, 'warm'));
  assert.throws(() => assertResidency(resident, config, 'cold'), /empty/);
  assert.throws(() => assertResidency({ models: [] }, config, 'warm'), /resident/);
  assert.throws(() => assertResidency({ models: [{ digest: 'other' }] }, config), /Unexpected/);
});
test('frozen schema, prompt and metadata cannot bypass current hashed inputs', () => {
  const original = { id: 'run', phase: 'smoke', config: {}, dataset: {}, modelOutputSchema: { additionalProperties: false }, prompt: 'original', provenance: {} };
  assert.doesNotThrow(() => assertFrozenInputs(original, structuredClone(original)));
  assert.doesNotThrow(() => assertFrozenInputs(original, { ...original, provenance: Object.create(null) }));
  for (const key of Object.keys(original)) assert.throws(() => assertFrozenInputs({ ...original, [key]: 'edited' }, original), /Frozen input changed/);
});
test('latency averages the two middle values and penalizes fast failures', () => {
  const result = summarizeLatency([{ outcome: 'valid', wallMs: 1000 }, { outcome: 'valid', wallMs: 3000 }, { outcome: 'valid', wallMs: 5000 }, { outcome: 'invalid_schema', wallMs: 10 }], 90000);
  assert.equal(result.observedWallMs.median, 2000);
  assert.equal(result.failurePenalizedWallMs.median, 4000);
  assert.equal(result.failurePenalizedWallMs.p95, 90000);
  assert.equal(result.successfulOnlyWallMs.count, 3);
});
test('local requests reject redirects and external endpoints before sending', async () => {
  let calls = 0;
  const fake = async (url, options) => { calls++; assert.equal(options.redirect, 'error'); return { ok: true }; };
  await localFetch('http://127.0.0.1:11435/api/chat', { method: 'POST', redirect: 'follow' }, fake);
  await assert.rejects(localFetch('https://example.com/api/chat', {}, fake), /Only local/);
  assert.equal(calls, 1);
});
test('a completed failed response survives a subsequent runtime guard failure', async () => {
  const saved = [];
  await assert.rejects(preserveAttempt({ outcome: 'invalid_schema', wallMs: 25 }, async () => { throw new Error('Runtime changed'); }, async record => saved.push(structuredClone(record))), /Runtime changed/);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].outcome, 'invalid_schema');
  assert.match(saved[0].guardFailure, /Runtime changed/);
});
