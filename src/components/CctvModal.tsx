/*
file ini buat popup intip kamera cctv lalu lintas
tampilin snapshot live, timestamp detik, sudut hadap, sama status jalanan
Todo:
-> modal popup cctv dengan gambar snapshot jelas
-> tampilin arah sudut hadap kamera dan status jalan
*/

import React from 'react';
import { CctvCamera } from '../types';
import { X, Video, Compass, Radio } from 'lucide-react';

interface CctvModalProps {
  cctv: CctvCamera;
  onClose: () => void;
}

export const CctvModal: React.FC<CctvModalProps> = ({ cctv, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-floating border border-slate-100 overflow-hidden flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight">
                {cctv.name}
              </h3>
              <p className="text-xs text-slate-500">{cctv.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* snapshot image frame */}
        <div className="relative w-full h-64 bg-slate-900">
          <img
            src={cctv.snapshotUrl}
            alt={cctv.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5 shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE CAM • {cctv.lastUpdated} WIB</span>
          </div>

          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-mono">
            Sudut: {cctv.angle}° • FOV: {cctv.fov}°
          </div>
        </div>

        {/* footer telemetry */}
        <div className="p-5 bg-white space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Jangkauan Pantau Kerucut:</span>
            </span>
            <span className="font-bold text-slate-800">
              {cctv.distanceMeters} meter ke badan jalan
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Kamera ini memantau secara berkala kondisi lalu lintas dan titik lubang/galian jalan untuk memastikan kelancaran pengendara dan mendeteksi potensi bahaya kecelakaan.
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-2xl hover:bg-slate-800 transition-colors"
          >
            Tutup Pantauan CCTV
          </button>
        </div>
      </div>
    </div>
  );
};
