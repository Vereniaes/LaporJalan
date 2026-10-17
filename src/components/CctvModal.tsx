// Expand the static preview in a keyboard-accessible dialog.
import React, { useState } from 'react';
import { useModalDialog } from './useModalDialog';
import { CctvCamera } from '../types';
import { CctvImage } from './CctvPopover';
import { X, Maximize2 } from 'lucide-react';

export const CctvModal: React.FC<{ cctv: CctvCamera; onClose: () => void }> = ({ cctv, onClose }) => {
  const dialogRef = useModalDialog();
  const [message, setMessage] = useState('');
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await dialogRef.current!.requestFullscreen();
      setMessage('');
    } catch { setMessage('Layar perangkat tidak tersedia. Pratinjau tetap dapat digunakan.'); }
  };
  return (
    <dialog ref={dialogRef} aria-labelledby="cctv-expanded-title" onCancel={event => { event.preventDefault(); onClose(); }}
      className="cctv-expanded m-auto h-[calc(100dvh-32px)] max-h-none w-[calc(100vw-32px)] max-w-none overflow-hidden rounded-2xl border-0 bg-slate-950 p-0 text-white backdrop:bg-black/60">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-3">
          <div><h2 id="cctv-expanded-title" className="text-sm font-semibold">{cctv.name}</h2><p className="mt-1 text-xs text-slate-400">Gambar contoh - media statis</p></div>
          <div className="flex gap-2">
            <button onClick={fullscreen} title="Mode layar perangkat" className="rounded-lg p-2 hover:bg-slate-800"><Maximize2 className="h-5 w-5" /></button>
            <button onClick={onClose} title="Tutup layar penuh" className="rounded-lg p-2 hover:bg-slate-800"><X className="h-5 w-5" /></button>
          </div>
        </header>
        <div className="min-h-0 flex-1"><CctvImage key={cctv.snapshotUrl} cctv={cctv} /></div>
        {message && <p role="status" className="p-3 text-xs text-slate-300">{message}</p>}
      </div>
    </dialog>
  );
};
