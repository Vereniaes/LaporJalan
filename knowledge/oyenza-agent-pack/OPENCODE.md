# OpenCode V2 sebagai cadangan

Dokumen ini menjelaskan aktivasi cadangan bila Codex desktop tidak memenuhi kebutuhan tertentu. OpenCode belum terpasang dalam WSL yang diperiksa. Sesi penyusunan paket tidak menjalankan installer atau mengubah konfigurasi provider.

## Kapan digunakan

Tetap gunakan Codex desktop sebagai pengendali. Pertimbangkan OpenCode untuk satu tugas terbatas yang memerlukan provider/model lain atau kontrol peran yang tidak tersedia. Manfaat harus disebutkan sebelum menambah runtime. OpenCode tidak otomatis memberi slot murah atau memindahkan penggunaan ke paket akun yang sama.

Sebelum aktivasi, pengendali membawa pilihan melalui /grillme bila ada perubahan provider, biaya, atau lingkup yang belum disepakati. Hasil tugas tetap menggunakan kontrak [HARNESS](HARNESS.md) serta budget [MODEL-POLICY](MODEL-POLICY.md). Tugas OpenCode masuk hitungan dua pelaksana, bukan slot tambahan di luar batas.

## Sumber dan versi

- [Installer V2](https://opencode.ai/v2/install): berhasil dibaca dengan HTTP 200. Mendukung versi spesifik dan pilihan tidak mengubah PATH; belum dieksekusi.
- [Agen V2](https://opencode.ai/v2/docs/agents/): file peran Markdown di `.opencode/agents/`, body menjadi system prompt dalam runtime OpenCode.
- [Permission V2](https://opencode.ai/v2/docs/permissions/): aturan berbentuk daftar action/resource/effect.
- [Provider V2](https://opencode.ai/v2/docs/providers/): periksa provider, akun, dan akses model saat aktivasi.

Gunakan dokumentasi V2 bersama installer V2. Jangan memakai contoh V1 yang menggunakan `agent`, `permission`, `bash`, atau `task` sebagai pengganti field/action V2 `agents`, `permissions`, `shell`, dan `subagent`.

## Urutan aktivasi yang akan dijalankan kemudian

1. Catat alasan pemakaian dan task ID; verifikasi otorisasi pemasangan serta provider yang dibutuhkan.
2. Periksa installer terbaru dan tentukan versi yang benar-benar tersedia. Instal di WSL yang digunakan proyek, lalu catat output versi. Jangan memasukkan versi rekaan atau menganggap command Windows memasang binary WSL.
3. Konfigurasi kredensial melalui mekanisme provider yang sesuai. Jangan menyalin token dari log, menaruh secret di knowledge, atau menganggap langganan Codex menanggung biaya provider tersebut.
4. Verifikasi nama model dan effort yang diterima provider. Batasi ke model pelaksana yang disetujui; jangan fallback ke Astra/Ultra.
5. Adaptasikan satu role prompt beserta common sebagai body agen V2. Salin kebijakan task/ownership dan kembalikan hasil ke pengendali Codex. Jangan membuat orchestrator kedua yang membuka task baru sendiri.
6. Mulai dari peran read-only. Pastikan permission menolak edit dan shell untuk reviewer; gunakan file reader untuk bukti. Writer baru diberi izin terbatas sesuai task bila memang diperlukan.
7. Uji bahwa model, larangan tulis, larangan delegasi turunan, dan output kontrak berfungsi. Kegagalan validasi menghentikan tugas OpenCode.

## Contoh konfigurasi peran, belum aktif

Contoh berikut sengaja memakai placeholder model. Ganti hanya dengan identifier provider yang telah diverifikasi sebelum menyimpan sebagai konfigurasi aktif; jangan mengeksekusi placeholder. Lokasi contoh: `.opencode/agents/laporjalan-reviewer.md` pada proyek yang telah dipilih.

```yaml
---
description: Review one LaporJalan change with evidence
mode: subagent
model: VERIFIED_PROVIDER_MODEL_AND_EFFORT
steps: 8
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
  - action: subagent
    resource: "*"
    effect: deny
---
```

Body diisi teks [common](prompts/common.md), [reviewer](prompts/reviewer.md), serta task terbatas. Delapan model steps adalah batas satu pemanggilan contoh, bukan pengganti counter 12 cycle/2 attempt milik pengendali. Dokumentasi V2 menyatakan input pengguna baru dapat mereset allowance steps; ledger proyek tidak boleh ikut tereset.

Larangan commit/push berlaku lintas tool. Pola deny `git push *` saja tidak menjamin larangan seluruh variasi shell, API, atau kode. Role reviewer di atas menolak seluruh shell/edit; writer memerlukan pemeriksaan permission dan command yang lebih ketat sesuai runtime. Jangan mengklaim policy sudah ditegakkan sebelum ada bukti uji.

## Handoff kembali ke Codex

Kembalikan task ID, model diminta/aktual, provider, usage bila tersedia, berkas yang dibaca/diubah, perintah beserta exit code, temuan, dan bukti. Root mencatat penggunaan pada ledger yang sama. Tugas tidak boleh melanjutkan otomatis setelah batas step/cycle tercapai. Tidak ada commit, push, deployment, atau pesan eksternal dari OpenCode.
