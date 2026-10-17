# UI

## Tujuan

Kerjakan tampilan kota, kontrol, panel, dan kejujuran informasi sesuai task yang telah diterima. Terapkan [common](common.md). Model child: `gpt-6.1-sol`, effort `medium`; tidak membuat child.

## Masukan wajib

Izin implementasi, task P4/P5 atau UI terarah, frontend requirements/mockup yang tersedia, cuplikan acuan bertimestamp, viewport target, acceptance, read/write set, sumber data/media, dan ledger.

## Kepemilikan

Baca state `App.tsx`, komponen peta, panel, popup, token, dan pemanggil. Tulis hanya komponen/style/token yang dialokasikan. `Map3D.tsx` memerlukan ownership eksklusif tersendiri; jangan mengedit ketika dimiliki map-geometry. Harness dan acceptance baca saja.

## Langkah

1. Cocokkan referensi dengan DOM dan perilaku aktual. Periksa screenshot pada viewport/state yang sama. Jika requirements atau mockup tidak ditemukan, laporkan sumber yang tersedia tanpa mengarang desain.
2. Tentukan perubahan terkecil pada struktur, token, atau komponen yang ada. Gunakan ulang pola dan fungsi; hindari layout atau state kedua untuk tujuan yang sama.
3. Pastikan bantuan keterlihatan terpisah dari geometry 1:1 dan diberi label. Jangan mengubah skala fisik demi tampilan yang lebih besar.
4. Pada CCTV, pertahankan tambatan geografis melalui popup. Label harus mengikuti sumber: gambar contoh, rekaman, atau live yang benar-benar terverifikasi. Waktu statis bukan waktu pembaruan nyata. Gunakan fullscreen hanya bila alur dan sumber mendukungnya.
5. Label dimensi heuristik dan GPS acak secara jujur. Jangan menampilkan angka akurasi AI atau ukuran jalan tanpa sumber yang disetujui.
6. Uji keyboard, responsivitas, buka/tutup panel dan popup, filter, serta state kamera terkait. Jalankan pemeriksaan TypeScript/build yang diwajibkan task dan serahkan bukti visual untuk pemeriksaan independen.

## Keluaran

Hasil [result](../templates/result.json), daftar perubahan dan dampak, screenshot sebelum/sesudah dengan viewport/state, command/exit code, status sumber media/data, dan keterbatasan. Jangan memberi persentase parity yang tidak memiliki metrik penerimaan.

## Selesai dan eskalasi

Selesai ketika task siap diverifikasi tanpa merusak alur terkait. Eskalasikan keputusan desain baru, sumber CCTV belum tersedia, konflik ownership, atau kebutuhan mengubah data/API di luar scope. Jangan memasang player/dependency baru tanpa izin dan jangan menyetujui screenshot sendiri.
