# Mengaktifkan laporan warga

Tanggal: 18 Oktober 2026. Perubahan masih lokal, tanpa commit, push, pengiriman email sungguhan, atau deployment oleh agen. Rilis pembaca CRM sebelumnya tetap bisa berjalan dengan kontribusi dimatikan.

## Konfigurasi

| Tempat | Variabel | Isi | Secret |
| --- | --- | --- | --- |
| Vercel | `VITE_API_URL` | Origin HTTPS backend Cloud Run, tanpa `/api` | Tidak |
| Cloud Run | `PUBLIC_REPORTS_ONLY` | `true`, tetap menutup semua route legacy/seed | Tidak |
| Cloud Run | `COMMUNITY_REPORTS_ENABLED` | `true` untuk mengaktifkan laporan warga | Tidak |
| Cloud Run | `MONGODB_URI` | URI database yang dapat dijangkau Cloud Run, dengan kredensial terbatas pada database aplikasi | Ya |
| Cloud Run | `APP_ORIGIN` | Origin frontend final, misalnya `https://NAMA.vercel.app`, tanpa path | Tidak |
| Cloud Run | `CORS_ORIGIN` | Origin frontend yang sama | Tidak |
| Cloud Run | `RESEND_API_KEY` | API key untuk pengiriman email pada akun Resend | Ya |
| Cloud Run | `EMAIL_FROM` | `LaporJalan <masuk@DOMAIN-TERVERIFIKASI>` | Tidak |
| Cloud Run | `NODE_ENV` | `production` | Tidak |

Simpan URI MongoDB dan key Resend melalui Secret Manager lalu hubungkan ke environment Cloud Run. Jangan memasukkan keduanya ke variabel `VITE_*`, repo, atau chat. Tidak perlu key Google Maps, key CRM, JWT secret, atau GCS untuk fitur ini. Lampiran memakai GridFS pada database yang sama, sehingga tidak hilang saat instance Cloud Run diganti.

Resend dipakai melalui adapter HTTPS tanpa SDK baru. Siapkan domain pengirim dan konfigurasi DNS pada akun Resend. Nilai EMAIL_FROM contoh bukan pengirim yang siap dipakai. [Dokumentasi pengiriman](https://resend.com/docs/api-reference/emails/send-email).

Konfigurasi email yang kosong menyebabkan permintaan tautan gagal 503 dengan pesan yang jelas. Database tidak tersedia ketika fitur aktif membuat startup gagal; koneksi putus saat runtime menyebabkan endpoint kontribusi gagal 503. Tidak ada fallback laporan contoh atau penyimpanan sementara yang dinyatakan berhasil.

## Urutan rilis

1. Tinjau perubahan di dua repo. Pemilik melakukan commit/push sendiri.
2. Konfigurasikan database persisten dan akses jaringan dari Cloud Run. Tidak ada migrasi data legacy; startup membuat indeks koleksi `citizen_*` dan tidak memasukkan seed.
3. Konfigurasikan layanan email serta origin frontend. Deploy backend terlebih dahulu. Mengaktifkan kontribusi mensyaratkan `PUBLIC_REPORTS_ONLY=true`.
4. Periksa `/health`: `community: true`, `database: connected`. `/api/reports` legacy tetap 404.
5. Deploy frontend dengan VITE_API_URL yang benar. Perubahan env frontend membutuhkan build baru.
6. Kirim tautan masuk ke email yang dikuasai pemilik. Periksa delivery nyata, termasuk folder spam, dan buka tautan di browser. Pemeriksaan ini belum dilakukan agen.
7. Buat laporan yang benar-benar sesuai kondisi yang ingin dipublikasikan, tambahkan pengamatan, muat ulang, lalu pastikan akun lain tidak mendapat akses memperbarui. Jangan membuat laporan contoh pada database produksi.
8. Periksa layar mobile, peta 2D/3D, CORS, pemuatan media, dan pemutaran/seek video di perangkat target.

Push saja belum cukup jika environment, database, domain email dan trigger Cloud Run belum disiapkan. Secret/config tambahan berada di backend; Vercel hanya membutuhkan URL API yang sudah digunakan sebelumnya.

## Perilaku akses dan data

- Email diperlukan untuk masuk, bukan untuk ditampilkan di peta. Tidak meminta NIK, KTP, nama lengkap, atau nomor telepon.
- Tautan masuk memakai token acak 256 bit di fragment URL, 15 menit, sekali pakai. GET halaman tidak menghabiskan token; konfirmasi mengirim POST. URL dibersihkan dari token ketika dibaca aplikasi.
- Server menyimpan hash token. Sesi berlaku 7 hari dan dicabut saat keluar; browser menyimpannya per tab dalam sessionStorage, dengan fallback memori jika storage tidak tersedia. Tab baru dapat memerlukan masuk ulang. Tidak menggunakan cookie lintas domain.
- Sesi dapat dibaca JavaScript pada origin aplikasi; cegah injeksi script dan jangan memasang script pihak ketiga yang tidak dipercaya. Ini bukan klaim audit keamanan menyeluruh.
- Maksimum 10 laporan/jam dan 40 permintaan penulisan/jam per akun; email 3/15 menit per alamat dan 100/jam global. Batas disimpan pada MongoDB agar berlaku lintas instance.
- Maksimum 100 entri riwayat per laporan, 3 lampiran per pengiriman, 10 MB per berkas. MIME dan signature diperiksa. Media JPEG/PNG/WebP/MP4/WebM tidak otomatis dimoderasi atau dihapus metadatanya.
- Pemilik mengonfirmasi publikasi lokasi, uraian dan lampiran. Semua laporan fitur ini publik. Fitur laporan rahasia JAKI tidak disalin ke LaporJalan.
- Batas koordinat merupakan amplop layanan sekitar Jakarta, bukan verifikasi poligon batas administrasi. Titik tetap pilihan pelapor dan belum pengukuran tersertifikasi.
- Daftar memuat 100 laporan warga per halaman dengan tombol muat berikutnya. CRM tetap memakai cakupan sumber hari ini dan kemarin.
- Riwayat mencatat waktu server dan pengamatan pelapor. Tidak mengarang status petugas, estimasi selesai, dimensi, atau persentase progres.

## Batas operasional

Email produksi, pembatasan pengiriman aktual penyedia, konfigurasi cloud dan audit perangkat fisik masih belum diverifikasi. Kuota database/media perlu dipantau. Koleksi email/akun tidak mempunyai alur penghapusan mandiri atau dashboard moderasi pada lingkup ini. Lampiran yang gagal disimpan ke laporan dibersihkan dalam jalur error; proses yang mati mendadak di tengah upload dapat meninggalkan GridFS tanpa referensi, yang tidak dilayani endpoint publik dan perlu pemeriksaan operasional.

Bila ada masalah, set `COMMUNITY_REPORTS_ENABLED=false` pada backend. Peta pembaca CRM tetap tersedia; data tersimpan tidak dihapus. Jangan menonaktifkan `PUBLIC_REPORTS_ONLY` sebagai jalan pintas karena itu membuka route legacy yang berbeda kontrak.
