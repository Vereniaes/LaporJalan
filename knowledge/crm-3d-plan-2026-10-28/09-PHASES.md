# Fase implementasi dan TODO terperinci

## Status pelaksanaan lokal - 28 Oktober 2026

P0-P2 telah dikerjakan dan [P3-P4 beserta dua siklus optimasi](implementation-p34/RESULTS.md) telah diverifikasi lokal. Gate RAF lulus dengan variasi/render pendamping yang masih terbuka; ini bukan kelulusan seluruh performa. Daftar awal di bawah merupakan rencana historis. TODO pelaksanaan dan bukti terkini berada pada paket masing-masing fase. P5/P6 belum dijalankan; tahap berikut menunggu pilihan pengguna.


Seluruh fase aplikasi di bawah **belum dijalankan pada sesi perencanaan**. Urutan mengutamakan kemampuan yang sudah tersedia dan membatasi eksperimen. P0-P2 adalah langkah implementasi berikut yang direkomendasikan; persetujuan rencana bukan bukti fase lulus.

## Pembaruan pelaksanaan P0-P2

Pengguna meminta kelanjutan berurutan setelah paket perencanaan. [Hasil lokal P0-P2](implementation-p012/RESULTS.md) dan [TODO pelaksanaan](implementation-p012/TODO.md) mencatat pemeriksaan terbaru. Daftar di bawah mempertahankan rincian rencana; P3-P6 belum dijalankan. Produksi belum diubah.

## P0 - baseline dan kesiapan layanan

**Pemilik:** pengendali + pemeriksa API. **Prasyarat:** baca paket dan keputusan yang sudah diterima.

- [ ] Catat working tree/HEAD, baseline UI dan konfigurasi efektif tanpa nilai secret. Deployment saat penelitian: legacy/community false.
- [ ] Bedakan penyebab community tidak aktif, database gagal dan email belum siap. Gunakan capability publik yang aman bila pesan UI memerlukannya.
- [ ] Siapkan lingkungan LaporJalan terisolasi; jangan memakai port/database BuktiPulih atau database produksi untuk tes.
- [ ] Verifikasi target PUBLIC_REPORTS_ONLY/community, origin, MongoDB dan adapter email sesuai panduan. Perubahan cloud/pengiriman email sungguhan memerlukan langkah rilis yang diotorisasi, tidak dilakukan diam-diam oleh agen.
- [ ] Bekukan kasus dan baseline performa yang relevan sebelum mengubah renderer.

**Berkas terkait:** backend `src/index.ts`, `src/config/env.ts`, `src/routes/healthRoutes.ts`, `src/community/index.ts`; frontend `community.ts` dan keadaan layanan pada halaman publik. Sentuh hanya bagian yang terbukti perlu.

**Gate:** login/laporan tersedia pada lingkungan uji, atau hambatan konfigurasi tercatat konkret. Kegagalan sumber tidak beralih ke seed/dummy. **Stop:** secret/domain/cloud belum siap; UI lainnya dapat disiapkan, tetapi jangan menyebut layanan produksi aktif.

## P1 - identitas pelapor dan tujuan login

**Pemilik:** implementasi laporan. **Dependensi:** kontrak akun dan P0 lingkungan uji.

- [ ] Tambah nama pilihan akun dan nama publik per laporan secara additive; consent opt-in, default Pelapor.
- [ ] Pertahankan email privat; old DTO tanpa field baru tetap kompatibel.
- [ ] Tambah tinjau nama, penarikan nama dan proyeksi label actor tanpa menyalin identitas ke seluruh event.
- [ ] Simpan tujuan login yang aman untuk laporan sendiri/detail/form, termasuk tab/perangkat berbeda.
- [ ] Tambah deep link laporan dan pemuatan detail di luar halaman daftar pertama.
- [ ] Uji akun lain ditolak, escaping, consent, revoke, link habis dan retry.

**Berkas:** backend `src/community/auth.ts`, `reports.ts`, tes community; frontend `EmailLogin.tsx`, `NewReport.tsx`, `CitizenDetail.tsx`, `community.ts`, `PublicReportsPage.tsx` dan tes terkait. Helper baru hanya bila menghindari duplikasi nyata.

**Gate:** nama hanya muncul atas persetujuan; semua pembaruan memiliki atribusi yang tepat; tujuan login tidak hilang. **Dampak:** privasi, DTO dan cache; bukan perubahan kontrak CRM.

## P2 - detail, riwayat dan publikasi yang terbaca

**Pemilik:** UI + reviewer visual terpisah. **Dependensi:** P1 dan baseline visual.

- [ ] Terapkan Ringkasan/Riwayat dalam panel yang sama; tampilkan bukti, waktu, sumber dan pelapor sesuai hierarki UI.
- [ ] Perbaiki kepadatan mobile: kategori daftar tidak memakan ruang detail, pesan gagal sesuai konteks, kontrol/atribusi tidak tertutup.
- [ ] Refresh memuat kedua feed dan mempertahankan isian/pilihan yang relevan.
- [ ] Pertahankan status warga; catatan tidak memalsukan perubahan status. Jelaskan 100 entri termasuk entri awal. Sebelum timeline ditampilkan terbaru dahulu, label/lampiran entri pembuatan memakai jenis/ID yang stabil, bukan indeks tampilan.
- [ ] Rancang dan implementasikan kontrol publikasi minimum yang disetujui pada tahap implementasi: penarikan pemilik, akses media dan audit. Tetapkan moderator nyata sebelum jalur moderator diaktifkan.
- [ ] Tinjau klaim privasi form; tambahkan turunan gambar yang aman dan kebijakan video/retensi sebelum memperluas publikasi.
- [ ] Periksa desktop/mobile/320 px, keyboard, fokus, tanpa foto, riwayat panjang dan layanan tidak tersedia.

**Berkas:** frontend `CitizenDetail.tsx`, `ReportMedia.tsx`, `PublicReportsPage.tsx`, CSS publik/community; backend `reports.ts`, `media.ts` bila publikasi/turunan diterapkan; tests yang bersesuaian.

**Gate:** isi utama dapat dibaca, sumber tidak tertukar, media yang ditarik tidak disajikan kembali, tidak ada peringatan yang menghalangi isi secara berulang. **Stop:** belum ada kebijakan/kemampuan penarikan media yang diperlukan; jangan mengaktifkan diskusi publik atau menyatakan media otomatis aman.

## P3 - kontrak kondisi dan bentuk manual

**Pemilik:** laporan + geometri. **Dependensi:** P1-P2 untuk review dan persistensi.

- [ ] Pisahkan kategori, kondisi, pengamatan status, publikasi dan representasi.
- [ ] Tambah point/line/polygon dan provenance opsional; lokasi kamera bukan otomatis lokasi kerusakan. Perluas fingerprint idempotensi agar seluruh field semantik baru tercakup; retry dengan ID sama dan payload berbeda ditolak.
- [ ] Buat konfirmasi titik dan alat ruas/area sederhana; jangan menambah dependensi gambar besar sebelum mengevaluasi API peta yang ada.
- [ ] Tambah input dimensi opsional dengan satuan, metode dan waktu; validasi invalid/missing tanpa angka pengganti.
- [ ] Definisikan pengamatan penutupan, cakupan akses dan usia data; kebijakan stale ditetapkan sebelum rilis tampilan penutupan.
- [ ] Tampilkan pratinjau simbol/area dan keterbatasan sebelum simpan.

**Berkas:** DTO/validator `reports.ts`, frontend `community.ts`, form/detail, `PublicMap.tsx`, adapter kecil geometri. Jangan menghidupkan heuristik `imageDetection.ts` sebagai pengukuran.

**Gate:** data kurang menghasilkan simbol atau bentuk belum tersedia; tidak mengarang ukuran, heading, jalan selebar 7 m atau jadwal. **Dampak:** filter/selection dan old reports tetap kompatibel.

## P4 - integrasi satu objek 3D pada peta publik

**Pemilik:** map/geometry, diperiksa reviewer visual. **Dependensi:** P3 dan fixture yang sumber/skala lokasinya diketahui.

- [ ] Bekukan pembanding inspeksi dekat yang sebanding, terpisah dari baseline rute publik zoom 19; lihat evaluasi 10.
- [ ] Satu objek dahulu; gunakan DamageLayer/sampler/transformasi yang sudah ada, satu canvas.
- [ ] Sediakan mode inspeksi eksplisit dan pose lengkap; 2D menghentikan orbit, pilihan biasa tidak memaksa inspeksi.
- [ ] Buktikan permukaan/bibir/dasar/occlusion pada empat bearing dan bangunan; jangan menipu dengan kedalaman global.
- [ ] Periksa clipping/label pada zoom sangat dekat; gunakan kebijakan label lokal yang sudah ada bila diperlukan.
- [ ] Uji style reload, WebGL2 fallback, context recovery, hidden tab, resize mobile dan 20 siklus keluar/masuk.
- [ ] Sesudah satu objek lulus, tambah representasi construction/closure berdasarkan ruas/area terkonfirmasi. Instancing/LOD ditambah hanya bila pengukuran jumlah objek menuntutnya.

**Berkas:** `PublicMap.tsx`, `src/map/DamageLayer.ts`, `damageGeometry.ts`, `damageMaterial.ts`, `coordinates.ts`, `camera.ts`, `closeZoomLabels.ts`; baca `Map3D.tsx` sebagai acuan, jangan menyalin komponen lama utuh.

**Gate:** target tertambat, terlihat, tidak melayang, ukuran/provenance jujur; peta tetap bekerja setelah layer dilepas. Performa memenuhi ambang yang dibekukan. **Stop:** aperture/terrain/occlusion tidak dapat dibuktikan dalam dua percobaan; laporkan dengan screenshot dan tiga opsi lingkup. Jalur simbol/2D tetap tersedia, bukan pengganti klaim cekungan lulus.

## P5 - pilot vision lokal terpisah

**Pemilik:** peneliti model + harness. **Dependensi:** dataset berizin, kontrak 06, dan pilihan menjalankan pilot. Tidak memerlukan deployment GPU produksi.

- [ ] Catat kapasitas bebas, versi, lisensi dan budget; unduh satu kandidat 4B hanya ketika fase ini dijalankan.
- [ ] Bekukan pilot/holdout, label manual, prompt, schema, preprocessing dan metric sebelum membandingkan.
- [ ] Uji hasil schema, jenis/unknown, kualitas foto, data negatif, latensi cold/warm dan memori.
- [ ] Bandingkan 2B hanya bila 4B terlalu berat atau tidak bermanfaat; jangan mencoba banyak model tanpa alasan.
- [ ] Rekam kegagalan, domain gap dan keputusan lanjut/manual. Jangan menyimpulkan kemampuan Jakarta dari benchmark umum model.

**Berkas:** modul worker/evaluator baru yang kecil dan terisolasi; bukti pada knowledge, bobot/dataset besar di luar Git. Tidak mengubah renderer atau status laporan demi skor model.

**Gate:** hasil memberi manfaat sesuai evaluasi 10, atau fitur AI tetap eksperimental/nonaktif. **Stop:** dataset/izin tidak tersedia, OOM, kualitas/latensi tidak memenuhi target; fitur laporan tidak diblokir.

## P6 - menghubungkan saran AI ke laporan

**Pemilik:** API/worker + UI. **Dependensi:** P5 lulus dan kontrak P3.

- [ ] Buat job durable dengan lease/dedupe/rate limit; worker satu request dan hanya media milik laporan yang diizinkan.
- [ ] UI meminta analisis setelah media tersimpan; hasil tidak dipublikasikan otomatis.
- [ ] Pelapor menerima/mengoreksi/menolak; simpan provenance dan revision secara idempoten.
- [ ] Hasil lama ditandai stale ketika bukti/kondisi berubah; penarikan media membatalkan pemrosesan.
- [ ] Uji model mati/timeout/JSON buruk, restart worker, dua konfirmasi bersamaan dan input bergambar berisi instruksi.
- [ ] Putuskan tempat worker produksi dan kredensialnya sebelum aktivasi; jangan membuka Ollama laptop ke internet.

**Berkas:** route analisis baru di bawah community, worker kecil, `community.ts`, detail dan panel saran; kontrak lama tetap berfungsi.

**Gate:** kegagalan AI tidak menggagalkan laporan; tidak ada data identitas/secret ke model; semua saran untuk peta melewati konfirmasi.

## P7 - verifikasi, review dan handoff

**Pemilik:** harness, reviewer visual dan reviewer akhir yang tidak menulis patch yang sama.

- [ ] Jalankan typecheck/build frontend/backend serta regresi community, kamera/filter dan renderer yang terdampak.
- [ ] Ukur performa baseline/kandidat pada perangkat yang dicatat; periksa ketika vision dan browser berbagi GPU bila relevan.
- [ ] Tinjau screenshot dan interaksi nyata desktop/mobile, bukan hanya diff piksel.
- [ ] Audit DTO, privasi nama/media, sumber, status, ukuran dan fallback.
- [ ] Simpan laporan hasil, keterbatasan, konfigurasi tambahan dan rollback kompatibel; artefak besar/bobot tidak masuk tracking.
- [ ] Serahkan diff lokal untuk pemilik. Commit/push hanya pemilik; deployment tidak menjadi tindakan otomatis agen.

**Gate:** seluruh pemeriksaan wajib lulus dengan bukti atau hambatan konkret dinyatakan failed/not_run. Tidak ada penggantian baseline, penurunan ambang atau klaim selesai karena budget habis.

## Sesudah tahap pertama

SAM 2, rekonstruksi metric, diskusi publik, notifikasi pengikut dan integrasi CRM resmi masing-masing memerlukan kebutuhan dan gate baru. Jangan menjalankan semuanya hanya karena tersedia di daftar teknologi.


## Status terbaru - 29 Oktober 2026

Daftar fase di atas mempertahankan konteks perencanaan awal. P0-P4 telah diimplementasikan lokal dengan batas verifikasi yang dicatat pada paketnya. [P5](implementation-p5/RESULTS.md) selesai hanya sebagai smoke8foto; evaluasi140foto belum dijalankan. Pengguna kemudian memilih [rancangan P6 saja](implementation-p6-design/README.md), tanpa mengaktifkan model di aplikasi. Endpoint/worker/UI P6 tetap belum diimplementasikan.


## Implementasi P6 model-off - 29 Oktober 2026

Setelah rancangan, pengguna memilih implementasi bertahap dengan model tetap nonaktif. [Fondasi privat, UI tinjauan dan konfirmasi P6](implementation-p6/RESULTS.md) telah diterapkan lokal dan diuji:115passed/1skip gabungan,57passed backend,14 pemeriksaan buildproduksi. Worker/inferensi dan gate kualitas140foto belum dijalankan. Lihat [handoff rilis](implementation-p6/DEPLOYMENT.md). Kode renderer/kamera tetap sama; tidak ada commit/push/deployment.
