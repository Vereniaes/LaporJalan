# Hasil implementasi laporan warga

18 Oktober 2026. Implementasi lokal selesai untuk laporan publik LaporJalan dan pembaruan oleh pemilik melalui tautan email. Tidak ada commit, push, deployment atau pengiriman email sungguhan oleh agen.

## Perilaku yang tersedia

- Tombol **Tambah laporan** pada header desktop/mobile.
- Masuk melalui email, konfirmasi tautan sekali pakai, keluar dan daftar **Laporan sendiri**.
- Formulir **Lokasi → Kondisi → Tinjau → Kirim**, dengan pin pada peta yang sama, koordinat manual dan lokasi perangkat atas tindakan eksplisit.
- Kategori Jalan, Pembangunan, Saluran dan Pembakaran; judul, uraian, patokan opsional, foto/video opsional dan konfirmasi publikasi.
- Laporan persisten, status awal **Dilaporkan**, riwayat waktu/catatan/lampiran, serta pembaruan pemilik: **Belum berubah**, **Terlihat dikerjakan**, **Terlihat selesai**.
- Setiap pengamatan dilabeli pelapor. Data sumber CRM tetap terpisah dan tidak diberi riwayat fiktif. Laporan LaporJalan belum dikirim ke pemerintah.
- Foto/video berada pada GridFS, bukan filesystem instance Cloud Run. Tidak ada fallback seed/memori.
- Isian gagal dikirim tetap tersedia. ID operasi mencegah duplikasi ketika server telah menyimpan tetapi respons tidak sampai. Pembaruan bersamaan memakai versi dokumen.
- Filter dan navigasi dikunci selama pembaruan belum disimpan; keluar melalui tombol kembali meminta konfirmasi.

## Bukti

| Pemeriksaan | Hasil |
| --- | --- |
| Frontend typecheck dan build | Lulus; URL HTTPS contoh hanya digunakan untuk validasi build lokal |
| Backend typecheck/build | Lulus, termasuk build image Docker dari dependency bersih |
| Playwright UI/unit | **36 passed, 1 skipped**, tanpa kegagalan pada run akhir |
| Backend Node test runner | **25 passed** yang dilaporkan runner, termasuk satu tes induk yang menaungi 12 subtes kontribusi |
| Kamera mobile setelah diagnosis runner | **5 pengulangan lulus**, ambang tidak diturunkan |
| Container | Health 200, database connected, daftar warga kosong 200, legacy 404, email tanpa konfigurasi 503 |
| Preservasi inspeksi | Hash 8/8 berkas inti identik dengan baseline |
| Git | Diff check lulus; artefak ZIP tidak masuk daftar untracked yang akan ditambahkan biasa |

[Bukti browser](runs/checks/results.json), [backend](runs/backend-tests.txt), [build frontend](runs/frontend-build.json), [container](runs/container-smoke.json), [hash inspeksi](inspection-preservation.json).

Pemeriksaan UI mencakup desktop 1440 × 900, mobile 390 × 844, dan alur daftar/detail pada lebar 320 px. Alur baru diuji dengan backend dan MongoDB sungguhan pada database lokal sekali pakai; pengiriman email dicegat oleh harness. Fixture kejadian/media dan basemap polos hanya dipakai dalam tes, tidak dimasukkan ke runtime. Screenshot [tinjau desktop](desktop-review.png), [riwayat desktop](desktop-history.png), [tinjau mobile](mobile-review.png), dan [riwayat mobile](mobile-history.png) merupakan bukti pengujian, bukan laporan kejadian nyata.

Satu skip adalah skenario panel mobile pada project desktop; skenario tersebut lulus pada project mobile. Pengujian memastikan email/ID pemilik/token/hash tidak muncul pada data publik; akun lain ditolak ketika menulis; token kedaluwarsa atau digunakan ulang ditolak; lampiran tersimpan dan byte-range dapat dibaca; database terputus menghasilkan 503 dan data tetap ada setelah koneksi pulih.

## Perbaikan selama verifikasi

1. Runner awal gagal memuat impor .js dari TypeScript backend. Integrasi kemudian memakai hasil build backend.
2. Membuka tautan email pada tab yang sama tidak me-remount aplikasi; penanganan hashchange ditambahkan dan token dibersihkan dari URL.
3. Label select dipisahkan dari option agar nama aksesibel tepat.
4. Request yang dihentikan dan batas waktu dipisahkan agar indikator muat tidak tertinggal. Permintaan halaman berikutnya diabaikan bila konteks daftar telah berubah.
5. Penjagaan isian pembaruan ditambahkan pada pencarian, kategori, pemilihan marker dan keluar akun.
6. Trace ulangan menemukan baseline kamera diambil saat animasi fit awal baru dimulai. Runner kini menunggu kontrol publik siap sebelum pemeriksaan kamera diam. [Diagnosis](runs/camera-race-diagnosis.json), [run gagal](runs/camera-race-results.json), [lima pengulangan](runs/camera-repeat-results.json). Tidak ada perubahan ambang atau geometri untuk menutupi kegagalan.

Tes integrasi berada di `tests/public-reports/community.integration.spec.ts`, sehingga konfigurasi pengujian publik lama tidak otomatis memerlukan database. Konfigurasi `playwright.community.config.ts` memasukkan integrasi bersama regresi publik. Jangan menjalankan `--list` dengan reporter JSON ke lokasi hasil final karena perintah tersebut dapat menimpa bukti dengan status skipped.

## Cara mengulang

Persiapan: Node 22, dependency kedua repo, browser Playwright, MongoDB lokal terisolasi pada port 27019. Jangan menggunakan URI produksi untuk tes.

1. Backend: `npm run build`.
2. Backend: `node --import tsx --test tests/community.test.ts tests/publicReports.test.ts tests/publicMode.test.ts`.
3. Frontend: jalankan Vite pada `127.0.0.1:3005` dengan `VITE_API_URL=http://127.0.0.1:5005`.
4. Frontend: `npx playwright test --config playwright.community.config.ts`.

Runner browser membuka API port 5005 sendiri, membuat database `lj_contributions_browser_*`, lalu menghapus database uji tersebut. Tes backend memakai database `lj_contributions_test_*`. API email diganti respons uji di proses tes, bukan melalui bypass produksi.

## Yang belum diverifikasi

- `not_run`: pengiriman email produksi, domain/DNS Resend, Cloud Run/Vercel nyata dan akses jaringan database cloud.
- `not_run`: pengujian perangkat fisik, pemutaran setiap codec video, benchmark performa baru dan audit keamanan menyeluruh.
- `not_run`: regresi browser inspeksi lama yang sebelumnya dijeda. Preservasi hash bukan klaim seluruh pekerjaan inspeksi sudah lulus.
- Tidak termasuk lingkup: komentar publik dari akun lain, petugas pemerintah, laporan privat, CCTV, moderasi/dashboard penghapusan atau integrasi kirim CRM.

Multer diperbarui dari versi 1 ke 2.4.0 sebelum upload diaktifkan. Build dependency masih melaporkan 5 temuan moderate pada rantai storage legacy yang telah tercatat sebelumnya. Build frontend masih memperingatkan ukuran chunk; tidak ada klaim 60 FPS atau bebas kerentanan.

Aktivasi berikutnya mengikuti [panduan deployment](DEPLOYMENT.md). API key dan kredensial hanya dimasukkan melalui pengaturan backend, tidak ditulis ke repo.
