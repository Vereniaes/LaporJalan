# Referensi pemerintah, GitHub, dan data

Catatan ini membedakan fitur yang tertulis pada sumber resmi, tampilan yang benar-benar terlihat, dan usulan desain LaporJalan. Pemeriksaan: 17 Oktober 2026. Tidak ada pengiriman laporan ke situs eksternal.

## Referensi desain

| Referensi | Konsep yang terverifikasi | Bagian yang diambil | Batas pemeriksaan |
| --- | --- | --- | --- |
| [BOS:311, Boston](https://311.boston.gov/tickets) | Daftar laporan publik dengan kategori, lokasi, status, waktu, ID, pencarian dan filter | Hierarki baris laporan dan aktivitas terbaru; **arah yang dipilih** | Halaman daftar dibuka dan screenshot desktop diperiksa. Foto menonjol dan integrasi peta pada beranda adalah adaptasi LaporJalan, bukan salinan halaman Boston. |
| [FixMyStreet Oxfordshire County Council](https://fixmystreet.oxfordshire.gov.uk/) | Cari alamat, tentukan lokasi di peta, pilih kategori, tambahkan rincian/foto, terima pembaruan | Alur melapor yang dimulai dari lokasi; pembaruan pada laporan yang sudah ada | Konten halaman tersedia melalui web. Browser langsung memberi HTTP 503 pada beranda dan halaman peta, sehingga visual peta belum dinilai. |
| [OneMap Singapura](https://www.onemap.gov.sg/) | Platform peta nasional resmi dari Singapore Land Authority | Peta sebagai ruang utama, pencarian langsung dan kontrol lokasi/lapisan | Peta berhasil terlihat di browser. Ini referensi navigasi peta, bukan bukti layanan pengaduan warga. [Penjelasan SLA](https://geospatial.sla.gov.sg/geospatial-for-you/onemap/) |
| [Helsinki Feedback on the map](https://palautteet.hel.fi/en/palautteet-kartalla) | Pencarian laporan publik menurut waktu, topik dan status | Label jelas, formulir terbaca; prinsip aksesibilitas dari [HDS](https://hds.hel.fi/getting-started/designer/) | Shell/form terlihat, area basemap kosong saat tangkapan. Header dan pengantar panjang tidak cocok disalin ke beranda peta. Pemeriksaan mobile menunjukkan overflow pada lingkungan uji. |
| [Züri wie neu, Kota Zürich](https://www.zueriwieneu.ch/) | Laporan kerusakan infrastruktur berdasarkan alamat, titik peta dan deskripsi | Contoh perluasan dari kerusakan jalan ke fasilitas sekitar | Konten beranda dan daftar tersedia melalui web; route peta browser memberi HTTP 503. Bukan referensi visual yang sudah lulus pemeriksaan. [Sumber pemerintah Zürich](https://www.stadt-zuerich.ch/geodaten/download/Zueri_wie_neu) |
| [Fix My Street Brussels](https://fixmystreet.brussels/) | Laporan masalah jalan dan ruang publik pada peta; sumber pemerintah mengonfirmasi cakupannya | Pembagian jenis kejadian dan pencarian berdasarkan nomor laporan | Halaman/list HTTP 200, tetapi basemap dan sebagian gambar tidak terlihat saat screenshot. Tidak menyatakan seluruh layanan rusak. [Kota Brussels](https://www.brussels.be/report-problem) |

Penilaian kesesuaian merupakan keputusan desain, bukan peringkat mutu pemerintah. Prinsip yang dipakai: aktivitas dari Boston, alur lokasi Oxfordshire, ruang peta OneMap. Tampilan akhir dibuat untuk konteks Jakarta dan keputusan produk LaporJalan.

## Bukti visual

- [BOS:311 desktop](references/boston-reports-desktop.png)
- [OneMap desktop](references/singapore-onemap.png)
- [Helsinki formulir desktop](references/helsinki-map-desktop.png), [bagian peta](references/helsinki-map-section.png), [mobile baru](references/helsinki-map-fresh-mobile.png)
- [Brussels daftar dan peta](references/brussels-incidents-desktop.png)
- [Oxfordshire HTTP 503](references/oxfordshire-map-desktop.png), [Zürich HTTP 503](references/zurich-map-desktop.png)
- Metadata kunjungan: [manifest awal](references/manifest.json), [tambahan](references/manifest-additional.json), [interaksi](references/manifest-interactions.json).

Screenshot adalah bukti penelitian situs publik, bukan aset gambar laporan LaporJalan. Tangkapan tidak boleh diimpor sebagai kejadian Jakarta atau dimasukkan ke fallback aplikasi.

## GitHub yang relevan

- [mySociety/fixmystreet](https://github.com/mysociety/fixmystreet): platform pelaporan berbasis peta; README menjelaskan pencarian lokasi, pin, laporan publik, dan pembaruan. Gunakan sebagai referensi alur serta pemisahan kategori/lokasi. Tidak ada keputusan mengganti React/MapLibre/Express dengan keseluruhan stack proyek tersebut. Periksa [lisensi repository](https://github.com/mysociety/fixmystreet/blob/master/LICENSE.txt) jika kelak mengambil kode.
- [City-of-Helsinki/helsinki-design-system](https://github.com/City-of-Helsinki/helsinki-design-system): sumber komponen dan prinsip HDS. Gunakan prinsip hierarki dan aksesibilitas; tidak perlu memasang satu design system baru. [Panduan desainer HDS](https://hds.hel.fi/getting-started/designer/) juga membedakan kebutuhan font organisasi.

Repositori tersebut menyediakan acuan implementasi, bukan sumber laporan Jakarta. Tidak ada kode atau aset merek pemerintah yang disalin ke aplikasi pada sesi ini.

## Sumber Indonesia dan dampaknya pada UI

Penelitian data tetap disimpan agar desain tidak menjanjikan informasi yang belum tersedia. Integrasi belum dilakukan.

| Sumber | Temuan saat diperiksa | Penggunaan yang masuk akal |
| --- | --- | --- |
| [SP4N-LAPOR!](https://www.lapor.go.id/) | Layanan pengaduan dan penelusuran; opsi anonim/rahasia serta proses penyaluran | Acuan kebutuhan bukti dan kejelasan informasi. Jangan menyalin janji tindak lanjut sebagai kemampuan LaporJalan. |
| [CRM Jakarta - peta](https://crm.jakarta.go.id/crm-peta) | Bundle publik menggunakan endpoint `/api/public/dashboard/distribution-map`. Permintaan tanpa autentikasi, `isPrivacy=0`, rentang 16-17 Oktober 2026 menghasilkan HTTP 200 dan 271 objek ber-ID, koordinat, status, kategori, waktu | Kandidat data titik nyata Jakarta. Periksa makna kategori/status, cakupan tanggal, privasi, ketentuan penggunaan dan kestabilan sebelum integrasi. Bukan janji API resmi dengan SLA. |
| [JakCCTV publik](https://jakcctv.jakarta.go.id/publik) | Endpoint publik `/publik/data?q=&page=1` menyatakan total 52 kamera pada pemeriksaan; kartu memuat tautan embed sumber Balitower | Kandidat CCTV resmi. Pemutaran stream, izin embed dan koordinat kamera belum diverifikasi. Jangan menebak titik atau menampilkan LIVE dari respons HTTP saja. |
| [Jalan Kita](https://jalankita.binamarga.pu.go.id/) | Bundle menunjuk API resmi; `/common/dashboard` dapat dibaca tanpa login, dengan 3 laporan terbaru pada respons yang diperiksa. Sampel bukan Jakarta. `/data-map` memberi 401 | Acuan road-reporting. Tidak menerobos route terlindungi dan tidak mengklaim feed Jakarta tersedia dari sampel tersebut. |
| [laporjalan.com](https://laporjalan.com/) | Website SIG jalan Kabupaten Bekasi; layer `rusakberat_2025.js` memuat 2.777 fitur MultiLineString | Contoh data ruas jalan dan pengingat nama sudah digunakan pihak lain. Data Bekasi 2025 tidak dimasukkan sebagai kejadian Jakarta saat ini. |

Ringkasan CRM tidak menyimpan isi keluhan, identitas atau koordinat individual: [crm-data-probe.json](crm-data-probe.json). Tanggal dan jumlah hanya menjelaskan respons saat pemeriksaan, bukan angka untuk dashboard produk.

Pemeriksaan publik lain tersimpan pada [public-source-probe](public-source-probe.json), [source-detail-probe](source-detail-probe.json), [jakarta-probe](jakarta-probe.json), [source-access-probe](source-access-probe.json), dan [crm-bundle-probe](crm-bundle-probe.json). File mentah penelitian sementara di `/tmp` bukan dependensi aplikasi atau bukti yang perlu dipublikasikan.

Pencarian GitHub dengan nama JalanKita/LaporJalan menemukan repositori bernama mirip, tetapi kepemilikan resmi belum terbukti. Pencarian README untuk domain persis tidak menghasilkan kecocokan pada pemeriksaan; ini tidak membuktikan repositori tidak ada. [lakuapik/cctv-jakarta](https://github.com/lakuapik/cctv-jakarta) bersifat historis dan telah diarsipkan, sehingga tidak menjadi dasar klaim kamera aktif.

## Implikasi yang wajib dipertahankan

1. API publik, koordinat, dan status ada pada kandidat CRM Jakarta, tetapi belum diintegrasikan atau dipetakan semantiknya.
2. Ikon pembangunan memerlukan kejadian/kategori nyata; jangan mengganti laporan jalan rusak menjadi pembangunan untuk mengisi layer.
3. Tampilkan sumber dan waktu. Waktu pengambilan bukan waktu pengamatan.
4. Status pemerintah dibaca dari sumber; komentar warga tidak mengubahnya.
5. Jika data belum tersedia, keadaan kosong/gagal merupakan desain yang sah. Data contoh bukan pengganti koneksi yang gagal.
6. Belum ada posting otomatis ke LAPOR!, CRM, Jalan Kita, atau situs pemerintah lain.
