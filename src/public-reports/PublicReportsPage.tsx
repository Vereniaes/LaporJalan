/* Todo:
-> show the public map, reports, and source status
-> keep filters, selection and the mobile panel in sync
*/
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUpRight, ChevronRight, Construction, Flame, ImageOff, List, MapPin, Plus, RefreshCw, Route, Search, Waves, X } from 'lucide-react';
import { filterReports, MapArea, PublicReport, ReportCategory, reportDate, SOURCE_URL } from './data';
import { PublicMap } from './PublicMap';
import { usePublicReports } from './usePublicReports';
import { api, capabilityMessage, CATEGORY_LABELS, CitizenReport, errorMessage, isReportId, mediaUrl, useCapabilities, useCitizenReports, useEmailSession } from './community';
import { EmailLogin } from './EmailLogin';
import { NewReport, ReportLocation } from './NewReport';
import { CitizenDetail } from './CitizenDetail';
import { AccountProfile } from './AccountProfile';
import { closureNeedsUpdate, ConditionGeometry, conditionLabel, conditionSize, GeometryDrawingStarter, useConditionClock } from './condition';
import './public-reports.css';
import './community.css';

const categories = [
  { id: 'all', label: 'Semua', icon: List },
  { id: 'road', label: 'Jalan', icon: Route },
  { id: 'construction', label: 'Pembangunan', icon: Construction },
  { id: 'drain', label: 'Saluran', icon: Waves },
  { id: 'burning', label: 'Pembakaran', icon: Flame },
] as const;

export function PublicReportsPage() {
  const { snapshot, loading, error, refresh } = usePublicReports();
  const session = useEmailSession();
  const { capabilities, loading: capabilitiesLoading, refresh: refreshCapabilities } = useCapabilities();
  const [mine, setMine] = useState(false);
  const community = useCitizenReports(mine, session.user, Boolean(capabilities?.reports && (!mine || session.user)));
  const [composing, setComposing] = useState(false), [picking, setPicking] = useState(false);
  const [draftLocation, setDraftLocation] = useState<ReportLocation | null>(null);
  const [loginLink, setLoginLink] = useState(() => new URLSearchParams(location.hash.slice(1)).get('masuk') ?? '');
  const [loginOpen, setLoginOpen] = useState(Boolean(loginLink));
  const [loginIntent, setLoginIntent] = useState('mine');
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const reportIntent = useRef(new URLSearchParams(location.search).get('buat') === '1');
  const [drawing, setDrawing] = useState<{ id: string; mode: 'line' | 'area'; complete: (geometry: ConditionGeometry) => void } | null>(null);
  const [draftGeometry, setDraftGeometry] = useState<ConditionGeometry | null>(null), [inspectingId, setInspectingId] = useState<string | null>(null);
  const drawingExpanded = useRef(false), conditionNow = useConditionClock();
  useEffect(() => {
    const readLink = () => {
      const value = new URLSearchParams(location.hash.slice(1)).get('masuk');
      if (!value) return;
      setLoginLink(value); setLoginOpen(true);
      history.replaceState(history.state, '', location.pathname + location.search);
    };
    readLink(); window.addEventListener('hashchange', readLink);
    return () => window.removeEventListener('hashchange', readLink);
  }, []);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ReportCategory | 'all'>('all');
  const [area, setArea] = useState<MapArea | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(location.search).get('laporan'));
  const [linkedReport, setLinkedReport] = useState<CitizenReport | null>(null), [linkError, setLinkError] = useState('');
  const linkedUser = useRef('');
  const [expanded, setExpanded] = useState(false);
  const [crmTab, setCrmTab] = useState<'summary' | 'history'>('summary');
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const previousPanel = useRef(false);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const listScroll = useRef(0), panelScroll = useRef(0), panel = useRef<HTMLElement>(null), reportList = useRef<HTMLDivElement>(null);
  const historyIndex = useRef(Number(history.state?.ljIndex ?? 0)), restoringHistory = useRef(false);
  const rows = useMemo(() => {
    const reports = [...(mine ? [] : snapshot?.reports ?? []), ...community.reports];
    if (linkedReport && (!linkedReport.visibility || linkedReport.visibility === 'public' || (mine && session.user?.id === linkedUser.current)) && !reports.some(row => row.id === linkedReport.id)) reports.push(linkedReport);
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [snapshot, community.reports, linkedReport, mine, session.user?.id]);
  const filtered = useMemo(() => filterReports(rows, category, query, area), [rows, category, query, area]);
  const selectedRow = filtered.find(report => report.id === selectedId);
  const selected = selectedRow ? (linkedReport?.id === selectedId ? linkedReport : selectedRow) : (session.user && linkedUser.current === session.user.id && linkedReport?.id === selectedId && linkedReport.visibility && linkedReport.visibility !== 'public' ? linkedReport : null);
  const unsupported = category !== 'all' && category !== 'road';
  const startDrawing: GeometryDrawingStarter = (mode, complete) => {
    drawingExpanded.current = expanded; setInspectingId(null);
    setDrawing({ id: crypto.randomUUID(), mode, complete }); setExpanded(false);
  };
  function finishDrawing(geometry: ConditionGeometry) { const request = drawing; setDrawing(null); setExpanded(drawingExpanded.current); request?.complete(geometry); }
  function cancelDrawing() { setDrawing(null); setExpanded(drawingExpanded.current); }
  function navigate(id: string | null, replace = false) {
    const url = new URL(location.href); id ? url.searchParams.set('laporan', id) : url.searchParams.delete('laporan');
    if (!replace) historyIndex.current++;
    history[replace ? 'replaceState' : 'pushState']({ ...history.state, ljIndex: historyIndex.current }, '', url);
    setSelectedId(id); setLinkError('');
    setInspectingId(null); setDrawing(null); setDraftGeometry(null);
  }
  useEffect(() => {
    history.replaceState({ ...history.state, ljIndex: historyIndex.current }, '');
    const pop = (event: PopStateEvent) => {
      if (restoringHistory.current) { restoringHistory.current = false; return; }
      const index = Number(event.state?.ljIndex ?? 0);
      if ((pendingUpdate || composing) && !confirm('Perubahan belum disimpan. Buang isian?')) {
        const delta = historyIndex.current - index;
        if (delta) { restoringHistory.current = true; history.go(delta); }
        return;
      }
      historyIndex.current = index; setComposing(false); setPicking(false); setPendingUpdate(false);
      setInspectingId(null); setDrawing(null); setDraftGeometry(null);
      setSelectedId(new URLSearchParams(location.search).get('laporan')); setLinkError(''); setExpanded(true);
    };
    window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop);
  }, [pendingUpdate, composing]);
  useEffect(() => { setInspectingId(null); }, [query, category, area, mine, composing]);
  useEffect(() => {
    if (!selectedId || rows.some(row => row.id === selectedId)) return;
    if (!isReportId(selectedId)) { if (!loading) setLinkError('Tautan laporan tidak valid atau laporan CRM tidak tersedia pada sumber yang dimuat.'); return; }
    if (linkedReport?.id === selectedId && (!linkedReport.visibility || linkedReport.visibility === 'public' || session.user?.id === linkedUser.current)) return;
    const controller = new AbortController();
    api<CitizenReport>(`/reports/${selectedId}`, { signal: controller.signal }).then(result => { if (!controller.signal.aborted) { linkedUser.current = session.user?.id ?? ''; setLinkedReport(result); setExpanded(true); } }).catch(error => { if (!controller.signal.aborted) setLinkError(errorMessage(error)); });
    return () => controller.abort();
  }, [selectedId, session.user?.id, rows, loading, linkedReport?.id]);

  function startReport() {
    if (!session.user) { setLoginIntent('new'); setLoginOpen(true); return; }
    navigate(null); setComposing(true); setExpanded(true); setDraftLocation(null);
  }
  // --- landing report intent ---
  useEffect(() => {
    if (!reportIntent.current || capabilitiesLoading || session.loading) return;
    reportIntent.current = false;
    const url = new URL(location.href); url.searchParams.delete('buat');
    history.replaceState(history.state, '', url);
    if (capabilities?.write && (session.user || capabilities.login)) startReport();
    else setAccountError(capabilityMessage(capabilities));
  }, [capabilitiesLoading, capabilities, session.loading, session.user]);
  // --- end of landing report intent ---
  function savedReport(report: CitizenReport) {
    community.merge(report); setComposing(false); setPicking(false); setDraftLocation(null);
    linkedUser.current = session.user?.id ?? ''; setLinkedReport(report);
    setQuery(''); setCategory('all'); setArea(null); navigate(report.id); setExpanded(true);
  }
  function select(report: PublicReport) {
    returnFocus.current = document.activeElement as HTMLElement;
    previousPanel.current = expanded;
    listScroll.current = reportList.current?.scrollTop ?? 0; panelScroll.current = panel.current?.scrollTop ?? 0;
    if (report.origin === 'community' && (!(report as CitizenReport).visibility || (report as CitizenReport).visibility === 'public')) {
      linkedUser.current = session.user?.id ?? ''; setLinkedReport(report as CitizenReport);
    }
    navigate(report.id);
    if (matchMedia('(max-width: 800px)').matches) setExpanded(true);
  }
  function closeDetail() {
    navigate(null);
    setExpanded(previousPanel.current);
    requestAnimationFrame(() => {
      const target = returnFocus.current;
      if (target?.isConnected) target.focus();
      else listHeading.current?.focus();
      if (reportList.current) reportList.current.scrollTop = listScroll.current;
      if (panel.current) panel.current.scrollTop = panelScroll.current;
    });
  }
  useEffect(() => { if (selectedId && rows.some(row => row.id === selectedId) && !selected) navigate(null, true); }, [selectedId, selected, filtered]);
  useEffect(() => { setCrmTab('summary'); if (selectedId) heading.current?.focus(); }, [selectedId]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && selectedId && selected?.origin !== 'community') closeDetail(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  return <div className={`lj-app${expanded ? ' lj-expanded' : ''}${composing ? ' lj-composing' : ''}${selected || selectedId ? ' lj-reading-detail' : ''}${drawing ? ' lj-drawing' : ''}${inspectingId && inspectingId === selectedId ? ' lj-inspecting' : ''}`}>
    <a className="lj-skip" href="#report-panel">Ke daftar laporan</a>
    {accountOpen && session.user && <AccountProfile user={session.user} writeAvailable={Boolean(capabilities?.write)} onSave={session.profile} onClose={() => setAccountOpen(false)} />}
    {loginOpen && <EmailLogin link={loginLink} returnTo={loginIntent} onClose={() => { setLoginOpen(false); setLoginLink(''); }} onExchange={async link => {
      const intent = await session.exchange(link);
      if (intent === 'new') { navigate(null); setComposing(true); setExpanded(true); setDraftLocation(null); }
      else if (intent === 'mine') { navigate(null); setMine(true); setExpanded(true); }
      else {
        if (linkedReport?.id !== intent || (linkedReport.visibility && linkedReport.visibility !== 'public')) setLinkedReport(null);
        navigate(intent); setExpanded(true);
      }
    }} />}
    <header className="lj-header">
      <a className="lj-brand" href="/" aria-label="LaporJalan - halaman utama">
        <span><img src="/brand/lockup-horizontal.svg" width="162" height="32" alt="" /><small>Laporan jalan dari warga</small></span>
      </a>
      <div className="lj-search">
        <label htmlFor="report-search">Cari laporan</label>
        <div><Search size={18} aria-hidden="true" /><input id="report-search" type="search" value={query}
          disabled={composing || pendingUpdate} placeholder="Judul, kode, atau status laporan" onChange={event => setQuery(event.target.value)} /></div>
      </div>
      <span className="lj-region"><MapPin size={16} aria-hidden="true" /> Jakarta</span>
      <button className="lj-primary lj-add-report" disabled={composing || pendingUpdate || !capabilities?.write || (!session.user && !capabilities.login)} title={capabilitiesLoading ? 'Memeriksa layanan…' : capabilityMessage(capabilities)} onClick={startReport}><Plus size={18} aria-hidden="true" /> Tambah laporan</button>
      <a className="lj-source-link" href={SOURCE_URL} target="_blank" rel="noreferrer">Peta CRM <ArrowUpRight size={16} aria-hidden="true" /></a>
    </header>

    <main className="lj-workspace">
      <PublicMap reports={filtered} selected={composing ? null : selected} onSelect={select} onArea={setArea} selectionLocked={pendingUpdate || composing} picking={picking && !drawing} draftLocation={draftLocation} onLocation={setDraftLocation}
        drawing={drawing ? { id: drawing.id, mode: drawing.mode } : null} onDrawingComplete={finishDrawing} onDrawingCancel={cancelDrawing} draftGeometry={draftGeometry}
        inspecting={Boolean(inspectingId && inspectingId === selectedId)} onExitInspection={() => setInspectingId(null)} />
      <section id="report-panel" ref={panel} className="lj-panel" aria-label="Laporan publik" tabIndex={-1}>
        <button className="lj-panel-toggle" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
          {expanded ? <><ArrowDown size={16} /> Lihat peta</> : <><List size={16} /> Perluas daftar</>}
        </button>
        {composing ? <NewReport location={draftLocation} writeAvailable={Boolean(capabilities?.write)} preferredName={session.user?.displayName} onLocation={setDraftLocation} onPicking={setPicking} onDrawGeometry={startDrawing} onGeometryPreview={setDraftGeometry}
          onClose={() => { setComposing(false); setPicking(false); setDraftLocation(null); setDraftGeometry(null); setDrawing(null); setInspectingId(null); }} onSaved={savedReport} /> : <>
        {!selectedId && <><div className="lj-panel-intro">
          <div><p className="lj-eyebrow">PETA WARGA</p><h1>Jalan di sekitar.</h1></div>
          <button className="lj-refresh" aria-label="Perbarui laporan" disabled={loading || community.loading || capabilitiesLoading || pendingUpdate} onClick={() => { void refresh(); community.refresh(); refreshCapabilities(); }}>
            <RefreshCw size={18} className={loading ? 'lj-spinning' : ''} />
          </button>
          <p className="lj-intro-copy">Pantau laporan publik dan status dari sumbernya.</p>
        </div>
        <nav className="lj-categories" aria-label="Kategori laporan">
          {categories.map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={category === id}
            disabled={pendingUpdate} onClick={() => setCategory(id)}><Icon size={16} aria-hidden="true" />{label}</button>)}
        </nav>

        <div className="lj-account-row">
          {session.user ? <><button disabled={pendingUpdate} aria-pressed={mine} onClick={() => { navigate(null); setMine(value => !value); }}>{mine ? 'Lihat semua laporan' : 'Laporan sendiri'}</button>
            <button disabled={pendingUpdate} onClick={() => setAccountOpen(true)}>Akun</button>
            <button disabled={pendingUpdate} onClick={() => { void session.logout().then(() => { setMine(false); setLinkedReport(null); }).catch(error => setAccountError(errorMessage(error))); }}>Keluar</button></>
          : <button disabled={!capabilities?.login} onClick={() => { setLoginIntent('mine'); setLoginOpen(true); }}>Masuk untuk mengelola laporan</button>}
        </div>
        {accountError && <p className="lj-form-error" role="alert">{accountError}</p>}
        {session.expired && <p className="lj-form-error" role="status">Sesi berakhir. Masuk kembali untuk mengelola laporan.</p>}
        {!capabilitiesLoading && capabilityMessage(capabilities) && <p className="lj-community-warning" role="status">{capabilityMessage(capabilities)}</p>}
        {community.error && <div className="lj-community-warning" role="status"><span>Laporan LaporJalan: {community.error}</span><button onClick={community.refresh}>Coba muat laporan warga</button></div>}
        {error && !mine && <div className="lj-data-warning" role="alert">
          <strong>{snapshot ? 'Pembaruan belum berhasil.' : 'Laporan belum dapat dimuat.'}</strong>
          <span>{snapshot ? `Menampilkan data yang diambil ${reportDate(snapshot.source.retrievedAt)} WIB.` : 'Sumber sedang tidak tersedia. Silakan coba kembali.'}</span>
          <button onClick={() => void refresh()} disabled={loading}>Coba lagi</button>
        </div>}
        {community.loading && <p className="lj-loading" role="status">Memuat laporan warga…</p>}
        {loading && !mine && <p className="lj-loading" role="status">{snapshot ? 'Memperbarui laporan…' : 'Memuat laporan dari CRM Jakarta…'}</p>}
        </>}

        {selectedId && !selected && <div className="lj-detail"><button className="lj-back" onClick={closeDetail}><ArrowLeft size={18} /> Kembali ke daftar</button><div className="lj-detail-body"><p role="status">{linkError || 'Memuat laporan…'}</p></div></div>}

        <div className="lj-list-section" hidden={Boolean(selectedId)}>
          <div className="lj-results-heading">
            <h2 ref={listHeading} tabIndex={-1} aria-live="polite">{snapshot || community.reports.length ? `${filtered.length} laporan${area ? ' di area ini' : ''}` : 'Daftar laporan'}</h2>
            <span>Terbaru dahulu</span>
          </div>
          {area && <div className="lj-area-filter">Area peta dipilih<button onClick={() => setArea(null)}><X size={14} /> Hapus area</button></div>}
        <div ref={reportList} className="lj-report-list" aria-label="Daftar laporan">
            {filtered.map(report => <button key={report.id} className="lj-report-row" data-report-id={report.id} onClick={() => select(report)}>
              <span className="lj-thumbnail" aria-hidden="true">{report.origin === 'community' && (!(report as CitizenReport).visibility || (report as CitizenReport).visibility === 'public') && report.media?.[0]?.mime.startsWith('image/')
                ? <img src={mediaUrl(report.id, report.media[0].id)} alt="" loading="lazy" /> : <><Route size={25} /><small>{report.media?.length ? 'Video' : 'Tanpa foto'}</small></>}</span>
              <span className="lj-row-copy"><span className="lj-row-meta">{CATEGORY_LABELS[report.category].toUpperCase()} <time dateTime={report.createdAt}>{reportDate(report.createdAt)}</time></span>
                <strong>{report.title ?? report.code}</strong>
                <span className="lj-row-source">{report.origin === 'community' ? 'Warga · LaporJalan' : 'Laporan warga · JAKI'}</span>
                {report.condition && <span className="lj-row-condition">{[conditionLabel(report.condition), conditionSize(report.condition)?.short, 'pengamatan pelapor'].filter(Boolean).join(' · ')}<br /><time dateTime={report.condition.observedAt}>{reportDate(report.condition.observedAt)} WIB</time>{closureNeedsUpdate(report.condition, conditionNow) && <strong className="lj-stale-condition">Perlu pembaruan</strong>}</span>}
                <span className="lj-status">{report.sourceStatus ?? 'Status belum tersedia'}{report.origin === 'community' ? ` · ${(report as CitizenReport).reporterName || 'Pelapor'}` : ''}</span>
                {report.origin === 'community' && (report as CitizenReport).visibility === 'withdrawn' && <span className="lj-row-source">Ditarik dari publik</span>}
              </span>
              <ChevronRight size={17} className="lj-row-arrow" aria-hidden="true" />
            </button>)}
            {community.cursor && <button className="lj-load-more" disabled={community.loading} onClick={() => void community.more()}>Muat laporan warga berikutnya</button>}
            {!loading && !error && !community.loading && !community.error && !filtered.length && <div className="lj-empty" role="status">
              <Route size={28} aria-hidden="true" />
              <h3>{'Belum ada laporan yang sesuai'}</h3>
              <p>{unsupported ? 'Belum ada laporan warga pada kategori ini. Laporan baru dapat ditambahkan dari lokasi kejadian; sumber CRM pada integrasi ini hanya mencakup kategori Jalan.' : 'Coba ubah pencarian, kategori, atau area peta. Data mencakup hari ini dan kemarin.'}</p>
              <button onClick={() => { setMine(false); setQuery(''); setCategory('all'); setArea(null); }}>Lihat semua laporan</button>
            </div>}
          </div>
        </div>

        {selected?.origin === 'community' && <CitizenDetail key={selected.id} summary={selected} user={session.user} loginAvailable={Boolean(capabilities?.login)} writeAvailable={Boolean(capabilities?.write)} sessionExpired={session.expired} onClose={closeDetail}
          onDrawGeometry={startDrawing} onGeometryPreview={setDraftGeometry} onInspect={() => { setDrawing(null); setInspectingId(selected.id); }}
          onResolved={report => { linkedUser.current = session.user?.id ?? ''; setLinkedReport(report); }}
          onLogin={() => { if (capabilities?.login) { setLoginIntent(selected.id); setLoginOpen(true); } else setAccountError(capabilityMessage(capabilities)); }} onSaved={report => { community.merge(report); linkedUser.current = session.user?.id ?? ''; setLinkedReport(report); }} onDirty={setPendingUpdate} />}
        {selected && selected.origin !== 'community' && <div className="lj-detail">
          <button className="lj-back" onClick={closeDetail}><ArrowLeft size={18} /> Kembali ke daftar</button>
          <div className="lj-detail-body">
            <p className="lj-eyebrow">LAPORAN KATEGORI JALAN</p>
            <h2 ref={heading} tabIndex={-1}>{selected.code}</h2>
            <p className="lj-detail-date">Dibuat {reportDate(selected.createdAt)} WIB</p>
            <span className="lj-status">{selected.sourceStatus ?? 'Status belum tersedia'}</span>
            <p className="lj-detail-note">Sumber: CRM Jakarta · laporan JAKI</p>
            <div className="lj-detail-tabs" role="tablist" aria-label="Isi laporan CRM">
              <button role="tab" id="crm-summary-tab" aria-controls="crm-summary" aria-selected={crmTab === 'summary'} onClick={() => setCrmTab('summary')}>Ringkasan</button>
              <button role="tab" id="crm-history-tab" aria-controls="crm-history" aria-selected={crmTab === 'history'} onClick={() => setCrmTab('history')}>Riwayat</button>
            </div>
            <div id="crm-summary" role="tabpanel" aria-labelledby="crm-summary-tab" hidden={crmTab !== 'summary'}>
            <div className="lj-media-empty"><ImageOff size={28} aria-hidden="true" /><strong>Foto belum tersedia</strong><span>Sumber peta tidak menyertakan media laporan.</span></div>
            <dl className="lj-facts">
              <div><dt>Kategori sumber</dt><dd>{selected.sourceCategory}</dd></div>
              <div><dt>Koordinat sumber</dt><dd>{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</dd></div>
              <div><dt>Alamat jalan</dt><dd>Belum tersedia</dd></div>
              <div><dt>Status dari CRM</dt><dd>{selected.sourceStatus ?? 'Belum tersedia'}</dd></div>
            </dl>
            <p className="lj-detail-note">Kategori Jalan belum menjelaskan jenis kerusakan. Ketelitian lokasi dan kondisi lapangan belum diverifikasi oleh LaporJalan.</p>
            </div>
            <div id="crm-history" role="tabpanel" aria-labelledby="crm-history-tab" hidden={crmTab !== 'history'}>
              <h3 className="lj-history-title">Riwayat sumber</h3><p className="lj-detail-note">Riwayat belum tersedia dari sumber ini.</p>
              <p className="lj-detail-date">Status CRM saat data diambil: {selected.sourceStatus ?? 'Belum tersedia'}.{snapshot && <> Data diambil {reportDate(snapshot.source.retrievedAt)} WIB.</>}</p>
            </div>
            <section className="lj-detail-source"><h3>Sumber laporan</h3><p>CRM Jakarta · laporan JAKI</p>
              <p>Riwayat penanganan dan deskripsi tidak tersedia pada tampilan ini.</p>
              <a href={SOURCE_URL} target="_blank" rel="noreferrer">Buka peta sumber <ArrowUpRight size={16} /></a>
            </section>
          </div>
        </div>}
        </>}
        <footer className="lj-source-footer">
          <div><span className="lj-source-dot" /><strong>CRM Jakarta + warga LaporJalan</strong><span>Bukan layanan resmi pemerintah</span></div>
          {snapshot && <p>{reportDate(snapshot.source.dateStart, false)} - {reportDate(snapshot.source.dateEnd, false)} · Diambil {reportDate(snapshot.source.retrievedAt)} WIB</p>}
          <p>CRM: kategori Jalan, hari ini dan kemarin. LaporJalan: kiriman warga. Bukan seluruh laporan Jakarta.</p>
        </footer>
      </section>
    </main>
  </div>;
}
