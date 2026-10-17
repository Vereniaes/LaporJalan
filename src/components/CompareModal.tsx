/*
file ini buat mode komparasi sebelum vs sesudah perbaikan jalan
Todo:
-> slider interaktif sebelum vs sesudah tambal aspal
-> komparasi tanggal lapor vs tanggal selesai perbaikan
-> kartu audit mutu bina marga (material, ketebalan overlay cm)
*/

import React, { useState } from 'react';
import { useModalDialog } from './useModalDialog';
import { X, CheckCircle2, AlertTriangle, ArrowLeftRight, Clock, ShieldCheck, HardHat } from 'lucide-react';

interface CompareItem {
  id: string;
  title: string;
  location: string;
  jurisdiction: string;
  beforeImg: string;
  afterImg: string;
  reportDate: string;
  fixedDate: string;
  depthCm: number;
  contractor: string;
  material: string;
  costEstimate: string;
}

const SAMPLE_COMPARE_DATA: CompareItem[] = [
  {
    id: 'cmp-01',
    title: 'Penambalan Lubang Kritis Thamrin Simpang C09',
    location: 'Jl. M.H. Thamrin No. 28, Menteng (Arah Bundaran HI)',
    jurisdiction: 'Jalan Nasional (BBPJN PUPR)',
    beforeImg: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    afterImg: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    reportDate: '12 Oktober 2026 • 08:30 WIB',
    fixedDate: '13 Oktober 2026 • 23:45 WIB (Tuntas <36 Jam)',
    depthCm: 7.5,
    contractor: 'Satker PJN Wilayah I BBPJN DKI Jakarta',
    material: 'Hotmix Asphalt Concrete - Wearing Course (AC-WC) 5cm',
    costEstimate: 'Pemeliharaan Rutin Swakelola (P5 Patching)'
  },
  {
    id: 'cmp-02',
    title: 'Penutupan Bekas Galian Utilitas Kabel Sudirman',
    location: 'Jl. Jenderal Sudirman (Depan Chase Plaza)',
    jurisdiction: 'Jalan Provinsi (Bina Marga DKI)',
    beforeImg: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    afterImg: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    reportDate: '10 Oktober 2026 • 14:15 WIB',
    fixedDate: '11 Oktober 2026 • 04:00 WIB',
    depthCm: 4.8,
    contractor: 'Vendor Utilitas di bawah supervisi Dinas Bina Marga',
    material: 'Pemadatan Agregat Kelas A + Cold Mix Overlay',
    costEstimate: 'Tanggung Jawab Pemilik Utilitas (Klaim Jaminan)'
  }
];

interface CompareModalProps {
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ onClose }) => {
  const dialogRef = useModalDialog();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50); // persentase pembagian 0 - 100
  const item = SAMPLE_COMPARE_DATA[selectedIdx];

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pos)));
  };

  return (
    <dialog ref={dialogRef} aria-labelledby="compare-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} className="m-auto w-[calc(100vw-24px)] max-w-xl max-h-[calc(100dvh-24px)] overflow-y-auto border-0 rounded-3xl bg-transparent p-0 backdrop:bg-slate-900/60">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-floating border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="compare-dialog-title" className="font-bold text-slate-800 text-sm leading-tight">
                  Contoh perbandingan jalan
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Sebelum vs Sesudah
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Data dan gambar ilustratif - bukan bukti perbaikan
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup perbandingan"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* selector lokasi komparasi */}
        <div className="px-5 pt-3 pb-2 flex items-center space-x-2 overflow-x-auto bg-slate-50 border-b border-slate-100">
          {SAMPLE_COMPARE_DATA.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setSelectedIdx(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedIdx === i
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Titik {i + 1}: {c.title.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* area slider komparasi interaktif */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {item.title}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
          </div>

          {/* interactive split view slider */}
          <div
            className="relative w-full h-64 rounded-3xl overflow-hidden cursor-ew-resize select-none border border-slate-200 shadow-inner group"
            role="slider" tabIndex={0} aria-label="Batas perbandingan" aria-valuemin={5} aria-valuemax={95} aria-valuenow={sliderPos}
            onKeyDown={event => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                setSliderPos(value => Math.max(5, Math.min(95, value + (event.key === 'ArrowRight' ? 5 : -5))));
              }
            }}
            onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e)}
            onClick={handleSliderMove}
            onTouchMove={handleSliderMove}
          >
            {/* gambar sesudah (layer bawah penuh) */}
            <img
              src={item.afterImg}
              alt="Kondisi Ditambal"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-3 right-3 bg-emerald-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SESUDAH DITAMBAL</span>
            </div>

            {/* gambar sebelum (layer atas dengan clip-path presisi tanpa distorsi) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img
                src={item.beforeImg}
                alt="Kondisi Rusak"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SEBELUM (RUSAK)</span>
              </div>
            </div>

            {/* garis pemisah dan pegangan slider */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-md border-2 border-slate-800 flex items-center justify-center text-slate-800 -ml-0.5 group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* petunjuk geser */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/65 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium text-white shadow-sm pointer-events-none">
              Geser slider ke kiri / kanan
            </div>
          </div>

          {/* detail data penanganan */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Waktu Pelaporan Warga:</span>
              </span>
              <span className="font-semibold text-slate-800">{item.reportDate}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Waktu Selesai Ditangani:</span>
              </span>
              <span className="font-bold text-emerald-700">{item.fixedDate}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center space-x-1">
                <HardHat className="w-3.5 h-3.5 text-amber-500" />
                <span>Unit Pelaksana:</span>
              </span>
              <span className="font-semibold text-slate-800">{item.contractor}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Spesifikasi Material:</span>
              <span className="font-medium text-slate-700 text-right">{item.material}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-2xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Tutup Komparasi
          </button>
        </div>
      </div>
    </dialog>
  );
};
