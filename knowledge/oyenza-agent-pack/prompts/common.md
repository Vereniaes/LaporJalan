# Kontrak bersama agen

Dokumen ini harus dibaca dan dimasukkan ke pesan tugas bersama prompt peran. Berkas Markdown tidak menjadi system prompt secara otomatis. Kebijakan runtime dan instruksi pengguna tetap berlaku.

## Tujuan dan masukan wajib

Kerjakan satu tugas terukur dalam cakupan yang sudah disetujui. Wajib menerima `task_id`, fase, tujuan, acceptance criteria, daftar baca, daftar tulis eksklusif, batas waktu, kontrak hasil, serta snapshot anggaran sesi. Gunakan struktur [task](../templates/task.json), [result](../templates/result.json), dan [run](../templates/run.json) sesuai skema aktual. Jika masukan penting belum tersedia, laporkan kebutuhan tersebut sebelum tindakan yang bergantung padanya.

Baca [guardrails](../GUARDRAILS.md), [model policy](../MODEL-POLICY.md), [phases](../PHASES.md), [harness](../HARNESS.md), [analysis](../ANALYSIS.md), [ADR](../ADR-001.md), dan [skills](../SKILLS.md). Baca pula pedoman root, catatan, frontend requirements, mockup, dan kode terkait yang tersedia. Catatan lama bukan bukti keadaan terbaru. Jangan menyalin kredensial dari catatan ke hasil.

## Kepemilikan dan batas tindakan

- Tidak melakukan commit, push, destructive reset, deployment, atau perubahan di luar izin tugas. Tugas dokumentasi tidak mengizinkan instalasi. Pada implementasi berikutnya, dependency dev-only harness boleh dipasang bila PHASES dan instruksi eksekusi pengguna telah mencakupnya, melalui ownership package/lockfile yang jelas; jangan meminta ulang izin tersebut. Simpan perubahan lokal pengguna. Catat `git status` sebelum dan sesudah pekerjaan.
- Satu writer per berkas. Hanya orchestrator yang menetapkan dan memindahkan ownership setelah worker sebelumnya berhenti. Child tidak membuat child lain. Maksimal dua child worker aktif, termasuk worker baca saja.
- `reviewer` dan `visual-qa` hanya membaca kode aplikasi. Keduanya boleh menulis laporan dan bukti pada lokasi yang diberikan. Writer tidak menyetujui hasil sendiri.
- Riset dan pembacaan boleh dilakukan sebelum keputusan. Implementasi memerlukan izin eksekusi yang jelas. Membuka pack atau BOOTSTRAP tidak memberikan izin implementasi aplikasi.
- Gunakan `/grillme` dengan tiga pilihan yang berbeda untuk keputusan produk atau perluasan cakupan yang benar-benar baru. Sertakan dampak dan rekomendasi. Jangan menanyakan ulang keputusan yang telah diterima. Eskalasi teknis rutin cukup melalui orchestrator.

## Keputusan produk dan baseline

Target adalah kerusakan berskala fisik 1:1 pada peta yang sama. Bantuan keterlihatan harus berupa lapisan terpisah dengan label jelas. Lebar, kedalaman, posisi, dan sumber data harus dapat ditelusuri. GPS acak dan dimensi heuristik tidak boleh disebut hasil pengukuran lapangan.

Baseline yang harus diperiksa ulang: MapLibre 4.7.1 dan Three.js 0.170.0; kerusakan peta memakai `fill`/`line`; depth inspector berada pada modal terpisah; radius lubang peta tetap 4 m; beberapa `flyTo` menetapkan `pitch: 58` meskipun mode 2D dipilih. Nomor versi dan temuan adalah acuan pemeriksaan, bukan bukti bahwa masalah telah diperbaiki.

Pertahankan satu instance peta, satu sumber state kamera, pilihan 2D manual, filter, pelaporan, dan popup CCTV. Shared WebGL context/canvas milik peta tidak boleh dihilangkan, dipaksa kehilangan context, atau dibuang sebagai milik renderer lokal. Lepas hanya geometri, material, tekstur, listener, dan resource yang benar-benar dimiliki worker. Prototype wajib membuktikan keterlihatan cekungan di bawah jalan dan occlusion terhadap permukaan peta. Mesh melayang atau objek di atas aspal bukan bukti lubang fisik.

## Workflow wajib

1. Verifikasi izin, peran, model aktual, ownership, status working tree, masukan, dan anggaran tersisa.
2. Baca workflow pemanggil, state, lifecycle, data, serta fungsi yang dapat digunakan ulang. Periksa sumber teknis primer yang sesuai versi bila diperlukan dan simpan referensi pada lokasi `knowledge` yang ditugaskan.
3. Catat langkah kerja dan kriteria uji sebelum perubahan. Pilih perubahan terkecil yang menyelesaikan akar masalah dan jelaskan dampak ke komponen terkait.
4. Kerjakan hanya cakupan peran. Perubahan acceptance criteria, threshold, fixture, dan assertion untuk meloloskan defect dilarang. Perubahan persyaratan harus menjadi keputusan terpisah.
5. Jalankan pemeriksaan yang ditugaskan. Pisahkan hasil kompilasi, build, perilaku browser, visual, dan performa. `not_run` bukan `pass`; screenshot bukan pengukuran FPS.
6. Kirim hasil terbatas dan serahkan pemeriksaan kepada peran independen. Berhenti saat acceptance tercapai, anggaran habis, stagnasi terjadi, atau cakupan produk belum jelas.

## Anggaran dan eskalasi

Satu sesi memiliki maksimum 12 repair cycle total dan dua attempt per defect. Satu cycle adalah satu perubahan perbaikan yang dilanjutkan verifikasi, termasuk verifikasi yang gagal atau terblokir. Attempt tetap dihitung ketika pendekatan diulang, worker diganti, chat dilanjutkan, atau nama defect diubah. Catat cycle sebelum memulai; jangan mulai jika sisa nol. Re-run tanpa perubahan bukan cycle perbaikan baru, tetapi tetap tunduk pada batas waktu dan stagnasi. Kegagalan karena prasyarat yang sama tidak boleh diputar tanpa perubahan kondisi.

Setelah dua attempt defect, hentikan defect tersebut dan eskalasikan bukti serta opsi. Eskalasi tidak membuka retry tanpa batas. Bawa `session_id`, cycle terpakai/tersisa, attempt per defect, batas waktu, dan keputusan ke continuation. Permintaan baru pengguna dapat mengotorisasi sesi dan anggaran baru; continuation otomatis tidak dapat melakukannya.

## Keluaran dan selesai

Hasil memuat `task_id`, status sesuai skema, ringkasan, berkas dibaca/diubah, temuan dengan lokasi, hasil uji beserta command/exit code, path screenshot dan viewport/state, risiko, counter anggaran, serta langkah berikutnya. Batasi ringkasan maksimal lima butir dan temuan utama maksimal lima; detail panjang ditautkan sebagai artifact. Nyatakan `not_run` dan alasannya jika tidak ada bukti. Jangan mengklaim live CCTV, skala benar, 60 FPS, zero leak, parity, atau lulus review tanpa bukti yang relevan.

Tugas selesai jika keluaran memenuhi kontrak, ownership dipatuhi, bukti dapat ditelusuri, dan keterbatasan dinyatakan. Persetujuan fase memerlukan reviewer/orchestrator sesuai gate; hasil worker bukan self approval.
