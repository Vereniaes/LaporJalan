// Validate a local image dataset and its rights evidence before any inference.
import { readFile, realpath, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const backendRequire = createRequire(new URL('../../../laporjalan-be/package.json', import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error(message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// Support only the schema keywords used by the frozen manifest, without coercion.
function validateStructure(value, rule, definitions, path = 'manifest') {
  if (rule.$ref) return validateStructure(value, definitions[rule.$ref.split('/').at(-1)] ?? fail('Unknown schema reference'), definitions, path);
  if (rule.anyOf) {
    if (!rule.anyOf.some(candidate => { try { validateStructure(value, candidate, definitions, path); return true; } catch { return false; } })) fail(`${path} has an invalid type`);
    return;
  }
  if (Object.hasOwn(rule, 'const') && value !== rule.const || rule.enum && !rule.enum.includes(value)) fail(`${path} has an invalid value`);
  if (rule.type) {
    const matches = type => type === 'null' ? value === null : type === 'object' ? object(value) : type === 'array' ? Array.isArray(value) : type === 'integer' ? Number.isInteger(value) : type === 'number' ? typeof value === 'number' && Number.isFinite(value) : typeof value === type;
    if (!(Array.isArray(rule.type) ? rule.type : [rule.type]).some(matches)) fail(`${path} has an invalid type`);
  }
  if (typeof value === 'string') {
    const length = Array.from(value).length;
    if (rule.minLength !== undefined && length < rule.minLength || rule.maxLength !== undefined && length > rule.maxLength || rule.pattern && !new RegExp(rule.pattern).test(value)) fail(`${path} has invalid text`);
    if (rule.format === 'date-time' && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value)))) fail(`${path} has an invalid date-time`);
  }
  if (typeof value === 'number' && (rule.minimum !== undefined && value < rule.minimum || rule.maximum !== undefined && value > rule.maximum)) fail(`${path} is outside bounds`);
  if (Array.isArray(value)) {
    if (rule.maxItems !== undefined && value.length > rule.maxItems) fail(`${path} contains too many entries`);
    if (rule.items) value.forEach((entry, index) => validateStructure(entry, rule.items, definitions, `${path}[${index}]`));
  } else if (object(value)) {
    for (const key of rule.required ?? []) if (!Object.hasOwn(value, key)) fail(`${path}.${key} is required`);
    if (rule.additionalProperties === false && Object.keys(value).some(key => !Object.hasOwn(rule.properties ?? {}, key))) fail(`${path} contains an extra property`);
    for (const [key, child] of Object.entries(rule.properties ?? {})) if (Object.hasOwn(value, key)) validateStructure(value[key], child, definitions, `${path}.${key}`);
  }
}

function validateUrl(text) {
  let url; try { url = new URL(text); } catch { fail('Invalid public provenance URL'); }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || [...url.searchParams.keys()].some(key => /^(?:token|access_token|api_key|apikey|password|secret|signature|x-amz-credential|x-amz-signature)$/i.test(key))) fail('Unsafe public provenance URL');
}

function validateReview(entry, phase) {
  const review = entry.review;
  if (!review.rationale.trim()) fail('Review rationale must not be empty');
  if ((review.secondaryReviewerId === null) !== (review.secondaryLabel === null)) fail('Secondary reviewer and label must occur together');
  if (review.secondaryReviewerId === review.primaryReviewerId) fail('Two reviewers must have distinct IDs');
  if (phase === 'full_evaluation' && review.ambiguous && (!review.secondaryReviewerId || !['agreed', 'resolved_disagreement'].includes(review.decision))) fail('Ambiguous full evaluation requires two resolved reviews');
  if (review.decision === 'single_clear' && (review.ambiguous || review.secondaryReviewerId !== null || review.primaryLabel !== entry.goldLabel)) fail('Single clear review is inconsistent');
  if (review.decision === 'smoke_single_review' && (phase !== 'smoke' || review.secondaryReviewerId !== null || review.primaryLabel !== entry.goldLabel)) fail('Smoke review is inconsistent');
  if (review.decision === 'agreed' && (!review.secondaryReviewerId || review.primaryLabel !== entry.goldLabel || review.secondaryLabel !== entry.goldLabel)) fail('Agreed review labels must match gold');
  if (review.decision === 'resolved_disagreement' && (!review.secondaryReviewerId || review.primaryLabel === review.secondaryLabel)) fail('Resolved disagreement requires two different original labels');
}

export async function validateDataset(manifest, { datasetRoot, schemaPath } = {}) {
  if (typeof datasetRoot !== 'string' || !datasetRoot) throw new TypeError('datasetRoot is required');
  const schema = JSON.parse(await readFile(schemaPath ?? new URL('../../knowledge/crm-3d-plan-2026-10-28/implementation-p5/SCHEMA.json', import.meta.url), 'utf8'));
  validateStructure(manifest, schema.$defs.manifest, schema.$defs);
  if (manifest.status !== 'frozen') fail('Dataset must be frozen before inference');
  const labels = schema.$defs.label.enum, known = labels.filter(label => !['other', 'unknown'].includes(label));
  const counts = { total: manifest.entries.length, bySplit: { smoke: 0, pilot: 0, holdout: 0 }, byGoldLabel: Object.fromEntries(labels.map(label => [label, 0])), holdoutByGoldLabel: Object.fromEntries(labels.map(label => [label, 0])) };
  const ids = new Set(), sources = new Set(), assets = new Set(), groups = new Map();
  for (const entry of manifest.entries) {
    if (ids.has(entry.id)) fail('Duplicate sample ID'); ids.add(entry.id);
    if (sources.has(entry.source.sourceSha256) || assets.has(entry.asset.sha256)) fail('Duplicate image hash');
    sources.add(entry.source.sourceSha256); assets.add(entry.asset.sha256);
    counts.bySplit[entry.split]++; counts.byGoldLabel[entry.goldLabel]++;
    if (entry.split === 'holdout') counts.holdoutByGoldLabel[entry.goldLabel]++;
    for (const field of ['incidentGroupId', 'locationGroupId', 'nearDuplicateGroupId']) {
      const key = `${field}:${entry[field]}`, existing = groups.get(key);
      if (existing && existing !== entry.split) fail('Group leakage across dataset splits');
      groups.set(key, entry.split);
    }
    validateReview(entry, manifest.phase);
    validateUrl(entry.source.pageUrl); validateUrl(entry.source.licenseUrl);
    if (!entry.source.license.trim() || !entry.source.attribution.trim()) fail('License and attribution must not be empty');
  }
  if (manifest.phase === 'smoke' && (manifest.entries.length < 6 || manifest.entries.length > 8 || counts.bySplit.smoke !== manifest.entries.length)) fail('Smoke requires 6-8 smoke-only entries');
  if (manifest.phase === 'full_evaluation' && (counts.bySplit.smoke || [...known, 'unknown'].some(label => counts.holdoutByGoldLabel[label] < 20))) fail('Full evaluation requires 20 holdout entries per known class and unknown');

  const root = await realpath(datasetRoot), hashes = Object.create(null), entries = [];
  if (!(await stat(root)).isDirectory()) fail('Dataset root must be a directory');
  const relativeRule = new RegExp(schema.$defs.relativePath.pattern);
  async function datasetFile(path, maxBytes) {
    if (typeof path !== 'string' || !relativeRule.test(path)) fail('Unsafe dataset-relative path');
    const absolute = await realpath(resolve(root, path));
    const within = relative(root, absolute);
    if (within === '..' || within.startsWith(`..${sep}`) || isAbsolute(within)) fail('Dataset path escapes approved root');
    const info = await stat(absolute);
    if (!info.isFile() || info.size < 1 || info.size > maxBytes) fail('Dataset file is empty, oversized or not regular');
    const bytes = await readFile(absolute);
    if (bytes.length !== info.size || bytes.length > maxBytes) fail('Dataset file changed while reading');
    hashes[path] = sha256(bytes);
    return { absolute, bytes, hash: hashes[path] };
  }
  const sharp = backendRequire('sharp');
  async function imageMetadata(file, processed) {
    const image = sharp(file.bytes, { limitInputPixels: processed ? 1024 * 1024 : 24_000_000, failOn: 'error' });
    const meta = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(meta.format) || !meta.width || !meta.height || meta.pages > 1 || processed && (meta.width > 1024 || meta.height > 1024)) fail('Unsupported image format or dimensions');
    if (processed && (meta.exif || meta.xmp || meta.iptc || meta.orientation !== undefined)) fail('Processed image still contains metadata');
    await image.clone().raw().toBuffer();
    return meta;
  }
  for (const entry of manifest.entries) {
    const evidence = await datasetFile(entry.source.rightsEvidence, 1024 * 1024);
    let rights; try { rights = JSON.parse(evidence.bytes.toString('utf8')); } catch { fail('Rights evidence must be readable JSON'); }
    if (!object(rights) || typeof rights.rightsText !== 'string' || !rights.rightsText.trim() || typeof rights.sourcePath !== 'string') fail('Rights evidence must contain rights text and a source path');
    for (const [key, value] of Object.entries(rights)) if (/(?:^url$|Url$)/.test(key) && value !== null) validateUrl(value);
    for (const key of ['pageUrl', 'license', 'licenseUrl', 'attribution', 'sourceSha256']) if (rights[key] !== entry.source[key]) fail('Rights evidence does not match manifest provenance');
    const source = await datasetFile(rights.sourcePath, 10 * 1024 * 1024);
    if (source.hash !== entry.source.sourceSha256) fail('Source hash mismatch');
    await imageMetadata(source, false);
    const asset = await datasetFile(entry.asset.path, 10 * 1024 * 1024);
    if (asset.hash !== entry.asset.sha256) fail('Processed asset hash mismatch');
    if (asset.bytes.length !== entry.asset.sizeBytes) fail('Processed asset size mismatch');
    const meta = await imageMetadata(asset, true);
    if (meta.width !== entry.asset.width || meta.height !== entry.asset.height || `image/${meta.format === 'jpeg' ? 'jpeg' : meta.format}` !== entry.asset.mime) fail('Processed asset metadata mismatch');
    entries.push({ ...entry, assetAbsolutePath: asset.absolute, evidenceAbsolutePath: evidence.absolute });
  }
  return { entries, hashes, counts };
}
