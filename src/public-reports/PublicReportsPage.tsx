/* Todo:
-> show the public map, reports, and source status
-> keep filters, selection and the mobile panel in sync
*/
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, CircleUserRound, ClipboardList, Construction, Flame, List, LogOut, Moon, Play, Plus, RefreshCw, Route, Search, Sun, Waves, X } from 'lucide-react';
import { filterReports, MapArea, PublicReport, ReportCategory, reportDate } from './data';
import { PublicMap } from './PublicMap';
import { usePublicReports } from './usePublicReports';
import { api, capabilityMessage, CATEGORY_LABELS, CitizenReport, errorMessage, isReportId, mediaUrl, useCapabilities, useCitizenReports, useEmailSession } from './community';
import { EmailLogin } from './EmailLogin';
import { useDrawing } from './useDrawing';
import { NewReport, ReportLocation } from './NewReport';
import { ReportPopup } from './ReportPopup';
import { statusClass } from './statusTone';
import { timeAgo } from './timeAgo';
import { swatchStyle } from './conditionFeatures';
import { closureNeedsUpdate, ConditionGeometry, conditionLabel, conditionSize, useConditionClock } from './condition';
import { MikoMotion } from '../home/MikoMotion';
import { MikoFlight } from './MikoFlight';
import { ThemeContext, useThemeChoice } from './theme';
import './public-reports.css';
import './community.css';
import './cute.css';

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
  const reportIntent = useRef(new URLSearchParams(location.search).get('buat') === '1');
  const [draftGeometry, setDraftGeometry] = useState<ConditionGeometry | null>(null), [inspectingId, setInspectingId] = useState<string | null>(null);
  const drawingExpanded = useRef(false), conditionNow = useConditionClock();
  // owner, 11 Nov: Oyenza-like and cute, Miko on the page, dark mode (device first, the header button decides after)
  const { theme, toggle: toggleTheme } = useThemeChoice();
  const [flights, setFlights] = useState(0), [toast, setToast] = useState('');
  const fly = () => setFlights(value => value + 1);
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
  // the report card on the map: a hover/focus preview, else the pinned (selected) report
  const [hovered, setHovered] = useState<PublicReport | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLElement>(null), reportList = useRef<HTMLDivElement>(null);
  const historyIndex = useRef(Number(history.state?.ljIndex ?? 0)), restoringHistory = useRef(false);
  const rows = useMemo(() => {
    const reports = [...(mine ? [] : snapshot?.reports ?? []), ...community.reports];
    if (linkedReport && (!linkedReport.visibility || linkedReport.visibility === 'public' || (mine && session.user?.id === linkedUser.current)) && !reports.some(row => row.id === linkedReport.id)) reports.push(linkedReport);
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [snapshot, community.reports, linkedReport, mine, session.user?.id]);
  const filtered = useMemo(() => filterReports(rows, category, query, area), [rows, category, query, area]);
  // Miko flies over the map while reports load and after "Cari di area ini"
  useEffect(() => { if (loading) fly(); }, [loading]);
  useEffect(() => { if (area) fly(); }, [area]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const selectedRow = filtered.find(report => report.id === selectedId);
  const selected = selectedRow ? (linkedReport?.id === selectedId ? linkedReport : selectedRow) : (session.user && linkedUser.current === session.user.id && linkedReport?.id === selectedId && linkedReport.visibility && linkedReport.visibility !== 'public' ? linkedReport : null);
  const unsupported = category !== 'all' && category !== 'road';
  // drawing takes the whole map; the panel returns to its earlier size afterwards
  const { drawing, setDrawing, start: startDrawing, finish: finishDrawing, cancel: cancelDrawing } = useDrawing(active => {
    if (active) { drawingExpanded.current = expanded; setInspectingId(null); setExpanded(false); }
    else setExpanded(drawingExpanded.current);
  });
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
  // while the form is open the list behind it is read-only (the map selection is locked the same way)
  // while the popup is open the page behind it is out of reach; drawing hands the map back
  useEffect(() => {
    const behind = [panel.current, document.querySelector('.lj-header'), document.querySelector('.lj-workspace > .lj-map')];
    behind.forEach(element => element?.toggleAttribute('inert', composing && !drawing));
  }, [composing, drawing]);
  useEffect(() => {
    if (!selectedId || rows.some(row => row.id === selectedId)) return;
    if (!isReportId(selectedId)) { if (!loading) setLinkError('Tautan laporan tidak valid atau laporan tidak tersedia.'); return; }
    if (linkedReport?.id === selectedId && (!linkedReport.visibility || linkedReport.visibility === 'public' || session.user?.id === linkedUser.current)) return;
    const controller = new AbortController();
    api<CitizenReport>(`/reports/${selectedId}`, { signal: controller.signal }).then(result => { if (!controller.signal.aborted) { linkedUser.current = session.user?.id ?? ''; setLinkedReport(result); setExpanded(true); } }).catch(error => { if (!controller.signal.aborted) setLinkError(errorMessage(error)); });
    return () => controller.abort();
  }, [selectedId, session.user?.id, rows, loading, linkedReport?.id]);

  function startReport() {
    if (!session.user) { setLoginIntent('new'); setLoginOpen(true); return; }
    navigate(null); setComposing(true); setExpanded(true); setDraftLocation(null);
  }
  // after any sign-in (email link or password): open what the visitor was reaching for
  function continueIntent(intent: string) {
    if (intent === 'new') { navigate(null); setComposing(true); setExpanded(true); setDraftLocation(null); }
    else if (intent === 'mine') { navigate(null); setMine(true); setExpanded(true); }
    else {
      if (linkedReport?.id !== intent || (linkedReport.visibility && linkedReport.visibility !== 'public')) setLinkedReport(null);
      navigate(intent); setExpanded(true);
    }
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
    fly(); setToast('Laporan terkirim. Terima kasih!');
  }
  // pin a report: its card opens on the map; the list stays where it was (no second page)
  function select(report: PublicReport) {
    returnFocus.current = document.activeElement as HTMLElement;
    if (report.origin === 'community' && (!(report as CitizenReport).visibility || (report as CitizenReport).visibility === 'public')) {
      linkedUser.current = session.user?.id ?? ''; setLinkedReport(report as CitizenReport);
    }
    setHovered(null); navigate(report.id);
    if (matchMedia('(max-width: 800px)').matches) setExpanded(false); // phones: the card sits on the map
  }
  function closeDetail() {
    navigate(null);
    requestAnimationFrame(() => {
      const target = returnFocus.current;
      if (target?.isConnected) target.focus(); else listHeading.current?.focus();
    });
  }
  // hover previews follow fine pointers only; touch taps pin directly
  const previewable = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
  useEffect(() => { if (selectedId && rows.some(row => row.id === selectedId) && !selected) navigate(null, true); }, [selectedId, selected, filtered]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && selectedId && !inspectingId) closeDetail(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, inspectingId]);
  // the pinned card stays while another pin is previewed
  const preview = hovered && hovered.id !== selected?.id ? hovered : null;
  const cards = composing ? [] : [selected, preview].filter((report): report is PublicReport => Boolean(report));

  return <ThemeContext.Provider value={theme}><div className={`lj-app lj-theme-${theme}${expanded ? ' lj-expanded' : ''}${composing ? ' lj-composing' : ''}${drawing ? ' lj-drawing' : ''}${selected && !composing ? ' lj-card-open' : ''}${inspectingId && inspectingId === selectedId ? ' lj-inspecting' : ''}`}>
    <a className="lj-skip" href="#report-panel">Ke daftar laporan</a>
    {loginOpen && <EmailLogin link={loginLink} returnTo={loginIntent} emailLink={Boolean(capabilities?.emailLink)} onClose={() => { setLoginOpen(false); setLoginLink(''); }}
      onExchange={async link => continueIntent(await session.exchange(link))}
      onSignIn={async (path, body) => { await session.signIn(path, body); continueIntent(loginIntent); }} />}
    <header className="lj-header">
      <a className="lj-brand" href="/" aria-label="LaporJalan - halaman utama">
        <span><img src={theme === 'dark' ? '/brand/lockup-horizontal-dark.svg' : '/brand/lockup-horizontal.svg'} width="162" height="32" alt="" /><small>Laporan jalan dari warga</small></span>
      </a>
      <div className="lj-search">
        <label htmlFor="report-search">Cari laporan</label>
        <div><Search size={18} aria-hidden="true" /><input id="report-search" type="search" value={query}
          disabled={composing || pendingUpdate} placeholder="Judul, kode, atau status laporan" onChange={event => setQuery(event.target.value)} /></div>
      </div>
      {/* account links sit in the header beside Tambah laporan (owner, 10 Nov) */}
      {/* icon buttons (owner, 10 Nov): one Akun goes to /akun, where the name is edited too; the name shows as a tooltip and to screen readers */}
      <div className="lj-account-row">
        <button className="lj-icon-button lj-theme-toggle" aria-pressed={theme === 'dark'} aria-label="Mode gelap" title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'} onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}</button>
        {session.user ? <><button className="lj-icon-button" disabled={pendingUpdate} aria-pressed={mine} aria-label={mine ? 'Lihat semua laporan' : 'Laporan sendiri'} title={mine ? 'Lihat semua laporan' : 'Laporan sendiri'}
            onClick={() => { navigate(null); setMine(value => !value); }}><ClipboardList size={20} aria-hidden="true" /></button>
          <a className="lj-icon-button" href="/akun" aria-label="Akun" title="Akun"><CircleUserRound size={20} aria-hidden="true" /></a>
          <button className="lj-icon-button" disabled={pendingUpdate} aria-label="Keluar" title="Keluar"
            onClick={() => { void session.logout().then(() => { setMine(false); setLinkedReport(null); }).catch(error => setAccountError(errorMessage(error))); }}><LogOut size={20} aria-hidden="true" /></button></>
        : <button disabled={!capabilities?.login} onClick={() => { setLoginIntent('mine'); setLoginOpen(true); }}>Masuk</button>}
      </div>
      <button className="lj-primary lj-add-report" disabled={composing || pendingUpdate || !capabilities?.write || (!session.user && !capabilities.login)} title={capabilitiesLoading ? 'Memeriksa layanan…' : capabilityMessage(capabilities)} onClick={startReport}><Plus size={18} aria-hidden="true" /> Tambah laporan</button>
    </header>

    <main className="lj-workspace">
      <PublicMap reports={filtered} selected={composing ? null : selected} onSelect={select} onArea={setArea} selectionLocked={pendingUpdate || composing} picking={picking && !drawing} draftLocation={draftLocation} onLocation={setDraftLocation}
        drawing={drawing ? { id: drawing.id, mode: drawing.mode } : null} onDrawingComplete={finishDrawing} onDrawingCancel={cancelDrawing} draftGeometry={draftGeometry}
        inspecting={Boolean(inspectingId && inspectingId === selectedId)} onExitInspection={() => setInspectingId(null)}
        // Why/Note: a pin or row only clears its own preview (a pin losing focus to the card must not erase the row now hovered)
        onHover={(report, leaving) => setHovered(current => report ?? (leaving && current?.id !== leaving.id ? current : null))}
        popups={cards.map(card => ({ report: card, pinned: card === selected, content: <ReportPopup report={card} pinned={card === selected} user={session.user} onClose={closeDetail}
          onInspect={card === selected && card.condition ? () => { setDrawing(null); setInspectingId(card.id); } : undefined} /> }))} />
      {/* the form is a centred popup over the page (owner, 10 Nov): the point is picked on the form's own map; the big map only returns for drawing */}
      <MikoFlight run={flights} />
      <div className="lj-toast-region" role="status">{toast && <p className="lj-toast"><img src="/home/miko/look-192.webp" width="40" height="40" alt="" />{toast}</p>}</div>
      {composing && <div className="lj-compose-backdrop"><section className="lj-compose-card" role="dialog" aria-modal="true" aria-label="Tambah laporan">
        <NewReport location={draftLocation} writeAvailable={Boolean(capabilities?.write)} preferredName={session.user?.displayName} onLocation={setDraftLocation} onPicking={setPicking} onDrawGeometry={startDrawing} onGeometryPreview={setDraftGeometry}
          onClose={() => { setComposing(false); setPicking(false); setDraftLocation(null); setDraftGeometry(null); setDrawing(null); setInspectingId(null); }} onSaved={savedReport} />
      </section></div>}
      <section id="report-panel" ref={panel} className="lj-panel" aria-label="Laporan publik" tabIndex={-1}>
        <button className="lj-panel-toggle" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
          {expanded ? <><ArrowDown size={16} /> Lihat peta</> : <><List size={16} /> Perluas daftar</>}
        </button>
        <div className="lj-panel-intro">
          <MikoMotion anim="look" className="lj-intro-miko" src="/home/miko/look-192.webp" />
          <h1 ref={listHeading} tabIndex={-1}>Jalan di sekitar{(snapshot || community.reports.length > 0) && <span className="lj-count">{filtered.length.toLocaleString('id-ID')}</span>}</h1>
          <button className="lj-refresh" aria-label="Perbarui laporan" disabled={loading || community.loading || capabilitiesLoading || pendingUpdate} onClick={() => { void refresh(); community.refresh(); refreshCapabilities(); }}>
            <RefreshCw size={18} className={loading ? 'lj-spinning' : ''} />
          </button>
        </div>
        <nav className="lj-categories" aria-label="Kategori laporan">
          {categories.map(({ id, label, icon: Icon }) => <button key={id} className={`chip-${id}`} aria-pressed={category === id}
            disabled={pendingUpdate} onClick={() => setCategory(id)}><Icon size={16} aria-hidden="true" />{label}</button>)}
        </nav>

        {accountError && <p className="lj-form-error" role="alert">{accountError}</p>}
        {session.expired && <p className="lj-form-error" role="status">Sesi berakhir. Masuk kembali untuk mengelola laporan.</p>}
        {!capabilitiesLoading && capabilityMessage(capabilities) && <p className="lj-community-warning" role="status">{capabilityMessage(capabilities)}</p>}
        {community.error && <div className="lj-community-warning" role="status"><span>Laporan LaporJalan: {community.error}</span><button onClick={community.refresh}>Coba muat laporan warga</button></div>}
        {error && !mine && <div className="lj-data-warning" role="alert">
          <MikoMotion anim="look" className="lj-warning-miko" src="/home/miko/look-192.webp" />
          <strong>{snapshot ? 'Pembaruan belum berhasil.' : 'Laporan belum dapat dimuat.'}</strong>
          <span>{snapshot ? `Menampilkan data yang diambil ${reportDate(snapshot.source.retrievedAt)} WIB.` : 'Sumber sedang tidak tersedia. Silakan coba kembali.'}</span>
          <button onClick={() => void refresh()} disabled={loading}>Coba lagi</button>
        </div>}
        {community.loading && <p className="lj-loading" role="status"><img src="/home/miko/fly-192.webp" width="28" height="28" alt="" />Memuat laporan warga…</p>}
        {loading && !mine && <p className="lj-loading" role="status"><img src="/home/miko/fly-192.webp" width="28" height="28" alt="" />{snapshot ? 'Memperbarui laporan…' : 'Memuat laporan…'}</p>}

        {selectedId && !selected && <div className="lj-link-status" role="status"><span>{linkError || 'Memuat laporan…'}</span><button onClick={closeDetail}>Tutup</button></div>}

        <div className="lj-list-section">
          <p className="lj-visually-hidden" aria-live="polite">{snapshot || community.reports.length ? `${filtered.length} laporan${area ? ' di area ini' : ''}` : ''}</p>
          {area && <div className="lj-area-filter">Area peta dipilih<button onClick={() => setArea(null)}><X size={14} /> Hapus area</button></div>}
        <div ref={reportList} className="lj-report-list" aria-label="Daftar laporan">
            {filtered.map(report => {
              const citizen = report.origin === 'community' ? report as CitizenReport : null;
              const photo = citizen && (!citizen.visibility || citizen.visibility === 'public') && report.media?.[0]?.mime.startsWith('image/') ? mediaUrl(report.id, report.media[0].id) : '';
              const CategoryIcon = categories.find(row => row.id === report.category)?.icon ?? Route;
              return <button key={report.id} className={`lj-report-row${report.id === selectedId ? ' is-selected' : ''}`} data-report-id={report.id} aria-pressed={report.id === selectedId} onClick={() => select(report)}
                onMouseEnter={() => { if (previewable()) setHovered(report); }} onMouseLeave={() => setHovered(current => current?.id === report.id ? null : current)}>
                <span className={`lj-thumbnail cat-${report.category}`} aria-hidden="true" style={!photo && report.condition ? swatchStyle(report.condition.kind) : undefined}>
                  {photo ? <img src={photo} alt="" loading="lazy" /> : <CategoryIcon size={26} />}
                  {report.media?.length && !photo ? <Play size={14} className="lj-thumb-video" /> : null}
                </span>
                <span className="lj-row-copy">
                  <strong>{report.title ?? report.code}</strong>
                  <span className="lj-row-meta"><CategoryIcon size={14} aria-hidden="true" /><time dateTime={report.createdAt} title={reportDate(report.createdAt)}>{timeAgo(report.createdAt)}</time>
                    <span className={statusClass(report.sourceStatus)}>{report.sourceStatus ?? 'Belum ada status'}</span>
                    {report.condition && closureNeedsUpdate(report.condition, conditionNow) && <span className="lj-stale-condition">Perlu pembaruan</span>}
                    {citizen?.visibility === 'withdrawn' && <span className="lj-stale-condition">Ditarik</span>}</span>
                  {/* the details the picture shows, for screen readers */}
                  <span className="lj-visually-hidden">{CATEGORY_LABELS[report.category]}{report.condition ? `, ${[conditionLabel(report.condition), conditionSize(report.condition)?.short].filter(Boolean).join(', ')}` : ''}{citizen ? `, oleh ${citizen.reporterName || 'pelapor'}` : ''}</span>
                </span>
              </button>;
            })}
            {community.cursor && <button className="lj-load-more" disabled={community.loading} onClick={() => void community.more()}>Muat laporan warga berikutnya</button>}
            {!loading && !error && !community.loading && !community.error && !filtered.length && <div className="lj-empty" role="status">
              <MikoMotion anim="peek-puddle" className="lj-empty-miko" src="/home/miko/peek-puddle-512.webp" loading="lazy" />
              <h3>{'Belum ada laporan yang sesuai'}</h3>
              <p>{unsupported ? 'Belum ada laporan pada kategori ini. Laporan baru dapat ditambahkan dari lokasi kejadian.' : 'Coba ubah pencarian, kategori, atau area peta.'}</p>
              <button onClick={() => { setMine(false); setQuery(''); setCategory('all'); setArea(null); }}>Lihat semua laporan</button>
            </div>}
          </div>
        </div>

      </section>
    </main>
  </div></ThemeContext.Provider>;
}
