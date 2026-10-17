// A compact overview of reports and demonstration cameras.
import React, { useState } from 'react';
import { X, HardHat, Video, Shovel } from 'lucide-react';

interface MascotBannerProps {
  reportCount: number;
  cameraCount: number;
  onOpenReportModal: () => void;
  onFilterType: (type: 'all' | 'pothole' | 'trench' | 'cctv') => void;
}

export const MascotBanner: React.FC<MascotBannerProps> = ({ reportCount, cameraCount, onOpenReportModal, onFilterType }) => {
  const [showBanner, setShowBanner] = useState(true);
  return (
    <div className="space-y-3">
      {showBanner && <div className="flex items-start gap-3 rounded-2xl bg-violet-50/60 p-3">
        <HardHat className="h-8 w-8 shrink-0 text-violet-500" />
        <div className="flex-1 text-xs leading-relaxed">
          <p className="font-semibold text-slate-800">Pantau kondisi jalan</p>
          <p className="text-slate-500">{reportCount} laporan tersedia. Pilih titik untuk melihat detail.</p>
          <button className="mt-1 font-semibold text-violet-700" onClick={onOpenReportModal}>Tambahkan laporan</button>
        </div>
        <button aria-label="Tutup ringkasan" onClick={() => setShowBanner(false)} className="p-1 text-slate-500"><X className="h-4 w-4" /></button>
      </div>}
      <div className="grid grid-cols-2 gap-2 text-left text-xs">
        <button onClick={() => onFilterType('trench')} className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
          <Shovel className="h-4 w-4 text-amber-600" /><span>Galian utilitas</span>
        </button>
        <button onClick={() => onFilterType('cctv')} className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
          <Video className="h-4 w-4 text-violet-500" /><span>{cameraCount} kamera contoh</span>
        </button>
      </div>
    </div>
  );
};
