# LaporJalan - spesifikasi branding dan UI

Dokumen ini menetapkan rancangan antarmuka untuk ditinjau sebelum implementasi. Nama dan arah BOS:311 sudah dipilih; token visual serta ukuran berikut merupakan usulan desain.

## 1. Prinsip visual

1. Isi laporan menjadi pusat perhatian: lokasi, bukti, waktu, lalu pembaruan.
2. Peta dan daftar selalu menjelaskan kumpulan laporan yang sama.
3. Satu panel untuk satu tugas. Detail menggantikan daftar; formulir tidak menumpuk di atas beberapa modal.
4. Warna menunjukkan makna yang tetap. Ikon kategori tidak berubah menjadi indikator progres.
5. Spasi, ukuran teks, dan garis pemisah membentuk hierarki. Efek dekoratif tidak menjadi penentu hierarki.

Pola daftar BOS:311 menjadi acuan informasi. Penambahan foto pada daftar dan peta sebagai halaman utama merupakan adaptasi khusus LaporJalan; bukan klaim bahwa halaman daftar BOS:311 memiliki susunan yang sama.

## 2. Identitas dan token awal

| Elemen | Usulan | Penggunaan |
| --- | --- | --- |
| Wordmark | LaporJalan, semibold | Penulisan konsisten, tanpa pemisahan menjadi dua merek |
| Deskripsi | Laporan jalan dari warga | Di informasi produk dan ruang yang cukup |
| Simbol | Dua garis ruas dengan satu titik | Pendamping wordmark; uji pada 16, 24, dan 32 px |
| Teks utama | `#142B3A` | Judul, label, isi |
| Aksi utama | `#0B5B70` | Laporkan, tombol langkah berikutnya, fokus pilihan |
| Teks sekunder | `#55646D` | Waktu, sumber, keterangan |
| Latar aplikasi | `#F5F6F4` | Bingkai antarmuka |
| Permukaan panel | `#FFFFFF` | Daftar, detail, formulir |
| Garis pemisah | `#CDD5D9` | Baris, batas panel; bukan satu-satunya penanda input |
| Fokus keyboard | `#0B5B70`, outline 3 px dengan celah | Seluruh kontrol interaktif |
| Font | System sans yang sudah dipakai aplikasi | Satu keluarga font; hindari dependensi font baru pada tahap awal |
| Skala teks | 14 px metadata, 16 px isi, 20 px judul panel, 24 px judul halaman | Jangan membawa teks inti 10-11 px dari UI lama |
| Spasi | 4, 8, 12, 16, 24, 32 px | Jarak konsisten |
| Radius | 6-8 px kontrol; 12 px panel bawah | Sudut lembut secukupnya |
| Bayangan | Tipis hanya pada overlay peta | Daftar memakai garis pemisah |

Palet merupakan usulan orisinal untuk LaporJalan, bukan penyalinan logo, font berlisensi, atau palet identitas pemerintah lain. Referensi prinsip: [Helsinki Design System](https://hds.hel.fi/getting-started/designer/).

## 3. Peta dan kategori

Default rancangan adalah peta 2D netral agar lokasi, jalan, dan marker mudah dibaca. Mode 3D yang sudah dikerjakan dapat tetap menjadi kemampuan tambahan bila data relevan; tidak menjadi syarat untuk melapor dan tidak aktif karena memilih laporan biasa.

| Kategori | Bentuk ikon yang diusulkan | Warna aksen | Isi detail |
| --- | --- | --- | --- |
| Jalan rusak | Ruas/garis patah | Bata `#A33E2B` | Kondisi, bukti, lokasi; dimensi hanya jika tersedia dengan asal pengukuran |
| Pembangunan | Pembatas jalan | Oker `#966000` | Pengamatan pekerjaan; jadwal/penanggung jawab hanya dari sumber |
| Saluran tersumbat | Saluran dengan gelombang | Biru `#245F83` | Bukti sumbatan/genangan dan waktu pengamatan |
| Pembakaran sampah | Api | Cokelat `#884C18` | Pengamatan, bukti, dan waktu; tidak mengarang tingkat bahaya |
| CCTV | Kamera, bentuk berbeda dari laporan | Abu `#55646D` | Pemilik sumber, lokasi, waktu media, keadaan akses |

Gunakan keluarga ikon yang tersedia di proyek. Jika simbol jalan patah diperlukan, buat satu SVG kecil yang digunakan ulang. Jangan menambah pustaka ikon kedua.

Aturan marker:

- Pada zoom jauh, kelompokkan titik dan tampilkan jumlah dari data yang benar-benar dimuat. Jumlah kelompok bukan jumlah seluruh laporan Jakarta.
- Pada zoom dekat, tampilkan ikon; label ringkas muncul ketika dipilih atau difokuskan.
- Marker terpilih memiliki outline dan label, tidak hanya berganti warna.
- Jenis, sumber, dan status penanganan adalah atribut terpisah. Tidak ada lingkaran progres pada ikon pembangunan.
- Koordinat yang hanya menunjukkan centroid wilayah tidak boleh digambarkan sebagai posisi kerusakan presisi.
- Segmen jalan dari dataset bukan otomatis satu kejadian. Gunakan garis bila sumber memang berupa ruas.
- Lapisan CCTV bersifat pilihan; kamera tidak memenuhi daftar laporan warga.

## 4. Susunan desktop

Ukuran acuan 1440 × 900. Header sekitar 64 px. Panel daftar sekitar 400 px; sisanya untuk peta. Ukuran merupakan target rancangan, bukan ukuran wajib pada semua layar.

```text
LaporJalan    [Cari jalan atau wilayah ........]    Jakarta   [Laporkan]
---------------------------------------------------------------------
Laporan di area peta      |                                           |
[Kategori] [Waktu]       |                PETA                        |
[Sumber]                |                                           |
------------------------|                                           |
[Foto] Kategori/judul   |          marker terhubung ke daftar         |
       Jalan/wilayah    |                                           |
       Pembaruan, sumber|                         [Lapisan]          |
------------------------|                         [Lokasi] [+] [-]  |
Baris laporan berikutnya|                         atribusi peta      |
```

Daftar menggunakan baris dengan thumbnail sekitar 88 × 72 px, judul maksimal dua baris, lokasi, waktu pembaruan, dan sumber. Foto hanya ditampilkan bila memang tersedia. Label `Tanpa foto` menggantikan gambar stok. Tidak perlu setiap baris menjadi kartu berbayang.

Panel detail menggantikan daftar pada sisi kiri, dengan tombol `Kembali ke laporan`. Foto/video tampil lebih besar pada detail. Peta tetap terlihat dan mempertahankan konteks lokasi. Detail tidak membuka panel tambahan di kanan.

## 5. Susunan mobile

Ukuran acuan 390 × 844, dengan pemeriksaan tambahan pada lebar 320 px dan pembesaran teks.

- Header ringkas menampilkan nama dan aksi `Laporkan`; kolom pencarian berada di bawahnya.
- Peta tetap menjadi latar utama. Panel bawah awal berisi judul area dan satu ringkasan laporan jika ada data.
- Panel memiliki tiga keadaan: ringkas, setengah, dan penuh. Tombol `Lihat daftar`/`Lihat peta` tersedia sebagai alternatif gerakan tarik.
- Detail menggunakan panel yang sama. Menutupnya mengembalikan pilihan serta posisi peta sebelumnya.
- Kontrol lokasi, zoom, dan atribusi ditempatkan di area yang tidak tertutup panel. Peta menyesuaikan ruang yang tersedia saat menyorot laporan.
- Pengisian laporan memakai halaman/panel penuh agar keyboard tidak menutupi input. Titik yang dipilih tetap dapat ditinjau.

Desktop dan mobile berbagi komponen isi laporan. Perbedaan hanya pada wadah, kepadatan, dan cara membuka panel.

## 6. Isi detail laporan

Urutan informasi:

1. Kategori dan judul yang berasal dari laporan.
2. Lokasi, waktu pengamatan bila tersedia, serta waktu publikasi.
3. Bukti foto/video. Video diputar atas tindakan pengguna, bukan autoplay.
4. Deskripsi kondisi.
5. `Pembaruan`: kejadian awal, bukti tambahan, komentar, dan perubahan status sumber yang tersedia.
6. `Tambah pembaruan`: teks dengan lampiran foto/video opsional.
7. `Sumber laporan`: nama sumber, tautan asli, waktu sumber diperbarui dan waktu diambil jika relevan.

Untuk menjaga panel ringkas, gunakan dua bagian `Ringkasan` dan `Pembaruan` bila isi panjang. Jumlah komentar hanya muncul jika berasal dari data. Riwayat sumber tidak disusun ulang seolah-olah seluruh tahap pernah terjadi.

Tidak ada tombol warga `Tandai selesai` yang mengubah status resmi. Unggahan warga tentang perbaikan tetap muncul sebagai pengamatan dengan asal dan waktunya.

## 7. Interaksi inti

| Interaksi | Perilaku rancangan |
| --- | --- |
| Cari jalan/wilayah | Hasil lokasi dibedakan dari hasil laporan. Memilih lokasi tidak otomatis mengosongkan daftar karena judul laporan tidak cocok dengan nama jalan. |
| Geser peta | Tampilkan `Cari di area ini`; pembaruan daftar dilakukan secara eksplisit agar posisi baca tidak melompat. |
| Pilih baris/marker | Pilih ID yang sama, sorot titik, buka detail; jangan otomatis masuk inspeksi 3D. |
| Ganti kategori | Filter daftar dan marker dengan aturan yang sama. Jika pilihan hilang karena filter, tutup detail dengan perilaku yang jelas. |
| Kembali | Pulihkan filter, posisi daftar, dan kamera sebelumnya. |
| Bagikan laporan | Tautan stabil ke laporan yang telah tersimpan; tidak memasukkan identitas pribadi ke URL. |
| Tambah pembaruan | Tampilkan keadaan mengirim, berhasil, dan gagal. Komentar gagal tetap dapat diperbaiki/dikirim ulang. |
| Buka CCTV | Muat satu media saat diminta. Tampilkan tautan sumber bila embed tidak tersedia. |

## 8. Alur laporan baru

`Lokasi -> Kondisi dan bukti -> Tinjau -> Kirim`

1. Cari alamat atau pilih titik. Lokasi perangkat bersifat pilihan. Tampilkan presisi lokasi yang diketahui; geser marker untuk koreksi.
2. Perlihatkan laporan terdekat yang benar-benar tersedia sebelum membuat laporan baru, agar bukti dapat ditambahkan ke kejadian yang sama.
3. Pilih satu kategori. Isi deskripsi singkat dan tambahkan foto/video yang relevan. Alur tidak mewajibkan hasil AI atau ukuran lubang.
4. Tinjau titik, kategori, bukti, serta informasi yang akan dipublikasikan. Jangan tampilkan nomor telepon pribadi di laporan publik.
5. Nyatakan berhasil hanya setelah server mengonfirmasi penyimpanan. Kegagalan tidak menghilangkan isian.

Batas ukuran/durasi media, cara masuk akun, dan aturan moderasi merupakan kontrak implementasi yang masih perlu ditetapkan. Papan desain belum menjalankan upload atau autentikasi.

## 9. Keadaan data dan kejujuran UI

| Keadaan | Teks/perilaku |
| --- | --- |
| Sedang mengambil data | `Memuat laporan…`, tanpa statistik palsu |
| Permintaan berhasil, tidak ada hasil | `Belum ada laporan pada area dan filter ini` + ubah filter/laporkan |
| Permintaan gagal | `Laporan belum dapat dimuat` + coba lagi; bukan keadaan kosong |
| Cache lama tersedia | Tampilkan data beserta waktu terakhir berhasil diperbarui dan kegagalan pembaruan |
| Waktu pengamatan tidak tersedia | `Waktu pengamatan belum tersedia`; waktu unduh bukan waktu kejadian |
| Foto/video gagal | Lampiran tidak tersedia + tindakan mencoba kembali; teks laporan tetap terlihat |
| Tidak ada status sumber | `Status penanganan belum tersedia` |
| Sumber belum terintegrasi | Jangan tampilkan kejadian buatan untuk memenuhi peta |
| CCTV hanya gambar | Nyatakan gambar dan waktunya jika diketahui; tanpa lencana LIVE |
| CCTV gagal dimainkan | `Siaran belum dapat dibuka` + tautan sumber resmi |

Sumber data nyata tidak otomatis membuktikan kebenaran setiap laporan. Gunakan label `Laporan warga` atau nama sumber; jangan mengganti dengan `Terverifikasi` hanya karena data berasal dari sebuah API.

## 10. Aksesibilitas dan evaluasi

- Target kontras teks biasa minimal 4,5:1. [WCAG 2.2 - contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Warna selalu didampingi bentuk atau teks. [WCAG 2.2 - use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- Target produk untuk kontrol sentuh adalah 44 × 44 px. Ini pilihan desain; minimum WCAG 2.2 AA memiliki ketentuan 24 × 24 px beserta pengecualian. [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Label input selalu terlihat; placeholder bukan pengganti label.
- Daftar menyediakan semua informasi inti tanpa mengharuskan membaca peta secara visual.
- Fokus kembali ke pemicu ketika panel ditutup. Tombol Escape menutup overlay yang sesuai, tidak menghapus isian tanpa penjelasan.
- Hormati preferensi pengurangan gerak; jangan memulai orbit otomatis.
- Uji nama panjang, laporan tanpa foto, kegagalan jaringan, teks 200%, keyboard, dan panel saat keyboard mobile terbuka.

Papan desain hanya memeriksa rancangan dan beberapa interaksi wireframe. Kelulusan aksesibilitas aplikasi memerlukan pemeriksaan implementasi berikutnya.
