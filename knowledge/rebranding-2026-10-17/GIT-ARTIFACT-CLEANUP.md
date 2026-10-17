# Artefak pengujian yang ikut push

Pemeriksaan 17 Oktober 2026 mengikuti log push pemilik proyek. Push `42f720e..2c08ad7` berhasil. GitHub memperingatkan trace terbesar 67,27 MiB. Working tree bersih sebelum pencatatan ini. Pencatatan awal tidak mengubah index. Setelah pilihan `/grillme`, pengguna mengizinkan penambahan ignore dan pengeluaran artefak dari index. Agen tetap tidak melakukan commit, push, atau penulisan ulang riwayat.

## Temuan

Berkas terlacak berjumlah 1.950, total 1.818.794.436 byte pada working tree. Folder run Oyenza lama memuat 1.793.172.338 byte. Ukuran ini berbeda dari pack terkompresi 1,41 GiB yang ditampilkan saat push. Artefak tidak menjadi dependency runtime peta/3D.

## Tiga jalur

1. **Rapikan tracking berikutnya (direkomendasikan).** Tambahkan aturan ignore untuk `knowledge/**/runs/**/artifacts/`, `test-results/` dan `playwright-report/`. Keluarkan hanya kandidat terverifikasi dari index dengan tetap menyimpan berkas lokal. Pertahankan kode, ringkasan Markdown/JSON dan screenshot pilihan yang ditautkan dari laporan. Mengurangi isi revisi selanjutnya, tetapi tidak memangkas blob pada riwayat lama.
2. **Rencanakan pemangkasan riwayat.** Siapkan backup, inventaris kolaborator dan daftar path, lalu instruksi untuk pemilik. Menghapus blob dari riwayat yang sudah dipush dapat memerlukan penulisan ulang history dan force push. Agen tidak akan mengeksekusi commit/push/force push; pekerjaan tersebut memerlukan keputusan tersendiri.
3. **Lanjut periksa deployment dahulu.** Peringatan ukuran tidak membuktikan deployment gagal. Periksa hasil build dan environment frontend/backend, lalu jadwalkan pembersihan artefak.

## TODO

- [x] Verifikasi commit, status dan ukuran berkas yang terlacak.
- [x] Inventaris kandidat artefak tanpa membaca isi trace atau menghapus berkas.
- [x] Pilih jalur melalui `/grillme`: rapikan tracking, pertahankan berkas lokal dan riwayat.
- [x] Pratinjau daftar path, tambah aturan ignore dan keluarkan 1.372 artefak dari index.
- [x] Pertahankan empat screenshot yang ditautkan laporan pada `selected-evidence` dan perbarui tautan.
- [x] Verifikasi hash seluruh artefak lokal, aturan ignore, perubahan staged dan preservasi kode.
- [ ] Pemilik meninjau diff dan melakukan tindakan Git yang diperlukan.

[Manifest kandidat](git-artifact-cleanup-manifest.json) berisi path dan ukuran yang dapat diperiksa. Manifest kini merekam path yang dikeluarkan dari index, ukuran, hash SHA-256 dan pemetaan empat screenshot pilihan. Semua berkas asli tetap ada di disk. Link screenshot laporan lama telah diarahkan ke salinan terpilih agar tetap tersedia pada clone baru setelah pemilik memasukkan perubahan ini ke commit.

GitHub memberi peringatan untuk file di atas 50 MiB dan memblokir file di atas 100 MiB. [Dokumentasi GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

## Hasil pembersihan

- **1.372 artefak / 1.760.189.418 byte** dikeluarkan dari index dengan `git rm --cached`; tidak dihapus dari filesystem.
- Seluruh **664 ZIP trace** termasuk dalam daftar tersebut. Ringkasan Markdown/JSON di luar direktori artifacts tetap terlacak. Referensi path mentah dalam laporan mesin merupakan lokasi bukti lokal; raw trace tidak tersedia pada clone baru setelah commit pembersihan.
- `.gitignore` mengecualikan `knowledge/**/runs/**/artifacts/`, `/test-results/` dan `/playwright-report/` untuk hasil pemeriksaan berikutnya.
- Empat screenshot PREVIEW-CYCLE22 disalin tanpa perubahan isi ke `selected-evidence`; screenshot pilihan rebranding tetap dipertahankan.
- Kode frontend, WebGL/Three.js, test source, dependency, konfigurasi build dan backend tidak diubah.
- HEAD tetap `2c08ad7000d22fbe56f2d41954a0cec5387a26be`. Ukuran riwayat remote belum berkurang.

[Validasi pembersihan](git-artifact-cleanup-validation.json) memuat pemeriksaan hash, index, aturan ignore, dan tautan. Pemeriksaan aplikasi tidak dijalankan ulang karena tidak ada perubahan runtime; verifikasi berfokus pada integritas file dan tracking.

Penghapusan dari index sudah staged. Aturan ignore, salinan screenshot serta catatan terkait juga disiapkan bersama agar commit pemilik nanti konsisten. Tidak ada commit atau push oleh agen. Cadangan index sebelum perubahan disimpan lokal pada `/tmp/laporjalan-artifact-cleanup-20261017/index.before`; tidak dipulihkan otomatis.
