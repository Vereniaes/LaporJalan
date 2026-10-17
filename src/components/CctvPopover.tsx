// Show a static camera example anchored to the map.
import React, { useEffect, useRef, useState } from 'react';
import { CctvCamera } from '../types';
import { X, Maximize2, Copy } from 'lucide-react';

export const CctvImage: React.FC<{ cctv: CctvCamera }> = ({ cctv }) => {
  const [failed, setFailed] = useState(false);
  return failed ? <p role="status" className="p-8 text-center text-sm text-slate-300">Gambar tidak tersedia.</p> :
    <img src={cctv.snapshotUrl} alt={`Gambar contoh untuk ${cctv.name}`} onError={() => setFailed(true)} className="h-full w-full object-contain" />;
};

interface CctvPopoverProps {
  cctv: CctvCamera;
  onClose: () => void;
  onFullscreen: () => void;
}

export const CctvPopover: React.FC<CctvPopoverProps> = ({ cctv, onClose, onFullscreen }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copyStatus, setCopyStatus] = useState('');
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  const copyLocation = async () => {
    try {
      await navigator.clipboard.writeText(`${cctv.lat}, ${cctv.lng}`);
      setCopyStatus('Lokasi tersalin');
    } catch { setCopyStatus('Lokasi tidak dapat disalin'); }
  };
  return (
    <section aria-label="Pratinjau CCTV" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } }}
      className="w-[min(320px,calc(100vw-112px))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl pointer-events-auto">
      <div className="flex items-start justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0"><h4 className="truncate text-xs font-semibold">{cctv.name}</h4><p className="mt-0.5 truncate text-[10px] text-slate-500">{cctv.location}</p></div>
        <button ref={closeRef} onClick={onClose} title="Tutup CCTV" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
      </div>
      <div className="relative aspect-video bg-slate-950">
        <CctvImage key={cctv.snapshotUrl} cctv={cctv} />
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[9px] font-semibold text-white">{cctv.status === 'maintenance' ? 'Pemeliharaan' : 'Gambar contoh'}</span>
      </div>
      <p className="px-3 pt-2 text-[10px] text-slate-500">Media statis - sumber dan waktu belum diverifikasi.</p>
      <div className="flex items-center justify-between gap-2 p-3">
        <button onClick={copyLocation} className="flex items-center gap-1 text-[10px] text-slate-600"><Copy className="h-3 w-3" />Salin lokasi contoh</button>
        <button onClick={onFullscreen} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-[10px] font-semibold"><Maximize2 className="h-3 w-3" />Layar Penuh</button>
      </div>
      {copyStatus && <p role="status" className="px-3 pb-2 text-[10px] text-slate-600">{copyStatus}</p>}
    </section>
  );
};
