# Validasi paket desain

Dokumen ini mencatat pemeriksaan planning dan papan desain, terpisah dari pengujian aplikasi LaporJalan.

Status: pemeriksaan paket selesai pada 17 Oktober 2026. Detail mesin berada pada [validation-results.json](validation-results.json) dan [design-board-check.json](design-board-check.json).

| Pemeriksaan | Hasil | Batas |
| --- | --- | --- |
| Preservasi aplikasi | Seluruh 42 berkas baseline memiliki SHA-256 yang sama | Baseline berisi frontend/backend yang diperiksa pada awal planning; bukan klaim aplikasi bebas bug |
| Tautan relatif Markdown | Tidak ditemukan target hilang pada paket dan kedua indeks yang diperbarui | Hanya keberadaan target lokal; bukan pengujian semua layanan eksternal |
| JSON | Seluruh JSON paket dapat diparsing | Termasuk ringkasan sumber, manifest browser, dan hasil pemeriksaan |
| `git diff --check` frontend | Exit 2: blank line pada EOF `src/index.css:130` dan `src/services/mockData.ts:303` | Keduanya identik dengan baseline sebelum planning; temuan lama tidak diperbaiki di luar lingkup |
| Keadaan papan desain | Daftar, detail, alur laporan, dan gagal tampil pada ukuran frame desktop/mobile; tepat satu panel terlihat | 8 kombinasi frame/keadaan, bukan 8 pengujian aplikasi produksi |
| Detail pembaruan | Tab pembaruan terlihat dan tab bukti tersembunyi setelah dipilih | Satu pemeriksaan tambahan pada wireframe |
| Render gambar referensi | Kedua gambar pada papan desain berhasil dimuat | Screenshot situs, bukan bukti Jakarta |
| JavaScript papan desain | Tidak ada page error pada alur yang diperiksa | Tidak mencakup MapLibre/API/upload karena belum terhubung |
| Lebar halaman | Viewport 390 px dan scrollWidth 390 px | Tidak ada overflow horizontal pada keadaan papan desain yang diperiksa |
| Peninjauan visual | Screenshot desktop dan mobile dibuka dan diperiksa | Area peta sengaja berupa wireframe; tidak menilai ketepatan geografi atau marker |
| Kontras token utama | Teks utama/putih 14,62:1; aksi/putih 7,65:1; metadata/putih 6,12:1; metadata/latar 5,65:1 | Penghitungan warna awal; bukan audit seluruh implementasi WCAG |
| Uji tugas dengan warga | `not_run` | Target pemahaman pada rencana belum diukur |
| Typecheck/build/tes aplikasi | `not_run` | Tidak ada perubahan sumber aplikasi pada sesi planning |
| CCTV playback | `not_run` | HTTP/embed tersedia tidak membuktikan stream dapat dimainkan |
| Integrasi data Jakarta | `not_run` | Respons publik diperiksa untuk penelitian; tidak dipasang pada aplikasi |
| Commit/push/deploy/instalasi | Tidak dilakukan | Hanya dokumen, papan desain, dan bukti penelitian ditulis |

## Riwayat yang dipertahankan

Perubahan aplikasi dari run inspeksi sebelumnya tetap ada. Paket ini tidak me-reset, menghapus, memperbaiki, atau mengklaim kelulusan run tersebut. Perintah browser penelitian hanya membuka sumber publik dan papan desain lokal; tidak mengirim laporan ke situs pemerintah.

## Langkah berikutnya

Pengguna telah memilih pematangan mockup. [Mockup lanjutan](MOCKUP.html) dan [panduan](MOCKUP.md) sudah tersedia untuk peninjauan. Implementasi produk tetap belum diminta.

## Validasi mockup lanjutan

- [mockup-check.json](mockup-check.json): 34 pemeriksaan lulus, 0 gagal pada hasil akhir. Dua selector awal runner terlalu luas dan satu langkah mengabaikan keadaan panel yang sudah diperluas; runner dikoreksi tanpa mengubah kriteria.
- Hubungan marker/daftar, jumlah kelompok, pencarian, filter kosong, informasi sumber, komentar lokal, isian wajib, tipe media, penghapusan lampiran, tinjau dan batal keluar diuji.
- Lebar 1440, 390 dan 320 px diperiksa. Pada mobile, titik terpilih terlihat dan atribusi berada di luar panel. Papan awal yang tidak menampilkan baris pada keadaan ringkas diperbaiki pada mockup lanjutan.
- Kelompok titik mencegah tumpukan marker pada zoom jauh. Jumlah kelompok berasal dari cuplikan 25 laporan, bukan angka seluruh Jakarta.
- Tidak ada mutasi HTTP eksternal atau JavaScript page error pada alur yang diperiksa. File uji dan teks uji hanya berada pada sesi browser dan tidak disimpan sebagai data laporan.
- Tangkapan akhir diambil dari sesi bersih terpisah. [Manifest](mockup-captures.json) mencatat layar dan pemeriksaan basemap gagal.
- `mockup-first-review.json` mempertahankan hasil inspeksi awal. Request `ERR_ABORTED` ketika kamera berpindah bukan bukti seluruh tile gagal; hasil akhir mencatat kegagalan jaringan selain pembatalan tersebut secara terpisah.
- Pengujian produksi, backend, CCTV playback, penyimpanan dan uji pengguna tetap `not_run`.
- Pemeriksaan basemap gagal berhasil: 25 baris laporan tetap tersedia dan pesan kegagalan peta terlihat.
- [Validasi paket lanjutan](mockup-package-validation.json) membuktikan 42 berkas sumber aplikasi tetap identik dengan baseline; 25 objek ekspor sesuai bidang sumber publik, tanpa ketidaksesuaian kategori/status/koordinat. Semua tautan lokal yang diperiksa tersedia.
