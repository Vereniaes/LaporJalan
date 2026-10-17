# Fase implementasi LaporJalan

Status: rancangan kerja, seluruh pekerjaan implementasi dan pengujian di bawah belum dijalankan oleh paket ini. Checklist lama tidak menggantikan bukti penerimaan. [HARNESS.md](HARNESS.md) mendefinisikan ID pengujian, bukti, dan tiga gerbang penerimaan.

Dokumen ini mengarahkan implementasi berikutnya. Pembuatan paket dokumentasi tidak memberi izin menjalankan harness, memasang dependensi, mengubah aplikasi, API, atau basis data. Keputusan baru sebelum atau selama implementasi memakai `/grillme` sesuai [GUARDRAILS.md](GUARDRAILS.md); keputusan yang sudah diterima tidak ditanyakan ulang. Larangan commit dan push tetap berlaku.

## Pemilik dan urutan

Nama pemilik berikut adalah peran tetap untuk penugasan, bukan pernyataan bahwa agen sudah berjalan: `orchestrator` mengelola ledger dan keputusan; `frontend-map` mengerjakan kamera serta integrasi peta; `geometry` mengerjakan prototipe bentuk; `frontend-ui` mengerjakan bangunan, panel, dan CCTV; `verifier` menjalankan pemeriksaan independen; `reviewer` meninjau hasil. Maksimal dua worker aktif, satu penulis per berkas, tanpa agen turunan. Penugasan baru wajib menyebut nama pemilik aktual pada `task.json`.

Pemetaan ke [BOOTSTRAP.md](BOOTSTRAP.md): `frontend-map` dan `geometry` memakai prompt `map-geometry`; `frontend-ui` memakai `ui`; `verifier` memakai `harness` atau `visual-qa` sesuai tugas. Ini nama penugasan, bukan tambahan slot worker. Prompt `common` selalu disertakan bersama prompt peran.

Urutan gerbang: P0 -> P1 -> P2 -> P3 -> P4 -> P5 -> P6 -> P7. P4 dan P5 dapat dianalisis sebelumnya tanpa mengubah berkas yang dikunci; implementasi mengikuti gerbang. P2 adalah titik keputusan kelayakan. Kegagalan P2 menghentikan integrasi, bukan memicu pergantian engine otomatis. Aturan anggaran dan berhenti terdapat pada [HARNESS.md](HARNESS.md#siklus-perbaikan).

Path pada daftar izin selalu relatif terhadap akar frontend `LaporJalan/`. Daftar izin fase adalah batas maksimum yang harus dipersempit pada tugas. Path baru di bawah `src/map/` dan `tests/` adalah usulan untuk implementasi berikutnya, belum ada. Penambahan path lain memerlukan keputusan ruang lingkup. Berkas ledger dan baseline hanya ditulis `orchestrator`; worker menyerahkan hasil terpisah. Berkas pengujian hanya ditulis `verifier` sebelum tugas implementasi berjalan, kemudian dibekukan untuk tugas tersebut.

Penerimaan fase memiliki cakupan tertulis pada tugas dan hasil, misalnya `P2:prototype-layer`. Bukti subset tidak meluluskan ID atau gerbang akhir seluruh aplikasi. D03-D04 seluruh UI dituntaskan P5; lifecycle/media penuh dan seluruh regresi dituntaskan P6. Temuan awal tetap terbuka sampai fase pemiliknya selesai. Kegagalan baru pada cakupan fase atau regresi yang ditimbulkan perubahan menahan fase tersebut; cacat baseline di luar cakupan tidak disamarkan sebagai lulus. Lihat kontrak cakupan pada HARNESS.

## P0 - Baseline dan bukti

Prasyarat: arah inspeksi pada peta disetujui melalui `/grillme`, versi lokal dan working tree dapat dibaca. Pemilik: `orchestrator`; pemeriksa: `verifier` dan `reviewer`.

- [ ] Catat status Git dan hash isi berkas aplikasi yang sudah berubah, tanpa mengubah atau memulihkan perubahan tersebut.
- [ ] Baca guardrails, frontend-req, mockup, catatan dan [perbandingan video](../video-ui-comparison-2026-10-16.md). Catat artefak yang tidak ditemukan, jangan mengarang desain.
- [ ] Inventaris versi paket terkunci, Node, npm, browser, GPU, WebGL2 dan sistem operasi aktual. Konfirmasi MapLibre 4.7.1 dan Three 0.170.0 terhadap lockfile serta instalasi, bukan hanya rentang pada package.json.
- [ ] Baca utilitas dan konfigurasi test yang sudah ada pada saat implementasi. Gunakan ulang yang sesuai; siapkan satu runner Playwright dev-only untuk helper TypeScript tanpa page fixture dan project browser desktop/mobile. Tambahkan hanya dependensi, browser dan konfigurasi lokal yang diperlukan, tanpa framework test tambahan jika belum ada bukti kebutuhan.
- [ ] Bekukan test contract serta fixture minimal, jalankan smoke harness, lalu ambil baseline perilaku aplikasi yang belum diperbaiki. Setup P0 hanya berlaku setelah prompt peluncuran BOOTSTRAP dikirim sebagai permintaan implementasi; izin tersebut sudah mencakup setup terbatas sehingga tidak ditanyakan ulang. Sesi dokumentasi saat ini tidak memasang apa pun.
- [ ] Ambil baseline desktop 1440 x 900 dan mobile 390 x 844 menggunakan fixture serta pose kamera terkontrol pada HARNESS. Rekam bug 2D, ukuran palsu, dan CCTV statis sebagai kondisi awal yang gagal.
- [ ] Bekukan hash baseline, fixture, kontrak pengujian, video acuan dan hasil kompilasi/build; tetapkan identitas run, pemilik, kunci berkas, penghitung awal serta ambang kinerja U03 berdasarkan kebutuhan yang disepakati. Simpan baseline implementasi pada `runs/<run-id>/baseline.json`.

Izin berkas: `knowledge/oyenza-agent-pack/runs/<run-id>/`, `knowledge/oyenza-agent-pack/evidence/<baseline-id>/`; khusus tugas verifier setup harness: `package.json`, `package-lock.json`, `playwright.config.ts`, `tests/`. Baseline run ditulis sekali oleh orchestrator pada `runs/<run-id>/baseline.json`; perubahan menghasilkan ID/run baru dengan alasan, tanpa menimpa versi sebelumnya. `knowledge/oyenza-agent-pack/baseline.json` kanonis milik sesi dokumentasi hanya dibaca dan tidak pernah ditimpa P0. Sebelum setup harness, rekam hash package/config awal; setelah setup, rekam delta dependensi/config terpisah dari perubahan fitur.

Penerimaan: B01-B03 pada cakupan baseline serta smoke harness unit/browser; gerbang fase otomatis, visual dan review memiliki bukti masing-masing. Cacat fitur yang direproduksi bukan kegagalan inventaris baseline B03 dan tetap dicatat sebagai failed pada kasus fiturnya. Artefak: manifest hash, status Git sebelum kerja, lingkungan, tangkapan layar, trace reproduksi, hasil perintah/exit code dan setup delta. Gagal/pemulihan: layanan eksternal atau GPU tidak tersedia diberi `blocked` atau `not_run`; gunakan fixture lokal yang dilabeli, lalu ulangi baseline yang terdampak. Jangan mengklaim integrasi nyata dari fixture. P1 tidak dimulai sebelum prasyaratnya terverifikasi.

## P1 - Kamera dan dimensi

Prasyarat: P0 lulus, workflow semua pemanggil kamera serta sumber dimensi dipetakan. Pemilik: `frontend-map`; kontrak data ditinjau `reviewer`.

- [ ] Satukan mode kamera dan intent perpindahan dengan fungsi yang paling kecil dan dapat dipakai ulang. Petakan seleksi laporan/CCTV, pencarian, reset, zoom otomatis, jalanan, atas, inspeksi, orbit dan callback animasi.
- [ ] Pastikan semua perpindahan menghormati 2D. Masuk inspeksi harus secara eksplisit mengganti state ke mode inspeksi dan menyimpan mode sebelumnya. Keluar mengembalikan mode sebelumnya. Memilih 2D mengakhiri inspeksi, membatalkan orbit serta perpindahan tertunda dan memperbarui mode pengembalian menjadi 2D.
- [ ] Uji perubahan state cepat, callback usang, filter yang menghapus laporan terpilih, dan data baru sebelum style siap. Hapus seleksi/inspeksi secara konsisten ketika laporan tidak lagi tersedia.
- [ ] Buat adapter internal dari kontrak `DamageReport` yang ada. Gunakan cm / 100 untuk meter dengan skala 1:1. Jangan ubah kontrak API/basis data. Panjang, heading dan lebar jalan yang tidak ada tetap `unknown`/`null` pada model internal.
- [ ] Definisikan pemisahan pin yang diperbesar dari geometri 1:1 pada adapter. Ukuran tetap lama bukan input pengukuran. Inventaris label radius/lebar jalan lama untuk P5; P1 tidak mengklaim seluruh UI sudah jujur sebelum label tersebut diperbaiki.

Izin berkas: `src/App.tsx`, `src/components/Map3D.tsx`, `src/map/camera.ts`, `src/map/dimensions.ts`; pengujian beku P1 di `tests/` dikelola verifier. `src/types.ts`, API client dan backend hanya dibaca pada fase ini.

Penerimaan fase: C01-C06 untuk jalur kamera dan seleksi eksisting, D01-D02 untuk adapter, R01. Simpan observasi D03-D04 tanpa meluluskan cakupan penuh; seluruh label UI diperbaiki P5. Artefak: matriks transisi state, hasil konversi 52 cm -> 0,52 m dan 7,5 cm -> 0,075 m, trace 2D, bukti data hilang/invalid, hasil type/build. Gagal/pemulihan: perbaiki jalur kamera pusat yang gagal, bukan menambah nilai pitch tersebar; kembalikan hanya patch tugas jika perlu, pertahankan perubahan awal. Ketidakjelasan semantik dimensi diajukan melalui `/grillme` sebelum pembentukan geometri nyata.

## P2 - Satu lubang dalam konteks peta bersama

Prasyarat: P1 lulus; fixture jalan sintetis terkontrol disiapkan dan disebut sintetis. Titik jalan nyata baru dipakai setelah diverifikasi. Dukungan WebGL2 dan API custom layer versi terpasang dibuktikan. Pemilik: `geometry`; integrasi lifecycle ditinjau `frontend-map`.

- [ ] Baca kembali deformasi yang sudah tersedia di `DepthInspector3D.tsx`; ekstrak bagian yang dapat digunakan ulang tanpa menyalin seluruh renderer modal.
- [ ] Bangun satu lubang fixture berlebar 0,52 m dan kedalaman 0,075 m, pusat dasar pada -0,075 m terhadap permukaan jalan lokal z = 0. Definisikan sumbu dan pengukuran lebar tepat pada kontrak fixture.
- [ ] Gunakan custom layer MapLibre dan konteks WebGL2 peta yang sama. Terapkan transformasi Mercator/meter dari latitude anchor serta matriks kamera sesuai versi 4.7.1, termasuk orientasi sumbu dan restore state render. Jangan menyalin signature dokumentasi versi terbaru tanpa memeriksa versi lokal.
- [ ] Buktikan rongga di bawah jalan tetap terlihat dari pose miring dan empat bearing. Buat solusi sambungan/aperture atau road patch yang sah pada fixture; polygon peta yang datar dapat menutup mesh berkedalaman negatif. Menonaktifkan depth test seluruh scene, mengangkat lubang ke atas jalan, atau memperbesar skala bukan keberhasilan.
- [ ] Buktikan oklusi: bibir dekat menutup bagian dalam sesuai sudut pandang, objek penghalang menutup mesh yang ada di belakang, dan jalan di luar rongga tidak bocor/berkedip. Bedakan lubang asli dari bidang gelap datar dengan perubahan paralaks dan profil vertex.
- [ ] Jalankan 20 siklus tambah/hapus layer dan style reload terkontrol. Lepas geometri/material/tekstur/listener/RAF yang dimiliki layer saja. Jangan memanggil `forceContextLoss()` atau menghapus canvas milik peta. Setelah layer dilepas, peta masih dapat pan dan zoom.
- [ ] Catat batas solusi, ketergantungan sumber jalan, dan keputusan lulus/gagal berbasis bukti. Keberadaan `type: custom` saja tidak cukup.

Izin berkas: `src/map/damageGeometry.ts`, `src/map/DamageLayer.ts`, `src/components/Map3D.tsx`, serta `src/components/DepthInspector3D.tsx` hanya bila ekstraksi fungsi diperlukan; fixture dan tes pada `tests/fixtures/` dan `tests/geometry/` dikelola verifier. Tidak mengubah package.json, lockfile, versi engine atau sumber bangunan pada P2.

Penerimaan fase: G01-G06 pada prototipe satu lubang dan data fixture, L01-L03 pada resource layer/prototipe selama 20 siklus, D01-D02 pada geometri/adapter, R01. Cakupan lifecycle CCTV/media penuh belum dinilai di P2; hasil tersebut tetap belum lulus di ledger akhir. Artefak: profil vertex dalam meter, tangkapan layar dengan pose/scale/provenance, rekaman rotasi pada peta yang sama, bukti aperture/oklusi, capability WebGL2, tabel 20 siklus resource, dan hasil type/build. Gagal/pemulihan: hentikan P3; simpan bukti masalah dan tiga opsi untuk pengguna, yaitu memperbaiki komposisi jalan dalam engine yang sama, memperkecil cakupan prototipe sambil menyatakan keterbatasan, atau mengevaluasi engine lain sebagai keputusan arsitektur terpisah. Tidak ada switch otomatis atau klaim kebutuhan sudah terpenuhi.

## P3 - Integrasi inspeksi

Prasyarat: P2 lulus termasuk cekungan dan oklusi, bukan sekadar mesh terpasang. Pemilik: `frontend-map`; pemeriksa: `verifier`.

- [ ] Hubungkan pemilihan laporan, tombol inspeksi dan layer yang sama; hindari penampil terpisah untuk kebutuhan inspeksi langsung pada peta.
- [ ] Terapkan adapter hanya pada bentuk yang datanya memadai. Jangan membuat panjang/arah galian, lebar jalan, atau volume terukur dari input yang tidak tersedia.
- [ ] Sinkronkan lapisan, pin, daftar dan report terpilih ketika kategori/data berubah. Ketika seleksi hilang, tutup inspeksi, batalkan orbit/callback lama dan bersihkan layer miliknya.
- [ ] Rekonsiliasi data sebelum style load dan ketika style dimuat ulang dengan data paling baru. Uji unmount/remount tanpa duplikasi map, layer, popup atau listener.
- [ ] Verifikasi 2D, masuk/keluar inspeksi, tombol Atas/Jalanan, reset, pencarian dan CCTV mengikuti aturan P1; jalur explicit-inspect memperbarui state sebelum kamera.

Izin berkas: `src/App.tsx`, `src/components/Map3D.tsx`, `src/components/DamageReportCard.tsx`, `src/map/camera.ts`, `src/map/dimensions.ts`, `src/map/DamageLayer.ts`, `src/map/damageGeometry.ts`; tes beku di `tests/` milik verifier.

Penerimaan fase: C01-C06 dan G01-G06 pada integrasi inspeksi, D01-D02 pada adapter, L01-L03 pada map/inspeksi, R01 serta R02-R03 sebagai regresi alur yang terdampak terhadap baseline. D03-D04 seluruh UI dan lifecycle media baru menunggu P5-P6. Artefak: rekaman alur select-inspect-filter-close, matriks state aktual, hasil race/style reload dan regression, hasil type/build. Gagal/pemulihan: isolasi adapter atau lifecycle yang gagal; pertahankan jalur peta awal yang masih bekerja. Bentuk yang belum didukung dilabeli belum tersedia. Perluasan jenis kerusakan menunggu keputusan ruang lingkup.

## P4 - Bangunan dan UI

Prasyarat: P3 lulus; pencarian frontend-req/mockup tercatat beserta hasil ada/tidak ditemukan. Jika tidak tersedia, gunakan video dan gambar pembanding yang tersedia dengan batas bukti yang tercatat, tanpa mengarang desain. Lisensi/provenance sumber bangunan diperiksa. Pemilik: `frontend-ui`; pemeriksa: `reviewer`.

- [ ] Cocokkan warna bangunan netral, hierarki label, keterbacaan jalan, panel dan kontrol dengan adegan acuan yang relevan; gunakan rubrik HARNESS, bukan persentase kemiripan video generatif.
- [ ] Verifikasi ketersediaan geometri bangunan pada sumber style/tile aktual. Jangan menganggap 14 persegi contoh sebagai data kota nyata atau mengarang tinggi bangunan.
- [ ] Atur kepadatan label/layer agar satu lubang skala nyata tetap dapat ditemukan melalui pin yang terpisah dan ditinjau pada pose inspeksi.
- [ ] Periksa 1440 x 900 dan 390 x 844, overflow, target sentuh, tab order, fokus, kontras dan reduced motion. Jangan mengubah mekanisme seleksi/filter untuk mengejar tampilan.

Izin berkas: `src/components/Map3D.tsx`, `src/App.tsx`, `src/index.css`, `tailwind.config.js`; `src/services/mockData.ts` hanya untuk pelabelan fixture atau penggantian bangunan contoh dengan sumber yang terverifikasi dalam kontrak tugas. Tidak mencakup kontrak API/DB atau migrasi engine.

Penerimaan fase: U01-U03 untuk peta/layout dan ambang beku P0, A01-A02 untuk kontrol yang disentuh, G03-G05 serta C01-C06 sebagai regresi inspeksi/kamera, R01 serta regresi terdampak R02-R03. Aksesibilitas fullscreen/media yang dibuat P5 belum dianggap lulus penuh. Artefak: screenshot dua viewport dan pose sama, tabel rubrik, provenance sumber bangunan, pemeriksaan keyboard/reduced motion, hasil type/build. Gagal/pemulihan: persempit styling ke komponen terdampak, jangan menambah data buatan yang terlihat nyata; jika sumber belum tersedia, nyatakan demo dan laporkan batasnya.

## P5 - CCTV dan kejujuran data

Prasyarat: P4 lulus; sumber media dan status ketersediaan diverifikasi. Pemilik: `frontend-ui`; pemeriksa: `reviewer`.

- [ ] Tampilkan foto contoh sebagai demo/snapshot, waktu pembaruan hanya jika bersumber, offline/maintenance saat sesuai. `LIVE` memerlukan bukti stream aktif dan freshness, bukan hanya tag video.
- [ ] Gunakan adapter internal untuk metadata real/demo/offline dari sumber yang tersedia tanpa perubahan API/DB. Bila kontrak sekarang tidak cukup membuktikan real, tampilkan unknown/demo.
- [ ] Sambungkan layar penuh dan tutup/Escape beserta pemulihan fokus. Pada sumber statis, layar penuh menampilkan snapshot berlabel; jangan menyajikannya sebagai video.
- [ ] Uji pan/zoom/resize dan anchor popup, berpindah CCTV cepat, media gagal, penolakan fullscreen dan cleanup listener/timer/media setelah tutup.
- [ ] Koreksi seluruh label heuristik dimensi dan confidence, termasuk card, inspector, modal kamera, marker dan daftar. Hilangkan lebar jalan tetap 7 m serta klaim ukuran/volume terukur tanpa sumber. Lokasi acak pada `CameraReportModal.tsx` harus dilabeli lokasi contoh, bukan GPS. Jika posisi nyata tidak tersedia, tampilkan belum tersedia.
- [ ] Pertahankan alur submit dengan mock contract; jangan mengirim uji ke produksi. Tidak mengeklaim ukuran/volume terukur dari estimasi citra atau fixture.

Izin berkas: `src/components/CctvPopover.tsx`, `src/components/CctvModal.tsx`, `src/components/Map3D.tsx`, `src/components/CameraReportModal.tsx`, `src/components/DepthInspector3D.tsx`, `src/components/DamageReportCard.tsx`, `src/App.tsx`, `src/services/mockData.ts`, `src/map/dimensions.ts`. `src/services/imageDetection.ts` hanya untuk label/provenance yang disetujui; algoritma deteksi tidak diperluas. Tidak menyentuh backend atau kontrak API.

Penerimaan fase: M01-M04 pada media nyata yang tersedia dan fixture real/demo/offline yang ditandai; D03-D04 mencakup seluruh UI; A01-A02 untuk seluruh aksi utama termasuk media; L01-L03 untuk media/map yang disentuh; R01 serta regresi terdampak R02-R03. Fixture live-valid tidak menjadi bukti stream produksi. P6 mengulang seluruh cakupan terintegrasi. Artefak: matriks sumber/status, screenshot real/demo/offline, trace fullscreen/penolakan/Escape, bukti label estimasi/lokasi contoh dan hasil type/build. Gagal/pemulihan: hentikan klaim real/live, gunakan label demo/offline yang benar, simpan kegagalan sumber terpisah dari bug aplikasi. Sumber privat atau rahasia tidak disalin ke bukti.

## P6 - Pengujian dan perbaikan terbatas

Prasyarat: P1-P5 memiliki kandidat dan bukti, test contract serta baseline telah dibekukan. Pemilik: `verifier`; perbaikan oleh owner fase asal; keputusan oleh `orchestrator`.

- [ ] Jalankan pemeriksaan otomatis, visual dan review secara independen. Catat `not_run` apabila alat, sumber atau browser tidak tersedia.
- [ ] Gunakan ulang harness minimal P0. Perkuat fixture, assertion dan pelaporan sesuai gap yang terbukti, dengan review independen sebelum membekukan kontrak revisi. P6 bukan pemasangan pertama runner.
- [ ] Jalankan ulang kasus bug awal 2D, skala/depresi, CCTV dan label data, kemudian regression filter, submit mock, pencarian, traffic, comparison dan penampil lama yang masih dapat diakses.
- [ ] Rekam 20 siklus lifecycle, profil kinerja median/p95 dan kondisi hardware. Periksa pertumbuhan resource sesudah warm-up; jangan menyebut bebas bocor hanya karena tidak crash.
- [ ] Untuk kegagalan, simpan expected/actual, test ID, lokasi kode, bukti dan langkah reproduksi; beri satu tugas per akar masalah dengan izin berkas minimal.
- [ ] Jalankan kembali kasus gagal beserta regresi yang terdampak. Penulis implementasi tidak boleh mengubah test/baseline agar lolos. Semua penghitung tetap mengikuti ledger sesi, termasuk setelah restart atau eskalasi.

Izin berkas: bukti pada `knowledge/oyenza-agent-pack/runs/<run-id>/`; hardening oleh verifier pada `tests/` dan `playwright.config.ts` dalam izin implementasi yang sudah diterima. Perubahan aplikasi memerlukan tugas perbaikan dengan allowed paths fase asal. Package/lock memakai setup P0; kebutuhan dependensi baru di luar setup minimal memerlukan bukti kebutuhan dan keputusan ruang lingkup, bukan pemasangan framework otomatis. Paket dokumentasi ini tidak mengubah atau memasang apa pun.

Penerimaan akhir aplikasi: B01-B03, C01-C06, D01-D04, G01-G06, L01-L03, U01-U03, M01-M04, A01-A02, R01-R03, H01-H02 pada cakupan penuh kandidat terintegrasi; H03 dilengkapi saat handoff P7. Tidak boleh ada gate wajib `not_run`, failed atau blocked untuk klaim selesai. Artefak: hasil per test, screenshot/trace, review independen, diff terhadap hash awal, exit code, resource/performance report dan daftar batas yang tersisa. Gagal/pemulihan: ikuti batas 12 repair cycle per sesi dan 2 per defect di HARNESS; stagnasi, cap atau ruang lingkup baru menghentikan loop dan memerlukan `/grillme` dengan tiga opsi konkret.

## P7 - Serah terima

Prasyarat: pemeriksaan penuh P6 selesai, dengan H03 sengaja menunggu laporan P7; atau run dihentikan dengan status tidak lengkap yang jujur. P7 tidak menunggu kelulusan laporan yang belum ditulis. Pemilik: `orchestrator`; penerima hasil: pengguna; pemeriksa: `reviewer`.

- [ ] Cocokkan semua hasil dengan baseline/fixture/test contract yang sama dan hash bukti yang dapat dibaca.
- [ ] Ringkas perubahan, alasan, dampak ke alur lain, pengujian aktual, keterbatasan sumber/data dan pekerjaan belum berjalan.
- [ ] Pastikan diff hanya memuat allowed paths tugas; pisahkan perubahan yang sudah ada sebelum run pada laporan, tanpa menghapusnya.
- [ ] Tulis checkpoint akhir, status tiap gate, penghitung permanen, kunci yang dilepas serta langkah lanjutan yang memerlukan keputusan pengguna.
- [ ] Serahkan hasil tanpa commit/push; jangan memberi status selesai implementasi jika paket yang diserahkan hanya dokumentasi atau jika gerbang masih belum berjalan.

Izin berkas: `knowledge/oyenza-agent-pack/runs/<run-id>/`, hanya orchestrator untuk ledger/checkpoint; `README.md` paket hanya melalui tugas dokumentasi dengan lock tersendiri. Tidak ada perubahan aplikasi pada P7.

Penerimaan: H01-H03 dan R01; bukti pass/failed/not_run tetap terlihat. Artefak: ringkasan akhir, daftar berkas, hasil pemeriksaan, checkpoint, risiko dan tiga pilihan lanjutan bila terhenti. Gagal/pemulihan: koreksi laporan atau bukti yang hilang, jangan mengulang implementasi di luar anggaran; minta keputusan pengguna jika gerbang wajib belum dapat dipenuhi.
