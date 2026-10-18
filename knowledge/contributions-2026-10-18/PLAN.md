# Laporan dan pembaruan warga

Tanggal: 18 Oktober 2026. Keputusan pengguna: laporan disimpan di LaporJalan, pembaruan berasal dari pelapor, akses melalui tautan email. Tidak ada petugas simulasi atau pengiriman otomatis ke CRM.

## TODO

- [x] Baca kode publik, backend lama, mockup, deployment, guardrail dan sumber resmi.
- [x] Tetapkan sumber pembaruan dan cara masuk melalui /grillme.
- [x] Backend persisten: akun email, tautan sekali pakai, sesi, laporan, lampiran dan riwayat.
- [x] UI: tambah laporan, pemilihan lokasi, tinjau, status, pembaruan, akses milik pelapor.
- [x] Uji data tersimpan, kepemilikan, replay, kegagalan, media dan tampilan desktop/mobile.
- [x] Dokumentasi konfigurasi cloud dan keterbatasan; tanpa commit/push/deploy.

## Kontrak

Laporan warga memiliki kategori, judul, uraian, lokasi yang dipilih, patokan opsional, waktu server dan lampiran opsional. Status awal Dilaporkan. Pembaruan menyimpan catatan dan kondisi yang diamati pelapor: belum berubah, terlihat dikerjakan, atau terlihat selesai. Semua status tetap pengamatan pelapor, bukan verifikasi pemerintah. Riwayat tidak ditimpa.

Email merupakan data akses privat. Token masuk acak 256 bit, disimpan sebagai hash, berlaku 15 menit dan sekali pakai. Sesi dibatasi waktunya dan dapat dicabut saat keluar. Email tidak muncul pada DTO publik. Browser menyimpan sesi per tab; tautan tidak menaruh token pada query URL. Permintaan masuk dan penulisan dibatasi pada server. Resend menjadi adapter awal melalui HTTPS tanpa SDK tambahan; tidak ada email sungguhan dikirim saat pengujian.

Laporan dan metadata tersimpan dalam koleksi MongoDB baru, terpisah dari seed legacy. GridFS memakai MongoDB yang sama untuk lampiran, sehingga tidak bergantung pada disk Cloud Run. JPEG/PNG/WebP/MP4/WebM, maksimum 3 lampiran dan 10 MB per berkas. Validasi server memeriksa ukuran, MIME dan signature. Bukan layanan pemindaian virus atau moderasi otomatis. Isi yang dipublikasikan harus dikonfirmasi pelapor pada langkah tinjau.

Create dan update memakai ID permintaan untuk mencegah duplikasi saat retry. Status dan entri riwayat diperbarui atomik dalam satu dokumen. Mutasi memerlukan sesi dan pemeriksaan pemilik. Database gagal tidak beralih ke memori atau data contoh. Toggle kamera publik dan geometri inspeksi dipertahankan.

## Referensi

- [Kanal resmi CRM](https://crm.jakarta.go.id/kanal-pengaduan): kanal masuk berbeda; tidak ada bukti API kirim pihak ketiga yang tersedia.
- [Panduan laporan JAKI](https://jaki.jakarta.go.id/id/feature/report/): foto, lokasi, uraian, kategori, privasi dan konfirmasi. Bukan bukti semua data akun wajib pada setiap laporan.
- [CRM petugas](https://crm.jakarta.go.id/crm_petugas): tindak lanjut pemerintah memiliki pihak berwenang tersendiri.
- [Kebijakan privasi JAKI](https://jaki.jakarta.go.id/privacy-policy/): cakupan data akun, bukan daftar persyaratan wajib formulir.
- [GridFS](https://www.mongodb.com/docs/drivers/node/current/crud/gridfs/): penyimpanan dan streaming berkas.
- [Multer](https://expressjs.com/en/resources/middleware/multer/): pembatasan multipart pada route upload.
- [Resend](https://resend.com/docs/api-reference/emails/send-email): adapter pengiriman tautan.
- [OWASP token email](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html): token acak, singkat masa berlaku, sekali pakai, pembatasan permintaan.

Sumber diperiksa 18 Oktober 2026. Situs JAKI belum diuji melalui akun aplikasi; tidak ada laporan eksternal dibuat. frontend-req terpisah tetap tidak ditemukan; mockup proyek menjadi acuan.

Hasil: [verifikasi dan keterbatasan](RESULTS.md), [konfigurasi deployment](DEPLOYMENT.md).
