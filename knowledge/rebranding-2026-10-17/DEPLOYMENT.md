# Deploy peta publik LaporJalan

Panduan ini untuk implementasi peta/daftar CRM pada 17 Oktober 2026. Frontend dan backend sudah diubah secara lokal. Belum ada commit, push, deployment, atau perubahan pengaturan akun cloud.

## Variabel yang diperlukan

| Tempat | Nama | Nilai | Secret? |
| --- | --- | --- | --- |
| Vercel frontend | `VITE_API_URL` | Origin HTTPS service Cloud Run, misalnya `https://NAMA-SERVICE.run.app`. Gunakan URL sebenarnya dari dashboard, tanpa `/api`, tanpa path, tanpa token. | Tidak; masuk bundle browser. |
| Cloud Run backend | `PUBLIC_REPORTS_ONLY` | `true` | Tidak. |
| Cloud Run backend | `CORS_ORIGIN` | Origin frontend yang benar, misalnya `https://NAMA-PROJECT.vercel.app`, tanpa slash akhir/path. Gunakan custom domain jika itu domain yang dibuka warga. | Tidak. |
| Cloud Run backend | `NODE_ENV` | `production` (Dockerfile sudah mengaturnya). | Tidak. |
| Cloud Run backend | `PORT` | Disediakan Cloud Run; aplikasi mendengarkan `0.0.0.0` pada port ini. | Tidak perlu ditambahkan manual. |

Tidak diperlukan API key CRM, MapLibre, OpenFreeMap, Google Maps, OpenAI, MongoDB, atau Google Cloud Storage untuk **fitur peta dan daftar ini**. Tidak ada secret baru yang perlu ditambahkan ke Secret Manager. Jangan menghapus secret yang masih digunakan service lain.

`PUBLIC_REPORTS_ONLY=true` membuka `/health`, `/api/public-reports` dan informasi root. Jalur legacy `/api/reports`, `/api/cctv`, `/api/traffic`, `/api/places` dan `/uploads` tidak dipasang; MongoDB dan seed tidak dijalankan. Ini sengaja membatasi rilis saat ini pada data publik yang dibaca, tanpa endpoint penulisan atau data contoh. Mode lama masih tersedia bila opsi ini tidak diaktifkan; mode lama bukan konfigurasi rilis peta publik yang direkomendasikan.

Sumber CRM dipanggil backend melalui HTTPS tanpa kredensial. Basemap diambil browser dari OpenFreeMap. Koneksi keluar ke sumber tersebut harus tersedia. Kontrak publik/SLA serta hak penggunaan ulang sumber belum terverifikasi; akses lokal berhasil tidak membuktikan akses dari jaringan Cloud Run. Periksa sebelum publikasi luas.

Variabel `VITE_*` dapat dibaca pengunjung melalui bundle, sehingga tidak boleh menyimpan secret. Perubahan nilainya memerlukan build/deploy baru. [Dokumentasi Vite](https://vite.dev/guide/env-and-mode), [variabel Vercel](https://vercel.com/docs/environment-variables).

## Urutan deploy

1. Tinjau diff kedua repo. Working tree sudah berisi pekerjaan lama sebelum tahap ini; hindari mengikutsertakan perubahan atau berkas rahasia tanpa pemeriksaan. Commit/push hanya oleh pemilik proyek.
2. Build dan deploy **repo `laporjalan-be`** ke Cloud Run melalui Dockerfile yang sudah tersedia. Gunakan Node 22 sesuai Dockerfile. Aktifkan variabel pada tabel sebelum revisi melayani trafik.
3. Izinkan akses publik ke service pembaca ini agar browser Vercel dapat memanggilnya. Jangan menaruh service-account token di frontend. Pengaturan akses publik berbeda dari CORS. [Akses publik Cloud Run](https://docs.cloud.google.com/run/docs/authenticating/public).
4. Buka `https://URL-BACKEND/health`. Hasil harus menyatakan `mode: "public-reports"` dan `database: "not-used"`. Health membuktikan proses berjalan, bukan keberhasilan CRM.
5. Buka `https://URL-BACKEND/api/public-reports`. Hasil yang berhasil adalah JSON `reports` dan `source`. Daftar kosong sah bila sumber benar-benar tidak memiliki hasil. HTTP 503 berarti pengambilan sumber gagal; tidak ada fallback dummy.
6. Di Vercel, set `VITE_API_URL` pada environment Production. Untuk Preview, set juga nilainya dan sesuaikan CORS dengan origin preview yang digunakan. Kode CORS sekarang menerima satu origin; origin preview acak tidak otomatis diizinkan.
7. Pilih preset **Vite**, build command `npm run build`, output directory `dist`, Node 22. Bila repo frontend diimpor sendiri, root directory adalah root repo; bila workspace gabungan diimpor, pilih folder `LaporJalan`. [Vite pada Vercel](https://vercel.com/docs/frameworks/frontend/vite).
8. Build/deploy frontend setelah URL backend diisi. Build sekarang menolak URL kosong, HTTP, localhost, path `/api`, query, fragment dan kredensial dalam URL.
9. Jalankan smoke test di bawah pada URL yang benar-benar dipublikasikan. Pastikan tidak ada request ke `localhost` atau `127.0.0.1` di browser pengguna.

Push saja cukup memicu Vercel **hanya jika integrasi Git dan branch deploy sudah terhubung**. Push tidak otomatis membangun/deploy Cloud Run kecuali trigger continuous deployment sudah dikonfigurasi. Pengaturan akun/trigger remote belum diperiksa dalam sesi ini. Frontend baru memerlukan backend baru; push frontend saja tidak menambahkan endpoint CRM pada Cloud Run.

## Smoke test sesudah deploy

- [ ] Health backend: `public-reports`, database `not-used`.
- [ ] GET `/api/public-reports`: respons sumber atau 503 yang jelas; tidak redirect ke login.
- [ ] GET/POST `/api/reports`: 404 pada mode publik.
- [ ] Request dari origin frontend mendapat CORS yang sesuai; tidak muncul `Failed to fetch` akibat origin salah.
- [ ] Peta, daftar, pencarian kode/status, filter kategori, dan kembali dari detail bekerja.
- [ ] Mobile dapat membuka detail, memperluas daftar dan membaca atribusi peta.
- [ ] Refresh gagal menampilkan peringatan dan waktu data terakhir; gagal pertama tidak menampilkan laporan contoh.
- [ ] Jumlah laporan dipahami sebagai kategori Jalan, hari ini + kemarin menurut Jakarta, bukan seluruh laporan kota atau jumlah jalan rusak terverifikasi.

## Pemulihan

Jika frontend salah konfigurasi URL/CORS, perbaiki environment dan redeploy; jangan mengganti kegagalan dengan data contoh. Jika perlu rollback, pilih deployment Vercel/revisi Cloud Run yang kompatibel sebagai pasangan. Jangan mengembalikan backend ke revisi legacy sambil membiarkan frontend baru memanggil endpoint yang belum tersedia.

Rollback/hentikan rilis bila metadata privat bocor, mode publik masih membuka endpoint penulisan, halaman utama gagal, atau sumber gagal terus. Kegagalan CRM sporadis ditampilkan sebagai gagal/stale; health tetap bisa 200. Pantau status endpoint sumber selain health proses.

## Batas rilis

Peta/list/detail sumber sudah diterapkan. Toggle 2D/3D ditambahkan atas pilihan pengguna; 2D tetap menjadi tampilan awal. Tidak diperlukan key tambahan untuk tampilan bangunan 3D. Komentar, unggah foto/video, formulir laporan baru, CCTV, autentikasi serta riwayat progres tidak termasuk rilis ini. Foto tidak dibuat-buat. Kategori Pembangunan/Saluran/Pembakaran belum mempunyai pemetaan sumber yang terverifikasi. Inspeksi lama disimpan di `src/InspectionWorkspace.tsx`, tidak dimuat oleh entry publik dan tidak dinyatakan selesai.

Hasil pengujian lokal dan screenshot berada pada [run implementasi](runs/map-list-2026-10-17/). Smoke test di cloud, CI remote, peninjauan pemilik, dan pengaturan trigger masih `not_run`/belum diverifikasi; tidak boleh ditandai lulus berdasarkan hasil lokal.

## Pemeriksaan container dan dependency

Image Docker berhasil dibangun dan dijalankan lokal. Health menyatakan database tidak digunakan; endpoint sumber mendapat HTTP 200 dengan 51 laporan pada pemeriksaan tersebut; endpoint legacy mendapat 404. Berkas `.env` tidak ikut image. [Bukti container](runs/map-list-2026-10-17/container-smoke.json).

Audit dependency backend melaporkan 5 temuan moderate pada rantai Google Cloud Storage/uuid, tanpa high/critical pada hasil tersebut. Dependency lama tidak diperbarui dalam perubahan UI ini; fitur storage/upload tidak dipasang pada mode publik. Build juga memperingatkan Multer 1.x sudah deprecated. Catatan ini tetap perlu ditangani sebelum mengaktifkan kembali upload legacy. [Hasil audit](runs/map-list-2026-10-17/backend-audit.json). Tidak ada klaim audit keamanan menyeluruh atau dependency bebas kerentanan.
