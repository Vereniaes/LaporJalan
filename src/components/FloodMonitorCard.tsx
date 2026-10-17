// Keep the water report shortcut without inventing a measured water level.
import React from 'react';
import { Waves, ChevronRight } from 'lucide-react';

export const FloodMonitorCard: React.FC<{ onSelectPotholeWithWater: () => void }> = ({ onSelectPotholeWithWater }) => (
  <button onClick={onSelectPotholeWithWater} className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left hover:bg-slate-50">
    <Waves className="h-5 w-5 shrink-0 text-sky-500" />
    <div className="flex-1 text-xs">
      <p className="font-semibold text-slate-700">Pantauan genangan</p>
      <p className="mt-0.5 text-slate-500">Data ketinggian air belum tersedia.</p>
    </div>
    <ChevronRight className="h-4 w-4 text-slate-400" />
  </button>
);
