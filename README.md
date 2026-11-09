# LaporJalan - Frontend Client

Platform web partisipatif untuk pemantauan, pelaporan, dan visualisasi kondisi kerusakan jalan raya secara real-time. Dilengkapi visualisasi peta spasial 3D (MapLibre GL), estimasi profil geometris kerusakan jalan (Three.js), analisis citra aspal di peramban, serta integrasi data laporan publik CRM Jakarta (JAKI).

**Tautan Produksi**: [https://lapor-jalan-two.vercel.app](https://lapor-jalan-two.vercel.app)

---

## Fitur Utama

- **Landing Page Three.js (`/`)**: Hero 3D dan cerita tujuh tahap pelaporan jalan rusak dengan adaptasi aksesibilitas (*reduced motion*).
- **Peta Spasial 3D (`/peta`)**:
  - Mesin WebGL MapLibre GL dengan kemiringan dinamis (*pitch* hingga 74°).
  - Lapisan bercakan kerusakan fisik jalan (*decals polygon*).
  - Kerucut pandang dan garis pandang telemetri kamera CCTV lalu lintas.
  - Lapisan segmen arus kemacetan jalan real-time.
- **Deteksi Citra Kerusakan**: Analisis tekstur piksel aspal, kepadatan tepi (*edge density*), estimasi dimensi (kedalaman & lebar), dan pembuatan *bounding box*.
- **Inspeksi Profil Kedalaman 3D**: Penampil kontur cekungan jalan Three.js 360° untuk lubang (*pothole*) dan jalan ambles (*subsidence*).
- **Komparasi Sebelum vs Sesudah**: Slider visual interaktif untuk audit mutu hasil perbaikan jalan.
- **Pelaporan Warga Mobile-Optimized**: Antarmuka responsif pencatatan kondisi kerusakan dengan GPS dan unggahan foto/video.

---

## Peta Situs & Alur Navigasi (Sitemap)

```
/ (Landing Page - Hero Three.js dan Cara kerja)
├── Hero & Ringkasan Metrik
├── Alur Kerja Pelaporan Warga
└── CTA Utama ───► /peta (Peta Spasial 3D)
                    ├── Visualisasi Peta WebGL (MapLibre GL)
                    │    ├── Lapisan Poligon Kerusakan (Pothole / Subsidence / Crack)
                    │    ├── Lapisan Segmen Arus Lalu Lintas Real-time
                    │    └── Titik CCTV & Kerucut Telemetri (FOV / Angle)
                    │
                    ├── Modal Panel Detail Laporan (CRM & Komunitas)
                    │    ├── Inspeksi Kedalaman Kontur 3D (Three.js 360°)
                    │    ├── Komparasi Visual Sebelum vs Sesudah (Interactive Slider)
                    │    └── Metrik Prioritas Bina Marga (UP Score)
                    │
                    └── Alur Pembuatan Laporan Baru
                         ├── Penentuan Titik Koordinat GPS / Pin Peta
                         ├── Unggah Foto / Video Bukti Kerusakan
                         ├── Analisis Citra Otomatis di Peramban (Canvas Pixel Analysis)
                         └── Konfirmasi & Pengiriman Laporan
```

---

## Teknologi

- **Framework**: React 18 & TypeScript
- **Bundler & Build Tool**: Vite 5
- **Gaya Visual**: Tailwind CSS & Lucide Icons
- **Mesin Peta & 3D**: MapLibre GL JS & Three.js
- **Animasi**: Motion (Framer Motion)
- **Deployment**: Vercel

---

## Panduan Instalasi & Pengembangan Lokal

### 1. Prasyarat
- Node.js versi LTS (`v20+` atau `v24+`)
- npm versi `10+`

### 2. Pemasangan Dependensi
```bash
cd LaporJalan
npm install
```

### 3. Konfigurasi Lingkungan
Salin berkas template environment:
```bash
cp .env.example .env.local
```
Sesuaikan isi `.env.local` untuk pengembangan lokal:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi dapat diakses di: `http://localhost:3000`

---

## Variabel Lingkungan

| Variabel | Deskripsi | Nilai Contoh |
| --- | --- | --- |
| `VITE_API_URL` | URL origin backend API tanpa garis miring penutup | `https://laporjalan-be-710000917298.asia-southeast2.run.app` |

> **Catatan**: Konfigurasi `vite.config.ts` mewajibkan `VITE_API_URL` menggunakan protokol `https://` saat menjalankan perintah produksi `npm run build` untuk mencegah kesalahan pengiriman trafik ke `localhost`.

---

## Skrip NPM

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan lokal (port 3000) |
| `npm run build` | Menjalankan typecheck TypeScript dan build bundler produksi Vite ke direktori `/dist` |
| `npm run preview` | Meninjau hasil build produksi secara lokal |
| `npm run test` | Menjalankan suite pengujian Playwright |

---

## Konfigurasi Deployment (Vercel)

Berkas [vercel.json](file:///home/vereniaes/project/hackathon/LaporJalan/vercel.json) mengonfigurasi *rewrite* rute client-side SPA agar navigasi langsung ke `/peta` atau tautan bertoken tidak menghasilkan status 404:
```json
{
  "rewrites": [
    { "source": "/peta", "destination": "/index.html" },
    { "source": "/peta/", "destination": "/index.html" }
  ]
}
```
Pastikan variabel `VITE_API_URL` telah ditambahkan pada menu **Project Settings -> Environment Variables** di Vercel Dashboard.
