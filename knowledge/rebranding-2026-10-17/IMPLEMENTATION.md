# Implementasi peta dan daftar

Pengguna menyetujui tahap ini melalui pilihan `/grillme`: mulai implementasi peta dan daftar setelah memeriksa sumber nyata. Keputusan nama dan desain tetap berlaku. Tidak ada commit, push, deployment, instalasi, atau perubahan database.

## Langkah dan batas

- [x] Baca mockup, spesifikasi, kode frontend/backend, instruksi, dan perubahan lokal.
- [x] Simpan [baseline working tree dan hash](runs/map-list-2026-10-17/baseline.json).
- [x] Periksa endpoint publik CRM. Respons 200; akses lintas origin browser tidak diumumkan sumber.
- [x] Tambahkan pembaca backend dengan batas waktu/ukuran, cache singkat, privasi tertutup secara default, dan metadata minimum.
- [x] Terapkan peta 2D, daftar, filter, pemilihan area, detail sumber, dan layout mobile.
- [x] Bedakan loading, kosong, gagal, dan data terakhir yang gagal diperbarui.
- [x] Periksa kontrak data, interaksi, keyboard, desktop/mobile, typecheck dan build.
- [x] Simpan bukti visual, hasil pemeriksaan, dan keterbatasan.

## Keputusan teknis

Peta memakai MapLibre yang sudah terpasang dan helper koordinat yang tersedia. Kontrak laporan publik terpisah dari `DamageReport`, karena sumber tidak menyediakan dimensi, foto, alamat jalan, atau klasifikasi kerusakan. Memaksa data tersebut ke kontrak lama akan mengarang informasi.

Halaman utama berganti ke peta publik. Orkestrator inspeksi lama dipertahankan sebagai `src/InspectionWorkspace.tsx`, tanpa rute publik, import runtime utama, atau perubahan geometri. Salinan sebelum perubahan juga tersimpan di folder run. Pengujian browser lama yang mengharapkan UI inspeksi di `/` bukan bukti penerimaan desain baru; pengujian unit lama tetap diperiksa.

Pembaca backend hanya mengambil kategori sumber **Jalan** untuk hari ini dan kemarin menurut Asia/Jakarta. Semua laporan harus eksplisit `isPrivacy: false`. Hanya ID, kode, koordinat, kategori, waktu publikasi, dan nama status sumber yang diteruskan. Deskripsi bebas, identitas, media dan `zone` tidak diteruskan. `zone` dapat berisi unit organisasi dan bukan alamat.

Kategori Jalan tidak otomatis berarti jalan rusak. Pembangunan, saluran tersumbat, dan pembakaran sampah tetap memiliki keadaan sumber belum tersedia, tanpa mengklasifikasikan teks atau mengarang pin. Posisi mengikuti koordinat sumber; batas administratif dan ketelitian lapangan belum diverifikasi. Cakupan adalah laporan JAKI yang tampil di peta CRM, bukan seluruh pengaduan Jakarta.

Sumber: [peta CRM](https://crm.jakarta.go.id/peta/), [endpoint publik](https://crm.jakarta.go.id/api/public/dashboard/distribution-map?dateStart=2026-10-16&dateEnd=2026-10-17&isPrivacy=0). Endpoint teramati dari situs publik, bukan API dengan kontrak/SLA terbitan. Hak penggunaan ulang untuk peluncuran publik belum terverifikasi. Tahap ini integrasi lokal yang dapat ditinjau; penerbitan perlu memeriksa ketentuan sumber.

Pencarian tahap ini mencari kode/status pada data yang dimuat. Geocoding, pengiriman laporan, komentar, video, CCTV dan perubahan status belum diimplementasikan pada halaman baru. Tautan sumber membuka peta resmi, tidak berpura-pura menjadi permalink laporan.

## Pemeriksaan yang direncanakan

- Kontrak: privat/hilang privasi, kategori tidak cocok, koordinat/tanggal tidak valid, duplikat, respons salah bentuk, timeout, cache, kegagalan sumber.
- UI: daftar dan marker memakai data yang sama; pilihan area eksplisit; detail/kembali memulihkan konteks; filter menghapus pilihan tersembunyi.
- Keadaan: loading, kosong, gagal pertama, gagal refresh dengan data terakhir, peta gagal dan alternatif daftar.
- Visual: 1440 × 900, 390 × 844, lebar 320, teks 200%, fokus dan atribusi.
- Regresi: frontend/backend typecheck/build serta unit geometri/kamera lama. Benchmark orbit lama tidak berlaku pada UI 2D ini dan tidak dinyatakan lulus.

## Tambahan persiapan deploy yang diminta pengguna

`VITE_API_URL` wajib berupa origin HTTPS saat build. Backend menyediakan `PUBLIC_REPORTS_ONLY=true` untuk menutup endpoint contoh/penulisan legacy dan melewati database/seed. Panduan environment, urutan deploy dan smoke test berada pada [DEPLOYMENT.md](DEPLOYMENT.md). Perubahan pengaturan cloud dan deployment belum dilakukan.

## Toggle 2D/3D yang disetujui

Pengguna memilih menambahkan toggle 2D/3D pada peta publik, dengan 2D sebagai awal. Kamera menggunakan kembali `cameraPose` dari `src/map/camera.ts`. Bangunan berasal dari footprint OpenFreeMap/OpenMapTiles, memakai `render_height`, `render_min_height` dan `hide_3d`. Tidak ada footprint contoh atau ketinggian minimum buatan pada adapter baru. Tinggi sumber dapat berupa pendekatan dari jumlah lantai, bukan pengukuran lapangan. [Skema resmi](https://openmaptiles.org/docs/schema/#building), [contoh MapLibre](https://maplibre.org/maplibre-gl-js/docs/examples/display-buildings-in-3d/).

- [x] Pasang toggle dalam canvas peta yang sama; tidak membuat renderer kedua.
- [x] Pakai kembali kontrak pose kamera 2D/3D; pilihan mode bertahan saat memilih laporan/filter/kembali.
- [x] Tutup rotasi/pitch interaktif ketika kembali ke 2D.
- [x] Geometri kerusakan, DamageLayer, Map3D lama dan orkestrator inspeksi tetap tidak diubah.
- [x] Periksa bangunan nyata, tampilan desktop/mobile dan perpindahan mode berulang.

Ini mengaktifkan peta kota 3D pada UI publik. Inspeksi lubang tetap memerlukan dimensi yang belum diberikan CRM.
