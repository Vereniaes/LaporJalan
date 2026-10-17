/*
biar tampilan infrastruktur jalan gak kaku dan masyarakat nyaman melapor
Todo:
-> bikin avatar maskot kucing berhelm proyek kuning
-> card pengingat kondisi jam sibuk dan titik galian
*/

import React, { useState } from 'react';
import { X, HardHat, AlertTriangle, Video, Shovel } from 'lucide-react';

interface MascotBannerProps {
  onOpenReportModal: () => void;
  onFilterType: (type: 'all' | 'pothole' | 'trench' | 'cctv') => void;
}

export const MascotBanner: React.FC<MascotBannerProps> = ({ onOpenReportModal, onFilterType }) => {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="space-y-3">
      {/* banner peringatan maskot */}
      {showBanner && (
        <div className="relative bg-amber-50/90 border border-amber-200/80 rounded-3xl p-4 flex items-start space-x-3.5 shadow-sm">
          {/* avatar miko helm proyek */}
          <div className="relative w-12 h-12 rounded-2xl bg-amber-200/80 shrink-0 flex items-center justify-center text-2xl shadow-inner border border-amber-300">
            🐱
            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white p-0.5 rounded-full shadow-sm">
              <HardHat className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-amber-900">
                Miko Pantau Jalan
              </span>
              <span className="text-[10px] bg-amber-200/80 text-amber-800 font-bold px-2 py-0.2 rounded-full">
                Real-Time
              </span>
            </div>
            <p className="text-xs text-amber-800/90 leading-snug mt-0.5">
              Ada <strong>1 Lubang Kritis</strong> & <strong>2 Galian Utilitas</strong> di koridor Sudirman. Kurangi kecepatan motor saat hujan!
            </p>
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="text-amber-500 hover:text-amber-700 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onFilterType('trench')}
          className="flex items-center space-x-2.5 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-amber-300 transition-all text-left group"
        >
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-105 transition-transform">
            <Shovel className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              Galian Pipa/Kabel
            </span>
            <span className="text-[10px] text-slate-400">Pantau jalan dibongkar</span>
          </div>
        </button>

        <button
          onClick={() => onFilterType('cctv')}
          className="flex items-center space-x-2.5 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all text-left group"
        >
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              Miko CCTV
            </span>
            <span className="text-[10px] text-slate-400">4 Kamera aktif</span>
          </div>
        </button>
      </div>
    </div>
  );
};
