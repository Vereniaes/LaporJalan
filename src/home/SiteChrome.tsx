/* Todo:
-> one header and footer for the landing and the account pages (Miko rebrand)
-> account links follow the session: Masuk + Daftar before sign-in, Akun saya after
    -> always shown (owner, 10 Nov: they vanished while the backend was down); /masuk and /daftar explain when the service is off
*/
import type { User } from '../public-reports/community';

// --- site header ---
// sections: the landing's own anchors; other pages link home instead
export function SiteHeader({ user, sections = false }: { user: User | null; canLogin?: boolean; sections?: boolean }) {
  return <header className="site-head wrap">
    <a className="brand" href="/" aria-label="LaporJalan, halaman utama"><img src="/brand/lockup-horizontal.svg" width="162" height="32" alt="" /></a>
    <nav className="site-nav" aria-label="Halaman">
      {!sections && <a href="/">Beranda</a>}
      <a href="/peta">Peta</a>
      {sections && <><a href="#alur">Alur</a><a href="#pertanyaan">Pertanyaan</a></>}
    </nav>
    <div className="head-account">
      {user?.role === 'admin' && <a className="head-link" href="/admin">Admin</a>}
      {user ? <a className="btn btn-quiet head-cta" href="/akun">Akun saya</a>
        : <><a className="head-link" href="/masuk">Masuk</a><a className="btn btn-quiet head-cta" href="/daftar">Daftar</a></>}
    </div>
  </header>;
}
// --- end of site header ---

// --- site footer ---
export function SiteFooter({ user }: { user: User | null; canLogin?: boolean }) {
  return <footer className="site-foot wrap">
    <img src="/brand/lockup-horizontal.svg" width="130" height="26" alt="LaporJalan" />
    <nav className="foot-nav" aria-label="Semua halaman">
      <a href="/">Beranda</a><a href="/peta">Peta laporan</a>
      {user?.role === 'admin' && <a href="/admin">Admin</a>}
      {user ? <a href="/akun">Akun saya</a> : <><a href="/daftar">Daftar</a><a href="/masuk">Masuk</a></>}
    </nav>
    <p>Bukan layanan resmi pemerintah. Data peta © kontributor OpenStreetMap.</p>
  </footer>;
}
// --- end of site footer ---
