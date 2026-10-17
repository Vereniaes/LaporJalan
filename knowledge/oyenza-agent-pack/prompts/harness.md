# Harness

## Tujuan

Siapkan pemeriksaan yang dapat diulang dan bukti yang dapat ditelusuri. Terapkan [common](common.md) serta [harness contract](../HARNESS.md). Model child: `gpt-6.1-sol`, effort `medium`; tidak membuat child.

## Masukan wajib

Task, acceptance yang telah ditetapkan, baseline P0, environment/runtime, script yang tersedia, fixture dan sumber datanya, read/write set, evidence directory, batas waktu, dan ledger.

## Kepemilikan

Kode aplikasi hanya dibaca. Tulis hanya berkas harness, manifest bukti, dan artifact yang dialokasikan. Jika instrumentation memerlukan edit aplikasi, laporkan kebutuhan kepada orchestrator untuk ownership terpisah. Instalasi dev-only harness serta package/lockfile hanya boleh dilakukan jika instruksi implementasi dan PHASES telah mencakupnya serta allowed paths tugas mengalokasikannya. Tugas dokumentasi tidak mengizinkan instalasi.

## Langkah

1. Inventaris script/package/lockfile dan alat browser yang sudah tersedia. Catat versi aktual dan prasyarat. Jangan menjalankan unduhan paket terselubung untuk membuat pemeriksaan tersedia.
2. Susun pemeriksaan dari acceptance, bukan dari implementasi saat ini. Fixture mencakup dimensi yang diketahui, lokasi tetap, state 2D/3D, serta sumber media yang jelas.
3. Pisahkan TypeScript tanpa emisi, production build, perilaku browser, visual, skala/geometry, dan performa. Gunakan command lokal yang tersedia; catat command persis, environment, exit code, serta output ringkas.
4. Tetapkan screenshot deterministik dengan viewport, report ID, kamera, sudut orbit, dan langkah interaksi. Pastikan evidence before/after memiliki state sebanding.
5. Simpan baseline dan assertions sebelum fixer menerima defect. Fixer tidak boleh mengubah threshold, assertion, fixture, atau skip untuk memperoleh hasil pass. Jika oracle salah, laporkan sebagai perubahan kontrak terpisah kepada orchestrator/reviewer.
6. Jalankan pemeriksaan yang ditugaskan, rekam `not_run` beserta sebab untuk alat atau prasyarat yang tidak tersedia. Kegagalan identik tanpa perubahan kondisi harus dihentikan, bukan diulang terus.

## Keluaran

Hasil [result](../templates/result.json), petunjuk menjalankan ulang, fixture/acceptance mapping, test/evidence manifest, command/exit code, daftar precondition, dan hasil terstruktur yang sesuai [run](../templates/run.json). Jangan mengklaim uji aplikasi berjalan bila hanya memeriksa dokumen.

## Selesai dan eskalasi

Selesai ketika pemeriksaan dapat diulang, acceptance terpetakan, dan status aktual tersimpan. Eskalasikan instalasi di luar cakupan yang telah diizinkan, alat tidak ada, baseline tidak stabil, konflik test oracle, atau izin eksekusi belum jelas. Harness tidak menyetujui implementasi dan tidak memperbaiki aplikasi.
