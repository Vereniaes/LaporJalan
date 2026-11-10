/* Todo:
-> one form for masuk and daftar: email + kata sandi (+ nama tampilan when registering)
-> used by the /masuk and /daftar pages and by the login dialog on the map
    -> the email link stays as a second way in, only when the service can send email
*/
import { FormEvent, ReactNode, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { errorMessage, LoginIntent, postJson } from './community';

export type AuthMode = 'masuk' | 'daftar';
export type SignIn = (path: '/auth/login' | '/auth/register', body: Record<string, string>) => Promise<void>;

// --- auth form ---
export function AuthForm({ mode, onSignIn, emailLink = false, returnTo = 'mine', disabled = false, footer }: {
  mode: AuthMode; onSignIn: SignIn; emailLink?: boolean; returnTo?: LoginIntent; disabled?: boolean; footer?: ReactNode;
}) {
  const emailInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const register = mode === 'daftar';
  async function run(action: () => Promise<void>) {
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (failure) { setError(errorMessage(failure)); } finally { setBusy(false); }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void run(() => onSignIn(register ? '/auth/register' : '/auth/login', register ? { email, password, displayName: name.trim() } : { email, password }));
  }
  // the link needs only a valid email; the password field is not checked
  function sendLink() {
    if (!emailInput.current?.reportValidity()) return;
    void run(async () => setMessage((await postJson<{ message: string }>('/auth/link', { email, returnTo })).message));
  }
  return <form className="lj-form lj-auth-form" onSubmit={submit}>
    <fieldset disabled={busy || disabled}>
      <label>Email<input ref={emailInput} type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label>
      {register && <label>Nama tampilan <span>(opsional)</span><input autoComplete="nickname" maxLength={40} value={name} onChange={event => setName(event.target.value)} /></label>}
      <label>
        Kata sandi
        <div className="lj-password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete={register ? 'new-password' : 'current-password'}
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="lj-password-toggle"
            onClick={() => setShowPassword(visible => !visible)}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            disabled={busy || disabled}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
    </fieldset>
    {error && <p className="lj-form-error" role="alert">{error}</p>}
    {message && <p className="lj-form-success" role="status">{message}</p>}
    <button className="lj-primary" disabled={busy || disabled}>{busy ? 'Memproses…' : register ? 'Daftar' : 'Masuk'}</button>
    {emailLink && !register && <button type="button" className="lj-secondary" disabled={busy || disabled} onClick={sendLink}>Kirim tautan masuk</button>}
    {footer}
  </form>;
}
// --- end of auth form ---
