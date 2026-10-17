# LaporJalan - branding dan UI peta warga

Rencana ini menjelaskan identitas dan antarmuka LaporJalan sebelum perubahan aplikasi. Acuan: 17 Oktober 2026, Asia/Jakarta.

**Keputusan terbaru: nama LaporJalan tetap digunakan; desain mengutamakan peta dan aktivitas warga dengan referensi BOS:311.** Tahap penelitian dan mockup telah diikuti persetujuan implementasi peta/daftar. Halaman utama baru kini diterapkan pada aplikasi; lihat [hasil implementasi](IMPLEMENTATION.md) dan [panduan deploy](DEPLOYMENT.md).

Pembaruan: pengguna memilih pematangan mockup desktop/mobile. [Mockup lanjutan](MOCKUP.html) menyediakan peta, detail, pembaruan, komentar dan formulir lokal. Cuplikan publik dipakai untuk meninjau desain; pengiriman dan integrasi produk belum dilakukan.

## Baca paket

- **Acuan desain:** [mockup interaktif](MOCKUP.html) dan [panduan mockup](MOCKUP.md) untuk peta, detail, komentar, dan formulir. Memakai cuplikan publik berkategori Jalan; isian tidak dikirim.
- [Papan desain interaktif](DESIGN-BOARD.html) - susunan desktop/mobile, kategori, detail, dan langkah laporan. Wireframe tanpa data kejadian rekaan.
- Pratinjau: [desktop](design-board-desktop.png) dan [mobile](design-board-mobile.png).
- [Spesifikasi UI](UI-SPEC.md) - identitas, komponen, interaksi, keadaan gagal, dan aksesibilitas.
- [Referensi pemerintah dan sumber data](REFERENCES.md) - temuan, screenshot, batas pemeriksaan, dan GitHub.
- [TODO dan dampak kode](TODO.md) - urutan pekerjaan, syarat keluar, dan area yang perlu diperiksa.
- [Validasi paket](VALIDATION.md) - pemeriksaan dokumentasi dan preservasi aplikasi.

## Tujuan produk

Memudahkan warga menemukan kondisi jalan di sekitar, melaporkan lokasi dengan bukti, dan melihat pembaruan pada titik yang sama. Wilayah awal adalah Jakarta. Jalan tetap menjadi pusat produk; saluran tersumbat, pembakaran sampah, dan pembangunan ditampilkan sebagai kejadian yang berkaitan dengan jalan serta ruang di sekitarnya.

Pengamatan awal dari percakapan dengan pihak kelurahan menjadi masukan kebutuhan, bukan bukti bahwa semua kelurahan menggunakan proses yang sama. Validasi berikutnya perlu menguji cara warga menentukan lokasi dan memahami informasi laporan.

## Keputusan yang sudah diterima

| Topik | Keputusan |
| --- | --- |
| Nama | LaporJalan tetap digunakan. Ketersediaan merek/domain belum diperiksa; situs laporjalan.com sudah digunakan pihak lain. |
| Arah visual | Peta dengan aktivitas warga; daftar laporan, foto, dan pembaruan lebih menonjol, mengambil pola BOS:311. |
| Halaman utama | Peta interaktif dengan daftar yang terhubung pada titik. |
| Wilayah | Jakarta dahulu. |
| Data produk | Data nyata, bersumber, tanpa fallback dummy. |
| Peran | Warga dan pembaca publik. Tidak ada simulasi petugas atau progres penanganan rekaan. |
| Kategori awal | Jalan rusak, pembangunan/pekerjaan jalan, saluran tersumbat, pembakaran sampah. |
| Kontribusi | Laporan, komentar, foto, dan video pada titik terkait. |
| CCTV | Sumber resmi/terverifikasi; akses dan pemutaran harus diperiksa sebelum ditampilkan sebagai siaran langsung. |
| Referensi | BOS:311 untuk penyajian laporan; Oxfordshire untuk alur lokasi; OneMap untuk ruang peta; prinsip aksesibilitas Helsinki. |
| Batas terbaru | Implementasi peta/daftar dan detail sumber, setelah persetujuan pengguna. Persiapan konfigurasi deploy ditambahkan atas permintaan berikutnya. Tidak ada perubahan database, pemasangan alat, commit/push, atau deploy oleh agen. |

Oyenza dan proyek karhutla tidak menjadi acuan tampilan baru. Pekerjaan teknis inspeksi 3D sebelumnya tetap tersimpan dan sedang dijeda; tidak dihapus atau dinyatakan selesai.

## Tiga arah yang telah dipertimbangkan

| Arah | Kelebihan | Kompromi | Keputusan |
| --- | --- | --- | --- |
| Peta ringkas, OneMap + alur Oxfordshire | Ruang peta luas, navigasi lokasi langsung | Aktivitas warga kurang menonjol | Tidak dipilih |
| Layanan publik tegas, prinsip Helsinki | Label dan formulir mudah dipahami | Halaman panjang dapat menjauhkan peta dari fokus | Tidak dipilih |
| Peta dengan aktivitas warga, BOS:311 | Bukti dan pembaruan cepat ditemukan | Panel harus dibatasi agar peta tetap terlihat | **Dipilih** |

Nama Ruas dan Titik Jalan pernah diajukan sebagai alternatif. Keputusan akhir mempertahankan LaporJalan; nama alternatif tidak perlu ditawarkan ulang.

## Identitas yang diusulkan

**Deskripsi:** Laporan jalan dari warga.

**Janji produk:** lokasi jelas, bukti terlihat, pembaruan dapat ditelusuri. Tidak menjanjikan pemerintah menerima, memverifikasi, atau memperbaiki laporan tanpa integrasi yang membuktikannya.

**Karakter:** tenang, praktis, mudah dibaca. Wordmark LaporJalan menjadi identitas utama. Simbol pendamping berupa ruas jalan sederhana dengan satu titik pengamatan; rancangan simbol tetap perlu ditinjau dalam ukuran kecil. Hindari lambang instansi agar tidak menyiratkan afiliasi resmi.

**Bahasa UI:** pendek dan konkret: `Laporkan`, `Cari jalan atau wilayah`, `Lihat pembaruan`, `Tambah foto atau video`, `Sumber laporan`, `Belum ada pembaruan`. Istilah internal seperti pipeline, confidence model, dan WebGL tidak masuk alur warga.

## Pengalaman utama

1. Buka peta Jakarta, cari jalan/wilayah, atau pilih lokasi perangkat secara eksplisit.
2. Lihat daftar laporan di area peta. Ikon menunjukkan jenis kejadian; foto membantu mengenali kondisi.
3. Pilih baris atau titik. Keduanya membuka laporan yang sama, tanpa kehilangan posisi peta.
4. Baca bukti, waktu, sumber, dan pembaruan. Tambahkan komentar atau bukti baru bila diperlukan.
5. Jika belum ada laporan yang sesuai, pilih `Laporkan`, tentukan titik, isi kondisi dan bukti, lalu tinjau sebelum kirim.

Pembangunan merupakan **kategori kejadian**, bukan bukti bahwa sebuah laporan sedang ditangani. Komentar warga merupakan **pengamatan**, bukan konfirmasi resmi selesai. Jika status sumber tidak tersedia, tampilkan `Status penanganan belum tersedia`.

## Bentuk halaman

Desktop menggunakan header ringkas, daftar laporan di kiri, dan peta sebagai area terbesar. Detail menggantikan daftar pada panel yang sama. Mobile menggunakan peta dan panel bawah yang dapat diperluas; tersedia tombol eksplisit untuk beralih ke daftar penuh.

Foto besar digunakan pada detail, sedangkan daftar memakai thumbnail agar beberapa laporan tetap terlihat. Pembaruan diurutkan berdasarkan waktu kejadian yang diketahui. Riwayat administratif hanya ditampilkan bila benar-benar diberikan sumber, tanpa persentase progres buatan.

Rancangan tidak membutuhkan halaman pembuka pemasaran, statistik besar, maskot pada alur inti, atau animasi kamera otomatis. Keputusan final mengenai warna, ukuran, serta simbol dilakukan melalui papan desain; pilihan arah dan nama sudah tetap.

## Kriteria keberhasilan yang direncanakan

- Seluruh titik publik memiliki sumber dan koordinat yang dapat dijelaskan; tidak ada posisi acak.
- Memilih daftar dan memilih marker membuka ID laporan yang sama.
- Dalam uji tugas singkat, warga dapat menemukan lokasi, membuka bukti, dan membedakan jenis kejadian dari status penanganan. Target awal: minimal 4 dari 5 peserta menyelesaikan tugas tanpa bantuan; belum diukur.
- Semua aksi inti dapat digunakan melalui keyboard dan daftar alternatif, termasuk ketika peta tidak dapat digunakan.
- Loading, kosong, gagal, dan data lama memiliki tampilan berbeda. Tidak ada data dummy ketika permintaan gagal.
- Desktop 1440 × 900 dan mobile 390 × 844 tetap menampilkan akses ke peta, detail, dan aksi utama tanpa kontrol bertabrakan.

Ukuran keberhasilan tersebut adalah target rancangan, bukan hasil pengujian aplikasi. Rincian pemeriksaan berada pada [TODO](TODO.md).
