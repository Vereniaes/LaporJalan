# Guardrail paket agen

Dokumen ini membatasi tindakan dan klaim agen selama implementasi LaporJalan. Keputusan pengguna dan instruksi runtime yang berlaku tetap menjadi dasar otorisasi.

## G01 - Wewenang dan perubahan

- Dilarang commit dan push, termasuk Git CLI, API, library Git, agen lain, atau OpenCode. Agen tidak membuat PR yang memerlukan push. Pemilik proyek menangani Git secara manual.
- Paket ini mengotorisasi penyusunan dokumentasi. Eksekusi fitur P0-P7 dimulai ketika pengguna meminta implementasi aplikasi pada sesi berikutnya.
- Baca instruksi, catatan, requirement, mockup yang tersedia, dan kode terdampak. Keputusan produk baru memakai /grillme dengan minimal tiga opsi; jangan mengulang pertanyaan yang sudah diputuskan.
- Rekam git status, diff awal, dan hash berkas yang akan disentuh. Working tree yang sudah kotor tetap milik pengguna. Jangan reset, checkout, clean, stash, atau menghapus perubahan untuk memudahkan pengujian.
- Edit hanya berkas yang tercantum pada tugas. Tambahan berkas kecil yang diperlukan tetap harus dicatat pengendali dalam ownership sebelum ditulis; perluasan produk membutuhkan keputusan pengguna.
- Jangan deploy, mengirim pesan eksternal, membeli layanan, menjalankan API berbayar baru, atau memasang OpenCode dalam lingkup paket ini.

## G02 - Kepemilikan dan delegasi

- Maksimal dua pelaksana aktif. Pengendali mengelola antrean dan lock berkas. Satu berkas memiliki satu penulis; reviewer dan visual QA tidak mengedit implementasi.
- Subagen tidak membuat subagen turunan. Tidak ada delegasi tambahan hanya karena runtime menyediakan slot.
- Berikan tujuan, konteks minimum, allowed paths, acceptance ID, dan anggaran dalam setiap tugas. Sertakan instruksi bersama dan peran secara eksplisit.
- Atur model/effort saat spawn. Fork kosong jika tersedia agar pelaksana tidak mewarisi riwayat besar dan model mahal tanpa sengaja. [MODEL-POLICY](MODEL-POLICY.md) menjadi rujukan.

## G03 - Perubahan kecil dan keterbacaan

- Cari fungsi/sampler/komponen yang sudah tersedia. Ekstrak hanya bila ada tanggung jawab nyata atau penggunaan ulang, bukan untuk membuat framework baru.
- Gunakan nama yang menjelaskan tujuan. Komentar file menjelaskan fungsi secara singkat dalam bahasa Inggris sederhana atau campuran yang sesuai pedoman proyek; Todo menggunakan `->`.
- Komentar helper nontrivial memakai penjelasan tujuan, input, output, serta pemisah tanda hubung. Jangan menambah komentar untuk kondisi yang sudah jelas.
- Teks UI formal dan singkat. Hindari kata ganti yang tidak perlu, emoji tambahan, em dash, dan klaim teknis yang tidak membantu pengguna.

## G04 - Bukti dan data

- Bedakan observed_public, observed_code, observed_prior_visual, proposed, dan unknown. Simpan sumber serta tanggal. Kutipan video generatif tidak menjadi bukti ukuran lapangan atau implementasi Oyenza.
- Ukuran geometri mengikuti data, bukan sebaliknya. Asal data heuristik, contoh, atau tidak diketahui harus tetap terlihat pada laporan/inspeksi yang relevan.
- Jangan mengarang GPS, lebar jalan, panjang galian, heading, pemilik CCTV, timestamp, atau status live. Jangan memakai snap-to-road sebagai klaim posisi terukur.
- Marker boleh memiliki ukuran layar minimum. Pembesaran geometri hanya dalam mode ilustratif eksplisit dengan faktor yang terlihat; angka fisik tidak berubah.
- Jangan menyebarkan kredensial yang ditemukan dalam histori. Log, screenshot, request, dan paket konteks harus mengecualikan secret serta isi .env. Temuan secret dicatat dengan lokasi tanpa nilainya.
- Riset sumber publik bukan alasan melewati akses privat atau menyalin seluruh bundle/media tanpa dasar penggunaan.

## G05 - Kamera, grafis, dan resource

- Gunakan satu instance peta per mount dengan cleanup sesuai lifecycle React. Satu mode mengendalikan seluruh intent kamera.
- Dalam 2D, selection/search/CCTV/zoom tidak boleh mengubah pitch. Masuk inspeksi adalah pilihan eksplisit; memilih 2D menghentikan orbit dan inspeksi.
- Gunakan meter lokal dan transformasi Mercator yang benar. Data hilang/invalid tidak boleh diubah menjadi pengukuran buatan melalui clamp/fallback.
- Permukaan, jaring, dan kontur berasal dari sampler yang sama. Prototipe wajib membuktikan cekungan dan occlusion; poligon gelap atau lubang melayang tidak memenuhi syarat.
- Periksa konteks WebGL2 sebelum Three 0.170.0. Tangani context loss/recovery serta reload style tanpa duplikasi layer atau listener.
- Custom layer memakai canvas/context MapLibre. Jangan menghapus canvas tersebut, memanggil forceContextLoss, atau membersihkan seluruh depth buffer secara global untuk menutupi cacat rendering.
- Lepas hanya resource yang dimiliki layer: geometry, material, texture, line, renderer wrapper, listener, timer, dan RAF. Resource bersama didispose satu kali sesuai ownership. map.remove hanya saat pemilik map benar-benar unmount.
- Repaint sesuai kebutuhan. Hentikan animasi saat tidak aktif, keluar inspeksi, tab tersembunyi, atau reduced motion memintanya.

## G06 - Verifikasi dan loop

- Gunakan acceptance ID sebelum implementasi. Simpan perintah, exit code, lingkungan, screenshot/trace, dan batas pengukuran.
- Status not_run atau blocked tidak sama dengan passed. Typecheck/build tidak membuktikan perilaku browser, kesetaraan visual, FPS, atau zero leak.
- Implementer dan repair agent tidak boleh menurunkan ambang, menghapus assertion, mengganti screenshot baseline, atau memperluas mock agar lulus. Perbaikan harness memerlukan bukti kesalahan harness serta review independen.
- Maksimal 12 siklus perbaikan per sesi dan 2 per masalah. Pengendali mencatat counter sebelum dispatch; crash, compaction, ganti agen, atau ganti ID kosmetik tidak mereset counter.
- Eskalasi tidak memberikan percobaan ketiga otomatis. Butuh diagnosis baru dan keputusan yang terdokumentasi; perluasan anggaran merupakan keputusan pengguna.
- Berhenti lebih awal saat semua gate lulus. Bila tidak ada bukti baru setelah pengulangan, hentikan masalah tersebut dan handoff. Jangan mengubah klaim selesai hanya karena anggaran habis.

## G07 - Batas penegakan

Dokumen dan prompt adalah instruksi, bukan sandbox atau kontrol keamanan yang sudah terpasang. Batas penulis, budget, model, dan review dijalankan pengendali melalui ledger serta kemampuan runtime yang tersedia. Permission OpenCode yang dicontohkan belum aktif. Jangan mengklaim larangan Git atau batas tagihan ditegakkan secara teknis jika tool runtime belum membatasinya.

Saat kemampuan wajib tidak tersedia, catat fakta dan dampaknya. Gunakan /grillme hanya untuk keputusan yang benar-benar baru; pekerjaan independen yang sudah diotorisasi tetap dapat diteruskan. Lihat [HARNESS](HARNESS.md) untuk status dan handoff.
