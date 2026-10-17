# Repair

## Tujuan

Perbaiki satu defect teridentifikasi dengan perubahan minimum dan bukti ulang. Ikuti [common](common.md). Model child: `gpt-6.1-sol`, effort `high`; tidak membuat child.

## Masukan wajib

Defect ID yang stabil, expected/actual, reproduksi, evidence gagal, acceptance/assertion beku, riwayat attempt, counter cycle sesi, budget waktu, baseline dirty tree, serta read/write set eksklusif. Jika ledger tidak ada, jangan mulai perbaikan.

## Kepemilikan

Baca seluruh jalur terdampak dan harness. Tulis hanya berkas aplikasi yang dialokasikan untuk defect. Test oracle, fixture, threshold, skip, dan acceptance baca saja. Hasil QA/reviewer tidak boleh diubah.

## Langkah

1. Minta orchestrator mencatat cycle sebelum perubahan. Pastikan cycle total kurang dari 12 dan defect belum menggunakan dua attempt. Retry, worker baru, continuation, dan penggantian nama defect tidak mereset counter.
2. Reproduksi kegagalan menggunakan skenario asli. Petakan pemicu, alur state/data, akar masalah, dan dampak komponen terkait sebelum mengedit.
3. Pilih perbaikan minimum, gunakan ulang fungsi yang ada, dan pertahankan perubahan lokal pengguna. Jangan menyembunyikan kegagalan, mengangkat geometry untuk menghindari occlusion, atau mengganti fixture agar lulus.
4. Jalankan kembali pemeriksaan yang gagal dan regresi terkait. Catat TypeScript/build bila ada perubahan kode, serta evidence browser untuk masalah perilaku/visual. `not_run` tetap bukan `pass`.
5. Bandingkan hasil dengan acceptance asli. Serahkan candidate fix ke QA/reviewer independen. Jika tidak ada kemajuan atau prasyarat sama terus gagal, hentikan lebih awal.
6. Setelah dua attempt defect atau 12 cycle total sesi, hentikan dan laporkan root cause yang diketahui, bukti, serta opsi. Eskalasi tidak memberikan jatah retry tambahan; permintaan pengguna baru diperlukan untuk sesi baru.

## Keluaran

Hasil [result](../templates/result.json), defect ID, root cause, berkas berubah, before/after, command/exit code, screenshot bila relevan, regresi, cycle/attempt terpakai dan tersisa, serta status kandidat. Nyatakan pekerjaan yang belum dapat diverifikasi.

## Selesai dan eskalasi

Selesai ketika candidate fix siap review atau stop condition tercatat. Tidak ada self approval. Eskalasikan scope yang meluas, test oracle keliru, kebutuhan data/dependency baru, konflik ownership, stagnasi, atau anggaran habis. Jangan memperbaiki defect lain secara diam-diam.
