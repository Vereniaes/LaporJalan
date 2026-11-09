/* Todo:
-> /masuk and /daftar (/regis redirects here): email + kata sandi, the same form as the map dialog
-> after sign-in go to ?lanjut= (same-origin path only), else /akun
    -> a visitor who is already signed in goes straight on
    -> when the service cannot take sign-ins, say so and keep the form disabled
*/
import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { AuthForm, type AuthMode } from '../public-reports/AuthForm';
import { capabilityMessage, useCapabilities, useEmailSession } from '../public-reports/community';
import { SiteFooter, SiteHeader } from '../home/SiteChrome';
import { nextPath } from './nextPath';
import '../public-reports/public-reports.css';
import '../public-reports/community.css';
import '../home/home.css';
import './account.css';

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const session = useEmailSession();
  const { capabilities, loading } = useCapabilities();
  const params = new URLSearchParams(location.search);
  const next = nextPath(params.get('lanjut'));
  const keep = params.has('lanjut') ? `?lanjut=${encodeURIComponent(next)}` : '';
  const register = mode === 'daftar';
  const available = Boolean(capabilities?.login);
  useEffect(() => { document.title = `${register ? 'Daftar' : 'Masuk'} - LaporJalan`; }, [register]);
  useEffect(() => { if (session.user) location.replace(next); }, [session.user, next]);

  return <MotionConfig reducedMotion="user"><div className="home">
    <a className="skip" href="#isi">Ke isi halaman</a>
    <SiteHeader user={session.user} canLogin={available} />
    <main id="isi" className="auth wrap">
      <section className="auth-card" aria-labelledby="t-auth">
        <p className="kicker">Akun warga</p>
        <h1 className="h2" id="t-auth">{register ? 'Daftar akun.' : 'Masuk.'}</h1>
        <p className="auth-lead">{register
          ? 'Akun dipakai untuk mengirim laporan dan memantau pembaruannya. Peta tetap dapat dibuka tanpa akun.'
          : 'Masuk untuk membuat laporan dan melihat status laporan yang pernah dikirim.'}</p>
        {!loading && !available && <p className="lj-community-warning" role="status">{capabilityMessage(capabilities) || 'Akun warga belum tersedia.'}</p>}
        <AuthForm key={mode} mode={mode} disabled={!available} emailLink={Boolean(capabilities?.emailLink)} onSignIn={session.signIn}
          footer={<p className="auth-switch">{register ? <>Sudah punya akun? <a href={`/masuk${keep}`}>Masuk</a></> : <>Belum punya akun? <a href={`/daftar${keep}`}>Daftar</a></>}</p>} />
      </section>
      <img className="auth-miko" src={`/home/miko/${register ? 'clipboard' : 'phone'}-512.webp`} width="512" height="512" alt="" decoding="async" />
    </main>
    <SiteFooter user={session.user} canLogin={available} />
  </div></MotionConfig>;
}
