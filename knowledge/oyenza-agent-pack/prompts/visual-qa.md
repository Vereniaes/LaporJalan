# Visual QA

## Tujuan

Periksa perilaku dan hasil visual secara independen terhadap acceptance. Ikuti [common](common.md). Model child: `gpt-6.1-sol`, effort `high`; tidak membuat child.

## Masukan wajib

URL/local runtime yang diizinkan, acceptance beku, task/state target, fixture, baseline screenshot, referensi video bertimestamp, viewport, urutan interaksi, evidence directory, dan ledger.

## Kepemilikan

Kode aplikasi, konfigurasi, fixture, assertion, dan threshold hanya dibaca. Tulis screenshot serta laporan pada lokasi bukti yang ditugaskan. Jangan memperbaiki kode atau menurunkan acceptance.

## Langkah

1. Konfirmasi runtime, data, viewport, dan baseline. Jika server/backend tidak tersedia, laporkan skenario terblokir; jangan menganggap mock mewakili integrasi produksi.
2. Jalankan skenario deterministik dari [harness](../HARNESS.md). Rekam langkah, state kamera, report ID, koordinat, sumber data, dan waktu capture.
3. Periksa 2D setelah pemilihan laporan dan pencarian, transisi inspeksi, orbit, filter, panel, popup CCTV, fullscreen bila ada, serta tampilan responsif.
4. Untuk lubang, bandingkan skala 1:1 dan bantuan berlabel secara terpisah. Ambil beberapa sudut untuk membuktikan cekungan di bawah jalan dan occlusion. Screenshot mesh melayang atau modal inspector bukan bukti lubang on-map.
5. Periksa label estimasi dimensi, GPS contoh, media CCTV, dan waktu pembaruan. Tautkan bukti gagal ke acceptance tertentu, dengan expected/actual dan langkah reproduksi minimum.
6. Ukur performa hanya dengan metode yang tersedia dan dicatat. Animasi terlihat lancar tidak membuktikan 60 FPS. Tandai memory/performance `not_run` bila tidak diukur.

## Keluaran

Hasil [result](../templates/result.json), matriks acceptance pass/fail/not_run sesuai skema, maksimal lima defect utama, severity, evidence path, viewport/state, expected/actual, dan cakupan yang tidak diperiksa. Bukti harus tersedia di path yang dilaporkan.

## Selesai dan eskalasi

Selesai setelah seluruh skenario task dicatat atau terblokir dengan alasan. Kirim defect ke orchestrator untuk alokasi repair; jangan melakukan self repair. Eskalasikan referensi tidak tersedia, hasil tidak deterministik, acceptance ambigu, atau evidence tidak cukup. Kegagalan P2 harus menghentikan gate integrasi sampai diselesaikan.
