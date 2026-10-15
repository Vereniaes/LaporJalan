/*
file ini buat card detail laporan kerusakan jalan bergaya bus jakarta live
ada info dinas wewenang otomatis, dimensi lubang, sama pencocokan kamera cctv
Todo:
-> tampilin kartu wewenang dinas (nasional / provinsi / kota)
-> tampilin 3 kotak metrik (kedalaman, lebar, skor prioritas)
-> tampilin potongan live snapshot cctv terdekat
-> ada tombol buka penampil 3d potongan melintang
*/

import React from 'react';
import { DamageReport, CctvCamera } from '../types';
import { Layers, Video, ShieldCheck, MapPin, AlertOctagon, Clock } from 'lucide-react';

interface DamageReportCardProps {
  report: DamageReport;
  matchedCctv?: CctvCamera;
  onOpen3DInspector: () => void;
  onOpenStreetSimulation: () => void;
  onOpenCompare: () => void;
  onOpenCctv: (cctv: CctvCamera) => void;
}

export const DamageReportCard: React.FC<DamageReportCardProps> = ({
  report,
  matchedCctv,
  onOpen3DInspector,
  onOpenStreetSimulation,
  onOpenCompare,
  onOpenCctv
}) => {
  const getSeverityBadge = () => {
    switch (report.severity) {
      case 'berat':
        return { bg: 'bg-red-50 text-red-600 border-red-200', text: 'BAHAYA KRITIS' };
      case 'sedang':
        return { bg: 'bg-amber-50 text-amber-600 border-amber-200', text: 'PERHATIAN' };
      default:
        return { bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'PANTAUAN' };
    }
  };

  const badge = getSeverityBadge();

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-4">
      {/* header wewenang dinas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-500">
            {report.jurisdiction}
          </span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
          {badge.text}
        </span>
      </div>

      {/* judul & alamat */}
      <div>
        <h2 className="text-base font-bold text-slate-900 leading-snug">
          {report.title}
        </h2>
        <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{report.address}</span>
        </div>
      </div>

      {/* 3 kolom metrik dimensi jalan */}
      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
          <span className="block text-[11px] font-medium text-slate-400">Kedalaman</span>
          <span className="text-base font-bold text-red-600">
            ~{report.depthCm} <span className="text-xs font-normal">cm</span>
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
          <span className="block text-[11px] font-medium text-slate-400">Estimasi Lebar</span>
          <span className="text-base font-bold text-slate-800">
            ~{report.widthCm} <span className="text-xs font-normal">cm</span>
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
          <span className="block text-[11px] font-medium text-slate-400">Bina Marga UP</span>
          <span className="text-base font-bold text-amber-600">
            {report.upScore}
          </span>
        </div>
      </div>

      {/* tombol buka inspeksi 3d potongan melintang */}
      <div className="space-y-2">
        <button
          onClick={onOpen3DInspector}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs transition-all shadow-sm active:scale-98"
        >
          <Layers className="w-4 h-4" />
          <span>Inspeksi Potongan Melintang 3D (Putar 360°)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenStreetSimulation}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs transition-all shadow-sm active:scale-98"
          >
            <span>🐱</span>
            <span>Simulasi Lapangan 3D</span>
          </button>
          <button
            onClick={onOpenCompare}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-2xl font-bold text-xs transition-all active:scale-98"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sebelum vs Sesudah</span>
          </button>
        </div>
      </div>

      {/* bagian dicocokkan dengan cctv */}
      {matchedCctv && (
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>Dicocokkan dengan kamera</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Aktif</span>
            </span>
          </div>

          <div
            onClick={() => onOpenCctv(matchedCctv)}
            className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors group"
          >
            <div className="relative w-18 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-200">
              <img
                src={matchedCctv.snapshotUrl}
                alt={matchedCctv.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[9px] font-mono text-white">
                LIVE
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-mono font-bold text-slate-800">
                {matchedCctv.lastUpdated} WIB
              </span>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {matchedCctv.location}
              </p>
              <span className="text-[10px] text-blue-600 font-medium inline-block mt-0.5">
                Ketuk untuk intip kamera →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* deskripsi laporan warga */}
      <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl leading-relaxed border border-slate-100">
        <span className="font-semibold text-slate-700 block mb-1">Catatan Lapangan:</span>
        {report.description}
      </div>
    </div>
  );
};
