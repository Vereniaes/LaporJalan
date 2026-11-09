/* Todo:
-> /admin: the handling queue for every report (owner choice, 10 Nov): queue + detail panel
    -> summary counts double as quick filters; search, source and category filters
    -> panel: report, small map, source history, and the four actions (status + note, unit, moderation, duplicate)
    -> only accounts with the admin role; others see why, never the data
*/
import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { api, CATEGORY_LABELS, errorMessage, useEmailSession, writeJson } from '../public-reports/community';
import { PublicMap } from '../public-reports/PublicMap';
import { reportDate, type ReportCategory } from '../public-reports/data';
import { SiteFooter, SiteHeader } from '../home/SiteChrome';
import '../public-reports/public-reports.css';
import '../public-reports/community.css';
import '../home/home.css';
import './admin.css';

// --- shapes from /api/community/admin ---
type Kind = 'warga' | 'impor';
const STATUSES = { diterima: 'Diterima', diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak' } as const;
type Status = keyof typeof STATUSES;
const ACTIONS: Record<string, string> = { status: 'Status penanganan', assign: 'Ditugaskan', hide: 'Disembunyikan', show: 'Ditampilkan kembali', duplicate: 'Ditandai duplikat', unduplicate: 'Bukan duplikat' };
interface HandlingState { status: Status | null; hidden: boolean; duplicateOf: { id: string; code: string } | null }
interface QueueRow { kind: Kind; id: string; code: string; title: string; category: ReportCategory; categoryLabel: string; sourceStatus: string; unit: string | null; createdAt: string; excerpt: string; address: string; handling: HandlingState | null }
interface Summary { total: number; unhandled: number; hidden: number; duplicates: number; byStatus: Record<Status, number> }
interface Detail {
  kind: Kind; id: string; code: string; title: string; category: ReportCategory; subcategory: string; sourceStatus: string; unit: string | null;
  area: { village: string | null; district: string | null; city: string | null } | null; description: string; address: string; lat: number; lng: number; createdAt: string;
  sourceHistory: { at: string; status: string; unit: string | null; note: string }[];
  handling: { status?: Status; unit?: string; hidden?: boolean; duplicateOf?: { id: string; code: string } | null; history: { id: string; at: string; action: string; status?: Status; unit?: string; duplicateOf?: string; note: string }[] } | null;
}
type Filters = { kind: '' | Kind; category: '' | ReportCategory; status: '' | 'baru' | Status; view: '' | 'hidden' | 'duplicate'; q: string; page: number };
const query = (filters: Filters) => new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '' && value !== 0).map(([key, value]) => [key, String(value)])).toString();
const handlingLabel = (state: HandlingState | null) => state?.duplicateOf ? `Duplikat ${state.duplicateOf.code}` : state?.hidden ? 'Disembunyikan' : state?.status ? STATUSES[state.status] : 'Belum ditangani';
// --- end of shapes ---

export default function AdminPage() {
  const session = useEmailSession();
  const [filters, setFilters] = useState<Filters>({ kind: '', category: '', status: '', view: '', q: '', page: 0 });
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rows, setRows] = useState<QueueRow[]>([]), [total, setTotal] = useState(0), [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [selected, setSelected] = useState<{ kind: Kind; id: string } | null>(null), [detail, setDetail] = useState<Detail | null>(null);
  const [units, setUnits] = useState<string[]>([]), [revision, setRevision] = useState(0);
  const admin = session.user?.role === 'admin';
  useEffect(() => { document.title = 'Admin - LaporJalan'; }, []);

  // summary + units once, and after each action
  useEffect(() => {
    if (!admin) return;
    api<Summary>('/admin/summary').then(setSummary).catch(failure => setError(errorMessage(failure)));
    if (!units.length) api<{ units: string[] }>('/admin/units').then(result => setUnits(result.units)).catch(() => {});
  }, [admin, revision]);
  // the queue follows the filters (search waits for the typing to pause)
  useEffect(() => {
    if (!admin) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true); setError('');
      api<{ total: number; reports: QueueRow[] }>(`/admin/reports?${query(filters)}`, { signal: controller.signal })
        .then(result => { setRows(result.reports); setTotal(result.total); })
        .catch(failure => { if (!controller.signal.aborted) setError(errorMessage(failure)); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, filters.q ? 250 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [admin, filters, revision]);
  useEffect(() => {
    if (!admin || !selected) { setDetail(null); return; }
    const controller = new AbortController();
    api<Detail>(`/admin/reports/${selected.kind}/${selected.id}`, { signal: controller.signal }).then(setDetail).catch(failure => { if (!controller.signal.aborted) setError(errorMessage(failure)); });
    return () => controller.abort();
  }, [admin, selected, revision]);

  const set = (change: Partial<Filters>) => setFilters(current => ({ ...current, page: 0, ...change }));
  const shell = (content: ReactNode) => <MotionConfig reducedMotion="user"><div className="home">
    <a className="skip" href="#isi">Ke isi halaman</a>
    <SiteHeader user={session.user} canLogin />
    <main id="isi" className="admin wrap">{content}</main>
    <SiteFooter user={session.user} canLogin />
  </div></MotionConfig>;

  if (session.loading) return shell(<p role="status">Memuat akun…</p>);
  if (!session.user) return shell(<section className="admin-gate"><h1 className="h2">Admin.</h1><p>Masuk dengan akun admin untuk menangani laporan.</p><a className="btn btn-primary" href="/masuk?lanjut=%2Fadmin">Masuk</a></section>);
  if (!admin) return shell(<section className="admin-gate"><h1 className="h2">Khusus admin.</h1><p>Akun ini tidak memiliki peran admin. Peran diberikan oleh pengelola server.</p><a className="btn btn-quiet" href="/akun">Ke akun saya</a></section>);

  const chips: [string, number | undefined, Partial<Filters>][] = [
    ['Semua', summary?.total, { status: '', view: '' }], ['Belum ditangani', summary?.unhandled, { status: 'baru', view: '' }],
    ...(Object.keys(STATUSES) as Status[]).map(status => [STATUSES[status], summary?.byStatus[status], { status, view: '' }] as [string, number | undefined, Partial<Filters>]),
    ['Disembunyikan', summary?.hidden, { status: '', view: 'hidden' }], ['Duplikat', summary?.duplicates, { status: '', view: 'duplicate' }],
  ];
  return shell(<>
    <header className="admin-head">
      <div><p className="kicker">Admin</p><h1 className="h2">Penanganan laporan.</h1></div>
      <nav className="admin-chips" aria-label="Ringkasan dan saringan cepat">{chips.map(([label, count, change]) =>
        <button key={label} aria-pressed={filters.status === (change.status ?? '') && filters.view === (change.view ?? '')} onClick={() => set(change)}>{label}<strong>{count ?? '…'}</strong></button>)}</nav>
    </header>
    <div className="admin-filters">
      <div><label htmlFor="admin-q">Cari</label><input id="admin-q" type="search" value={filters.q} placeholder="Kode, judul, lokasi, unit" onChange={event => set({ q: event.target.value })} /></div>
      <div><label htmlFor="admin-kind">Sumber</label><select id="admin-kind" value={filters.kind} onChange={event => set({ kind: event.target.value as Filters['kind'] })}><option value="">Semua</option><option value="warga">Warga LaporJalan</option><option value="impor">Data impor</option></select></div>
      <div><label htmlFor="admin-category">Kategori</label><select id="admin-category" value={filters.category} onChange={event => set({ category: event.target.value as Filters['category'] })}><option value="">Semua</option>{Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
    </div>
    {error && <p className="lj-form-error" role="alert">{error}</p>}
    <div className="admin-grid">
      <section className="admin-queue" aria-labelledby="t-queue">
        <h2 id="t-queue" aria-live="polite">{loading ? 'Memuat…' : `${total} laporan`}</h2>
        <ol>{rows.map(row => <li key={`${row.kind}:${row.id}`}>
          <button aria-pressed={selected?.id === row.id} onClick={() => setSelected({ kind: row.kind, id: row.id })}>
            <span className="admin-row-top"><strong>{row.title}</strong><span className={`admin-state is-${row.handling?.duplicateOf ? 'duplicate' : row.handling?.hidden ? 'hidden' : row.handling?.status ?? 'new'}`}>{handlingLabel(row.handling)}</span></span>
            <span className="admin-row-meta">{row.code !== row.title ? `${row.code} · ` : ''}{row.categoryLabel} · {row.kind === 'warga' ? 'Warga' : 'Impor'} · {reportDate(row.createdAt)}</span>
            <span className="admin-row-meta">{row.sourceStatus}{row.unit ? ` · ${row.unit}` : ''}</span>
          </button>
        </li>)}</ol>
        {!loading && !rows.length && <p className="admin-empty">Tidak ada laporan pada saringan ini.</p>}
        <div className="admin-pages">
          <button className="btn btn-quiet" disabled={filters.page === 0} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}>Sebelumnya</button>
          <span>Halaman {filters.page + 1} dari {Math.max(1, Math.ceil(total / 50))}</span>
          <button className="btn btn-quiet" disabled={(filters.page + 1) * 50 >= total} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}>Berikutnya</button>
        </div>
      </section>
      <section className="admin-panel" aria-label="Detail laporan">
        {!selected ? <p className="admin-empty">Pilih laporan dari antrean untuk menanganinya.</p>
          : !detail ? <p role="status">Memuat laporan…</p>
          : <AdminDetail key={detail.id} detail={detail} units={units} onChanged={() => setRevision(value => value + 1)} />}
      </section>
    </div>
  </>);
}

// --- detail + actions ---
function AdminDetail({ detail, units, onChanged }: { detail: Detail; units: string[]; onChanged: () => void }) {
  const handling = detail.handling;
  const [status, setStatus] = useState<Status>(handling?.status ?? 'diterima'), [note, setNote] = useState('');
  const [unit, setUnit] = useState(handling?.unit ?? ''), [reason, setReason] = useState(''), [primary, setPrimary] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState('');
  async function act(event: FormEvent | null, body: Record<string, string>, done: string) {
    event?.preventDefault();
    setBusy(true); setError(''); setSaved('');
    try { await writeJson(`/admin/reports/${detail.kind}/${detail.id}/actions`, body); setSaved(done); setNote(''); setReason(''); setPrimary(''); onChanged(); }
    catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); }
  }
  const area = [detail.area?.village, detail.area?.district, detail.area?.city].filter(Boolean).join(', ');
  const mapReport = { id: detail.id, code: detail.code, lat: detail.lat, lng: detail.lng, category: detail.category, sourceCategory: detail.subcategory, createdAt: detail.createdAt, sourceStatus: detail.sourceStatus };
  return <article className="admin-detail">
    <p className="lj-eyebrow">{detail.kind === 'warga' ? 'LAPORAN WARGA' : 'DATA IMPOR'} · {CATEGORY_LABELS[detail.category].toUpperCase()}</p>
    <h2>{detail.title}</h2>
    <p className="admin-row-meta">{detail.code} · Dibuat {reportDate(detail.createdAt)} WIB</p>
    <div className="admin-map"><PublicMap reports={[mapReport]} selected={mapReport} onSelect={() => {}} onArea={() => {}} cooperative minimal /></div>
    <dl className="admin-facts">
      <div><dt>Status sumber</dt><dd>{detail.sourceStatus}</dd></div>
      <div><dt>Penanganan</dt><dd>{handling?.duplicateOf ? `Duplikat ${handling.duplicateOf.code}` : handling?.hidden ? 'Disembunyikan' : handling?.status ? STATUSES[handling.status] : 'Belum ditangani'}</dd></div>
      <div><dt>Unit</dt><dd>{handling?.unit ?? detail.unit ?? 'Belum ada'}</dd></div>
      {area && <div><dt>Kelurahan</dt><dd>{area}</dd></div>}
      {detail.address && <div><dt>Lokasi</dt><dd>{detail.address}</dd></div>}
    </dl>
    {detail.description && <p className="admin-description">{detail.description}</p>}
    {error && <p className="lj-form-error" role="alert">{error}</p>}
    {saved && <p className="lj-form-success" role="status">{saved}</p>}

    <form className="lj-form admin-action" onSubmit={event => act(event, { action: 'status', status, note }, 'Status penanganan disimpan.')}>
      <h3>Status penanganan</h3>
      {/* Why/Note: labels point at their fields, so a select's name is not read together with its current option */}
      <label htmlFor="admin-status">Status</label>
      <select id="admin-status" value={status} onChange={event => setStatus(event.target.value as Status)}>{(Object.keys(STATUSES) as Status[]).map(key => <option key={key} value={key}>{STATUSES[key]}</option>)}</select>
      <label htmlFor="admin-note">Catatan <span>(tampil publik sebagai Pengelola LaporJalan)</span></label>
      <textarea id="admin-note" rows={3} maxLength={1000} value={note} onChange={event => setNote(event.target.value)} />
      <button className="lj-primary" disabled={busy}>Simpan status</button>
    </form>
    <form className="lj-form admin-action" onSubmit={event => act(event, { action: 'assign', unit }, 'Unit ditugaskan.')}>
      <h3>Tugaskan ke unit/SKPD</h3>
      <label htmlFor="admin-unit">Unit</label>
      <input id="admin-unit" list="admin-units" required maxLength={160} value={unit} onChange={event => setUnit(event.target.value)} />
      <datalist id="admin-units">{units.map(name => <option key={name} value={name} />)}</datalist>
      <button className="lj-secondary" disabled={busy}>Tugaskan</button>
    </form>
    <form className="lj-form admin-action" onSubmit={event => act(event, { action: handling?.hidden ? 'show' : 'hide', note: reason }, handling?.hidden ? 'Laporan ditampilkan kembali.' : 'Laporan disembunyikan dari publik.')}>
      <h3>Moderasi</h3>
      <label htmlFor="admin-reason">Alasan <span>(internal)</span></label>
      <input id="admin-reason" maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} />
      <button className="lj-secondary" disabled={busy}>{handling?.hidden ? 'Tampilkan kembali' : 'Sembunyikan dari publik'}</button>
    </form>
    <form className="lj-form admin-action" onSubmit={event => act(event, handling?.duplicateOf ? { action: 'unduplicate' } : { action: 'duplicate', duplicateOf: primary }, handling?.duplicateOf ? 'Tanda duplikat dibatalkan.' : 'Ditandai sebagai duplikat.')}>
      <h3>Duplikat</h3>
      {handling?.duplicateOf ? <p>Duplikat dari <strong>{handling.duplicateOf.code}</strong>; tidak tampil di peta.</p>
        : <><label htmlFor="admin-primary">Kode laporan utama</label><input id="admin-primary" required placeholder="LJ-…" value={primary} onChange={event => setPrimary(event.target.value)} /></>}
      <button className="lj-secondary" disabled={busy}>{handling?.duplicateOf ? 'Batalkan duplikat' : 'Tandai duplikat'}</button>
    </form>

    <h3 className="admin-history-title">Riwayat penanganan</h3>
    {handling?.history.length ? <ol className="lj-popup-history">{[...handling.history].reverse().map(entry => <li key={entry.id}>
      <time dateTime={entry.at}>{reportDate(entry.at)} WIB</time>
      <strong>{ACTIONS[entry.action] ?? entry.action}{entry.status ? `: ${STATUSES[entry.status]}` : ''}{entry.unit ? ` (${entry.unit})` : ''}{entry.duplicateOf ? ` ${entry.duplicateOf}` : ''}</strong>
      {entry.note && <p>{entry.note}</p>}
    </li>)}</ol> : <p className="admin-empty">Belum ada penanganan.</p>}
    <h3 className="admin-history-title">Riwayat sumber</h3>
    {detail.sourceHistory.length ? <ol className="lj-popup-history">{detail.sourceHistory.map((entry, index) => <li key={index}>
      <time dateTime={entry.at}>{reportDate(entry.at)} WIB</time><strong>{entry.status}{entry.unit ? ` (${entry.unit})` : ''}</strong>{entry.note && <p>{entry.note}</p>}
    </li>)}</ol> : <p className="admin-empty">Riwayat sumber belum tersedia.</p>}
  </article>;
}
// --- end of detail + actions ---
