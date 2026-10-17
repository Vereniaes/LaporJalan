# Paket agen inspeksi LaporJalan

Paket ini menjelaskan cara membangun inspeksi jalan pada peta yang sama, dengan bukti, pembagian tugas, dan batas penggunaan model. Tanggal acuan: 16 Oktober 2026, Asia/Jakarta.

Pembaruan 17 Oktober 2026: run implementasi sedang dijeda atas perubahan arah pengguna. Permintaan aktif adalah [planning branding dan UI LaporJalan](../rebranding-2026-10-17/README.md), dengan nama tetap LaporJalan dan peta berisi aktivitas warga mengacu BOS:311. Oyenza tidak lagi menjadi acuan visual baru. Baca [handoff run](runs/oyenza-parity-2026-10-16/HANDOFF.md) untuk verifikasi yang belum selesai; jangan memulai ulang implementasi dari paket ini tanpa permintaan baru.

**Status: dokumentasi dan template untuk pelaksanaan berikutnya.** Fitur aplikasi, API, database, konfigurasi Codex, dan OpenCode tidak diubah oleh penyusunan paket. Harness aplikasi masih berupa rancangan, bukan runner yang sudah terpasang. Status fase P0-P7 belum dinyatakan lulus.

Pembaruan pelaksanaan 16 Oktober 2026: permintaan lanjutan untuk mendekati Oyenza sudah memulai implementasi. Hasil aktual berada pada [log run](runs/oyenza-parity-2026-10-16/PROGRESS.md), [TODO](runs/oyenza-parity-2026-10-16/TODO.md) dan [ledger](runs/oyenza-parity-2026-10-16/run.json). Status dokumentasi di atas merujuk sesi penyusunan awal; bukan status fitur saat run dilanjutkan. Pengujian dan klaim penerimaan harus membaca bukti run terbaru.

## Mulai

1. Baca [analisis](ANALYSIS.md) dan [keputusan arsitektur](ADR-001.md).
2. Baca [guardrail](GUARDRAILS.md), [kebijakan model](MODEL-POLICY.md), dan [pemetaan skill](SKILLS.md).
3. Buka proyek frontend dalam Codex desktop. Pilih model pengendali GPT-6 Ultra pada UI sesuai akses akun.
4. Saat siap meminta implementasi aplikasi, tempel blok prompt pada [BOOTSTRAP](BOOTSTRAP.md). Prompt tersebut meminta delegasi secara eksplisit. Membaca paket saja tidak memulai eksekusi.
5. Jalankan [fase](PHASES.md) secara berurutan melalui [harness](HARNESS.md). Pengendali mencatat hasil dan anggaran sebelum melanjutkan.

Pengendali tidak perlu meminta ulang keputusan yang sudah tercatat. `/grillme` digunakan jika ada keputusan baru yang mengubah lingkup, sumber data, atau kontrak produk.

## Keputusan yang sudah diterima

| Keputusan | Nilai |
| --- | --- |
| Deliverable sesi penyusunan | Analisis, prompt, guardrail, TODO, rancangan harness, template hasil |
| Tujuan aplikasi berikutnya | Inspeksi jalan pada peta yang sama |
| Skala | 1:1 terhadap data, dengan bantuan visual terpisah dan berlabel |
| Arsitektur awal | MapLibre 4.7.1 + Three.js 0.170.0; prototipe wajib sebelum integrasi penuh |
| Runtime utama | Codex desktop |
| Runtime cadangan | OpenCode V2; belum diinstal atau diaktifkan |
| Batas perbaikan | 12 siklus per sesi, maksimal 2 percobaan per masalah |
| Paralelisme | Maksimal 2 pelaksana aktif, 1 penulis per berkas, tanpa subagen turunan |
| Git | Agen dilarang commit dan push melalui mekanisme apa pun |

## Isi dan sumber kebenaran

| Dokumen | Digunakan untuk |
| --- | --- |
| [ANALYSIS](ANALYSIS.md) | Temuan Oyenza, gap kode, koreksi histori, dan dampak |
| [sources.json](sources.json) | Sumber primer, hash, penunjuk bukti, dan cara verifikasi |
| [baseline.json](baseline.json) | Identitas awal 45 berkas aplikasi/config yang dilindungi pada sesi dokumentasi |
| [ADR-001](ADR-001.md) | Pilihan engine, batas API, dan keputusan prototipe |
| [GUARDRAILS](GUARDRAILS.md) | Aturan lintas agen |
| [MODEL-POLICY](MODEL-POLICY.md) | Routing model, biaya, dan batas eksekusi |
| [SKILLS](SKILLS.md) | Skill yang dipakai, bersyarat, atau tidak relevan |
| [PHASES](PHASES.md) | TODO P0-P7 dan syarat keluar |
| [HARNESS](HARNESS.md) | Kontrak tugas, bukti, evaluasi, dan loop perbaikan |
| [BOOTSTRAP](BOOTSTRAP.md) | Prompt awal sesi implementasi berikutnya |
| [prompts/common](prompts/common.md) | Instruksi bersama yang harus disertakan saat delegasi |
| [OPENCODE](OPENCODE.md) | Panduan cadangan V2 |
| [VALIDATION](VALIDATION.md) | Hasil pemeriksaan paket ini, terpisah dari kelulusan aplikasi |

Template data: [tugas](templates/task.json), [hasil](templates/result.json), dan [sesi](templates/run.json). Salin ke direktori run baru saat menjalankan implementasi; jangan menimpa template atau baseline histori.

## Batas bukti

Analisis kode dan HTTP publik diperbarui pada tanggal acuan. Bukti visual berasal dari [pemeriksaan video sebelumnya](../video-ui-comparison-2026-10-16.md), yang mencatat metode serta keterbatasannya. Paket ini tidak mengklaim pengujian browser baru atau kelulusan prototipe 3D.

Berkas bernama `frontend-req`, `mockup`, `AGENTS.md`, atau `SKILL.md` proyek tidak ditemukan dalam pencarian workspace yang mengecualikan dependency dan hasil build. Instruksi AGENTS yang diberikan dalam chat tetap berlaku. Gunakan rekaman dan gambar pembanding yang tersedia; jangan mengarang dokumen desain yang hilang.

Dokumentasi induk berada di luar repositori frontend. Paket ini menjadi rujukan teknis terbaru untuk topik inspeksi; dokumen lama dipertahankan sebagai riwayat dan ditautkan ke koreksi. Bukti lama tidak otomatis membuktikan perilaku working tree berikutnya.
