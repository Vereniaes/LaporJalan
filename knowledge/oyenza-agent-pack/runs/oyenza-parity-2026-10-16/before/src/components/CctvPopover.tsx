/*
file ini buat kartu popover kamera cctv yang tertambat langsung di atas pin peta
gaya visual minimalis persis transit.oyenza.com/cctv dengan badge LIVE dan kontrol video
Todo:
-> render kartu mengambang tertambat di koordinat cctv
-> tombol tutup yang memutus media playback dan membersihkan listener
-> tombol layar penuh dan bagikan
*/

import React, { useState } from 'react';
import { CctvCamera } from '../types';
import { X, Maximize2, Radio, Share2, Check } from 'lucide-react';

interface CctvPopoverProps {
  cctv: CctvCamera;
  onClose: () => void;
  onFullscreen?: () => void;
}

export const CctvPopover: React.FC<CctvPopoverProps> = ({
  cctv,
  onClose,
  onFullscreen,
}) => {
  const [copied, setCopied] = useState(false);

  // helper salin tautan kamera cctv --------------------------------------------------------------------------
  // input param : id kamera
  // output : status copied boolean
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // end of helper ---------------------------------------------------------------------------------------------

  return (
    <div className="w-[320px] sm:w-[350px] bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-fade-in pointer-events-auto font-sans">
      {/* header ruas dan tombol tutup */}
      <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <h4 className="text-xs font-bold text-slate-100 truncate">
            {cctv.name}
          </h4>
          <p className="text-[10px] text-slate-400 truncate">
            {cctv.location} • Jasa Marga
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Tutup CCTV"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* viewport video streaming live 16:9 */}
      <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
        <img
          src={cctv.snapshotUrl}
          alt={cctv.name}
          className="w-full h-full object-cover"
        />

        {/* badge live denut merah */}
        <div className="absolute top-2.5 left-2.5 bg-red-600/90 text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center space-x-1 shadow-md">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* badge telemetri kamera */}
        <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-slate-300">
          Sudut {cctv.angle}° • {cctv.distanceMeters}m
        </div>
      </div>

      {/* footer aksi tombol layar penuh dan bagikan */}
      <div className="px-3.5 py-2 bg-slate-900/95 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 font-mono">
          Update: {cctv.lastUpdated} WIB
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold transition-all"
            title="Bagikan Tautan"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span>Bagikan</span>
              </>
            )}
          </button>

          {onFullscreen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFullscreen();
              }}
              className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all"
              title="Layar Penuh"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Layar Penuh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
