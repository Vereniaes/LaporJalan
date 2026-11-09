/* Save a private name preference for future reports.
Todo:
-> keep publication consent on each report
*/
import { FormEvent, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { errorMessage, User } from './community';

export function AccountProfile({ user, writeAvailable = true, onSave, onClose }: { user: User; writeAvailable?: boolean; onSave: (name: string) => Promise<void>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(user.displayName ?? ''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { dialog.current?.showModal(); }, []);
  async function save(event: FormEvent) { event.preventDefault(); if (!writeAvailable) return; setBusy(true); setError(''); try { await onSave(name.trim()); onClose(); } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); } }
  return <dialog className="lj-login" ref={dialog} aria-labelledby="account-heading" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <button className="lj-dialog-close" aria-label="Tutup akun" disabled={busy} onClick={onClose}><X size={20} /></button><h2 id="account-heading">Akun</h2>
    <p>{user.email} · privat</p><form className="lj-form" onSubmit={save}><label>Nama tampilan <span>(opsional)</span><input maxLength={40} value={name} disabled={busy} onChange={event => setName(event.target.value)} /></label>
      <p>Nama menjadi pilihan untuk laporan baru. Publikasi nama memerlukan persetujuan pada setiap laporan. Laporan lama tetap menggunakan nama sebelumnya.</p>
      {!writeAvailable && <p role="status">Pengiriman laporan belum tersedia.</p>}{error && <p className="lj-form-error" role="alert">{error}</p>}<button className="lj-primary" disabled={busy || !writeAvailable}>{busy ? 'Menyimpan…' : 'Simpan nama pilihan'}</button>
    </form>
  </dialog>;
}
