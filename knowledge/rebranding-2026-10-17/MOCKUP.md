# Mockup LaporJalan

Pratinjau ini mematangkan peta, detail, komentar, dan formulir setelah pilihan pengguna. Nama LaporJalan dan arah aktivitas warga mengacu BOS:311 tetap berlaku. Ini pekerjaan desain terpisah, bukan implementasi aplikasi.

## Buka dan coba

Buka [MOCKUP.html](MOCKUP.html) dari workspace yang sama. Papan konsep awal tetap tersedia pada [DESIGN-BOARD.html](DESIGN-BOARD.html).

1. Pilih laporan pada daftar atau marker. Keduanya membuka ID yang sama.
2. Pilih kelompok titik untuk memperbesar peta. Jumlah berasal dari data cuplikan.
3. Cari ID laporan/status atau ubah kategori. Kategori tanpa data menampilkan keadaan kosong.
4. Buka tab Ringkasan, Pembaruan, dan Komentar.
5. Ketik komentar dan pilih foto/video lokal untuk pratinjau yang belum dipublikasikan.
6. Pilih Laporkan, tentukan titik/koordinat, isi kondisi dan bukti, lalu tinjau.
7. Pada mobile, gunakan Lihat daftar/Lihat peta. Detail dan formulir memakai satu panel.

Tombol akhir berbunyi `Selesai meninjau`. Tidak ada laporan dikirim. Jika isian yang berubah ditutup, dialog memberi pilihan melanjutkan atau menghapusnya.

## Data yang digunakan

Mockup menggunakan **25 objek publik berkategori Jalan** dari respons CRM Jakarta, diperiksa pada 17 Oktober 2026 untuk rentang 16-17 Oktober 2026. [Ringkasan sumber](crm-data-probe.json) mencatat URL, waktu dan hash. [Snapshot untuk mockup](mockup-source.js) hanya menyimpan ID, kode, koordinat, kategori, waktu pembuatan dan label status.

- Seluruh objek yang dipilih memiliki `isPrivacy: false` pada respons asal.
- Identitas, isi keluhan, media, dan struktur organisasi dikeluarkan dari ekspor desain.
- Judul kartu `Laporan jalan` merupakan label umum UI, bukan judul asli keluhan.
- Kategori Jalan tidak otomatis berarti jalan rusak. Kategori lain tidak diisi dengan klasifikasi buatan.
- Koordinat mengikuti sumber; batas administrasi Jakarta dan ketelitian posisi belum divalidasi. Sebagian posisi dapat berada di luar wilayah yang diharapkan.
- Status seperti Selesai, Disposisi Unit, atau EWS adalah status CRM **saat cuplikan diambil**. Tidak ada penafsiran, tahapan atau persentase progres rekaan.
- Foto/video tidak tersedia pada respons ini. UI menunjukkan tanpa media, bukan gambar stok.
- Tidak ada pengiriman laporan/komentar ke pemerintah, dan tidak ada percakapan warga buatan.

Pemakaian sumber pada produk publik tetap memerlukan pemeriksaan kontrak dan ketentuan sumber. Penelitian lokal bukan pernyataan bahwa integrasi produksi atau izin publikasi ulang sudah selesai.

## Interaksi yang dimatangkan

| Area | Rincian |
| --- | --- |
| Daftar | Slot foto/keadaan tanpa foto, judul, kode, waktu dan status berlabel sumber |
| Marker | Ikon, pengelompokan titik rapat, outline pilihan |
| Detail | Menggantikan daftar pada panel yang sama; kembali mempertahankan pencarian |
| Pembaruan | Waktu pencatatan dan pengambilan dibedakan dari waktu perubahan status yang tidak diketahui |
| Komentar | Keadaan belum terhubung, input, media lokal, pratinjau belum dipublikasikan |
| Lokasi | Klik peta atau koordinat; tidak mengambil lokasi perangkat otomatis |
| Kondisi | Kategori, judul, uraian, foto/video opsional |
| Tinjau | Isi dan lampiran diperiksa; akhir pratinjau tidak menyerupai keberhasilan pengiriman |
| Keluar | Isian yang berubah tidak dibuang tanpa penjelasan; kembali pada konteks sebelumnya |
| Mobile | Panel awal memperlihatkan laporan; atribusi berada di luar panel |

## Batas teknis mockup

MapLibre dibaca dari dependency frontend yang sudah terpasang. Tidak ada instalasi baru. Basemap OpenFreeMap memerlukan internet. Menyalin folder tanpa `node_modules` membuat peta tidak tersedia, sedangkan daftar tetap dapat digunakan.

File lokal JPEG, PNG, WebP, MP4 dan WebM dapat dipratinjau. Batas pratinjau adalah 10 MB per berkas dan 3 lampiran per laporan; ini **belum menjadi keputusan API produksi**. Tidak ada upload. MIME diperiksa dari browser; validasi server, penyimpanan dan moderasi masih pekerjaan berikutnya. Semua isian berada di memori browser dan hilang saat halaman dimuat ulang.

Yang belum terhubung: pencarian alamat/geocoding, validasi batas Jakarta, akun, persistensi laporan/komentar, pembaruan sumber, CCTV, inspeksi 3D, dan riwayat penanganan resmi yang tidak diberikan sumber. Pengukuran aplikasi lama tidak diulang atau dinyatakan lulus.

Keadaan gagal dijelaskan pada [UI-SPEC](UI-SPEC.md) dan papan konsep. Mockup lanjutan mempertahankan daftar saat basemap gagal. Ketergantungan data laporan berupa cuplikan statis yang diberi tanggal.

## Referensi dan pemeriksaan

Pratinjau layar: [peta desktop](mockup-desktop-map.png), [detail desktop](mockup-desktop-detail.png), [peta mobile](mockup-mobile-map.png), [detail mobile](mockup-mobile-detail.png), [komentar mobile](mockup-mobile-comments.png), dan [kondisi laporan mobile](mockup-mobile-condition.png).

Hasil [pemeriksaan browser](mockup-check.json): 34 pemeriksaan lulus, meliputi jumlah titik, kesesuaian marker/daftar, filter dan pencarian, keadaan tanpa data, komentar yang tidak terkirim, validasi isian/media, pemulihan konteks, fokus, atribusi serta lebar 390/320 px. Tidak ada request mutasi eksternal atau page error pada alur yang diperiksa. Ini bukan audit aksesibilitas penuh atau kelulusan aplikasi.

Gaya Positron OpenFreeMap digunakan kembali, dengan atribusi OpenFreeMap, OpenMapTiles dan OpenStreetMap: [panduan](https://openfreemap.org/quick_start/), [atribusi](https://openfreemap.org/).

Pengujian browser memakai teks/berkas uji hanya di sesi browser, tidak menyimpannya ke data laporan. Pemeriksaan memisahkan kelulusan mockup dari aplikasi. Tidak ada commit, push, deploy atau pengunduhan massal.
