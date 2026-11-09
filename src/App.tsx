/* Todo:
-> open the landing, the public map, an account page (/masuk, /daftar, /akun) or the admin queue (/admin)
-> preserve existing report and email links
    -> /regis is an older name for /daftar
*/
import { lazy, Suspense, useEffect } from 'react';

// --- page entry ---
const HomePage = lazy(() => import('./home/HomePage'));
const PublicReportsPage = lazy(() => import('./public-reports/PublicReportsPage').then(module => ({ default: module.PublicReportsPage })));
const AuthPage = lazy(() => import('./account/AuthPage'));
const AccountPage = lazy(() => import('./account/AccountPage'));
const AdminPage = lazy(() => import('./admin/AdminPage'));
const path = location.pathname.replace(/\/$/, '') || '/';
if (path === '/regis') history.replaceState(history.state, '', `/daftar${location.search}`);
// legacy root links (/?laporan=, /#masuk=) open the map; /akun?laporan= and an email link arriving on /akun stay on the account page
const openMap = path === '/peta' || (path === '/' &&
  (new URLSearchParams(location.search).has('laporan') || new URLSearchParams(location.hash.slice(1)).has('masuk')));

function Page() {
  if (openMap) return <PublicReportsPage />;
  if (path === '/daftar' || path === '/regis') return <AuthPage mode="daftar" />;
  if (path === '/masuk') return <AuthPage mode="masuk" />;
  if (path === '/akun') return <AccountPage />;
  if (path === '/admin') return <AdminPage />;
  return <HomePage />;
}

export function App() {
  useEffect(() => {
    if (openMap || path === '/akun') return;
    const openEmail = () => {
      if (new URLSearchParams(location.hash.slice(1)).has('masuk')) location.replace(`/peta${location.search}${location.hash}`);
    };
    window.addEventListener('hashchange', openEmail);
    return () => window.removeEventListener('hashchange', openEmail);
  }, []);
  return <Suspense fallback={<p className="page-loading" role="status">Memuat halaman…</p>}><Page /></Suspense>;
}
export default App;
// --- end of page entry ---
