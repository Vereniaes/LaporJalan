# Roadmap & Rencana Kerja: Proyek LaporJalan (GCP Cloud Run + MongoDB + Vercel)

## Status Terkini
- [x] Riset domain standar kerusakan jalan Indonesia (Bina Marga & RDD2022) -> Tersimpan di `/knowledge`
- [x] Reverse-engineering arsitektur `transit.oyenza.com` dan komparasi `Jalan Kita 2.0` -> Tersimpan di `/knowledge`
- [x] Penyusunan Dokumen Spesifikasi Bisnis (BRD) dan Produk (PRD) -> Tersimpan di `/docs`
- [x] Konfirmasi arah arsitektur dan penentuan ruang lingkup MVP dengan pengguna
- [x] Sinkronisasi direktori target ke WSL: `\\wsl.localhost\Ubuntu\home\vereniaes\project\hackathon\`
- [x] Update environment WSL: Node.js diperbarui ke **v24.22.0 (LTS)** dan npm ke **12.2.0**
- [x] Fase 1: Inisialisasi Vite + React + TypeScript + Tailwind CSS di `/LaporJalan` (WSL)
- [x] Fase 2: Pembangunan Core UI & Layout Oyenza-Style (Floating Sheet, Pill Tabs, Card "Dicocokkan dengan Kamera", Maskot Miko)
- [x] Fase 3: MapLibre GL JS 3D Engine (Pitch 52°, 3D Building Extrusion, Frustum Kamera CCTV Segitiga, Marker Kerusakan 3D)
- [x] Fase 4: Modul Deteksi Citra Kerusakan (Texture & Pattern Processing: Lubang, Retak, Galian Utilitas, Bounding Box AI)
- [x] Fase 5: Modul 3D Depth Inspector (Potongan Melintang 3D Three.js 360° untuk inspeksi volumetrik lubang/galian)
- [x] Fase 6: Overlay Arus Kemacetan & Auto-Routing Yuridis Jalan (Nasional / Provinsi / Kota)
- [x] Fase 7A: Garis Pandang CCTV Dinamis (Sight-Line Telemetri di Peta 3D + Label Jarak Meter)
- [x] Fase 7B: Mode Komparasi 'Sebelum vs Sesudah' (Interactive Split Comparison Slider ala transit.oyenza.com/compare)
- [x] Fase 7C: Mode Simulasi Lapangan 3D (Street-Level View 360° ala Gambar 3 dengan Avatar Miko Helm Proyek, Traffic Cones, dan Lubang)
- [x] Fase 7D: Kartu Pantauan Genangan & Banjir Jalanan (Deteksi Lubang Tertutup Genangan Air Hujan)
- [x] Fase 8: Pembangunan Backend Node.js TypeScript di `/laporjalan-be`:
  - Express + TypeScript + Mongoose Schemas (Report & Cctv)
  - Dual-mode: Siap MongoDB Atlas & GCS Cloud Run dengan fallback in-memory + local uploads
  - Dockerfile multi-stage production-ready untuk Google Cloud Run (Port 8080)
  - Endpoints aktif: `GET /health`, `GET & POST /api/reports`, `GET /api/cctv`, `GET /api/traffic`
- [x] Fase 9: Pengujian Sinkronisasi End-to-End Browser UI -> REST API Backend (100% Berhasil)

---

## Log Aktivitas Proyek
- **2026-10-15 04:08**: Menyusun dokumen BRD & PRD lengkap mencakup analisis teknis Bina Marga dan Oyenza.
- **2026-10-15 04:11**: Pengguna menyetujui cakupan penuh 6 fitur MVP.
- **2026-10-15 04:14**: Lokasi pengerjaan diarahkan ke WSL `\\wsl.localhost\Ubuntu\home\vereniaes\project\hackathon` (`LaporJalan` & `laporjalan-be`).
- **2026-10-15 04:16**: Node.js di WSL berhasil di-update ke versi LTS `v24.22.0` dan npm ke `12.2.0`.
- **2026-10-15 04:22**: Membangun arsitektur frontend modular LaporJalan.
- **2026-10-15 04:34**: 4 fitur pemolesan frontend selesai diimplementasikan (Mode Lapangan 3D, Before/After Slider, CCTV Sight-Line, dan Pantauan Genangan Banjir) dan divalidasi via subagent browser.
- **2026-10-15 10:45**: Backend `laporjalan-be` selesai dibangun, berhasil dicompile dengan TypeScript, dan seluruh endpoint REST API (`/health`, `/api/reports`, `/api/cctv`, `/api/traffic`) aktif di port 5000 dengan fallback in-memory yang mulus.
- **2026-10-15 10:54**: Pengujian end-to-end berhasil secara tuntas: Pengguna mengirimkan foto galian via modal AI kamera, deteksi bounding box dan kedalaman 12 cm dihitung secara instan, data dikirim melalui HTTP POST ke `/api/reports`, dan data baru langsung tersimpan serta terverifikasi di backend API dengan catatan `"Uji sinkronisasi end-to-end hackathon"`.
