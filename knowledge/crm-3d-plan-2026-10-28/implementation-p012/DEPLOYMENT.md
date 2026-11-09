# Menyiapkan rilis P0-P2

28 Oktober 2026. Perubahan aplikasi tersedia lokal. Tidak ada perubahan cloud, email sungguhan, commit atau push oleh agen. Panduan ini melengkapi [konfigurasi kontribusi sebelumnya](../../contributions-2026-10-18/DEPLOYMENT.md).

## Backend Cloud Run

| Nama | Penggunaan | Secret |
| --- | --- | --- |
| PUBLIC_REPORTS_ONLY | `true`, menutup endpoint legacy/seed | Tidak |
| COMMUNITY_REPORTS_ENABLED | `true`, mengaktifkan akun dan laporan warga | Tidak |
| MONGODB_URI | Database laporan dan media GridFS | Ya |
| RESEND_API_KEY | Mengirim tautan login | Ya |
| EMAIL_FROM | Alamat pengirim dari domain yang telah diverifikasi | Bukan kredensial, konfigurasi backend |
| APP_ORIGIN | Origin HTTPS frontend yang benar, tanpa path/query/fragment | Tidak |
| CORS_ORIGIN | Origin frontend yang sama dan diizinkan | Tidak |
| NODE_ENV | `production` | Tidak |
| PORT | Disediakan Cloud Run | Tidak perlu diisi manual |

Database connected pada health tidak membuktikan fitur warga aktif atau pengiriman email siap. Pemeriksaan deployment saat perencanaan menunjukkan legacy/community false. Jangan mengaktifkan kembali fallback legacy untuk mengatasi konfigurasi yang kurang.

Sharp dipasang melalui dependency backend dan FFmpeg/ffprobe melalui Dockerfile runner. Deploy backend memakai Dockerfile terbaru; build TypeScript saja tidak memasang binary video pada host lain. Tidak ada API key tambahan untuk pemrosesan foto/video. Jangan menonaktifkan pemrosesan atau menerbitkan berkas asli ketika binary gagal.

## Frontend Vercel

Tetap gunakan `VITE_API_URL` berupa origin backend HTTPS tanpa `/api`. Nilai ini publik. Database, email, token, dan secret lain tidak masuk variabel VITE. Perubahan environment Vite memerlukan build baru. Tidak ada key AI, Ollama, Oyenza atau Google Maps baru untuk P0-P2.

Capability baru `/api/community/capabilities` menjelaskan `reports`, `write`, `login` dan `reason`. Frontend baru menghadapi backend lama yang belum memiliki endpoint ini dengan menonaktifkan aksi penulisan; laporan CRM tetap dapat dibaca. Pasangkan backend dan frontend terbaru ketika rilis.

## Media dan kapasitas

- Maksimum tiga lampiran per kiriman, input/output masing-masing maksimum 10 MB.
- Foto maksimum 24 juta piksel, animasi/multipage ditolak; orientasi diterapkan lalu metadata sumber dibuang. PNG tetap PNG; JPEG/WebP menjadi JPEG.
- Video maksimum 120 detik dan 8.294.400 piksel input; hasil MP4 H.264/AAC muat dalam 1920 × 1080 tanpa crop. Audio tetap disertakan, tidak disamarkan otomatis.
- Satu batch pemrosesan per instance; request lain yang berbenturan mendapat 429 dan dapat dicoba kembali. Batas batch 90 detik; frontend memberi waktu unggahan 120 detik.
- Sesuaikan timeout platform di atas waktu request yang diizinkan dan ukur kapasitas CPU/memori di lingkungan cloud. Pengujian lokal tidak membuktikan konfigurasi resource atau beban produksi.
- Media baru hanya menyimpan keluaran yang telah diproses ke GridFS; byte input berada pada memori/temp selama pemrosesan, lalu dibersihkan. Penarikan menyembunyikan konten, bukan menjanjikan penghapusan seluruh salinan storage/backup.

**Media lama tanpa penanda pemrosesan server tidak disajikan mentah dan mendapat 503.** Tidak ada migrasi massal pada sesi ini. Pemrosesan ulang data lama memerlukan pekerjaan migrasi terpisah atau unggahan ulang oleh pemilik. Ini dampak kompatibilitas yang harus ditinjau sebelum rilis.

Nama publik dan semua event terkait dikembalikan menjadi Pelapor ketika consent ditarik. Audit publikasi menyimpan 100 tindakan terakhir, berbeda dari timeline pengamatan yang maksimum 100 entri termasuk pembuatan. Penarikan tetap tersedia saat jendela audit penuh. Respons terkait memakai no-store; salinan yang telah diunduh pihak lain tidak dapat ditarik kembali oleh aplikasi.

## Pemeriksaan setelah pemilik melakukan deployment

- [ ] Health menunjukkan public-reports, community true, database connected.
- [ ] Capability menunjukkan reports/write/login true, reason null dengan konfigurasi lengkap.
- [ ] Endpoint legacy `/api/reports`, `/api/cctv`, `/api/traffic` tetap 404 pada mode publik.
- [ ] Frontend tidak meminta localhost; konfigurasi origin cocok.
- [ ] Kirim satu login email sungguhan atas tindakan pemilik, periksa domain/DNS dan link yang sampai.
- [ ] Buat satu laporan sah dengan foto/video yang hak publikasinya jelas, tinjau, kirim dan lihat kembali setelah reload.
- [ ] Periksa nama opt-in, riwayat, deep link, penarikan dan pemulihan melalui akun pemilik serta sesi tamu.
- [ ] Konfirmasi media lama mendapat penanganan yang dijelaskan; tidak ada fallback raw atau dummy.
- [ ] Periksa peta/kamera mobile dan desktop pada URL produksi.

Cloud smoke dan email sungguhan tetap not_run sampai dikerjakan pada rilis nyata. Pemilik tetap melakukan commit/push sendiri; push frontend saja tidak otomatis mengubah backend Cloud Run tanpa trigger yang sesuai.
