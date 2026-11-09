/* Optional condition details, shared by new reports and owner observations.
Todo:
-> require explicit location review before sending a condition
*/
import { useEffect, useId, useRef, useState } from 'react';
import type { ReportCategory } from './data';
import { reportDate } from './data';
import { accessLabel, closureNeedsUpdate, conditionDimensionLabel, ConditionGeometry, ConditionKind, conditionLabel, conditionSize, CONDITION_KINDS, CONDITION_LABELS, GeometryDrawingStarter, RoadCondition } from './condition';
import type { KindImport } from './analysis';

type Point = { lng: number; lat: number };
type Fields = { kind: ConditionKind | ''; observedAt: string; geometry: ConditionGeometry | null; shape: 'point' | 'line' | 'area'; confirmed: boolean; method: '' | 'measured' | 'estimated'; tool: string; width: string; depth: string; length: string; access: 'unknown' | 'partial' | 'closed' };
const localDate = (iso: string) => { const date = new Date(iso); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16); };
function initialFields(condition?: RoadCondition | null): Fields {
  return { kind: condition?.kind ?? '', observedAt: condition ? localDate(condition.observedAt) : '', geometry: condition?.geometry ?? null,
    shape: condition?.geometry.type === 'Polygon' ? 'area' : condition?.geometry.type === 'LineString' ? 'line' : 'point', confirmed: false,
    method: condition?.dimensions?.method ?? '', tool: condition?.dimensions?.tool ?? '', width: condition?.dimensions?.widthM?.toString() ?? '', depth: condition?.dimensions?.depthM?.toString() ?? '', length: condition?.dimensions?.lengthM?.toString() ?? '', access: condition?.access ?? 'unknown' };
}
export function ConditionFields({ category, location, initialCondition, updating = false, disabled = false, onChange, onDrawGeometry, onGeometryPreview, kindImport, onKindImported }: {
  category: ReportCategory; location: Point | null; initialCondition?: RoadCondition | null; updating?: boolean; disabled?: boolean;
  onChange: (condition: RoadCondition | null | undefined, valid: boolean) => void; onDrawGeometry?: GeometryDrawingStarter; onGeometryPreview?: (geometry: ConditionGeometry | null) => void;
  kindImport?: KindImport | null; onKindImported?: (id: string, applied: boolean) => void;
}) {
  const fieldId = useId();
  const kindField = useRef<HTMLSelectElement>(null), focusImportedKind = useRef(false);
  const [fields, setFields] = useState(() => initialFields(initialCondition)), [enabled, setEnabled] = useState(!updating), [removed, setRemoved] = useState(false), [locationNote, setLocationNote] = useState('');
  const callbacks = useRef({ onChange, onGeometryPreview }); callbacks.current = { onChange, onGeometryPreview };
  const previousLocation = useRef(location ? `${location.lng}:${location.lat}` : '');
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; callbacks.current.onGeometryPreview?.(null); }; }, []);
  const locationKey = location ? `${location.lng}:${location.lat}` : '';
  useEffect(() => {
    if (previousLocation.current === locationKey) return;
    previousLocation.current = locationKey;
    setFields(value => ({ ...value, geometry: null, confirmed: false }));
    setLocationNote('Lokasi laporan berubah. Tinjau titik atau gambar ulang bentuk, lalu konfirmasi.');
  }, [locationKey]);
  const kinds = CONDITION_KINDS[category];
  const imported = useRef('');
  useEffect(() => {
    if (!kindImport || imported.current === kindImport.id || disabled) return;
    imported.current = kindImport.id;
    const replacing = fields.kind && fields.kind !== kindImport.kind;
    const allowed = kinds.includes(kindImport.kind) && (!replacing || confirm('Ganti jenis kondisi dengan saran? Isian lain tetap disimpan. Tinjau kembali lokasi, bentuk, dan ukuran yang sudah diisi.'));
    if (allowed) { focusImportedKind.current = true; setFields(value => ({ ...value, kind: kindImport.kind, confirmed: false })); setEnabled(true); setRemoved(false); setLocationNote('Jenis saran dimasukkan. Tinjau kembali lokasi, bentuk, dan ukuran sebelum menyimpan.'); }
    onKindImported?.(kindImport.id, Boolean(allowed));
  }, [kindImport?.id, disabled]);
  useEffect(() => { if (focusImportedKind.current && enabled) { kindField.current?.focus(); focusImportedKind.current = false; } }, [fields, enabled]);
  useEffect(() => { if (fields.kind && !kinds.includes(fields.kind)) setFields(value => ({ ...value, kind: '', confirmed: false })); }, [category, fields.kind]);
  function change(patch: Partial<Fields>) { setFields(value => ({ ...value, ...patch })); setRemoved(false); }
  const geometry: ConditionGeometry | null = fields.shape === 'point' ? fields.geometry?.type === 'Point' ? fields.geometry : location ? { type: 'Point', coordinates: [location.lng, location.lat] } : null : fields.geometry;
  const suppliedDimensions = [fields.width, fields.depth, fields.length].some(value => value.trim());
  const dimensionsValid = !suppliedDimensions || (Boolean(fields.method) && (fields.method !== 'measured' || Boolean(fields.tool.trim())) && [fields.width, fields.depth, fields.length].every((value, index) => !value.trim() || (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim()) && Number(value) <= 1000 && (index === 1 ? Number(value) >= 0 : Number(value) > 0))));
  const observedDate = fields.observedAt ? new Date(fields.observedAt) : null;
  const observedAt = observedDate && Number.isFinite(observedDate.getTime()) ? initialCondition && fields.observedAt === localDate(initialCondition.observedAt) ? initialCondition.observedAt : observedDate.toISOString() : '';
  const valid = !enabled || !fields.kind || (Boolean(observedAt && geometry && fields.confirmed) && dimensionsValid && kinds.includes(fields.kind));
  const condition: RoadCondition | undefined = enabled && fields.kind && valid && geometry ? {
    kind: fields.kind, observedAt, geometry, locationConfirmed: true, source: 'reporter',
    ...(fields.kind === 'closure' ? { access: fields.access } : {}),
    ...(suppliedDimensions ? { dimensions: { method: fields.method as 'measured' | 'estimated', ...(fields.method === 'measured' ? { tool: fields.tool.trim() } : {}), ...(fields.width.trim() ? { widthM: Number(fields.width) } : {}), ...(fields.depth.trim() ? { depthM: Number(fields.depth) } : {}), ...(fields.length.trim() ? { lengthM: Number(fields.length) } : {}) } } : {}),
  } : undefined;
  const serialized = JSON.stringify(removed ? null : condition);
  useEffect(() => {
    const value = removed ? null : serialized ? JSON.parse(serialized) as RoadCondition : undefined;
    callbacks.current.onChange(value, valid);
  }, [serialized, valid, removed]);
  const serializedGeometry = JSON.stringify(enabled && fields.kind && kinds.includes(fields.kind) && !removed ? geometry : null);
  useEffect(() => { callbacks.current.onGeometryPreview?.(JSON.parse(serializedGeometry) as ConditionGeometry | null); }, [serializedGeometry]);
  function draw(mode: 'line' | 'area') {
    onDrawGeometry?.(mode, result => { if (mounted.current) { change({ geometry: result, shape: mode, confirmed: false }); setLocationNote('Bentuk selesai digambar. Tinjau pada peta, lalu konfirmasi.'); } });
  }
  return <fieldset className="lj-condition-fields" disabled={disabled}>
    <legend>Kondisi dan bentuk <span>(opsional)</span></legend>
    {updating && <label className="lj-checkbox"><input type="checkbox" checked={enabled} onChange={event => { setEnabled(event.target.checked); setRemoved(false); change({ confirmed: false }); }} />Ubah kondisi dan bentuk</label>}
    {enabled && <>
      <label htmlFor={`${fieldId}-kind`}>Jenis kondisi</label><select ref={kindField} id={`${fieldId}-kind`} value={fields.kind} onChange={event => change({ kind: event.target.value as Fields['kind'], confirmed: false })}><option value="">Belum ditentukan</option>{kinds.map(kind => <option key={kind} value={kind}>{CONDITION_LABELS[kind]}</option>)}</select>
      {fields.kind && <>
        <label>Waktu pengamatan<input type="datetime-local" required value={fields.observedAt} onChange={event => change({ observedAt: event.target.value, confirmed: false })} /></label>
        <label htmlFor={`${fieldId}-shape`}>Bentuk lokasi</label><select id={`${fieldId}-shape`} value={fields.shape} onChange={event => change({ shape: event.target.value as Fields['shape'], geometry: null, confirmed: false })}><option value="point">Titik</option><option value="line">Ruas</option><option value="area">Area</option></select>
        {fields.shape === 'point' ? <p className="lj-form-note">{geometry?.type === 'Point' ? `Titik kondisi: ${geometry.coordinates[1].toFixed(6)}, ${geometry.coordinates[0].toFixed(6)}.` : 'Pilih lokasi terlebih dahulu.'}</p> : <>
          <button className="lj-secondary" type="button" disabled={!onDrawGeometry || disabled} onClick={() => draw(fields.shape as 'line' | 'area')}>{fields.shape === 'line' ? 'Gambar ruas' : 'Gambar area'}</button>
          <p>{fields.geometry ? 'Bentuk telah digambar oleh pelapor.' : 'Bentuk belum digambar. Pilih titik pada peta lalu selesaikan gambar.'}</p>
        </>}
        {locationNote && <p role="status" className="lj-form-note">{locationNote}</p>}
        {fields.kind === 'closure' && <><label htmlFor={`${fieldId}-access`}>Pengamatan akses</label><select id={`${fieldId}-access`} value={fields.access} onChange={event => change({ access: event.target.value as Fields['access'], confirmed: false })}><option value="unknown">Belum diketahui</option><option value="partial">Sebagian akses terhalang</option><option value="closed">Tampak tertutup</option></select></>}
        <details className="lj-dimension-fields" open={suppliedDimensions || Boolean(fields.method)}><summary>Dimensi (opsional)</summary><p>Isi dalam meter. Contoh: 52 cm = 0.52 m; 7.5 cm = 0.075 m. Angka tidak diambil dari foto.</p>
          <label htmlFor={`${fieldId}-method`}>Metode dimensi</label><select id={`${fieldId}-method`} value={fields.method} onChange={event => change({ method: event.target.value as Fields['method'], confirmed: false })}><option value="">Belum diisi</option><option value="measured">Pengukuran pelapor</option><option value="estimated">Perkiraan pelapor</option></select>
          {fields.method === 'measured' && <label>Alat pengukuran<input maxLength={80} required={suppliedDimensions} value={fields.tool} onChange={event => change({ tool: event.target.value, confirmed: false })} /></label>}
          <div className="lj-dimension-grid">{(['width', 'depth', 'length'] as const).map((key, index) => <label key={key}>{['Lebar (m)', 'Kedalaman (m)', 'Panjang (m)'][index]}<input type="number" inputMode="decimal" step="any" min={0} max={1000} value={fields[key]} onChange={event => change({ [key]: event.target.value, confirmed: false })} /></label>)}</div>
          {!dimensionsValid && <p className="lj-form-error">Isi metode dan dimensi yang valid. Pengukuran memerlukan nama alat; lebar dan panjang harus lebih dari nol.</p>}
        </details>
        <label className="lj-checkbox"><input type="checkbox" required checked={fields.confirmed} disabled={!geometry || !observedAt || !dimensionsValid || disabled} onChange={event => change({ confirmed: event.target.checked })} />Lokasi dan bentuk telah diperiksa.</label>
        <p className="lj-form-note">{condition ? conditionDimensionLabel(condition) : 'Ilustrasi - ukuran belum diukur'}. Bentuk merupakan keterangan pelapor, bukan hasil survei atau verifikasi pemerintah.</p>
      </>}
    </>}
    {updating && initialCondition && <button type="button" className="lj-text-action" onClick={() => { if (confirm('Hapus kondisi dan bentuk dari laporan? Riwayat sebelumnya tetap tersimpan.')) { setRemoved(true); setEnabled(false); } }}>Hapus kondisi dan bentuk</button>}
    {removed && <p role="status" className="lj-form-note">Kondisi dan bentuk akan dihapus saat pembaruan disimpan.</p>}
    {updating && !enabled && !removed && <p>Catatan biasa mempertahankan kondisi dan waktu pengamatan sebelumnya.</p>}
  </fieldset>;
}

export function ConditionSummary({ condition, now = Date.now(), historical = false }: { condition: RoadCondition; now?: number; historical?: boolean }) {
  const size = conditionSize(condition);
  return <section className="lj-condition-summary" aria-label="Kondisi pelapor"><h3>{conditionLabel(condition)}</h3>
    <p>Pengamatan pelapor · <time dateTime={condition.observedAt}>{reportDate(condition.observedAt)} WIB</time></p>
    {condition.kind === 'closure' && <p>{accessLabel(condition.access)}{!historical && closureNeedsUpdate(condition, now) && <strong className="lj-stale-condition">Perlu pembaruan</strong>}</p>}
    <p>{conditionDimensionLabel(condition)}</p>
    {condition.dimensions && <p>{[condition.dimensions.widthM !== undefined ? `Lebar ${condition.dimensions.widthM} m` : '', condition.dimensions.depthM !== undefined ? `Kedalaman ${condition.dimensions.depthM} m` : '', condition.dimensions.lengthM !== undefined ? `Panjang ${condition.dimensions.lengthM} m` : ''].filter(Boolean).join(' · ')}{condition.dimensions.tool && <> · Alat: {condition.dimensions.tool}</>}</p>}
    {size && <p>{size.short[0].toUpperCase() + size.short.slice(1)}, dihitung dari {size.drawn} yang digambar pelapor.</p>}
    <p>{condition.geometry.type === 'Point' ? 'Titik' : condition.geometry.type === 'LineString' ? 'Ruas' : 'Area'} dikonfirmasi pelapor. Profil bentuk merupakan ilustrasi.</p>
  </section>;
}
