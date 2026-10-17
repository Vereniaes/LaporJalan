# Map geometry

## Tujuan

Implementasikan tugas kamera, skala, atau geometry pada peta sesuai gate. Ikuti [common](common.md). Model child: `gpt-6.1-sol`, effort `high`; tidak membuat child.

## Masukan wajib

Izin implementasi, task fase P1/P2/P3 atau tugas peta terarah, acceptance beku, read/write set eksklusif, baseline, hasil riset API versi aktual, fixture dimensi/koordinat, evidence plan, dan ledger.

## Kepemilikan

Baca `Map3D.tsx`, `DepthInspector3D.tsx`, `App.tsx`, tipe, data, dan pemanggil terkait. Tulis hanya berkas yang ditugaskan, termasuk helper baru hanya jika terdaftar. Jangan menulis UI yang dimiliki worker lain, assertion, fixture penerimaan, atau threshold uji.

## Langkah

1. Reproduksi masalah kamera/skala sebelum edit. Periksa radius tetap 4 m, konversi cm ke meter, latitude-dependent scaling, orientasi, serta hard-coded `pitch: 58` pada seluruh jalur kamera.
2. Gunakan sumber state kamera yang sama untuk pemilihan laporan, pencarian, auto-tilt, dan inspeksi. Pilihan 2D harus bertahan. Pertahankan single map instance, filter, dan popup tertambat.
3. Pisahkan geometry 1:1 dari bantuan keterlihatan. Dimensi tidak tersedia atau heuristik harus menghasilkan status jujur; jangan membuat angka lapangan baru.
4. Pada P2, bangun hanya satu prototype lubang di koordinat fixture. Uji transform dan bentuk terhadap ukuran yang diketahui, kamera berputar, permukaan jalan, serta depth/occlusion. Cekungan di bawah permukaan dapat tertutup basemap; buktikan solusi sebelum integrasi luas.
5. Gunakan kontrak MapLibre 4.7.1 dan Three.js 0.170.0 yang telah diperiksa. Untuk shared canvas, jangan memanggil context loss, menghapus canvas peta, atau melakukan cleanup yang mengambil alih resource peta. Lepas hanya resource/listener milik layer dan uji lifecycle.
6. Jalankan TypeScript/build dan skenario regresi yang dialokasikan. Serahkan screenshot pada kamera/state yang dapat diulang untuk visual-qa. Jangan mengklaim physical pothole dari mesh di atas jalan.

## Keluaran

Hasil [result](../templates/result.json), berkas berubah, alasan perubahan minimum, perhitungan unit, command/exit code, evidence path, hasil feasibility dan risiko cleanup/occlusion. Laporkan hal yang belum diuji sebagai `not_run`.

## Selesai dan eskalasi

Selesai ketika perubahan terukur memenuhi task dan siap review independen. Eskalasikan jika rendering below-road tidak terlihat, occlusion tidak benar, shared ownership berkonflik, versi API berbeda, atau data tidak mendukung klaim 1:1. Jangan memperbesar scope atau mengubah acceptance. Perbaikan setelah kegagalan tunduk pada cycle/attempt common.
