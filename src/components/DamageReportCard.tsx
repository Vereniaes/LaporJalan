// Show report estimates and open inspection on the map.
import React from 'react';
import { DamageReport, CctvCamera } from '../types';
import { Eye, MapPin, Video } from 'lucide-react';

interface DamageReportCardProps {
  report: DamageReport;
  matchedCctv?: CctvCamera;
  onOpen3DInspector: () => void;
  onOpenStreetSimulation: () => void;
  onOpenCompare: () => void;
  onOpenCctv: (cctv: CctvCamera) => void;
}

export const DamageReportCard: React.FC<DamageReportCardProps> = ({ report, matchedCctv, onOpen3DInspector, onOpenStreetSimulation, onOpenCompare, onOpenCctv }) => {
  const dimension = (value: number) => Number.isFinite(value) && value >= 0 ? `${value} cm` : 'Belum tersedia';
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold leading-snug text-slate-900">{report.title}</h2>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${report.severity === 'berat' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>{report.severity}</span>
      </div>
      <p className="flex items-start gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" />{report.address}</p>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
        <div><p className="text-slate-500">Kedalaman</p><p className="mt-1 font-semibold text-slate-900">{dimension(report.depthCm)}</p></div>
        <div><p className="text-slate-500">Lebar</p><p className="mt-1 font-semibold text-slate-900">{dimension(report.widthCm)}</p></div>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">Estimasi laporan - metode pengukuran belum diverifikasi.</p>
      <button onClick={onOpenStreetSimulation} className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-700">
        <Eye className="h-4 w-4" />Lihat Lapangan 3D
      </button>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
        <button onClick={onOpen3DInspector} className="rounded-xl border border-slate-200 py-2 hover:bg-slate-50">Profil ilustratif</button>
        <button onClick={onOpenCompare} className="rounded-xl border border-slate-200 py-2 hover:bg-slate-50">Sebelum vs Sesudah</button>
      </div>
      {matchedCctv && <button onClick={() => onOpenCctv(matchedCctv)} className="flex w-full items-center gap-2 rounded-xl bg-slate-50 p-2 text-left hover:bg-slate-100">
        <img src={matchedCctv.snapshotUrl} alt="" className="h-12 w-16 rounded-lg object-cover" />
        <div className="min-w-0 text-xs"><p className="truncate font-medium text-slate-700">{matchedCctv.name}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500"><Video className="h-3 w-3" />Gambar contoh</p></div>
      </button>}
      <details className="border-t border-slate-100 pt-2 text-xs text-slate-600">
        <summary className="cursor-pointer font-medium">Catatan laporan</summary>
        <p className="mt-2 leading-relaxed">{report.description}</p>
        <p className="mt-2 text-[11px] text-slate-500">{report.jurisdiction} - penetapan belum diverifikasi.</p>
        <p className="mt-1 text-[11px] text-slate-500">Skor prioritas contoh: {report.upScore}</p>
      </details>
    </section>
  );
};
