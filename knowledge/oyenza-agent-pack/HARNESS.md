# Rancangan harness dan penerimaan

Status: desain dan template, belum ada runner, fixture browser baru, Playwright, atau validator yang dibuat oleh paket ini. Tidak ada hasil pengujian aplikasi baru yang dinyatakan lulus di sini. `not_run` berbeda dari `passed`. Setup minimal di P0 adalah pekerjaan implementasi berikutnya setelah prompt peluncuran BOOTSTRAP dikirim; sesi dokumentasi saat ini tidak memasang dependensi atau mengubah aplikasi.

Rancangan mengikuti skill `engineering:testing-strategy`: unit untuk konversi/state, integrasi untuk lifecycle/data, lalu sedikit E2E dan pemeriksaan visual untuk alur utama. Periksa [PHASES.md](PHASES.md), [GUARDRAILS.md](GUARDRAILS.md), [MODEL-POLICY.md](MODEL-POLICY.md) dan [OPENCODE.md](OPENCODE.md) sebelum mengeksekusi tugas implementasi yang disetujui.

## Fakta awal dan perintah

`package.json` saat pemeriksaan hanya memiliki `dev`, `build` dan `preview`. Belum ada script test atau dependensi Playwright. `build` menjalankan `tsc && vite build`. Dependensi yang dituju proyek adalah MapLibre 4.7.1 dan Three 0.170.0, dengan rentang `^` pada manifest; P0 harus membaca versi terkunci/terpasang. Tidak meng-upgrade keduanya dalam adapter awal.

Perintah yang tersedia, dari WSL pada `/home/vereniaes/project/hackathon/LaporJalan`, bila Node lokal dan node_modules sudah tersedia:

```sh
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Gunakan binary Node WSL yang sudah tersedia, bukan binary Windows pada UNC dan bukan `npx` yang berpotensi mengunduh paket. Catat lokasi binary, versi, direktori kerja, waktu, stdout/stderr dan exit code. Bila belum tersedia, tandai blocked dan ajukan penyiapan terpisah. `npm run dev -- --host 127.0.0.1` adalah perintah dev yang tersedia untuk pemeriksaan browser berikutnya; memakai ini memulai server, bukan bukti test lulus. Build dan type check tidak membuktikan hasil visual.

Pada P0 implementasi berikutnya, verifier membaca utilitas/config yang tersedia lalu menyiapkan satu runner `@playwright/test` dev-only. Runner yang sama menguji helper TypeScript murni melalui project `unit` tanpa memakai fixture `page`/`browser`, serta E2E melalui project `desktop`/`mobile` dengan Chromium lokal. `playwright.config.ts` memisahkan testMatch agar kasus unit tidak terduplikasi pada project browser. Tidak menambah Vitest/Jest atau framework kedua tanpa bukti kebutuhan. Instalasi paket, browser Chromium, dan perubahan `package.json`/`package-lock.json` yang dibatasi kebutuhan ini sudah termasuk izin prompt peluncuran BOOTSTRAP; jangan meminta ulang izin tersebut. Bekukan versi yang kompatibel dengan Node lokal dalam lockfile dan catat setup delta. Ini belum dilakukan oleh sesi dokumentasi.

Perintah rencana setelah setup P0 dan project tersebut benar-benar tersedia:

```sh
node node_modules/@playwright/test/cli.js test --project=unit
node node_modules/@playwright/test/cli.js test --project=desktop
node node_modules/@playwright/test/cli.js test --project=mobile
```

Ketiga project dan perintah tersebut belum tersedia pada baseline dokumentasi. P0 menjalankan smoke test unit/browser sebelum mengambil baseline fitur, kemudian fase berikutnya memakai runner yang sama; P6 memperkuat dan mengulangnya. Validator ledger masih harus diimplementasikan sebagai bagian harness, tanpa framework test tambahan. Jangan menulis `npm test`, menyatakan unit suite lama ada, atau menjalankan perintah rencana seolah merupakan fasilitas yang sudah terpasang. Paket dokumentasi tidak memasang dependensi dan tidak menjalankan harness.

`knowledge/oyenza-agent-pack/baseline.json` kanonis menyimpan hash sesi dokumentasi dan hanya dibaca. Orchestrator implementasi menulis baseline tersendiri pada `knowledge/oyenza-agent-pack/runs/<run-id>/baseline.json`, termasuk referensi/hash baseline kanonis, hash aplikasi sebelum fitur, delta setup harness dan hash fixture/test. Jangan memakai path kanonis sebagai target P0 atau menimpanya saat refresh baseline. Baseline run juga immutable setelah dibekukan; revisi memerlukan ID/run baru beserta alasan.

## Fixture yang dapat diulang

Satu manifest fixture yang dibekukan oleh verifier harus berisi ID, hash, waktu tetap, seed, report, media, style lokal, geometri, kamera dan jaringan. Gunakan waktu fixture `2026-10-16T00:00:00.000Z` dan seed tercatat; pasang clock sebelum kode aplikasi berjalan. Screenshot membekukan animasi pada waktu tertentu, pengujian orbit memajukan waktu secara terkontrol. Pengukuran performa memakai waktu nyata monotonic pada run terpisah, tidak memakai clock palsu sebagai frame-time.

- Viewport desktop 1440 x 900 dan mobile 390 x 844, DPR fixture 1, browser/version/font/locale `id-ID`/timezone `Asia/Jakarta` direkam. Test DPR lain boleh ditambah dengan bukti sendiri.
- Mock request laporan, CCTV, traffic, geocoding dan submit pada browser. Urutkan respons tetap; sertakan response lambat, invalid, error dan out-of-order. Tidak menulis ke backend produksi, tidak mengubah API/DB.
- Kontrol style/tile/font/media lewat fixture lokal dan tunggu readiness yang eksplisit. Timeout menghasilkan kegagalan/blocked, bukan screenshot kosong yang dinyatakan benar. Pisahkan pengujian sumber peta/media nyata dengan label live-integration dan waktu aktual.
- Laporan `fixture-pothole-052-0075` bertipe pothole: widthCm 52, depthCm 7.5. Adapter menghasilkan widthM 0.52 dan depthM 0.075, tanpa faktor pembesaran. Panjang, heading dan roadWidth tetap unknown pada laporan. Pin navigasi terpisah boleh diperbesar dengan label yang benar.
- Lokasi geografis fixture adalah simbol `ROAD_ANCHOR_TO_VERIFY`, dengan lng/lat `null` sampai verifier memverifikasi jalan beserta sumbernya. Ini tidak boleh dipakai sebagai argumen numerik ke map. Untuk prototipe sintetis, fixture memilih origin lokal dan mencatat transformasi anchor sebagai titik sintetis, tanpa menyebut jalan nyata.
- Fixture road patch memakai bidang z = 0, unit meter, sumbu lokal tercatat, batas patch sintetis 4 m x 4 m dan aperture berdiameter 0.52 m. Angka 4 m adalah ukuran panggung uji, bukan lebar jalan. Lubang radial sintetis memiliki permukaan rim z = 0, pusat z = -0.075 m dan support diameter 0.52 m. Model bentuk ini asumsi fixture yang eksplisit, bukan panjang lapangan yang ditambahkan ke laporan.
- Pasang objek penghalang sintetis dan pola/checker terkontrol untuk pemeriksaan depth/paralaks. Bekukan pose atas dan empat bearing miring 0/90/180/270 derajat dengan pitch 60 derajat, pusat anchor. Kalibrasikan serta bekukan jarak/zoom di P0 agar 0.52 m terbaca dalam viewport; jangan memperbesar mesh.
- Untuk test peta nyata, anchor harus berada di ruas jalan yang diverifikasi dan seluruh metadata pose/transformasi disimpan. Bila skala/oklusi tidak memenuhi acuan di sumber nyata, hasil sintetis tidak memberi status lulus integrasi nyata.

Current `DamageReport` tidak menyimpan length, heading, road width atau provenance pengukuran. Current `CctvCamera` menyimpan snapshotUrl, lastUpdated dan status online/maintenance, belum membuktikan stream atau freshness. Fixture dapat membawa metadata pendamping untuk tes, tetapi tidak boleh membuat seolah backend telah menyediakan kolom tersebut. Adapter awal hanya internal, tanpa perubahan kontrak API/DB.

## Tiga gerbang yang independen

| Gerbang | Pemeriksa | Bukti wajib | Syarat lulus |
| --- | --- | --- | --- |
| Otomatis | verifier | exit code, hasil per ID, lingkungan, hash fixture/test | Semua kasus wajib berjalan dan memenuhi expected |
| Visual | verifier atau pemeriksa visual yang berbeda dari implementer | screenshot/rekaman, pose, waktu, viewport, rubrik expected/actual | Seluruh butir wajib rubrik terpenuhi pada dua viewport |
| Review | reviewer independen | diff terhadap baseline, dampak, provenance, checklist dan alasan | Tidak ada pelanggaran scope, data, lifecycle atau klaim tanpa bukti |

Tangkapan layar saja tidak meluluskan gerbang otomatis; type/build saja tidak meluluskan visual; penilaian implementer tidak menggantikan review independen. Jika independensi tidak tersedia, gerbang terkait tetap `not_run`. `passed` memerlukan evidence yang dapat dibuka dan cocok dengan hash run. `failed`, `blocked`, `not_run` semuanya menahan fase yang membutuhkan gerbang tersebut. Status `blocked` harus menjelaskan prasyarat eksternal yang hilang; jangan menggunakannya untuk menyembunyikan assertion yang gagal.

Gerbang fase dan gerbang akhir berbeda dalam cakupan, bukan ambang oracle. `task.json` dan `result.json` mencatat `acceptance_scope`, misalnya `P1:camera-adapter`, `P2:prototype-layer`, atau `P6:full-application`. Setiap case evidence mencatat test ID, scope, subkasus yang dicakup dan hasilnya. P2 boleh meluluskan gerbang fase untuk 20 siklus resource layer tanpa menyatakan L01-L03 seluruh aplikasi/media lulus. D03-D04 adapter/fixture yang sudah benar tidak meluluskan seluruh UI sebelum P5. A01-A02 kontrol peta P4 tidak meluluskan fullscreen/media yang baru dibuat P5.

Hasil fase disimpan pada `run.phase_results`; `run.gates` dicadangkan untuk verdict penuh kandidat terintegrasi setelah P6 dan handoff P7. Kasus final tetap `not_run` jika hanya ada bukti subset, atau tetap `failed` jika cacat cakupan penuhnya sudah diketahui. Semua butir oracle final di katalog tetap wajib. Regression fase menguji alur yang disentuh terhadap baseline dan menolak kerusakan baru, sambil mempertahankan defect baseline yang belum diselesaikan sebagai terbuka; ini tidak mengubah expected final. H03 baru dapat lulus setelah laporan P7 tersedia, sehingga bukan prasyarat P6 atau awal P7.

Rubrik visual tidak memakai persentase kemiripan arbitrer terhadap video generatif. Nilai setiap butir `passed`/`failed`/`not_run` dengan bukti dan expected: (1) inspeksi di konteks peta yang sama, (2) rim, dasar dan wireframe terbaca serta berubah perspektif, (3) skala 1:1 dan oklusi benar, (4) bangunan netral serta jalan tetap terbaca, (5) hierarki panel/kontrol sesuai referensi desain terverifikasi, (6) CCTV tertambat dengan label sumber benar, (7) layout/fokus dapat dipakai pada dua viewport. Bila frontend-req/mockup tidak ditemukan, catat ketidaktersediaannya dan gunakan rekaman/gambar pembanding yang tersedia, tanpa mengarang mockup. Rekaman acuan memberi maksud bentuk/interaksi, bukan ukuran, teks lapangan atau angka akurasi.

## Katalog pengujian

| ID | Jenis | Kasus dan kriteria penerimaan |
| --- | --- | --- |
| B01 | Review | Working tree, hash baseline run/fixture/test contract, referensi baseline kanonis immutable, versi terpasang, setup delta harness dan sumber acuan tercatat. Perubahan lokal awal tidak dihapus. |
| B02 | Otomatis | Perintah type dan build eksisting exit 0; simpan output. Kegagalan baseline dicatat apa adanya. |
| B03 | Visual | Dua viewport dan pose baseline tersedia; bug awal direproduksi dengan trace, tanpa klaim baseline sudah memenuhi desain. |
| C01 | Integrasi/E2E | Dalam 2D, seleksi laporan, CCTV dan pencarian mempertahankan pitch 0 dan state 2D. |
| C02 | Integrasi/E2E | Zoom auto-tilt, reset dan callback fly/ease tidak menimpa 2D; test perpindahan tertunda yang selesai setelah toggle. |
| C03 | Integrasi/E2E | Explicit inspect menyimpan mode sebelumnya, mengubah state ke inspect sebelum kamera; keluar kembali ke mode sebelumnya. Masuk dari 2D diperbolehkan hanya dengan aksi explicit inspect. |
| C04 | Integrasi/E2E | Orbit aktif lalu pilih 2D: inspeksi berakhir, RAF/orbit/flight lama berhenti, pitch 0 dan state 2D. Callback keluar tidak menghidupkan mode lama. Atas/Jalanan mengubah state secara konsisten. |
| C05 | Integrasi | Klik cepat report A/B, pencarian, toggle dan respons lama tidak mengembalikan target/mode usang; state terakhir menang. |
| C06 | Integrasi/E2E | Filter/data menghapus report terpilih: seleksi/inspeksi/orbit dibersihkan, tidak ada layer atau HUD yatim, state kamera konsisten. |
| D01 | Unit | 52 cm -> 0.52 m dan 7.5 cm -> 0.075 m; tidak ada minimum clamp/fallback/perbesaran yang mengubah angka valid. Toleransi numerik 1e-6 m. |
| D02 | Unit/integrasi | Null, undefined, NaN, negatif dan nilai invalid tidak menjadi ukuran rekaan. Nilai nol ditangani eksplisit sebagai tidak ada depresi atau invalid sesuai kontrak beku, tidak diganti default 7.5/52. |
| D03 | Integrasi/review | Length/heading/roadWidth tidak tersedia tetap unknown; UI tidak menampilkan 7 m, heading atau volume terukur tanpa sumber. Pin besar berbeda dari geometri 1:1. |
| D04 | Integrasi/visual | Dimensi heuristik berlabel estimasi, confidence bukan akurasi terukur, random lat/lng berlabel lokasi contoh dan bukan GPS; semua permukaan UI diperiksa. |
| G01 | Unit | Rentang vertex permukaan road z = 0, pusat -0.075 m, diameter support 0.52 m, toleransi 1e-6 m; offset wireframe terpisah tidak mengubah profil fisik. |
| G02 | Integrasi | Satu map/canvas/context; renderer memakai WebGL2 milik peta. Matriks/signature API sesuai versi terpasang; unsupported WebGL2 memberi pesan benar dan status belum didukung. |
| G03 | Visual/E2E | Cekungan di bawah jalan terlihat pada pose miring/four bearings, dalam lingkungan peta yang sama; rim/dasar/wireframe dan paralaks membuktikan bentuk 3D. Tidak lulus hanya karena custom layer ada. |
| G04 | Visual/integrasi | Permukaan jalan di luar aperture tetap utuh, tidak z-fighting; rim/objek penghalang mengoklusi bagian yang benar, isi lubang tidak tertutup plane jalan. Depth tidak dimatikan global dan mesh tidak diangkat menjadi tonjolan. |
| G05 | Integrasi/visual | Anchor geometri dibanding map.project(anchor) setelah pan, zoom, bearing, pitch dan resize: selisih <= 2 CSS px pada dua viewport, ukur anchor yang ditentukan dan simpan pasangan titik/proyeksinya. |
| G06 | Integrasi | Data tiba sebelum style load, style reload dan context recovery memakai report terbaru; add/remove idempotent, error readiness tidak menelan pembaruan, tidak ada duplicate layer/source. Uji context loss/recovery terkontrol oleh verifier; cleanup adapter tidak menghancurkan konteks. |
| L01 | Integrasi/profil | 20 siklus mount/inspect/orbit/CCTV/close/unmount/remount dan layer/style reload; satu map per mount, tanpa layer/listener/RAF/media aktif tersisa setelah cleanup. |
| L02 | Profil/review | Catat geometry/texture/material/program, listener, RAF dan DOM/canvas pada tiap siklus. Sesudah warm-up siklus 1-5, hitungan pada titik settled siklus 6-20 plateau dengan fixture identik, tanpa kenaikan monoton. Cache yang sengaja menetap dibuktikan dan dijelaskan. |
| L03 | Integrasi/review | Cleanup hanya resource milik layer, shared context/canvas tetap hidup; tidak ada forceContextLoss atau penghapusan canvas peta. Peta masih pan/zoom setelah layer ditutup, cleanup berulang aman. |
| U01 | Visual | Bangunan, label, jalan, panel dan kontrol sesuai butir mockup/video yang diverifikasi; sumber bangunan dicatat, geometri contoh tidak disebut kota nyata. |
| U02 | Visual/E2E | Desktop 1440 x 900 dan mobile 390 x 844 tidak overflow; kontrol peta, informasi dimensi, popup dan aksi utama tetap terbaca/dapat dijangkau. |
| U03 | Profil | Ukur median/p95 frame time dan latensi input pada skenario beku; catat hardware, GPU, browser, DPR, durasi dan jumlah frame. Ambang kinerja disepakati dan dibekukan P0 sebelum verdict; tanpa ambang hasil hanya recorded, bukan performance passed. |
| M01 | Integrasi/visual | Snapshot/demo/offline/maintenance/live-valid dan stream stale/error dipetakan benar; LIVE hanya dari sumber stream aktif dengan freshness terbukti, bukan tag video atau status online saja. |
| M02 | Integrasi/E2E | Fullscreen snapshot/video sesuai jenis media, close/Escape pulihkan fokus; penolakan fullscreen ditangani; saat tutup media/timer/listener dibersihkan. |
| M03 | Integrasi/visual | Popup MapLibre mengikuti koordinat saat pan/zoom/resize dengan drift anchor <= 2 CSS px, offset/anchor semantik dicatat; ganti kamera cepat tidak memutar media lama. |
| M04 | Review | Asal media, timestamp serta identitas penyedia benar; unknown tidak menjadi data nyata; tidak ada URL bertoken/rahasia pada bukti atau ledger. |
| A01 | E2E/manual | Semua aksi utama dapat dicapai keyboard, fokus terlihat, dialog/fullscreen Escape bekerja dan fokus kembali; tidak ada keyboard trap. |
| A02 | E2E/visual | prefers-reduced-motion menghindari orbit/auto-animasi berulang yang tidak diminta; perpindahan eksplisit tetap dapat digunakan, state kamera tetap benar. |
| R01 | Otomatis/review | Type/build exit 0; diff hanya allowed paths. Tidak ada commit/push, modifikasi kontrak API/DB atau penghapusan perubahan awal. |
| R02 | Integrasi/E2E | Filter, report selection, search, traffic dan submit mock tetap berfungsi dengan kontrak lama; kegagalan network memberi fallback yang dilabeli benar. Tidak POST ke produksi. |
| R03 | E2E/visual | Comparison, inspector lama yang masih dapat diakses, popup CCTV dan layout tidak rusak oleh ekstraksi geometry/styling. Bila fitur sengaja berubah perlu keputusan scope, bukan dianggap regression pass. |
| H01 | Validasi/review | Semua hasil punya run/task/test/baseline IDs dan bukti; not_run tidak dipetakan passed. Hash dan exit code konsisten. |
| H02 | Validasi/review | Budget, lock, riwayat defect/repair dan checkpoint berlanjut setelah restart/compaction/escalation; orchestrator satu-satunya penulis ledger. |
| H03 | Review | Laporan akhir membedakan dokumentasi, implementasi dan tes aktual, memberi dampak/keterbatasan serta tidak mengklaim 60 FPS tanpa ukur. |

Coverage ditujukan pada seluruh jalur kamera serta transisi, kontrak input valid/invalid, readiness/lifecycle, kejujuran data dan alur penting; tidak menetapkan persen line coverage tanpa kebutuhan. Pengujian boilerplate/getter trivial tidak diprioritaskan. Manual-only dan integrasi sumber nyata yang belum dijalankan harus tetap terlihat.

Untuk U03, jalankan baseline/kandidat dengan kondisi sama setelah warm-up, sekurangnya tiga sampel 30 detik per viewport, simpan raw frame interval, median dan p95 per sampel. Catat idle/orbit/pan-inspect secara terpisah. Thermal throttling, software rendering, sumber tile lambat dan perubahan hardware membuat perbandingan tidak sepadan dan harus diberi catatan. Klaim 60 FPS memerlukan pengukuran yang mendukung pada perangkat/skenario tersebut, bukan estimasi dari screenshot. Pengukuran resource WebGL saja tidak membuktikan seluruh memori aplikasi bebas bocor; heap/GPU yang tidak dapat diukur dilabeli unavailable.

## Siklus perbaikan

Satu repair cycle adalah satu tugas koreksi terukur setelah kegagalan, diikuti pemeriksaan ulang. Baseline awal dan test run observasi bukan alasan menghapus penghitung. Orchestrator menambah penghitung sebelum penugasan koreksi dimulai; tugas yang crash tetap memakai siklus. Maksimal 12 siklus koreksi per sesi dan 2 per defect, termasuk percobaan yang terputus. `defect_id` merujuk akar masalah tetap, tidak diganti untuk menghindari batas.

1. Verifier menyerahkan failure dengan expected/actual, ID, bukti, reproduksi dan hash test yang tidak berubah.
2. Orchestrator memeriksa saldo budget, dependensi fase dan lock. Beri tugas minimal serta owner. Maksimal dua worker aktif; satu penulis per berkas. Verifier/reviewer yang berjalan juga menggunakan slot worker. Tidak ada grandchildren.
3. Implementer mengubah hanya allowed paths dan menulis hasilnya sendiri. Implementer tidak boleh mengubah tests, assertion, snapshot baseline, expected atau rubric supaya lulus.
4. Verifier mengulang kasus gagal dan regression terdampak dengan fixture/baseline yang sama. Reviewer menilai diff dan bukti secara independen.
5. Orchestrator memperbarui ledger, checkpoint, status gerbang dan lock. Berhenti ketika semua gerbang wajib lulus, cap tercapai, stagnasi teramati, atau tugas berubah menjadi kebutuhan produk baru.

Stagnasi berarti bukti gagal yang sama tidak membaik setelah perbaikan atau akar masalah belum dapat dipastikan dalam batas defect. Jangan memakai loop ulang tanpa hipotesis yang teruji. Eskalasi menyertakan tiga opsi konkret dan konsekuensinya melalui `/grillme`; eskalasi tidak mereset budget, tidak memberi izin model Astra/Ultra otomatis dan tidak mengalihkan engine. Pada restart/compaction, baca run/checkpoint lebih dahulu. Jika ledger tidak valid atau baseline tidak cocok, jangan lanjutkan perbaikan sampai konsistensi dipulihkan oleh orchestrator.

Contoh feedback kegagalan:

```text
Defect: geometry-road-occlusion-01
Test: G04 | baseline: <frozen-id> | fixture: <frozen-hash>
Expected: dasar z=-0.075 m tampak melalui aperture, rim mengoklusi bagian dekat.
Actual: dasar tertutup plane jalan pada bearing 90 dan 180.
Evidence: <relative screenshot path + sha256>, <trace path + sha256>
Reproduce: fixture 052-0075, desktop, pose miring 90, waktu fixture tetap.
Owner: geometry | allowed: src/map/DamageLayer.ts
Repair used: 1/2 defect, 4/12 session.
Next: periksa urutan depth/aperture di konteks bersama; jangan angkat mesh
atau ubah baseline. Ulang G03-G06, L03 dan R01 setelah patch.
```

Angka feedback hanya contoh format, bukan hasil eksekusi atau ledger sesi ini.

## Template dan kontrak validasi

Template [task.json](templates/task.json), [result.json](templates/result.json), dan [run.json](templates/run.json) adalah JSON valid versi 1, bukan JSON Schema atau runner. Seluruh ID/hash yang belum ditetapkan `null`, status yang belum berjalan `not_run`, evidence kosong dan exit code `null`. Tidak mengisi hasil contoh sebagai keberhasilan aktual. Berikut adalah aturan validator yang harus dibuat pada implementasi harness, belum executable di paket ini.

`task.json`: identitas task/run, phase, owner, tujuan, read_paths, allowed_paths relatif akar frontend, acceptance_ids, acceptance_scope dan budget. `runtime.model_requested` dan `runtime.reasoning_requested` menyimpan permintaan dispatch; isi sebelum dispatch. `time_budget_seconds` dan `deadline_at` menetapkan batas waktu; minimal satu harus terisi sebelum eksekusi, dan bila keduanya terisi batas yang lebih awal berlaku. Deadline memakai ISO 8601 UTC. Scope null berarti cakupan belum ditetapkan dan tugas belum dapat dieksekusi. Array allowed_paths kosong berarti belum diizinkan mengedit apa pun; jangan menafsirkan sebagai semua file. Owner null berarti belum ditugaskan. Budget repair tidak mengarang kuota token/biaya. Satu task memiliki satu penulis; lock harus cocok dengan ledger.

`result.json`: identitas task/run/owner, status, baseline ID, acceptance_scope, runtime, timing, usage, delegation_count, repair, perubahan, pemeriksaan perintah beserta exit code, gates, evidence dan defect. Gates pada result hanya berlaku bagi scope tugas tersebut. Satu evidence berisi path relatif run atau frontend, SHA-256, jenis, test IDs serta waktu/viewport bila relevan. Evidence kosong berarti belum ada bukti. Tambahkan objek kasus hasil dengan test_id, scope, covered_subcases, status dan evidence_ids saat benar-benar dijalankan; jangan menghilangkan kasus wajib karena gagal.

`run.json`: ledger milik orchestrator, identitas run/session, runtime yang diizinkan [MODEL-POLICY.md](MODEL-POLICY.md), timing, usage, budget, repair counters, delegation_count/delegations, referensi documentation_baseline kanonis, baseline run immutable IDs/path/hashes, lock, task, phase_results, gate akhir dan checkpoint. Default template mempunyai kapasitas dua worker dan satu writer per file, bukan dua worker aktif. Saldo serta cap defect disimpan lintas restart. `checkpoint` menunjuk artefak terakhir yang konsisten. Lokasi checkpoint tidak boleh berada di luar workspace. Baseline baru memerlukan ID baru dan alasan/otorisasi; worker tidak boleh menimpa baseline lama.

Field metadata memakai arti yang sama pada result dan run:

- `runtime.model_requested`/`reasoning_requested` adalah parameter yang diminta; `model_actual`/`reasoning_actual` hanya dari informasi runtime yang benar-benar tersedia. Jika actual tidak diekspos, tetap null dengan alasan pada `verification_note`. Jangan menyalin requested menjadi actual. `authorization_ref` pada run menunjuk keputusan pemilihan model, bukan credential.
- `timing.started_at`/`finished_at` adalah waktu aktual ISO 8601 UTC; `elapsed_seconds` diukur dengan clock monotonic aktual, bukan clock fixture. Sebelum dijalankan semuanya null. Jika tidak dapat diukur, null dan jelaskan pada limitations hasil.
- `usage.input_tokens`, `output_tokens` dan `cached_input_tokens` hanya dari telemetri yang tersedia. Usage tidak tersedia tetap null dengan `unavailable_reason`, bukan nol. Cache adalah bagian input jika provider menyatakan demikian, tidak dijumlahkan dua kali. Usage run menyatakan agregat yang cakupannya jelas di unavailable_reason bila hanya sebagian telemetri tersedia; jangan menghitung biaya tanpa tarif terverifikasi.
- `result.repair.cycle` dan `attempt` adalah nomor 1-based yang dialokasikan orchestrator sebelum koreksi, bersama defect_id stabil; null untuk tugas awal/non-repair. `session_cycles_used` dan `defect_attempts_used` menyalin counter ledger setelah alokasi, bukan mereset counter. `run.defect_counters` memuat defect_id dan attempts_used yang monoton.
- `run.delegation_count` bertambah sebelum setiap percobaan dispatch dan sama dengan jumlah record `delegations`. Satu record berisi delegation_id, task_id, owner/child_id bila tersedia, model_requested/model_actual, reasoning_requested/reasoning_actual, status, started_at/finished_at, repair_cycle/defect_attempt bila relevan dan result_path. Field yang belum tersedia null; dispatch gagal tetap dicatat. `active_workers` hanya worker yang sedang aktif, bukan total delegasi. `result.delegation_count` milik child wajib 0 karena larangan grandchildren; hasil orchestrator melaporkan jumlah dari ledger.

Kosakata `status` untuk task, result, run dan record delegasi adalah `not_run`, `running`, `passed`, `failed`, `blocked`, atau `stopped`. `not_run` belum dimulai; `running` sedang berjalan; `passed` memenuhi acceptance pada scope yang disebut; `failed` assertion/acceptance gagal; `blocked` prasyarat eksternal hilang; `stopped` dihentikan karena batas waktu/budget, stagnasi, keputusan atau scope baru. Gate dan case memakai `not_run`, `running`, `passed`, `failed`, `blocked`; run stopped tidak mengubah gate yang gagal/belum berjalan menjadi passed. Status command memakai kosakata task dan selalu konsisten dengan exit_code serta bukti. Keberhasilan menghasilkan artefak saja tidak meluluskan acceptance yang belum diperiksa.

Validator wajib menolak:

- `schema_version` selain 1, JSON rusak, ID task/run yang tidak cocok, owner tak cocok lock, counter negatif atau berkurang, atau task mulai setelah cap.
- Status di luar kosakata, dispatch tanpa model/effort diminta atau batas waktu, actual model/usage yang dikarang, child delegation_count bukan 0, jumlah record delegasi tidak cocok counter, atau cycle/attempt hasil tidak cocok alokasi ledger. Nilai metadata yang unavailable harus null dengan alasan, bukan keberhasilan palsu.
- Path absolut, `..`, wildcard terlalu luas, resolusi symlink keluar akar frontend, konflik dua penulis pada file, atau perubahan di luar allowed paths. Normalize path sebelum membandingkan; lock berkas bersama diperlukan untuk App.tsx/Map3D.tsx.
- Gerbang `passed` tanpa evidence terkait yang ada serta hash cocok, kasus wajib masih not_run/failed/blocked, type/build tanpa exit code 0, atau review tanpa identitas reviewer independen.
- Scope hasil tidak cocok tugas, subset subkasus dipakai meluluskan cakupan penuh, `run.gates` diluluskan hanya dari hasil fase, atau baseline P0 ditulis ke path baseline kanonis sesi dokumentasi.
- Exit code 0 dengan status perintah not_run, exit code nonzero dengan command passed, atau perintah yang belum dijalankan memakai exit code 0. Gate visual tidak disimpulkan dari exit code saja.
- Evidence kandidat dari baseline/fixture/browser/viewport berbeda tanpa penjelasan dan keputusan; perubahan baseline/test contract oleh implementer; model/engine berubah tanpa izin.
- Lebih dari dua worker aktif, grandchildren, sesi/counter baru untuk menyamarkan cap lama, atau ledger yang ditulis implementer.
- Rahasia, token, cookie, credential, URL media privat atau isi `.env` pada template, output dan evidence. Referensikan nama variabel konfigurasi saja.

Minimal validasi dokumentasi saat ini hanya parse JSON dan konsistensi tautan/ID/semantik. Lulus parse tidak berarti invariant runtime telah diuji. Template belum berisi hash baseline atau bukti aplikasi karena belum ada run implementasi.

## Sumber teknis

- [Custom layer MapLibre pada tag v4.7.1](https://github.com/maplibre/maplibre-gl-js/blob/v4.7.1/src/style/style_layer/custom_style_layer.ts) menjadi acuan signature dan ownership konteks versi proyek; periksa juga implementasi lokal sebelum menulis adapter.
- [WebGLRenderer Three pada tag r170](https://github.com/mrdoob/three.js/blob/r170/src/renderers/WebGLRenderer.js) menjadi acuan kompatibilitas WebGL2 dan lifecycle versi proyek; jangan memakai cleanup renderer mandiri untuk menghancurkan konteks MapLibre bersama.
- [Playwright Clock](https://playwright.dev/docs/clock) menjelaskan pengendalian waktu browser untuk fixture yang dapat diulang. Penggunaan API mengikuti versi yang nantinya disepakati, belum terpasang saat paket ini dibuat.
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) menjadi acuan pengambilan screenshot dalam lingkungan yang sama; snapshot proyek harus dibekukan dan diperiksa, bukan diperbarui otomatis agar tes hijau.

Sumber diperiksa ulang untuk penyusunan rancangan pada 16 Oktober 2026. Bukti proyek awal terdapat pada [perbandingan video](../video-ui-comparison-2026-10-16.md) dan bukan bukti bahwa harness baru telah berjalan.
