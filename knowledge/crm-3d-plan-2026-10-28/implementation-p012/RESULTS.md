# Hasil implementasi P0-P2

28 Oktober 2026, Asia/Jakarta. Kelanjutan dimulai setelah pengguna meminta continue berurutan. Implementasi bersifat lokal; tidak ada commit/push/staging, perubahan cloud atau email sungguhan.

## Perilaku yang berubah

- Kesiapan laporan warga, penulisan dan email dipisahkan melalui capability publik. Aksi yang belum siap dinonaktifkan tanpa menutup pembacaan CRM; refresh memeriksa ulang capability dan kedua feed.
- Nama pilihan akun bersifat privat. Publikasi nama pada laporan bersifat opt-in per laporan; default tetap Pelapor. Pemilik dapat menarik nama dan seluruh proyeksi riwayat kembali menjadi Pelapor.
- Tujuan login disimpan server pada tautan sekali pakai. Membuka link di tab/perangkat lain kembali ke laporan/form/daftar sendiri yang dimaksud. Email tetap privat.
- Tautan `?laporan=ID` dapat membuka laporan tersimpan meskipun tidak berada pada halaman daftar yang dimuat. Navigasi kembali mempertahankan konteks daftar dan kamera.
- Detail memakai Ringkasan/Riwayat, menampilkan bukti, sumber, waktu dan atribusi. Riwayat terbaru dahulu tetap mengenali entri pembuatan dari identitas entri, bukan indeks tampilan.
- Mobile detail merangkum header dan mengurangi peta agar judul, status, tab dan awal bukti terlihat lebih cepat. Kategori daftar dan peringatan global tidak menutup detail.
- Pemilik dapat menarik laporan dari publik, memulihkan laporan withdrawn, atau menarik lampiran tertentu. Akun lain tidak memperoleh akses melalui ID langsung. Penarikan bukan penghapusan seluruh data dari storage/backup.
- Foto dan video baru wajib diproses server sebelum publikasi. Orientasi dipertahankan, metadata sumber dibuang, video dapat diperkecil dan tetap menyertakan audio. Tidak ada penyamaran wajah/plat/suara otomatis.
- Media lama tanpa penanda pemrosesan server ditolak, bukan ditampilkan mentah. Migrasi massal belum dijalankan.
- Draft catatan/lampiran tetap berada pada komponen detail ketika sesi habis dan setelah login kembali ke laporan yang sama. Retry tidak menggandakan laporan atau event.

Status laporan tetap pengamatan pelapor. Tidak ada petugas simulasi, pengiriman otomatis ke CRM, progres/ETA resmi buatan, model AI yang diunduh atau geometri baru pada tahap ini.

## Pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| Browser/UI/unit gabungan | 50 passed, 1 skipped pada run akhir |
| Backend gabungan | 35 passed yang dilaporkan Node test runner, termasuk tes induk/subtes |
| TypeScript dan build frontend/backend | Lulus pada pemeriksaan yang dicatat |
| Peta nyata | UI source terbaru membaca 40 laporan pada desktop/mobile tanpa page error/overflow horizontal pada alur baca yang dicoba |
| Preservasi peta/3D | 11 berkas inti identik dengan baseline |
| Review independen | Tiga temuan kontrak diperbaiki; review visual empat screenshot tidak menemukan cacat serius yang perlu patch P0-P2 |
| Audit dependensi | 0 high/critical; 5 moderate pada rantai lain yang sudah ada |
| Detail warga 320 px | 2 pemeriksaan terarah lulus; tanpa overflow pada viewport yang diperiksa |
| Container | Build dan smoke lulus: foto/video diproses pada image, metadata sumber dibuang, video range 206, penarikan tamu 404/pemilik 200, legacy 404 |

Satu skip adalah kasus khusus mobile pada project desktop; kasus tersebut lulus pada project mobile. `50 passed` bukan jumlah seluruh kasus inspeksi lama. Build Vite tetap memberi peringatan chunk besar; ambang tidak diubah.

Bukti: [hasil gabungan](evidence/full-final-results.json), [backend](evidence/backend-tests.txt), [build](evidence/builds.json), [peta nyata](evidence/real-map-review.json), [hash 3D](evidence/inspection-preservation.json), [audit](evidence/dependency-audit.json), [container](evidence/container-smoke.json), [build image](evidence/docker-build.txt), [320 px](evidence/narrow-check.json). Pemeriksaan lama tidak dipakai untuk mengklaim kelulusan perubahan baru.

## Bukti visual

[Mobile dengan peta nyata](evidence/mobile-real-map.png), [desktop dengan peta nyata](evidence/desktop-real-map.png), [mobile laporan ditarik](evidence/mobile-withdrawn.png), [desktop riwayat/video](evidence/desktop-history.png).

Screenshot community menggunakan fixture berlabel MEDIA UJI dan basemap deterministik untuk menguji UI/persistensi. Screenshot peta nyata memakai feed produksi secara baca saja, semua mutasi diblokir. Tidak ada laporan uji ditulis ke produksi.

## Perbaikan selama pemeriksaan

Review menemukan draft dapat hilang saat scope autentikasi berubah, audit penuh dapat menghalangi penarikan, dan origin invalid belum membedakan akses baca/tulis. Ketiganya diperbaiki dan diuji. Audit publikasi kini menyimpan 100 tindakan terakhir; timeline pengamatan tetap maksimum 100 entri termasuk pembuatan.

Dua masalah selector harness dan satu asumsi jumlah request StrictMode diperbaiki berdasarkan bukti. Hasil gagal dipertahankan. Build container awal mengalami timeout jalur CDN; pemasangan seluruh paket FFmpeg melalui mirror HTTPS resmi dibuktikan sebelum Dockerfile memakai jalur tersebut. Verifikasi sertifikat dan tanda tangan paket tidak dinonaktifkan.

[Catatan diagnosis](evidence/repairs.md) dan [trace jaringan capability yang diringkas](evidence/capability-harness-diagnosis.json) menjelaskan perubahan oracle tanpa menurunkan acceptance.

## Batas dan langkah berikut

- `not_run`: login/email sungguhan, perubahan konfigurasi cloud, deployment dan smoke produksi.
- `not_run`: benchmark performa baru, perangkat fisik dan verifikasi inspeksi lama yang dijeda.
- `not_run`: migrasi media lama, penghapusan data/backup, dashboard moderator dan kebijakan retensi lengkap.
- `not_run`: P3 kondisi/geometri manual, P4 integrasi kerusakan pada peta publik, P5 pilot vision, P6 worker model. P0-P2 tidak mengklaim kemampuan foto menjadi bentuk 3D telah tersedia.

Urutan berikut tetap [P3-P4 pada rencana fase](../09-PHASES.md). Aktivasi rilis mengikuti [DEPLOYMENT](DEPLOYMENT.md). Pemilik meninjau diff dan melakukan commit/push sendiri.
