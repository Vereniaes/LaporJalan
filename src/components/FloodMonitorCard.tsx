/*
file ini buat kartu pantauan banjir dan genangan air jalanan ala oyen banjir screenshot 2
membantu pengendara motor mendeteksi lubang bahaya yang tertutup genangan air keruh
Todo:
-> status siaga genangan air jalan (siaga 1, 2, 3)
-> peringatan lubang tersembunyi di bawah air
-> estimasi ketinggian air cm
*/

import React from 'react';
import { Waves, AlertTriangle, Droplets, ChevronRight } from 'lucide-react';

interface FloodMonitorCardProps {
  onSelectPotholeWithWater: () => void;
}

export const FloodMonitorCard: React.FC<FloodMonitorCardProps> = ({ onSelectPotholeWithWater }) => {
  return (
    <div
      onClick={onSelectPotholeWithWater}
      className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-3xl border border-blue-200/80 shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            🌊
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-xs font-bold text-slate-800 leading-tight">
                Miko Pantau Genangan
              </h4>
              <span className="text-[10px] font-bold bg-blue-200/80 text-blue-900 px-2 py-0.2 rounded-full">
                Siaga 3
              </span>
            </div>
            <p className="text-[11px] text-blue-800 font-medium mt-0.5">
              Tinggi Air ~20 cm di Jl. Thamrin Barat
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform mt-1" />
      </div>

      <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-start space-x-2 text-[11px] text-blue-900/80 leading-relaxed">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <span>
          <strong>Waspada Lubang Tak Kasat Mata: </strong>
          Genangan air hujan menutupi lubang sedalam 7.5 cm. Bahaya fatal bagi ban motor!
        </span>
      </div>
    </div>
  );
};
