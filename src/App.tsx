/* Todo:
-> open the landing or public map
-> preserve existing report and email links
*/
import { lazy, Suspense, useEffect } from 'react';

// --- page entry ---
const HomePage = lazy(() => import('./home/HomePage'));
const PublicReportsPage = lazy(() => import('./public-reports/PublicReportsPage').then(module => ({ default: module.PublicReportsPage })));
const openMap = location.pathname.replace(/\/$/, '') === '/peta' ||
  new URLSearchParams(location.search).has('laporan') || new URLSearchParams(location.hash.slice(1)).has('masuk');

export function App() {
  useEffect(() => {
    if (openMap) return;
    const openEmail = () => {
      if (new URLSearchParams(location.hash.slice(1)).has('masuk')) location.replace(`/peta${location.search}${location.hash}`);
    };
    window.addEventListener('hashchange', openEmail);
    return () => window.removeEventListener('hashchange', openEmail);
  }, []);
  return <Suspense fallback={<p className="page-loading" role="status">Memuat halaman…</p>}>
    {openMap ? <PublicReportsPage /> : <HomePage />}
  </Suspense>;
}
export default App;
// --- end of page entry ---
