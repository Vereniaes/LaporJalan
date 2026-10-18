/* Email sign-in dialog, without publishing the reporter's address.
Todo:
-> exchange a link only after an explicit confirmation
*/
import { FormEvent, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { errorMessage, postJson } from './community';

export function EmailLogin({ link, onExchange, onClose }: { link: string; onExchange: (token: string) => Promise<void>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
  useEffect(() => { dialog.current?.showModal(); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (link) { await onExchange(link); onClose(); }
      else { const result = await postJson<{ message: string }>('/auth/link', { email }); setMessage(result.message); }
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <dialog className="lj-login" ref={dialog} aria-labelledby="login-heading" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <button className="lj-dialog-close" aria-label="Tutup masuk" disabled={busy} onClick={onClose}><X size={20} /></button>
    <h2 id="login-heading">Masuk melalui email</h2>
    <p>{link ? 'Konfirmasi untuk membuka akses ke laporan. Tautan hanya dapat digunakan sekali.' : 'Tautan masuk akan dikirim ke email. Alamat email tidak ditampilkan pada laporan publik.'}</p>
    <form className="lj-form" onSubmit={submit}>
      {!link && <label>Email<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label>}
      {error && <p className="lj-form-error" role="alert">{error}</p>}
      {message && <p className="lj-form-success" role="status">{message}</p>}
      <button className="lj-primary" disabled={busy}>{busy ? 'Memproses…' : link ? 'Konfirmasi masuk' : 'Kirim tautan masuk'}</button>
      {link && error && <button type="button" onClick={onClose}>Tutup dan minta tautan baru</button>}
    </form>
  </dialog>;
}
