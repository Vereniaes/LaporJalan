# Perbandingan video dan antarmuka LaporJalan

Tanggal pemeriksaan: 16 Oktober 2026, WIB.

Pembaruan dokumentasi pada tanggal yang sama: [agent pack](oyenza-agent-pack/README.md) memuat analisis bundle Oyenza yang kemudian berhasil diambil melalui HTTP publik, koreksi klaim, dan rencana implementasi. Catatan kegagalan akses di laporan ini berlaku untuk metode pemeriksaan terdahulu. Bukti browser/video di bawah tetap merupakan hasil pemeriksaan terdahulu, bukan pengujian ulang fitur baru.

Kesimpulan: proyek sudah memiliki navigasi peta, inspeksi lapangan, jaring permukaan, dan kartu CCTV tertambat. Kebutuhan inti berupa kerusakan tiga dimensi yang menyatu dengan jalan pada peta belum terpenuhi. Catatan penyelesaian fase sebelumnya belum dapat dianggap sebagai bukti kesetaraan visual.

## Cakupan dan metode

- [x] Membaca pedoman, rencana tugas, catatan pengetahuan, dan komponen terkait.
- [x] Memeriksa ketiga video melalui cuplikan sepanjang durasi dan pemeriksaan lebih rapat pada adegan utama.
- [x] Memproses seluruh jalur audio dengan transkripsi otomatis lokal. Hasil transkripsi digunakan untuk memahami arah kebutuhan, bukan sebagai kutipan verbatim.
- [x] Membandingkan video dengan kode pada direktori kerja dan aplikasi lokal.
- [x] Menguji inspeksi, pilihan 2D, kartu CCTV, dan filter kategori melalui Chromium.
- [x] Menjalankan pemeriksaan TypeScript tanpa emisi berkas.
- [x] Mengumpulkan sumber teknis resmi dan bukti visual.
- [ ] Menetapkan prioritas implementasi melalui pilihan pengguna.

Pemeriksaan visual menggunakan cuplikan berjarak 2 detik, 4 detik, dan 8 detik untuk masing-masing video. Adegan inspeksi ditinjau lebih rapat pada 00:53 sampai 01:08. Metode ini bukan pemeriksaan setiap bingkai. Aplikasi lokal diuji pada ukuran layar 1912 x 908 piksel dengan data contoh karena layanan lokal pada port 5000 tidak tersedia. Acuan situs Oyenza saat pemeriksaan mengembalikan HTTP 403, sehingga rekaman pengguna menjadi bukti visual utama. Performa 60 FPS dan kondisi produksi tidak diukur.

## Inventaris rekaman

| Berkas | Durasi | Isi yang relevan |
| --- | --- | --- |
| Recording 2026-10-15 214801.mp4 | 21,20 detik | Navigasi Oyenza, pembesaran dan rotasi peta, bangunan netral, panel samping ringkas. |
| Recording 2026-10-15 221811.mp4 | 76,33 detik | LaporJalan versi lama, simulator kendaraan pada sekitar 00:28 dan 01:00, serta perbandingan dengan Oyenza. Audio sekitar 00:25 sampai 01:12 mengarahkan inspeksi langsung pada peta. |
| Recording 2026-10-15 230929.mp4 | 221,20 detik | Inspeksi lama pada 00:00 sampai 00:24, ilustrasi jalan pada 00:32 sampai 00:48, contoh lubang berjejaring pada 00:56, Google Maps pada sekitar 01:08 sampai 01:28, Oyenza pada sekitar 02:00 sampai 02:56, serta CCTV pada sekitar 03:04 sampai akhir. |

Klip yang ditampilkan pada 00:53 sampai 01:06 bernama `gemini_generated_video_7296baa1.mp4`. Klip tersebut digunakan sebagai acuan bentuk dan interaksi. Teks berulang, ukuran jalan, dan proporsi objek di dalamnya tidak menjadi bukti pengukuran lapangan.

## Temuan terverifikasi

### 1. Kerusakan tiga dimensi belum menyatu dengan peta

Pada video 230929 sekitar 00:56, cekungan dan jaring permukaan berada pada jalan dalam lingkungan kota yang sama. Pada proyek, lapisan kerusakan peta hanya bertipe `fill` dan `line`. Jaring dan permukaan yang terdeformasi dibangun oleh Three.js di penampil terpisah dengan latar gelap.

Bukti kode: `src/components/Map3D.tsx:458`, `src/components/DepthInspector3D.tsx:72`, dan `src/components/DepthInspector3D.tsx:285`.

Dampak: pembesaran menuju lokasi tidak menampilkan bentuk cekungan sebagaimana acuan. Tombol inspeksi lapangan memang mencapai zoom 19,2 dan kemiringan 74°, tetapi bentuk kerusakan tetap datar. Kemiringan kamera saja tidak menghasilkan geometri jalan tiga dimensi.

Arah perbaikan: uji satu lubang sebagai lapisan tiga dimensi yang mengikuti koordinat dan kamera peta. Gunakan kembali perhitungan deformasi yang sudah ada. Ukuran objek perlu berasal dari data laporan. Keberhasilan dinilai dari kesinambungan peta, perubahan perspektif, dan keterbacaan lubang saat kamera diputar.

Bukti visual: [perbandingan inspeksi](video-review-2026-10-16/inspection-comparison.jpg).

### 2. Mode 2D berubah setelah laporan dipilih

Reproduksi: aktifkan 2D, kemudian pilih penanda galian. Sebelum pemilihan, kemiringan kamera 0°. Setelah pemilihan, kemiringan menjadi 58° dengan status tombol `aria-pressed=false`. Efek pemilihan laporan menetapkan `pitch: 58` tanpa mengikuti mode kamera.

Bukti kode: `src/components/Map3D.tsx:715`. Efek pencarian lokasi pada baris 779 memiliki nilai kemiringan tetap yang sama, tetapi jalur pencarian tidak diuji dalam pemeriksaan ini.

Dampak: peta tidak mengikuti pilihan tampilan. Arah perbaikan: semua perpindahan kamera membaca mode yang sama. Kriteria penerimaan: pemilihan laporan dalam mode 2D mempertahankan kemiringan 0°.

### 3. Tampilan kota masih berbeda dari Oyenza

Video 214801 sekitar 00:04 sampai 00:20 memperlihatkan bangunan netral pada wilayah yang dijelajahi. Proyek memakai gaya dasar `bright` dengan banyak label dan ruas berwarna, kemudian menambahkan 14 poligon bangunan berbentuk persegi panjang di koridor tertentu. Pada tampilan inspeksi, balok besar mendominasi bidang pandang.

Bukti kode: `src/components/Map3D.tsx:319`, `src/components/Map3D.tsx:439`, dan `src/services/mockData.ts:186`.

Dampak: tekstur kota, proporsi bangunan, dan keterbacaan jalan berbeda. Arah perbaikan: gunakan geometri bangunan dari sumber peta yang sesuai, atur tampilan jalan dan label menurut tingkat pembesaran, kemudian ukur keterlihatan titik kerusakan. Panel proyek juga memakai lebar 460 piksel pada layar pengujian. Penyesuaian panel dapat dilakukan setelah tampilan jalan disepakati.

Bukti visual: [perbandingan peta](video-review-2026-10-16/map-comparison.jpg).

### 4. Kartu CCTV sudah tertambat, tetapi medianya masih statis

Video 230929 sekitar 03:20 memperlihatkan kartu CCTV di atas titik kamera dengan tampilan lalu lintas dan aksi layar penuh. Proyek sudah memakai `maplibregl.Popup`, tetapi komponen hanya merender `img`. Sumber gambar berasal dari Unsplash, waktu pembaruan disimpan sebagai teks tetap, dan label `LIVE` tetap muncul. Pengujian DOM menemukan 0 elemen video, 1 gambar, dan 0 tombol layar penuh. Properti `onFullscreen` tersedia pada komponen, tetapi tidak diberikan oleh pemanggilnya.

Bukti kode: `src/components/CctvPopover.tsx:63`, `src/components/CctvPopover.tsx:109`, `src/components/Map3D.tsx:965`, dan `src/services/mockData.ts:23`.

Dampak: tampilan mengesankan pemantauan langsung meskipun sumbernya gambar contoh. Arah perbaikan: sesuaikan label dengan sumber media, lalu integrasikan sumber CCTV yang tersedia dan pengendali layar penuh. Keberadaan video saja tidak membuktikan siaran langsung, sehingga status juga perlu mengikuti sumber dan waktu pembaruannya.

Bukti visual: [perbandingan CCTV](video-review-2026-10-16/cctv-comparison.jpg).

### 5. Ukuran visual dan angka laporan belum konsisten

Penanda menampilkan lebar laporan 52 cm, tetapi bentuk lubang di peta memakai radius dasar tetap 4 meter sebelum variasi bentuk. Nilai lebar jalan 7 meter juga ditulis langsung pada antarmuka. Galian menggunakan panjang, lebar, dan orientasi tetap.

Bukti kode: `src/components/Map3D.tsx:91`, `src/components/Map3D.tsx:186`, dan `src/components/Map3D.tsx:691`.

Dampak: ukuran visual tidak dapat dibaca sebagai representasi ukuran laporan. Arah perbaikan: pisahkan penanda yang sengaja diperbesar untuk keterlihatan dari geometri yang mengikuti skala. Lebar jalan harus memiliki sumber data atau dinyatakan belum tersedia.

## Bagian yang sudah sesuai

- Simulator kendaraan sudah tidak dipanggil oleh `App.tsx`. Tombol lapangan mengatur kamera peta yang sama.
- Permukaan terdeformasi dan jaring hijau sudah tersedia dalam penampil kedalaman.
- Kartu CCTV sudah menggunakan titik koordinat sebagai tambatan.
- Pemilihan kategori Retak menghasilkan satu laporan retak pada daftar dan satu penanda kerusakan retak pada peta.
- Pemeriksaan `node node_modules/typescript/bin/tsc --noEmit` berakhir dengan kode 0.

Keberhasilan kompilasi tidak membuktikan kesetaraan visual. Pemeriksaan tidak mencakup pengiriman laporan, pengukuran memori, atau pengujian beban. Tidak ada persentase kemiripan yang ditetapkan karena tolok ukur tersebut belum disepakati.

## Pilihan tindak lanjut

1. **Inspeksi jalan terlebih dahulu, direkomendasikan.** Satukan bentuk lubang dengan peta, selaraskan skala, dan perbaiki konsistensi kamera. Pilihan ini paling langsung menjawab audio video kedua dan contoh visual video ketiga.
2. **Tampilan Oyenza terlebih dahulu.** Selaraskan sumber bangunan, warna peta, kepadatan label, proporsi panel, dan kontrol navigasi. Pilihan ini memperbaiki kesan visual umum, tetapi belum memenuhi kebutuhan cekungan pada peta.
3. **CCTV terlebih dahulu.** Perbaiki label sumber media, sambungkan sumber kamera yang tersedia, dan tambahkan layar penuh. Pilihan ini memperbaiki fungsi pemantauan, tetapi tidak menutup kesenjangan inspeksi jalan.

## Sumber teknis

- [MapLibre CustomLayerInterface](https://maplibre.org/maplibre-gl-js/docs/API/interfaces/CustomLayerInterface/) menjelaskan lapisan khusus pada konteks grafis peta. Mekanisme ini dapat dievaluasi untuk geometri kerusakan yang memakai kamera peta. Penerapannya harus disesuaikan dengan versi MapLibre 4.7.x yang tercantum dalam proyek.
- [MapLibre Popup](https://maplibre.org/maplibre-gl-js/docs/API/classes/Popup/) menjelaskan penempatan konten pada koordinat geografis. Proyek sudah menggunakan mekanisme tersebut.

## Catatan pelaksanaan

Dokumen dan bukti pemeriksaan disimpan dalam direktori `knowledge` pada repositori frontend agar dapat dicatat melalui Git. Direktori pengetahuan di induk proyek berada di luar kedua repositori Git. Kode aplikasi yang diperiksa mencakup perubahan lokal yang sudah ada sebelum peninjauan. Perubahan tersebut tidak dimasukkan ke commit dokumentasi.

Hasil pengujian terperinci tersedia dalam [browser-results.json](video-review-2026-10-16/browser-results.json). Berkas video sumber tetap berada pada direktori induk proyek.
