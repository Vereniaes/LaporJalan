/*
file ini komponen utama (orchestrator) aplikasi LaporJalan
nyatuin peta 3d maplibre, daftar laporan, modal foto kamera ai, sama inspeksi 3d
Todo:
-> handle state laporan jalan, kamera cctv, sama filter tab
-> tombol kamera melayang buat lapor instan 1-snap
-> buka tutup modal penampil 3d potongan melintang
*/

import React, { useState, useEffect } from 'react';
import { DamageReport, CctvCamera, TrafficSegment } from './types';
import { INITIAL_REPORTS, INITIAL_CCTV_CAMERAS, INITIAL_TRAFFIC_SEGMENTS } from './services/mockData';
import { Map3D } from './components/Map3D';
import { DamageReportCard } from './components/DamageReportCard';
import { DepthInspector3D } from './components/DepthInspector3D';
import { CameraReportModal } from './components/CameraReportModal';
import { MascotBanner } from './components/MascotBanner';
import { CompareModal } from './components/CompareModal';

import { FloodMonitorCard } from './components/FloodMonitorCard';
import { 
  Camera, 
  Search, 
  Map as MapIcon, 
  ListFilter, 
  Video, 
  AlertTriangle, 
  ChevronRight, 
  HardHat,
  Share2
} from 'lucide-react';

import { fetchReports, submitReportToBackend, searchPlacesApi } from './services/api.js';

export const App: React.FC = () => {
  const [reports, setReports] = useState<DamageReport[]>(INITIAL_REPORTS);
  const [cctvList] = useState<CctvCamera[]>(INITIAL_CCTV_CAMERAS);
  const [trafficSegments] = useState<TrafficSegment[]>(INITIAL_TRAFFIC_SEGMENTS);

  const [activeTab, setActiveTab] = useState<'peta' | 'laporan' | 'cctv'>('peta');
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(reports[0]);
  const [selectedCctv, setSelectedCctv] = useState<CctvCamera | null>(null);
  
  const [is3DInspectorOpen, setIs3DInspectorOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isStreetInspectActive, setIsStreetInspectActive] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pothole' | 'trench' | 'crack'>('all');

  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [targetFlyLocation, setTargetFlyLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // debounce pencarian alamat places
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setPlaceSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      const results = await searchPlacesApi(searchQuery);
      setPlaceSuggestions(results);
      setIsSearchingPlaces(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // sinkronisasi laporan dari backend jika aktif
  useEffect(() => {
    fetchReports().then((data) => {
      if (data && data.length > 0) {
        setReports(data);
        setSelectedReport(data[0]);
      }
    });
  }, []);

  // filter data laporan
  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || rep.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddReport = (newReport: DamageReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    setActiveTab('peta');
    submitReportToBackend(newReport);
  };

  const matchedCctv = selectedReport?.cctvMatchId
    ? cctvList.find((c) => c.id === selectedReport.cctvMatchId)
    : undefined;

  return (
    <div className="relative w-screen h-screen flex flex-col md:flex-row overflow-hidden bg-slate-100 font-sans">
      {/* ===================== SIDEBAR / DRAWER KIRI ===================== */}
      <div className="z-30 w-full md:w-[420px] lg:w-[460px] h-[48vh] md:h-full bg-white/95 md:bg-white backdrop-blur-md md:backdrop-blur-none border-t md:border-t-0 md:border-r border-slate-200/80 shadow-2xl flex flex-col shrink-0 order-2 md:order-1 transition-all">
        {/* header brand bergaya */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20">
              🚧
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  LaporJalan
                </h1>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  3D Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Sistem Deteksi Citra & Pantau Galian
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCameraModalOpen(true)}
            className="flex items-center space-x-1.5 py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Lapor</span>
          </button>
        </div>

        {/* navigasi pill tab bergaya bus jakarta live */}
        <div className="px-4 md:px-5 pt-3 pb-2 flex items-center space-x-2 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('peta')}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'peta'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Peta 3D</span>
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'laporan'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Daftar ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cctv')}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'cctv'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>CCTV ({cctvList.length})</span>
          </button>
        </div>

        {/* kotak pencarian jalan / lubang dengan autocomplete places */}
        <div className="relative px-4 md:px-5 py-2 shrink-0 bg-white">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari jalan seluruh Indonesia (Google Places)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          {/* dropdown hasil autocomplete places */}
          {placeSuggestions.length > 0 && (
            <div className="absolute left-4 md:left-5 right-4 md:right-5 top-full mt-1 bg-white rounded-2xl shadow-floating border border-slate-200/80 z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {placeSuggestions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSearchQuery(p.name);
                    if (p.lng && p.lat) {
                      setTargetFlyLocation({ lng: p.lng, lat: p.lat });
                    }
                    setPlaceSuggestions([]);
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-bold text-slate-800 block truncate">{p.name}</span>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">{p.address}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* kontainer scrollable panel */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-3 space-y-4">
          {activeTab === 'peta' && (
            <>
              {/* banner maskot miko */}
              <MascotBanner
                onOpenReportModal={() => setIsCameraModalOpen(true)}
                onFilterType={(t) => {
                  if (t === 'cctv') setActiveTab('cctv');
                  else {
                    setFilterType(t as any);
                    setActiveTab('laporan');
                  }
                }}
              />

              {/* kartu pantauan genangan & banjir jalanan ala oyen banjir */}
              <FloodMonitorCard
                onSelectPotholeWithWater={() => {
                  const floodReport = reports.find((r) => r.id === 'rep-001') || reports[0];
                  setSelectedReport(floodReport);
                }}
              />

              {/* card detail laporan terpilih */}
              {selectedReport ? (
                <DamageReportCard
                  report={selectedReport}
                  matchedCctv={matchedCctv}
                  onOpen3DInspector={() => setIs3DInspectorOpen(true)}
                  onOpenStreetSimulation={() => setIsStreetInspectActive(true)}
                  onOpenCompare={() => setIsCompareOpen(true)}
                  onOpenCctv={(c) => setSelectedCctv(c)}
                />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Pilih titik kerusakan di peta untuk melihat detail dimensi 3D dan kamera pantau.
                </div>
              )}
            </>
          )}

          {activeTab === 'laporan' && (
            <div className="space-y-3">
              {/* filter pill kerusakan */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                {(['all', 'pothole', 'trench', 'crack'] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setFilterType(ft)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                      filterType === ft
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {ft === 'all'
                      ? 'Semua'
                      : ft === 'pothole'
                      ? 'Lubang'
                      : ft === 'trench'
                      ? 'Galian Utilitas'
                      : 'Retak'}
                  </button>
                ))}
              </div>

              {/* daftar card laporan */}
              <div className="space-y-2.5">
                {filteredReports.map((rep) => {
                  const isSel = selectedReport?.id === rep.id;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => {
                        setSelectedReport(rep);
                        setActiveTab('peta');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSel
                          ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
                          : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              rep.severity === 'berat'
                                ? 'bg-red-500'
                                : rep.severity === 'sedang'
                                ? 'bg-amber-500'
                                : 'bg-yellow-500'
                            }`}
                          ></span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {rep.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-1">
                          {rep.address}
                        </p>
                        <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-400 font-medium">
                          <span>Kedalaman: ~{rep.depthCm}cm</span>
                          <span>•</span>
                          <span>{rep.jurisdiction.split(' ')[0]}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'cctv' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-500 block">
                Kamera Pengawas Lalu Lintas & Galian:
              </span>
              <div className="grid grid-cols-1 gap-3">
                {cctvList.map((cam) => (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedCctv(cam)}
                    className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all cursor-pointer flex space-x-3 group"
                  >
                    <div className="relative w-24 h-18 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={cam.snapshotUrl}
                        alt={cam.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.5 rounded text-[8px] font-mono text-white">
                        LIVE
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {cam.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {cam.lastUpdated}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {cam.location}
                      </p>
                      <div className="mt-2 flex items-center space-x-2 text-[10px] text-blue-600 font-medium">
                        <span>Sudut {cam.angle}°</span>
                        <span>•</span>
                        <span>Jangkauan {cam.distanceMeters}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== AREA PETA 3D UTAMA ===================== */}
      <div className="relative flex-1 h-[52vh] md:h-full order-1 md:order-2">
        <Map3D
          reports={filteredReports}
          cctvList={cctvList}
          trafficSegments={trafficSegments}
          selectedReport={selectedReport}
          selectedCctv={selectedCctv}
          onCloseCctv={() => setSelectedCctv(null)}
          targetFlyLocation={targetFlyLocation}
          isStreetInspectActive={isStreetInspectActive}
          onToggleStreetInspect={setIsStreetInspectActive}
          onSelectReport={(rep) => {
            setSelectedReport(rep);
            setActiveTab('peta');
          }}
          onSelectCctv={(cctv) => setSelectedCctv(cctv)}
        />

        {/* floating button ambil foto kamera di mobile */}
        <button
          onClick={() => setIsCameraModalOpen(true)}
          className="md:hidden absolute bottom-4 right-4 z-20 flex items-center space-x-2 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold text-xs shadow-floating active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Lapor 1-Snap AI</span>
        </button>
      </div>

      {/* ===================== MODAL-MODAL INTERAKTIF ===================== */}
      {is3DInspectorOpen && selectedReport && (
        <DepthInspector3D
          report={selectedReport}
          onClose={() => setIs3DInspectorOpen(false)}
        />
      )}

      {isCompareOpen && (
        <CompareModal
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {isCameraModalOpen && (
        <CameraReportModal
          onClose={() => setIsCameraModalOpen(false)}
          onSubmitReport={handleAddReport}
        />
      )}
    </div>
  );
};
export default App;
