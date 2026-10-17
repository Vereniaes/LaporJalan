/* Public map and report list. Sumber dan status tetap terlihat.
Todo:
-> keep filters, selection and the mobile panel in sync
*/
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUpRight, ChevronRight, Construction, Flame, ImageOff, List, MapPin, RefreshCw, Route, Search, Waves, X } from 'lucide-react';
import { filterReports, MapArea, PublicReport, ReportCategory, reportDate, SOURCE_URL } from './data';
import { PublicMap } from './PublicMap';
import { usePublicReports } from './usePublicReports';
import './public-reports.css';

const categories = [
  { id: 'all', label: 'Semua', icon: List },
  { id: 'road', label: 'Jalan', icon: Route },
  { id: 'construction', label: 'Pembangunan', icon: Construction },
  { id: 'drain', label: 'Saluran', icon: Waves },
  { id: 'burning', label: 'Pembakaran', icon: Flame },
] as const;

export function PublicReportsPage() {
  const { snapshot, loading, error, refresh } = usePublicReports();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ReportCategory | 'all'>('all');
  const [area, setArea] = useState<MapArea | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const previousPanel = useRef(false);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const filtered = useMemo(() => filterReports(snapshot?.reports ?? [], category, query, area), [snapshot, category, query, area]);
  const selected = filtered.find(report => report.id === selectedId) ?? null;
  const unsupported = category !== 'all' && category !== 'road';

  function select(report: PublicReport) {
    returnFocus.current = document.activeElement as HTMLElement;
    previousPanel.current = expanded;
    setSelectedId(report.id);
    if (matchMedia('(max-width: 800px)').matches) setExpanded(true);
  }
  function closeDetail() {
    setSelectedId(null);
    setExpanded(previousPanel.current);
    requestAnimationFrame(() => {
      const target = returnFocus.current;
      if (target?.isConnected) target.focus();
      else listHeading.current?.focus();
    });
  }
  useEffect(() => { if (selectedId && !selected) setSelectedId(null); }, [selectedId, selected]);
  useEffect(() => { if (selectedId) heading.current?.focus(); }, [selectedId]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && selectedId) closeDetail(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  return <div className={`lj-app${expanded ? ' lj-expanded' : ''}`}>
    <a className="lj-skip" href="#report-panel">Ke daftar laporan</a>
    <header className="lj-header">
      <a className="lj-brand" href="/" aria-label="LaporJalan - halaman utama">
        <span className="lj-logo" aria-hidden="true"><Route size={25} strokeWidth={2.2} /></span>
        <span><strong>LaporJalan</strong><small>Laporan jalan dari warga</small></span>
      </a>
      <div className="lj-search">
        <label htmlFor="report-search">Cari laporan</label>
        <div><Search size={18} aria-hidden="true" /><input id="report-search" type="search" value={query}
          placeholder="Kode atau status laporan" onChange={event => setQuery(event.target.value)} /></div>
      </div>
      <span className="lj-region"><MapPin size={16} aria-hidden="true" /> Jakarta</span>
      <a className="lj-source-link" href={SOURCE_URL} target="_blank" rel="noreferrer">Peta CRM <ArrowUpRight size={16} aria-hidden="true" /></a>
    </header>

    <main className="lj-workspace">
      <PublicMap reports={filtered} selected={selected} onSelect={select} onArea={setArea} />
      <section id="report-panel" className="lj-panel" aria-label="Laporan publik" tabIndex={-1}>
        <button className="lj-panel-toggle" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
          {expanded ? <><ArrowDown size={16} /> Lihat peta</> : <><List size={16} /> Perluas daftar</>}
        </button>
        <div className="lj-panel-intro">
          <div><p className="lj-eyebrow">PETA WARGA</p><h1>Jalan di sekitar.</h1></div>
          <button className="lj-refresh" aria-label="Perbarui laporan" disabled={loading} onClick={() => void refresh()}>
            <RefreshCw size={18} className={loading ? 'lj-spinning' : ''} />
          </button>
          <p className="lj-intro-copy">Pantau laporan publik dan status dari sumbernya.</p>
        </div>
        <nav className="lj-categories" aria-label="Kategori laporan">
          {categories.map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={category === id}
            onClick={() => setCategory(id)}><Icon size={16} aria-hidden="true" />{label}</button>)}
        </nav>

        {error && <div className="lj-data-warning" role="alert">
          <strong>{snapshot ? 'Pembaruan belum berhasil.' : 'Laporan belum dapat dimuat.'}</strong>
          <span>{snapshot ? `Menampilkan data yang diambil ${reportDate(snapshot.source.retrievedAt)} WIB.` : 'Sumber sedang tidak tersedia. Silakan coba kembali.'}</span>
          <button onClick={() => void refresh()} disabled={loading}>Coba lagi</button>
        </div>}
        {loading && <p className="lj-loading" role="status">{snapshot ? 'Memperbarui laporan…' : 'Memuat laporan dari CRM Jakarta…'}</p>}

        <div className="lj-list-section" hidden={Boolean(selected)}>
          <div className="lj-results-heading">
            <h2 ref={listHeading} tabIndex={-1} aria-live="polite">{snapshot ? `${filtered.length} laporan${area ? ' di area ini' : ''}` : 'Daftar laporan'}</h2>
            <span>Terbaru dahulu</span>
          </div>
          {area && <div className="lj-area-filter">Area peta dipilih<button onClick={() => setArea(null)}><X size={14} /> Hapus area</button></div>}
          <div className="lj-report-list" aria-label="Daftar laporan">
            {filtered.map(report => <button key={report.id} className="lj-report-row" data-report-id={report.id} onClick={() => select(report)}>
              <span className="lj-thumbnail" aria-hidden="true"><Route size={25} /><small>Tanpa foto</small></span>
              <span className="lj-row-copy"><span className="lj-row-meta">JALAN <time dateTime={report.createdAt}>{reportDate(report.createdAt)}</time></span>
                <strong>{report.code}</strong>
                <span className="lj-row-source">Laporan warga · JAKI</span>
                <span className="lj-status">{report.sourceStatus ?? 'Status belum tersedia'}</span>
              </span>
              <ChevronRight size={17} className="lj-row-arrow" aria-hidden="true" />
            </button>)}
            {!loading && !error && !filtered.length && <div className="lj-empty" role="status">
              <Route size={28} aria-hidden="true" />
              <h3>{unsupported ? 'Sumber kategori belum tersedia' : 'Belum ada laporan yang sesuai'}</h3>
              <p>{unsupported ? 'Belum ada data terverifikasi untuk kategori ini. Laporan kategori Jalan dapat dilihat pada pilihan Semua.' : 'Coba ubah pencarian, kategori, atau area peta. Data mencakup hari ini dan kemarin.'}</p>
              <button onClick={() => { setQuery(''); setCategory('all'); setArea(null); }}>Lihat semua laporan</button>
            </div>}
          </div>
        </div>

        {selected && <div className="lj-detail">
          <button className="lj-back" onClick={closeDetail}><ArrowLeft size={18} /> Kembali ke daftar</button>
          <div className="lj-detail-body">
            <p className="lj-eyebrow">LAPORAN KATEGORI JALAN</p>
            <h2 ref={heading} tabIndex={-1}>{selected.code}</h2>
            <p className="lj-detail-date">Dibuat {reportDate(selected.createdAt)} WIB</p>
            <span className="lj-status">{selected.sourceStatus ?? 'Status belum tersedia'}</span>
            <div className="lj-media-empty"><ImageOff size={28} aria-hidden="true" /><strong>Foto belum tersedia</strong><span>Sumber peta tidak menyertakan media laporan.</span></div>
            <dl className="lj-facts">
              <div><dt>Kategori sumber</dt><dd>{selected.sourceCategory}</dd></div>
              <div><dt>Koordinat sumber</dt><dd>{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</dd></div>
              <div><dt>Alamat jalan</dt><dd>Belum tersedia</dd></div>
              <div><dt>Status dari CRM</dt><dd>{selected.sourceStatus ?? 'Belum tersedia'}</dd></div>
            </dl>
            <p className="lj-detail-note">Kategori Jalan belum menjelaskan jenis kerusakan. Ketelitian lokasi dan kondisi lapangan belum diverifikasi oleh LaporJalan.</p>
            <section className="lj-detail-source"><h3>Sumber laporan</h3><p>CRM Jakarta · laporan JAKI</p>
              <p>Riwayat penanganan dan deskripsi tidak tersedia pada tampilan ini.</p>
              <a href={SOURCE_URL} target="_blank" rel="noreferrer">Buka peta sumber <ArrowUpRight size={16} /></a>
            </section>
          </div>
        </div>}
        <footer className="lj-source-footer">
          <div><span className="lj-source-dot" /><strong>CRM Jakarta · JAKI</strong><span>Bukan layanan resmi pemerintah</span></div>
          {snapshot && <p>{reportDate(snapshot.source.dateStart, false)} - {reportDate(snapshot.source.dateEnd, false)} · Diambil {reportDate(snapshot.source.retrievedAt)} WIB</p>}
          <p>Hanya laporan publik berkategori Jalan pada peta CRM. Bukan seluruh laporan Jakarta.</p>
        </footer>
      </section>
    </main>
  </div>;
}
