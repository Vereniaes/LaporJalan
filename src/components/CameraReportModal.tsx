/*
file ini buat popup modal ambil foto jalan pake kamera hp atau upload
langsung dianalisis otomatis pake olah citra (image processing) di sisi browser
Todo:
-> buka input kamera atau file picker foto jalan
-> trigger analisa deteksi tekstur dan kontur cekungan
-> gambar kotak bounding box di atas foto
-> auto-tagging instansi wewenang jalan (nasional/provinsi/kota)
-> simpan laporan baru ke state
*/

import React, { useState, useRef } from 'react';
import { DamageReport, JurisdictionType } from '../types';
import { detectRoadDamage, DetectionResult } from '../services/imageDetection';
import { Camera, Upload, X, CheckCircle2, Sparkles, AlertTriangle, MapPin } from 'lucide-react';

interface CameraReportModalProps {
  onClose: () => void;
  onSubmitReport: (newReport: DamageReport) => void;
}

export const CameraReportModal: React.FC<CameraReportModalProps> = ({ onClose, onSubmitReport }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [address, setAddress] = useState('Jl. Jend. Sudirman KM 3.2, Jakarta');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // contoh foto sampel aspal jalanan indonesia buat dicoba langsung
  const sampleImages = [
    {
      name: 'Lubang Aspal',
      url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Galian Utilitas',
      url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Retak Aspal',
      url: 'https://images.unsplash.com/photo-1578874691223-a49267b0995f?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const handleProcessImage = async (imgUrl: string) => {
    setSelectedImage(imgUrl);
    setIsAnalyzing(true);
    try {
      const result = await detectRoadDamage(imgUrl);
      setDetection(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleProcessImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!detection || !selectedImage) return;

    // auto-routing kewenangan berbasis koordinat
    const jurisdiction: JurisdictionType =
      detection.type === 'pothole' && detection.depthCm > 5
        ? 'Jalan Nasional (BBPJN PUPR)'
        : 'Jalan Provinsi (Bina Marga DKI)';

    const newReport: DamageReport = {
      id: `rep-${Date.now()}`,
      type: detection.type,
      title: `${detection.typeName} Terdeteksi AI`,
      severity: detection.severity,
      depthCm: detection.depthCm,
      widthCm: detection.widthCm,
      lat: -6.1985 + (Math.random() - 0.5) * 0.008,
      lng: 106.8235 + (Math.random() - 0.5) * 0.008,
      address,
      jurisdiction,
      status: 'review',
      photoUrl: selectedImage,
      createdAt: 'Baru saja',
      upScore: detection.severity === 'berat' ? 8.8 : detection.severity === 'sedang' ? 6.5 : 4.0,
      trafficImpact: detection.depthCm > 5 ? 'padat' : 'lancar',
      description: notes.trim() || 'Laporan instan masyarakat via kamera deteksi tekstur AI.'
    };

    onSubmitReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-floating border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight">
                Lapor Kerusakan Jalan Instan
              </h3>
              <p className="text-xs text-slate-500">
                1-Snap AI: Deteksi Otomatis Tekstur, Pola & Kedalaman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* body content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedImage ? (
            <div className="space-y-4">
              {/* upload placeholder */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-amber-300 rounded-3xl bg-amber-50/40 hover:bg-amber-50/80 transition-colors flex flex-col items-center justify-center cursor-pointer p-4 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Ambil Foto Jalan atau Pilih dari Galeri
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Kamera akan mengukur kedalaman lubang dan pola retakan
                </span>
              </div>

              {/* opsi foto sampel */}
              <div>
                <span className="text-xs font-semibold text-slate-600 block mb-2">
                  Atau coba gambar sampel jalanan:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {sampleImages.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleProcessImage(s.url)}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-left hover:border-amber-400 transition-all group overflow-hidden"
                    >
                      <div className="w-full h-16 rounded-xl overflow-hidden mb-1 bg-slate-200">
                        <img
                          src={s.url}
                          alt={s.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 block truncate px-1">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* preview gambar dengan bounding box deteksi ai */}
              <div className="relative w-full h-56 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={selectedImage}
                  alt="Preview Kerusakan"
                  className="w-full h-full object-cover"
                />

                {/* status overlay saat menganalisa */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2">
                    <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs font-bold">Menganalisis Tekstur & Pola Citra...</span>
                  </div>
                )}

                {/* bounding box overlay jika hasil deteksi selesai */}
                {detection && !isAnalyzing && (
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/20 rounded-xl transition-all pointer-events-none"
                    style={{
                      left: `${detection.boundingBox.x}%`,
                      top: `${detection.boundingBox.y}%`,
                      width: `${detection.boundingBox.w}%`,
                      height: `${detection.boundingBox.h}%`
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      {detection.typeName} ({detection.confidence}%)
                    </span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setDetection(null);
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ringkasan hasil olah citra */}
              {detection && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hasil Analisis Citra Otomatis</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Akurasi {detection.confidence}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Jenis</span>
                      <span className="text-xs font-bold text-slate-800 capitalize truncate block">
                        {detection.type}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Taksiran Kedalaman</span>
                      <span className="text-xs font-bold text-red-600">
                        ~{detection.depthCm} cm
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Tingkat Bahaya</span>
                      <span className="text-xs font-bold text-amber-600 uppercase">
                        {detection.severity}
                      </span>
                    </div>
                  </div>

                  {/* auto routing dinas */}
                  <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200/60 flex items-center justify-between text-xs text-blue-900">
                    <span className="font-semibold">Otomatis Ditujukan Ke:</span>
                    <span className="font-bold">
                      {detection.depthCm > 5
                        ? 'Balai Besar PUPR (Jalan Nasional)'
                        : 'Dinas Bina Marga DKI (Provinsi)'}
                    </span>
                  </div>
                </div>
              )}

              {/* form input singkat */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lokasi Terdeteksi GPS:</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan Tambahan (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sangat licin saat hujan, banyak pemotor terjebak"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* tombol submit */}
              <button
                disabled={!detection || isAnalyzing}
                onClick={handleSubmit}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Kirim Laporan Kerusakan ke Dinas Terkait</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
