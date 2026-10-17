# Model dan anggaran agen

Dokumen ini mengatur penggunaan model untuk paket LaporJalan. Pengaturan adalah kebijakan proyek; keberhasilan penerapannya harus terlihat pada parameter runtime dan catatan sesi.

## Routing yang diterima

| Peran | Model diminta | Reasoning | Pemakaian |
| --- | --- | --- | --- |
| Orchestrator | GPT-6 Ultra pilihan pengguna di aplikasi | Mengikuti pilihan UI | Keputusan, koordinasi, eskalasi, penerimaan |
| Researcher | `gpt-6-luna` | `medium` | Membaca sumber primer dan pencarian kode terbatas |
| Planner | `gpt-6.1-sol` | `high` | Arsitektur, dampak, kontrak dan tugas |
| Map geometry | `gpt-6.1-sol` | `high` | Transformasi, sampler, shared GL, lifecycle |
| UI | `gpt-6.1-sol` | `medium` | Komponen, label, layout dan aksesibilitas |
| Visual QA | `gpt-6.1-sol` | `high` | Skenario browser dan pemeriksaan gambar |
| Harness | `gpt-6.1-sol` | `medium` | Fixture, assertion, trace dan laporan |
| Repair | `gpt-6.1-sol` | `high` | Diagnosis dan patch satu masalah |
| Reviewer | `gpt-6.1-sol` | `high` | Pemeriksaan independen diff dan bukti |

GPT-6 Ultra adalah label pilihan pengendali, bukan ID API yang ditetapkan paket. Jangan mengganti model utama tanpa keputusan pengguna. Dokumentasi resmi menempatkan Sol sebagai pilihan seimbang dan Luna untuk tugas lebih ringan; tabel di atas adalah keputusan proyek, bukan jaminan harga per tugas. [Panduan keluarga GPT-6](https://developers.openai.com/api/docs/guides/latest-model)

## Dispatch Codex desktop

1. Periksa model yang tersedia pada tool runtime saat sesi dimulai. Jangan memakai daftar model dari histori sebagai jaminan ketersediaan sekarang.
2. Gunakan parameter model dan reasoning eksplisit. Pada tool collaboration yang mendukungnya, pilih `fork_turns: "none"` saat override agar konteks serta pengaturan mahal tidak diwariskan tanpa sengaja.
3. Sertakan common prompt, satu role prompt, tugas, hasil dependency, keputusan pengguna, dan allowed paths. Jangan memasukkan semua log/video/bundle mentah.
4. Catat model_requested dan model_actual yang diekspos runtime. Bila actual tidak diekspos, tulis null dengan alasan; jangan menyamakan parameter permintaan dengan verifikasi aktual.
5. Jika override model tidak didukung atau model tidak tersedia, jangan spawn menggunakan default mahal. Catat blocked, lalu ajukan /grillme dengan model tersedia yang lebih ringan, pekerjaan terbatas pada pengendali, atau penundaan delegasi.

Contoh parameter untuk tool yang memang menyediakan schema ini, bukan konfigurasi otomatis:

```json
{
  "task_name": "inspect_one_pothole",
  "fork_turns": "none",
  "model": "gpt-6.1-sol",
  "reasoning_effort": "high",
  "message": "Teks common + prompt peran + task yang telah diisi pengendali"
}
```

Jangan menyalin field ini ke API atau OpenCode yang memiliki schema berbeda. Custom agent file juga tidak diaktifkan hanya karena berada dalam knowledge. [Dokumentasi subagen](https://learn.chatgpt.com/docs/agent-configuration/subagents) menjelaskan pewarisan model dan pengaturan eksplisit.

## Batas eksekusi

- Maksimal dua child aktif sekaligus. Writer pada area yang sama diserialkan; pemeriksaan boleh paralel hanya jika tidak membaca perubahan setengah selesai.
- Subagen tidak mendelegasikan lagi. Root memegang seluruh antrean, ledger, dan lock.
- Maksimal 12 repair cycle per sesi dan dua attempt per defect. Satu cycle adalah dispatch perbaikan masalah dengan verifikasi hasilnya; counter dicatat sebelum dispatch dan tetap terpakai jika crash atau hasil gagal.
- Task implementasi awal dan pemeriksaan awal dicatat terpisah. Memecah masalah atau menamai ulang task tidak boleh mengubah perbaikan menjadi pekerjaan awal agar menghindari batas.
- Eskalasi kembali kepada root untuk keputusan, bukan otomatis menambah worker/model mahal atau reset counter.
- Sesudah acceptance lulus, jangan terus memoles tanpa masalah terukur. Bila masih ada gap setelah budget habis, simpan handoff; jangan klaim selesai atau membuat sesi baru sendiri.
- Resume/compaction menggunakan ledger lama. Anggaran baru hanya setelah instruksi pengguna yang mengizinkannya.

## Mengurangi penggunaan tanpa kehilangan bukti

Muat README/guardrail sekali per peran; selanjutnya berikan perubahan konteks dan file yang relevan. Pengendali menerima hasil ringkas dengan path bukti, bukan salinan seluruh output. Gambar pemeriksaan dibatasi pada viewport/state yang diperlukan dan crop masalah yang dapat diidentifikasi. Hasil yang sudah lulus tidak diulang tanpa perubahan terkait.

Jangan menjalankan sembilan peran sekaligus. Planner dapat menyusun satu rencana, kemudian map/UI writer bekerja bergantian sesuai dependency. Reviewer atau visual QA baru menerima kandidat yang sudah selesai ditulis. Kualitas geometri kompleks tidak dikorbankan dengan mengalihkan semua tugas ke model terkecil.

## Pencatatan biaya

Gunakan ledger [run](templates/run.json) dan kontrak [HARNESS](HARNESS.md). Catat model, reasoning, dispatch, cycle, attempt, waktu, serta input/output/cached tokens jika tersedia. Angka biaya hanya dihitung bila tarif dan satuan billing telah diverifikasi untuk provider/akun tersebut.

Batas 12 cycle bukan batas token atau batas tagihan absolut. Pemakaian akun Codex dan provider OpenCode tidak diasumsikan identik. Nilai usage yang tidak tersedia tetap null dengan penjelasan, bukan nol. Paket ini tidak mengubah konfigurasi global Codex atau membuat panggilan API berbayar.
