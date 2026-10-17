# TODO branding dan UI LaporJalan

Daftar ini membedakan planning, implementasi peta/daftar yang telah dilakukan, dan fitur lanjutan yang belum dikerjakan. Keputusan terbaru pada [README](README.md) mengesampingkan arah visual Oyenza untuk pekerjaan rebranding.

## Status planning

- [x] Tetapkan Jakarta sebagai wilayah awal.
- [x] Tetapkan peta publik sebagai halaman utama.
- [x] Hapus simulasi petugas dari lingkup.
- [x] Pertahankan nama LaporJalan berdasarkan pilihan pengguna.
- [x] Tetapkan peta dengan aktivitas warga, mengacu BOS:311.
- [x] Periksa kode, pengetahuan lama, sumber pemerintah dan GitHub terkait.
- [x] Catat batas akses dan rendering referensi; jangan menganggap screenshot kosong sebagai desain yang dituju.
- [x] Susun spesifikasi, sumber, dan papan desain yang dapat ditinjau.
- [ ] Pemilik meninjau token warna, komposisi, serta simbol pada papan desain.
- [x] Tetapkan langkah berikutnya melalui `/grillme`: pengguna memilih pematangan mockup desktop/mobile sebelum implementasi.
- [x] Buat mockup lanjutan peta, detail, komentar, dan formulir di luar aplikasi; lihat [panduan](MOCKUP.md).

## D0 - Dasar dan bukti

**Pemilik:** perencana. **Status:** selesai untuk paket ini; ulangi hanya bila konteks berubah.

1. Catat working tree dan identitas berkas sumber.
2. Baca kebutuhan terkait, keputusan pengguna, frontend dan backend laporan.
3. Cari `frontend-req` dan mockup; catat bila tidak ditemukan. Pada pemeriksaan ini berkas khusus tersebut belum ditemukan di workspace di luar dependency/build.
4. Pisahkan temuan situs yang terlihat, dokumentasi resmi, dan inferensi desain.

**Hasil:** [baseline](planning-baseline.json), [referensi](REFERENCES.md), [UI-SPEC](UI-SPEC.md). Tidak ada klaim seluruh pengujian aplikasi lama lulus.

## D1 - Identitas dan komposisi

**Pemilik:** desainer/perencana. **Berkas:** paket dokumentasi saja.

1. Pertahankan wordmark LaporJalan dan deskripsi `Laporan jalan dari warga` sebagai usulan copy.
2. Tinjau palet, tipografi, ikon empat kategori, dan komposisi desktop/mobile.
3. Periksa simbol kecil dalam mode satu warna; ikon tetap terbaca tanpa warna kategori.
4. Tinjau daftar berfoto, detail, pembaruan, dan alur melapor.

**Syarat keluar:** persetujuan rancangan yang konkret. Nama dan arah visual yang sudah dipilih tidak diminta ulang. Papan desain bukan implementasi produk.

## D2 - Wireframe seluruh keadaan

**Pemilik:** desainer, dengan pemeriksa independen bila delegasi diminta. **Prasyarat:** D1.

1. Rinci halaman peta/daftar, detail laporan, pembaruan dan komentar, laporan baru, tinjau/kirim, serta CCTV.
2. Rinci keadaan loading, kosong, gagal, data lama, lokasi ditolak, tanpa media, media gagal, dan pengiriman gagal.
3. Tunjukkan desktop 1440 × 900 dan mobile 390 × 844. Uji juga lebar 320 px dan teks 200%.
4. Pastikan terdapat satu panel aktif dan jalan kembali yang mempertahankan konteks.
5. Buat prototipe klik untuk tugas menemukan laporan, membuka bukti, dan mengirim laporan. Prototipe sesi ini hanya menunjukkan struktur, belum simulasi layanan.

**Syarat keluar:** semua aksi utama dan keadaan gagal dapat dijelaskan tanpa data kejadian rekaan. Tidak ada kebutuhan petugas simulasi.

## D3 - Kelayakan data sebelum UI produksi

**Pemilik:** pelaksana data. **Status:** adapter CRM kategori Jalan diterapkan dan diuji lokal. Hak penggunaan ulang untuk publikasi luas, pemetaan kategori tambahan, serta CCTV masih belum diverifikasi.

1. Verifikasi kontrak sumber CRM Jakarta: privasi, arti status, kategori, koordinat, rentang tanggal, dan ID stabil. Pastikan penggunaan dan penyajian ulang sesuai ketentuan sumber.
2. Susun pemetaan empat kategori; kategori yang tidak cocok tetap di luar filter awal, tidak dipaksakan.
3. Definisikan asal data, URL sumber, waktu pengamatan/publikasi/pengambilan, ketelitian lokasi dan media.
4. Bedakan laporan warga asli pada aplikasi dengan salinan data publik. Jangan mengimpor identitas yang tidak diperlukan.
5. Hapus jalur runtime fallback dummy pada frontend/backend saat fase implementasi disetujui; uji jaringan gagal.
6. Verifikasi CCTV satu per satu untuk playback, lokasi dan bentuk akses. Kamera tanpa koordinat terverifikasi dapat berupa tautan/daftar sumber, bukan pin tebakan.

**Syarat keluar:** paling sedikit satu sumber/laporan nyata yang dapat dijelaskan pada UI; tidak mengisi peta memakai dummy jika sumber belum layak. Tahap ini tidak mengirim laporan ke kanal pemerintah.

## D4 - Implementasi peta dan daftar

**Pemilik:** pelaksana UI/peta. **Status:** implementasi lokal dan pemeriksaan selesai untuk peta/daftar/detail sumber. Persetujuan implementasi sudah diterima. Geocoding dan kontribusi warga berada pada fase berikutnya.

1. Gunakan kembali MapLibre, state kamera dan komponen yang masih sesuai.
2. Susun header, pencarian, filter, daftar foto, dan satu panel detail.
3. Hubungkan marker dan daftar dengan ID yang sama; pertahankan posisi saat kembali.
4. Tambahkan ikon kategori, cluster, dan pemilihan area. Sinkronkan data/filter tanpa memicu inspeksi otomatis.
5. Adaptasikan panel bawah mobile, ruang atribusi, fokus, dan tombol daftar alternatif.
6. Pertahankan inspeksi 3D sebagai kemampuan tambahan yang terisolasi; jangan mengubah geometri hanya untuk perubahan branding.

**Syarat keluar:** peta dan daftar sesuai data; pemilihan, pencarian, kategori, kembali, keyboard dan mobile bekerja. Tidak ada banner atau metrik contoh pada alur utama.

## D5 - Bukti, pembaruan, dan CCTV

**Pemilik:** pelaksana laporan/media. **Prasyarat:** kontrak persistensi, autentikasi kepemilikan, serta moderasi minimum ditetapkan.

1. Tambahkan daftar lampiran foto/video, status upload, validasi file dan penanganan gagal.
2. Simpan komentar/pembaruan dengan waktu serta asal. Konfirmasi penyimpanan sebelum menampilkan berhasil.
3. Tampilkan perubahan status sumber hanya bila benar-benar tersedia; jangan membangun tahap fiktif yang belum terjadi.
4. Muat satu CCTV atas permintaan, sediakan layar penuh bila didukung dan tautan sumber ketika embed gagal.
5. Pastikan penutupan panel menghentikan media; teks laporan tetap dapat dibaca saat media gagal.

**Syarat keluar:** bukti dan komentar tersimpan; tidak ada status LIVE atau status penanganan rekaan. Tidak ada panel petugas simulasi.

## D6 - Pemeriksaan dan handoff

**Pemilik:** pemeriksa, lalu pelaksana memperbaiki temuan. Pemeriksa tidak meluluskan pekerjaan berdasarkan screenshot saja.

| Pemeriksaan | Kriteria |
| --- | --- |
| Daftar dan peta | Filter/ID/seleksi sama, termasuk data terlambat dan laporan baru |
| Kamera | Pilihan 2D tetap pitch 0; memilih laporan tidak memulai orbit |
| Data | Setiap titik memiliki asal; tidak ada dummy, posisi acak, atau status otomatis dari kategori |
| Media | Foto/video benar, pemutaran gagal ditangani, tidak autoplay semua laporan |
| Pengiriman | Berhasil hanya setelah server menyimpan; retry tidak membuat duplikasi |
| Aksesibilitas | Keyboard, fokus, label, kontras, alternatif daftar, pengurangan gerak |
| Responsif | 1440 × 900, 390 × 844, 320 px dan teks 200%; atribusi/aksi tidak tertutup |
| Uji pemahaman | Target awal 4/5 peserta menemukan lokasi dan membedakan kategori dari status tanpa bantuan |
| Regresi | Build/typecheck dan uji perilaku terkait; jalur laporan, pencarian, kamera, filter tetap bekerja |
| Performa | Ukur baseline dan perubahan pada perangkat yang dicatat; jangan mengklaim 60 FPS tanpa pengukuran |

Perbaiki satu kegagalan yang dapat direproduksi, ulangi pemeriksaan terkait, dan simpan hasil. Jangan mengganti ambang/baseline untuk menyembunyikan kegagalan. Anggaran loop lama tidak otomatis diperpanjang oleh permintaan planning ini.

**Hasil:** diff terbatas, bukti pemeriksaan, keterbatasan, dan daftar pekerjaan tersisa. Commit/push tetap dilakukan hanya oleh pemilik proyek.

## Area kode yang terdampak pada implementasi berikutnya

| Area | Kondisi saat dibaca | Dampak yang perlu dijaga |
| --- | --- | --- |
| `src/App.tsx` | Menggabungkan navigasi, pencarian, laporan, filter, CCTV dan inspeksi; panel berisi banner serta kartu tambahan | Pisahkan tugas visual secukupnya, pakai state yang ada; jangan merusak hubungan seleksi/filter/kamera |
| `src/index.css` | Panel 400 px, gaya Oyenza, teks kecil pada komponen dan bottom panel tetap | Ganti token/layout secara terbatas; fokus, atribusi dan ruang peta tetap terlihat |
| `src/components/DamageReportCard.tsx` | Prioritas pada dimensi/aksi inspeksi; belum ada riwayat komentar | Prioritaskan bukti/lokasi/pembaruan; ukuran menjadi opsional sesuai kategori |
| `src/components/CameraReportModal.tsx` | Alur laporan yang sudah tersedia | Gunakan kembali bagian media/lokasi yang layak; jangan mengasumsikan setiap foto harus dianalisis sebagai lubang |
| `src/components/Map3D.tsx`, `src/map/*` | Kamera dan geometri hasil pekerjaan sebelumnya | Tambahkan representasi kategori melalui adapter; pertahankan lifecycle, 2D dan cleanup resource |
| `src/services/api.ts`, `src/services/mockData.ts` | Fetch memiliki fallback laporan contoh | Produk harus membedakan gagal/kosong/cache; fixture tes boleh tetap terisolasi dan tidak masuk runtime |
| `src/types.ts` | Tipe kerusakan jalan, dimensi wajib, satu foto; tidak ada komentar/provenance | Perlu adapter dan bidang opsional untuk jenis kejadian/media/asal, bukan memaksa semua kategori menjadi lubang |
| Backend `Report`, controller/routes laporan | Default contoh dan heuristik kewenangan; status diubah tanpa actor/history pada jalur yang diperiksa | Jangan mengekspos perubahan status resmi sebagai kemampuan warga; tentukan kepemilikan dan pembaruan yang persisten |
| Backend `storage.ts` | Upload foto tunggal, belum kontrak video yang cukup | Validasi file dan batas media perlu disepakati sebelum menjanjikan fitur upload video |
| CCTV frontend/backend | Struktur dan seed contoh tersedia | Ganti dengan sumber yang diuji; koordinat/FOV/status harus berdasarkan data |

Tidak ada kebutuhan migrasi framework atau layanan mikro untuk perubahan ini. Perubahan API/database hanya dilakukan jika implementasi fitur terkait sudah diminta dan kontraknya jelas.

## Handoff dari pekerjaan sebelumnya

Run inspeksi Oyenza dijeda berdasarkan perubahan arah pengguna. [Handoff lama](../oyenza-agent-pack/runs/oyenza-parity-2026-10-16/HANDOFF.md) menyimpan hasil dan kegagalan. Suite cycle23 dihentikan dengan exit 130: 69 passed, 7 failed, 1 interrupted, 45 not run. Benchmark V7 belum dijalankan. Angka tersebut bukan hasil pemeriksaan branding.

Paket ini tidak memperbaiki atau menyatakan lulus temuan kamera lama. Saat implementasi baru dimulai, baca kondisi working tree terbaru dan rencanakan pemeriksaan yang terdampak.

## Hasil tahap implementasi 17 Oktober 2026

- [x] Implementasi peta/daftar disetujui melalui `/grillme`.
- [x] Adapter CRM baca-saja, tanpa data contoh.
- [x] Peta 2D sebagai awal dengan toggle 3D, kelompok titik, daftar, pencarian kode/status, filter kategori/area, detail dan kembali.
- [x] Panel desktop/mobile, keyboard, loading, kosong, error, data terakhir.
- [x] Preservasi orkestrator inspeksi lama di `src/InspectionWorkspace.tsx`; geometri tidak diubah.
- [x] Typecheck/build, kontrak sumber, browser desktop/mobile dan data nyata.
- [x] Panduan Vercel/Cloud Run, penjagaan URL build dan mode backend publik.
- [ ] Pemilik meninjau dan menjalankan deployment kedua repo.
- [x] Build dan smoke test image Docker lokal.
- [ ] Smoke test pada URL cloud dan CI remote.
- [ ] Pengujian pengguna 4/5, pembandingan performa sebelum/sesudah, pengujian perangkat fisik.
- [ ] Fase D5: kontribusi, lampiran, pembaruan dan CCTV setelah kontraknya ditetapkan.

Bukti: [hasil pemeriksaan](IMPLEMENTATION-RESULTS.md), [panduan deploy](DEPLOYMENT.md). Kegagalan run inspeksi lama tetap belum diselesaikan dan tidak dihitung sebagai kelulusan UI publik.

## Pembersihan artefak setelah push

- [x] Pengguna memilih pembersihan tracking tanpa penulisan ulang riwayat.
- [x] Tambahkan ignore hasil pengujian dan keluarkan 1.372 artefak dari index.
- [x] Simpan seluruh berkas lokal; pertahankan screenshot terpilih dan perbarui tautan laporan.
- [x] Periksa hash artefak/kode, index dan aturan ignore.
- [ ] Pemilik meninjau staged diff lalu melakukan commit/push bila sesuai.

Rincian: [pembersihan tracking](GIT-ARTIFACT-CLEANUP.md). Pekerjaan ini tidak mengubah peta 2D/3D atau geometri inspeksi.
