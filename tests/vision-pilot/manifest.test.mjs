// Exercise dataset guards with temporary generated pixels, never private photographs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, basename, dirname, resolve } from 'node:path';
import { validateDataset } from './manifest.mjs';

const sharp = createRequire(new URL('../../../laporjalan-be/package.json', import.meta.url))('sharp');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const labels = ['pothole', 'crack', 'excavation', 'construction', 'possible_closure', 'no_visible_issue', 'unknown'];
const roots = [];
test.after(async () => {
  for (const root of roots) {
    assert.equal(dirname(root), resolve(tmpdir())); assert.ok(basename(root).startsWith('lj-vision-manifest-'));
    await rm(root, { recursive: true, force: true });
  }
});
async function fixture(count = 6, phase = 'smoke') {
  const temporary = await mkdtemp(join(tmpdir(), 'lj-vision-manifest-')); roots.push(temporary);
  const root = join(temporary, 'dataset'); await mkdir(root);
  const manifest = { manifestVersion: '1', datasetId: 'synthetic-fixture', phase, status: 'frozen', createdAt: '2026-10-29T00:00:00.000Z',
    preprocessing: { version: 'fixture-v1', maxLongSide: 1024, resize: 'contain_without_upscale', orientation: 'apply_exif_then_strip', metadata: 'remove', colorSpace: 'srgb' }, entries: [] };
  for (let i = 0; i < count; i++) {
    const source = await sharp({ create: { width: 16, height: 12, channels: 3, background: { r: (i * 37 + 10) % 256, g: (i * 67 + 30) % 256, b: 60 } } }).png().toBuffer();
    const processed = await sharp(source).resize(8, 6).png().toBuffer();
    const sourcePath = `source-${i}.png`, assetPath = `processed-${i}.png`, evidencePath = `rights-${i}.json`;
    await writeFile(join(root, sourcePath), source); await writeFile(join(root, assetPath), processed);
    const provenance = { pageUrl: `https://commons.wikimedia.org/wiki/File:Synthetic_fixture_${i}.png`, license: 'CC0-1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', attribution: 'Synthetic test author', sourceSha256: digest(source) };
    await writeFile(join(root, evidencePath), JSON.stringify({ ...provenance, sourcePath, rightsText: 'Synthetic fixture evidence for validator tests only.', sourcePageRevisionId: 123 }));
    const goldLabel = phase === 'smoke' ? labels[i % 6] : labels[Math.floor(i / 20)] ?? 'pothole';
    manifest.entries.push({ id: `image-${i}`, split: phase === 'smoke' ? 'smoke' : i < 140 ? 'holdout' : 'pilot', incidentGroupId: `incident-${i}`, locationGroupId: `location-${i}`, nearDuplicateGroupId: `similar-${i}`,
      source: { ...provenance, rightsEvidence: evidencePath }, asset: { path: assetPath, sha256: digest(processed), mime: 'image/png', sizeBytes: processed.length, width: 8, height: 6, privacyReviewed: true }, target: 'whole_image', goldLabel,
      review: { primaryReviewerId: 'reviewer-a', primaryLabel: goldLabel, secondaryReviewerId: null, secondaryLabel: null, ambiguous: false, decision: phase === 'smoke' ? 'smoke_single_review' : 'single_clear', rationale: 'Generated pixel fixture, not a real road gold label.' } });
  }
  return { root, manifest, temporary };
}

test('validates six unique generated images, source files and matching rights evidence', async () => {
  const { root, manifest } = await fixture();
  const result = await validateDataset(manifest, { datasetRoot: root });
  assert.equal(result.entries.length, 6); assert.equal(Object.keys(result.hashes).length, 18);
  assert.equal(result.counts.bySplit.smoke, 6); assert.equal(result.counts.byGoldLabel.pothole, 1);
  assert.equal(result.entries[0].assetAbsolutePath, join(root, manifest.entries[0].asset.path));
  assert.equal(result.entries[0].evidenceAbsolutePath, join(root, manifest.entries[0].source.rightsEvidence));
});

test('rejects traversal and absolute paths before reading outside data', async () => {
  const { root, manifest } = await fixture();
  const traversal = structuredClone(manifest); traversal.entries[0].asset.path = '../outside.png';
  await assert.rejects(validateDataset(traversal, { datasetRoot: root }), /invalid text|Unsafe|escapes/);
  const absolute = structuredClone(manifest); absolute.entries[0].asset.path = join(root, 'processed-0.png');
  await assert.rejects(validateDataset(absolute, { datasetRoot: root }), /invalid text|Unsafe/);
});

test('rejects symlink escapes to files outside the dataset root', async t => {
  const { root, manifest, temporary } = await fixture();
  await writeFile(join(temporary, 'outside.png'), await readFile(join(root, 'processed-0.png')));
  try { await symlink(join(temporary, 'outside.png'), join(root, 'escaped.png'), 'file'); }
  catch (error) { if (error.code === 'EPERM') { t.skip('Symlink creation unavailable in this environment.'); return; } throw error; }
  manifest.entries[0].asset.path = 'escaped.png';
  await assert.rejects(validateDataset(manifest, { datasetRoot: root }), /escapes approved root/);
});

test('rejects hash and byte-size mismatches', async () => {
  const { root, manifest } = await fixture();
  const changedHash = structuredClone(manifest); changedHash.entries[0].asset.sha256 = '0'.repeat(64);
  await assert.rejects(validateDataset(changedHash, { datasetRoot: root }), /asset hash mismatch/);
  manifest.entries[0].asset.sizeBytes++;
  await assert.rejects(validateDataset(manifest, { datasetRoot: root }), /size mismatch/);
});

test('rejects missing privacy review, draft datasets, inconsistent gold and extra properties', async () => {
  const { root, manifest } = await fixture();
  for (const change of [value => { value.entries[0].asset.privacyReviewed = false; }, value => { value.status = 'draft'; }, value => { value.entries[0].review.primaryLabel = 'unknown'; }, value => { value.entries[0].unexpected = true; }]) {
    const candidate = structuredClone(manifest); change(candidate);
    await assert.rejects(validateDataset(candidate, { datasetRoot: root }));
  }
});

test('rejects duplicate sample IDs and both processed/source hashes', async () => {
  const { root, manifest } = await fixture();
  for (const change of [value => { value.entries[1].id = value.entries[0].id; }, value => { value.entries[1].asset.sha256 = value.entries[0].asset.sha256; }, value => { value.entries[1].source.sourceSha256 = value.entries[0].source.sourceSha256; }]) {
    const candidate = structuredClone(manifest); change(candidate);
    await assert.rejects(validateDataset(candidate, { datasetRoot: root }), /Duplicate/);
  }
});

test('rights evidence must be nonempty, match source provenance and identify real source bytes', async () => {
  const { root, manifest } = await fixture(); const entry = manifest.entries[0], path = join(root, entry.source.rightsEvidence);
  const original = JSON.parse(await readFile(path, 'utf8'));
  for (const candidate of [{}, { ...original, rightsText: ' ' }, { ...original, license: 'different' }, { ...original, sourcePath: '../outside.png' }, { ...original, downloadUrl: 'https://user:password@example.test/photo.png' }]) {
    await writeFile(path, JSON.stringify(candidate)); await assert.rejects(validateDataset(manifest, { datasetRoot: root }));
  }
  await writeFile(path, JSON.stringify({ ...original, sourceSha256: '0'.repeat(64) })); entry.source.sourceSha256 = '0'.repeat(64);
  await assert.rejects(validateDataset(manifest, { datasetRoot: root }), /Source hash mismatch/);
});

test('rejects credentials and sensitive queries in provenance URLs', async () => {
  const { root, manifest } = await fixture();
  for (const pageUrl of ['https://user:password@example.test/file', 'https://example.test/file?access_token=secret', 'http://example.test/file']) {
    const candidate = structuredClone(manifest); candidate.entries[0].source.pageUrl = pageUrl;
    await assert.rejects(validateDataset(candidate, { datasetRoot: root }), /URL|invalid text/);
  }
});

test('rejects retained EXIF/orientation and mismatched decoded dimensions or MIME', async () => {
  const { root, manifest } = await fixture(); const entry = manifest.entries[0];
  const wrongDimensions = structuredClone(manifest); wrongDimensions.entries[0].asset.width = 9;
  await assert.rejects(validateDataset(wrongDimensions, { datasetRoot: root }), /metadata mismatch/);
  const wrongMime = structuredClone(manifest); wrongMime.entries[0].asset.mime = 'image/jpeg';
  await assert.rejects(validateDataset(wrongMime, { datasetRoot: root }), /metadata mismatch/);
  const metadata = await sharp(await readFile(join(root, entry.asset.path))).withMetadata({ orientation: 1 }).png().toBuffer();
  await writeFile(join(root, entry.asset.path), metadata); entry.asset.sha256 = digest(metadata); entry.asset.sizeBytes = metadata.length;
  await assert.rejects(validateDataset(manifest, { datasetRoot: root }), /still contains metadata/);
});

test('full evaluation requires 140 reviewed holdout images and prevents cross-split groups', async () => {
  const { root, manifest } = await fixture(141, 'full_evaluation');
  const valid = await validateDataset(manifest, { datasetRoot: root }); assert.equal(valid.counts.bySplit.holdout, 140);
  for (const group of ['incidentGroupId', 'locationGroupId', 'nearDuplicateGroupId']) {
    const candidate = structuredClone(manifest); candidate.entries[140][group] = candidate.entries[0][group];
    await assert.rejects(validateDataset(candidate, { datasetRoot: root }), /Group leakage/);
  }
  const insufficient = structuredClone(manifest); insufficient.entries[0].split = 'pilot';
  await assert.rejects(validateDataset(insufficient, { datasetRoot: root }), /20 holdout/);
  const ambiguous = structuredClone(manifest); ambiguous.entries[0].review.ambiguous = true;
  await assert.rejects(validateDataset(ambiguous, { datasetRoot: root }), /requires two/);
  const resolved = structuredClone(manifest); resolved.entries[0].review = { ...resolved.entries[0].review, ambiguous: true, secondaryReviewerId: 'reviewer-b', secondaryLabel: resolved.entries[0].goldLabel, decision: 'agreed' };
  assert.equal((await validateDataset(resolved, { datasetRoot: root })).entries.length, 141);
});
