# Hasil implementasi peta dan daftar

Peta publik dengan toggle 2D/3D, daftar laporan, pencarian kode/status, filter kategori/area, detail sumber dan panel mobile sudah diterapkan langsung ke aplikasi. Endpoint backend baru membaca metadata publik CRM Jakarta. Tidak ada commit, push, deployment, perubahan database, atau pemasangan dependency baru.

## Bukti dan pengujian

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Frontend TypeScript | Lulus | [build checks](runs/map-list-2026-10-17/build-checks.json) |
| Build frontend dengan URL HTTPS | Lulus; URL uji build bukan endpoint deploy | [build checks](runs/map-list-2026-10-17/build-checks.json) |
| Build tanpa URL / memakai localhost | Ditolak sesuai kriteria | [build checks](runs/map-list-2026-10-17/build-checks.json) |
| Backend TypeScript/build | Lulus | [build checks](runs/map-list-2026-10-17/build-checks.json) |
| Kontrak sumber + mode backend publik | 12 tes lulus | [log backend](runs/map-list-2026-10-17/backend-tests.log) |
| UI publik dan unit adapter | 32 lulus, 1 dilewati karena skenario khusus mobile pada project desktop | [hasil Playwright](runs/map-list-2026-10-17/checks/results.json) |
| Unit lama dimensi/geometri/fixture | 6 tes lama lulus; run juga memuat 3 unit baru yang sama | [hasil unit](runs/map-list-2026-10-17/legacy-unit/results.json) |
| Sumber dan basemap nyata | Desktop, mobile, lebar 320 lulus, 0 page error | [live checks](runs/map-list-2026-10-17/live-checks.json) |
| Entry produksi backend | HTTP 200, mode publik, database tidak dipakai; 49 laporan pada pengambilan tersebut | [production smoke](runs/map-list-2026-10-17/production-entry-smoke.json) |
| Image Docker dan runtime | Build lulus; HTTP 200 sumber, database tidak dipakai, route legacy 404, `.env` tidak ikut image | [container smoke](runs/map-list-2026-10-17/container-smoke.json) |
| Preservasi perubahan awal | Orkestrator inspeksi disalin persis; modul geometri lama tidak berubah | [preservation](runs/map-list-2026-10-17/preservation.json) |
| Diff whitespace | Backend bersih; dua catatan frontend sudah ada sebelum fase ini | [diff check](runs/map-list-2026-10-17/diff-check.json) |

Total unik pemeriksaan otomatis: **50 lulus**, terdiri dari 32 UI/unit publik, 12 backend dan 6 unit lama. Pemeriksaan live dan build dicatat terpisah. Tidak ada klaim suite browser inspeksi lama lulus. Run awal dengan kegagalan tetap tersimpan di `checks-first` dan `checks-second`; hasil final berada di `checks`.

Pengujian mencakup penolakan privasi yang tidak eksplisit publik, kategori salah, koordinat/tanggal tidak valid, duplikat, respons rusak/besar, timeout, cache, perubahan hari Jakarta, serta larangan endpoint legacy pada mode publik. UI diuji untuk data terlambat, error awal/refresh, kategori belum tersedia, filter area eksplisit, keyboard/fokus, pemulihan kamera, dan 20 kali buka/tutup detail. Pemeriksaan 20 siklus membuktikan jumlah canvas/marker tetap; tidak diklaim sebagai audit seluruh alokasi GPU/listener.

## Peninjauan visual

- [Peta desktop](runs/map-list-2026-10-17/desktop-map.png) dan [detail desktop](runs/map-list-2026-10-17/desktop-detail.png).
- [Peta mobile](runs/map-list-2026-10-17/mobile-map.png) dan [detail mobile](runs/map-list-2026-10-17/mobile-detail.png).
- [Lebar 320](runs/map-list-2026-10-17/narrow-map.png) dan [detail 320](runs/map-list-2026-10-17/narrow-detail.png).
- [Teks diperbesar 200%](runs/map-list-2026-10-17/desktop-text-200.png). Pembesaran teks dipaksakan pada elemen melalui harness, bukan klaim pengujian semua browser/OS.

Temuan yang diperbaiki: nama aksesibel marker ditimpa konstruktor MapLibre; ikon atribusi berulang; ruang daftar hilang ketika teks membesar; kontrol/atribusi terlalu rapat pada detail mobile. Dua kesalahan fixture juga diperbaiki: atribusi perlu source yang dipakai layer dan pembacaan ukuran perlu menunggu resize panel. Kriteria tidak diturunkan.

## Performa dan batas

Sampel pan 3 detik, Chromium 149 headless/SwiftShader, menunjukkan median interval RAF sekitar 16,7 ms dan p95 16,8 ms pada desktop/mobile pada run tersimpan. Ini smoke measurement singkat, bukan jaminan 60 FPS, bukan pengukuran perangkat mobile fisik, dan bukan pembandingan terhadap baseline lama. Uji pengguna, CI remote, deployment, dan smoke test jaringan Cloud Run belum dijalankan.

## Data yang ditampilkan

Sumber nyata berhasil diambil; jumlah berubah mengikuti waktu pengambilan. Pemeriksaan visual awal memakai 46 laporan, smoke entry produksi mendapatkan 49, container mendapatkan 51, dan pemeriksaan visual final 2D/3D mendapatkan 53. UI menyebut waktu pengambilan dan rentang tanggal. Tidak ada fallback snapshot knowledge atau dummy runtime.

Hanya kategori sumber Jalan yang diteruskan. Kategori tersebut belum membuktikan jalan rusak, ukuran kerusakan, alamat, kewenangan atau perbaikan. Tidak ada foto/komentar/riwayat progres yang dikarang. Koordinat mengikuti sumber dan belum disaring dengan batas administratif resmi, sehingga pin sumber dapat berada di luar Jakarta. Deskripsi bebas dan identitas tidak diteruskan.

Endpoint publik CRM tidak memiliki SLA atau kontrak API terbitan yang telah diverifikasi. Ketentuan penggunaan ulang untuk publikasi luas serta koneksi keluar dari Cloud Run masih perlu diperiksa. Bila sumber gagal, produk menunjukkan gagal/stale secara jelas.

## Menjalankan dan deploy

Pratinjau lokal: `http://localhost:3004/`, bukan membuka `index.html` lewat `file://`. Frontend memanggil pembaca backend lokal. Panduan environment dan urutan deployment berada pada [DEPLOYMENT.md](DEPLOYMENT.md).

Komponen inspeksi lama tetap di `src/InspectionWorkspace.tsx` tanpa rute publik. Endpoint lama tetap ada dalam kode untuk pengembangan terpisah, tetapi **tidak dipasang ketika `PUBLIC_REPORTS_ONLY=true`**. Pekerjaan lama tidak ditimpa dan hasil lama tidak diluluskan ulang.

## Tambahan 3D

Toggle 2D/3D dipasang sesuai pilihan pengguna; 2D tetap awal. Kamera menggunakan kembali helper yang sudah ada. Bangunan memakai footprint OpenFreeMap/OpenMapTiles dan tinggi sumber yang dapat berupa pendekatan, tanpa poligon contoh. Pemilihan laporan, filter dan kembali tidak mengubah mode. Perpindahan kembali ke 2D menutup interaksi pitch/rotasi. Pergantian mode memakai instance/canvas yang sama dan diuji berulang.

Perbaikan tambahan: menutup detail sebelum animasi selesai kini menghentikan transisi sebelum memulihkan posisi kamera. Run dengan temuan tersimpan pada `checks-3d-first`. Run live pertama setelah perubahan 3D terputus oleh hot reload selama pemeriksaan dan tidak dihitung sebagai lulus; pengambilan ulang dijalankan setelah kode tetap.

Geometri dan renderer inspeksi lama tidak diubah. Inspeksi kerusakan belum tersedia untuk laporan CRM karena tidak memiliki dimensi. Peta kota 3D pada halaman publik tidak menyatakan bahwa inspeksi lubang lama telah terintegrasi kembali.

Audit backend mencatat 5 moderate pada rantai dependency storage/uuid dan peringatan deprecation Multer 1.x. Tidak ada upgrade dependency dalam perubahan ini. Jalur storage/upload tidak dipasang pada mode publik. Lihat [audit](runs/map-list-2026-10-17/backend-audit.json) dan [panduan deploy](DEPLOYMENT.md).

Pemeriksaan visual final 3D lulus pada 1440 × 900, 390 × 844 dan 320 × 740, dengan 0 page error. Bukti: [desktop 3D](runs/map-list-2026-10-17/desktop-3d.png), [mobile 3D](runs/map-list-2026-10-17/mobile-3d-detail.png), [preservasi 8 berkas inti](runs/map-list-2026-10-17/preserved-3d.json). Pengukuran RAF yang disebut di atas untuk pan 2D; belum ada benchmark regresi 3D terhadap baseline inspeksi lama.
