/* Sign-in dialog on the map, without publishing the reporter's address.
Todo:
-> exchange an email link only after an explicit confirmation
-> otherwise masuk or daftar with a password in place, so a draft or an open report is not lost
*/
import { FormEvent, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { errorMessage, LoginIntent } from './community';
import { AuthForm, type AuthMode, type SignIn } from './AuthForm';

export function EmailLogin({ link, returnTo, emailLink = false, onExchange, onSignIn, onClose }: {
  link: string; returnTo: LoginIntent; emailLink?: boolean; onExchange: (token: string) => Promise<void>; onSignIn: SignIn; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<AuthMode>('masuk');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { dialog.current?.showModal(); }, []);
  async function confirm(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await onExchange(link); onClose(); } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); }
  }
  const title = link ? 'Masuk melalui email' : mode === 'daftar' ? 'Daftar akun' : 'Masuk';
  return <dialog className="lj-login" ref={dialog} aria-labelledby="login-heading" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <button className="lj-dialog-close" aria-label="Tutup masuk" disabled={busy} onClick={onClose}><X size={20} /></button>
    <h2 id="login-heading">{title}</h2>
    {link ? <>
      <p>Konfirmasi untuk membuka akses ke laporan. Tautan hanya dapat digunakan sekali.</p>
      <form className="lj-form" onSubmit={confirm}>
        {error && <p className="lj-form-error" role="alert">{error}</p>}
        <button className="lj-primary" disabled={busy}>{busy ? 'Memproses…' : 'Konfirmasi masuk'}</button>
        {error && <button type="button" onClick={onClose}>Tutup dan minta tautan baru</button>}
      </form>
    </> : <>
      <p>{mode === 'daftar' ? 'Buat akun untuk mengirim dan memantau laporan.' : 'Masuk untuk membuat dan mengelola laporan.'} Alamat email tidak ditampilkan pada laporan publik.</p>
      <AuthForm key={mode} mode={mode} emailLink={emailLink} returnTo={returnTo} onSignIn={async (path, body) => { await onSignIn(path, body); onClose(); }}
        footer={<button type="button" className="lj-text-action" onClick={() => setMode(mode === 'daftar' ? 'masuk' : 'daftar')}>{mode === 'daftar' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}</button>} />
    </>}
  </dialog>;
}
