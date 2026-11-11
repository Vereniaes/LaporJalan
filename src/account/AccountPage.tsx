/* Todo:
-> /akun: one page after sign-in (owner choice, 9 Nov)
    -> profile: name, private email, change name, sign out
    -> Buat laporan: the same 3-step form as the map page, beside its own map (pin, ruas, area)
    -> Laporanku: every own report with its status and publication
    -> Kelola (owner choice, 9 Nov: managing left the map page): the same detail as before - history, updates,
       publication, attachments - opens here in place of the form, beside the same map; ?laporan=ID opens it
-> no session: go to /masuk and come back here
    -> a session that ends while the page is open keeps the page and its drafts; sign in again in place (dialog, as on the map)
*/
import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { PublicMap } from '../public-reports/PublicMap';
import { NewReport, type ReportLocation } from '../public-reports/NewReport';
import { AccountProfile } from '../public-reports/AccountProfile';
import { CitizenDetail } from '../public-reports/CitizenDetail';
import { EmailLogin } from '../public-reports/EmailLogin';
import { useDrawing } from '../public-reports/useDrawing';
import { useLoadMore } from '../components/useLoadMore';
import { capabilityMessage, errorMessage, useCapabilities, useCitizenReports, useEmailSession, type CitizenReport, type User } from '../public-reports/community';
import type { ConditionGeometry } from '../public-reports/condition';
import { reportDate } from '../public-reports/data';
import { statusClass } from '../public-reports/statusTone';
import { SiteFooter, SiteHeader } from '../home/SiteChrome';
import { PageSkeleton, SkeletonRows } from '../components/Skeleton';
import '../public-reports/public-reports.css';
import '../public-reports/community.css';
import '../home/home.css';
import './account.css';

// --- small parts ---
const VISIBILITY = { public: 'Publik', withdrawn: 'Ditarik dari publik', hidden: 'Disembunyikan moderasi' } as const;
const openOnMap = (id: string) => `/peta?laporan=${encodeURIComponent(id)}`;
// keep the managed report in the address so a reload or a shared owner link reopens it
function rememberManaged(id: string | null) {
  const url = new URL(location.href); id ? url.searchParams.set('laporan', id) : url.searchParams.delete('laporan');
  history.replaceState(history.state, '', url);
}

// counts per status for the list heading, biggest first
function statusCounts(reports: CitizenReport[]) {
  const counts = reports.reduce<Record<string, number>>((all, row) => ({ ...all, [row.sourceStatus || 'Dilaporkan']: (all[row.sourceStatus || 'Dilaporkan'] ?? 0) + 1 }), {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}
// --- end of small parts ---

// --- account page ---
export default function AccountPage() {
  const session = useEmailSession();
  const { capabilities } = useCapabilities();
  // the last signed-in user stays on screen when the session ends mid-visit, so drafts are not unmounted
  const [known, setKnown] = useState<User | null>(null);
  useEffect(() => { if (session.user) setKnown(session.user); }, [session.user]);
  const [loginOpen, setLoginOpen] = useState(false), [loginLink, setLoginLink] = useState('');
  useEffect(() => {
    const readLink = () => {
      const value = new URLSearchParams(location.hash.slice(1)).get('masuk');
      if (!value) return;
      setLoginLink(value); setLoginOpen(true); history.replaceState(history.state, '', location.pathname + location.search);
    };
    readLink(); window.addEventListener('hashchange', readLink);
    return () => window.removeEventListener('hashchange', readLink);
  }, []);
  const mine = useCitizenReports(true, session.user ?? known, Boolean((session.user ?? known) && capabilities?.reports));
  // the next page of my reports loads by itself as the list's end comes near; the button stays for keyboards
  const mineEnd = useLoadMore<HTMLButtonElement>(() => { if (!mine.loading) void mine.more(); }, Boolean(mine.cursor) && !mine.loading, mine.reports.length);
  const [nameOpen, setNameOpen] = useState(false), [accountError, setAccountError] = useState('');
  // the form's draft on the map
  const [picking, setPicking] = useState(false), [draftLocation, setDraftLocation] = useState<ReportLocation | null>(null);
  const [draftGeometry, setDraftGeometry] = useState<ConditionGeometry | null>(null);
  const [formKey, setFormKey] = useState(0), [saved, setSaved] = useState<CitizenReport | null>(null);
  const [managingId, setManagingId] = useState<string | null>(() => new URLSearchParams(location.search).get('laporan'));
  const [dirty, setDirty] = useState(false);
  const managed = mine.reports.find(report => report.id === managingId) ?? null;
  const mapBox = useRef<HTMLDivElement>(null), leaving = useRef(false);
  // drawing a stretch or an area happens on the map; bring it into view (phones keep the form below it)
  const draw = useDrawing(active => { if (active) mapBox.current?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  useEffect(() => { document.title = 'Akun saya - LaporJalan'; }, []);
  // Why/Note: signing out also empties the session; that must go home, not to the sign-in form
  useEffect(() => { if (!session.loading && !session.user && !known && !loginLink && !leaving.current) location.replace('/masuk?lanjut=%2Fakun'); }, [session.loading, session.user, known, loginLink]);

  function manage(id: string | null) {
    if (dirty && !confirm('Perubahan belum disimpan. Buang isian?')) return;
    setDirty(false); setDraftGeometry(null); draw.setDrawing(null); setManagingId(id); rememberManaged(id);
    if (id) requestAnimationFrame(() => mapBox.current?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  }
  function resetForm() { setFormKey(key => key + 1); setPicking(false); setDraftLocation(null); setDraftGeometry(null); draw.setDrawing(null); }
  async function signOut() {
    leaving.current = true;
    try { await session.logout(); location.assign('/'); } catch (error) { leaving.current = false; setAccountError(errorMessage(error)); }
  }

  const user = session.user ?? known;
  const login = loginOpen && <EmailLogin link={loginLink} returnTo="mine" emailLink={Boolean(capabilities?.emailLink)} onClose={() => { setLoginOpen(false); setLoginLink(''); }}
    onExchange={async link => { await session.exchange(link); }} onSignIn={session.signIn} />;
  if (!user) return <div className="home">{login}<PageSkeleton label="Memuat akun…" /></div>;
  const write = Boolean(capabilities?.write), notice = capabilityMessage(capabilities);
  return <MotionConfig reducedMotion="user"><div className="home">
    <a className="skip" href="#isi">Ke isi halaman</a>
    <SiteHeader user={user} canLogin />
    {login}
    {nameOpen && <AccountProfile user={user} writeAvailable={write} onSave={session.profile} onClose={() => setNameOpen(false)} />}
    <main id="isi" className="account wrap">
      <header className="account-head">
        <div>
          <p className="kicker">Akun warga</p>
          <h1 className="h2">{user.displayName || 'Akun saya'}</h1>
          <p className="account-email">{user.email} · privat, tidak tampil di laporan</p>
        </div>
        <div className="actions">
          <button className="btn btn-quiet" onClick={() => setNameOpen(true)}>Ubah nama tampilan</button>
          <button className="btn btn-quiet" onClick={() => void signOut()}>Keluar</button>
        </div>
        {accountError && <p className="lj-form-error" role="alert">{accountError}</p>}
        {notice && <p className="lj-community-warning" role="status">{notice}</p>}
        {!session.user && <p className="lj-form-error" role="status">Sesi berakhir. Isian tetap tersimpan. <button className="lj-text-action" onClick={() => setLoginOpen(true)}>Masuk kembali</button></p>}
      </header>

      <div className="account-grid">
        {/* Buat laporan: the map is the form's location field */}
        <section className="account-compose" aria-label="Buat laporan">
          <div className={`account-map${draw.drawing ? ' is-drawing' : ''}`} ref={mapBox}>
            <PublicMap reports={mine.reports} selected={managed} onSelect={report => manage(report.id)} onArea={() => {}}
              picking={picking && !draw.drawing} draftLocation={draftLocation} onLocation={setDraftLocation}
              drawing={draw.drawing ? { id: draw.drawing.id, mode: draw.drawing.mode } : null} onDrawingComplete={draw.finish} onDrawingCancel={draw.cancel} draftGeometry={draftGeometry} />
          </div>
          {saved && !managed && <p className="lj-form-success account-saved" role="status">Laporan {saved.code} terkirim. <a href={openOnMap(saved.id)}>Lihat di peta</a></p>}
          {managingId && !managed && !mine.loading && <p className="lj-community-warning" role="status">Laporan ini tidak ada di akun ini. <button className="lj-text-action" onClick={() => manage(null)}>Kembali ke form</button></p>}
          <div className="account-form">
            {managed ? <CitizenDetail key={managed.id} summary={managed} user={session.user} writeAvailable={write} sessionExpired={session.expired}
              onClose={() => manage(null)} onLogin={() => setLoginOpen(true)} onDirty={setDirty}
              onDrawGeometry={draw.start} onGeometryPreview={setDraftGeometry} onSaved={mine.merge} onResolved={mine.merge} />
            : <NewReport key={formKey} location={draftLocation} writeAvailable={write} preferredName={user.displayName} backLabel="Kosongkan form" autoFocus={false}
              onLocation={setDraftLocation} onPicking={setPicking} onDrawGeometry={draw.start} onGeometryPreview={setDraftGeometry}
              onClose={() => { setSaved(null); resetForm(); }} onSaved={report => { mine.merge(report); setSaved(report); resetForm(); }} />}
          </div>
        </section>

        {/* Laporanku: status is the reporter's own observation, publication is the owner's choice */}
        <section className="account-reports" aria-labelledby="t-mine">
          <div className="account-reports-head">
            <h2 id="t-mine">Laporanku</h2>
            {mine.reports.length > 0 && <p className="account-counts">{statusCounts(mine.reports).map(([label, count]) => <span key={label} className={statusClass(label)}>{label} {count}</span>)}</p>}
          </div>
          {mine.error && <div className="lj-community-warning" role="status"><span>{mine.error}</span><button className="lj-text-action" onClick={mine.refresh}>Coba lagi</button></div>}
          {mine.loading && !mine.reports.length && <SkeletonRows count={3} thumb={false} />}
          {!mine.loading && !mine.error && !mine.reports.length && <p className="account-empty"><img src="/home/miko/clipboard-512.webp" width="512" height="512" alt="" loading="lazy" decoding="async" />Belum ada laporan. Tandai lokasi pada peta, lalu isi form Buat laporan.</p>}
          <ol className="my-reports">
            {mine.reports.map(report => <li key={report.id}>
              <button className={report.id === managingId ? 'is-managed' : ''} aria-pressed={report.id === managingId} onClick={() => manage(report.id)}>
                <span className="my-title">{report.title}</span>
                <span className="my-meta mono">{report.code} · {reportDate(report.createdAt)} WIB</span>
                <span className="my-badges">
                  <span className={statusClass(report.sourceStatus || 'Dilaporkan')}>{report.sourceStatus || 'Dilaporkan'}</span>
                  <span className={`my-visibility is-${report.visibility ?? 'public'}`}>{VISIBILITY[report.visibility ?? 'public']}</span>
                </span>
                <span className="my-open">Perbarui atau kelola<ArrowRight aria-hidden="true" /></span>
              </button>
            </li>)}
          </ol>
          {mine.cursor && <button ref={mineEnd} className="lj-load-more" disabled={mine.loading} onClick={() => void mine.more()}>{mine.loading ? 'Memuat…' : 'Muat laporan lainnya'}</button>}
        </section>
      </div>
    </main>
    <SiteFooter user={user} canLogin />
  </div></MotionConfig>;
}
// --- end of account page ---
