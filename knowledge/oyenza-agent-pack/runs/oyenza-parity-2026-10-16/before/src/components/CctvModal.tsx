/*
file ini buat popup intip kamera cctv lalu lintas ala oyenza screenshot 1
tampilin snapshot live, loader refresh 30 detik, sudut hadap, sama tombol layar penuh
Todo:
-> player viewport gelap dengan loader transisi
-> kartu bawah putih bersih: judul, lokasi, instansi pengelola, tombol layar penuh
*/

import React, { useState } from 'react';
import { CctvCamera } from '../types';
import { X, Maximize2, Radio, RefreshCw, ExternalLink } from 'lucide-react';

interface CctvModalProps {
  cctv: CctvCamera;
  onClose: () => void;
}

export const CctvModal: React.FC<CctvModalProps> = ({ cctv, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative bg-slate-950 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col transition-all ${
          isFullscreen ? 'w-full h-full max-w-5xl' : 'w-full max-w-lg'
        }`}
      >
        {/* player viewport gelap ala oyenza cctv */}
        <div className={`relative w-full bg-slate-950 flex items-center justify-center overflow-hidden ${isFullscreen ? 'flex-1' : 'h-64 md:h-72'}`}>
          <img
            src={cctv.snapshotUrl}
            alt={cctv.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-90'}`}
          />

          {/* overlay loading jika refresh */}
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-center px-6">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-3" />
              <p className="text-xs text-white/90 font-medium">
                Mengambil foto terbaru dari server pemilik kamera (bisa sampai 30 detik)...
              </p>
            </div>
          ) : (
            <div className="absolute top-3 left-3 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1.5 shadow-md">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>LIVE • {cctv.lastUpdated} WIB</span>
            </div>
          )}

          {/* tombol expand fullscreen di pojok kanan atas video */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md transition-colors"
            title="Layar Penuh"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* info sudut hadap dan jangkauan kamera */}
          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono">
            Sudut {cctv.angle}° • Jangkauan {cctv.distanceMeters}m
          </div>
        </div>

        {/* kartu bawah putih bersih ala oyenza screenshot 1 */}
        <div className="p-4 px-5 bg-white flex items-center justify-between border-t border-slate-100">
          <div className="pr-3">
            <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
              {cctv.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {cctv.location}
            </p>
            <span className="text-[10px] text-slate-400 block mt-1">
              CCTV: Dinas Perhubungan DKI Jakarta / ATCS
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isFullscreen ? 'Kecilkan' : 'Layar penuh'}</span>
            </button>

            <button
              onClick={handleRefresh}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              title="Perbarui Foto"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
