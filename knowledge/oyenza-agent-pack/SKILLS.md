# Pemetaan skill

Dokumen ini membatasi pemilihan skill pada kemampuan yang membantu tugas. Skill bukan alasan menjalankan semua tool atau memperluas lingkup.

## Skill untuk paket ini

| Skill | Digunakan untuk | Rujukan sesi |
| --- | --- | --- |
| engineering:architecture | ADR tiga opsi, konsekuensi, gate kelayakan | `C:/Users/ITA/.codex/plugins/cache/claude-cowork/engineering/1.2.0/skills/architecture/SKILL.md` |
| engineering:system-design | Kontrak kamera/data, alur komponen, batas API | `C:/Users/ITA/.codex/plugins/cache/claude-cowork/engineering/1.2.0/skills/system-design/SKILL.md` |
| engineering:testing-strategy | Prioritas uji, fixture, acceptance dan regresi | `C:/Users/ITA/.codex/plugins/cache/claude-cowork/engineering/1.2.0/skills/testing-strategy/SKILL.md` |
| engineering:documentation | Struktur panduan, prompt, TODO dan handoff | `C:/Users/ITA/.codex/plugins/cache/claude-cowork/engineering/1.2.0/skills/documentation/SKILL.md` |
| openai-docs | Verifikasi model dan aturan subagen Codex | `C:/Users/ITA/.codex/skills/.system/openai-docs/SKILL.md` |

Lokasi merupakan katalog saat penyusunan. Pada perangkat lain, cari nama skill pada katalog runtime sebelum membacanya. Jangan menganggap plugin atau lokasi Windows tersedia di WSL lain. Jangan menyalin seluruh isi skill ke setiap task; masukkan petunjuk yang relevan setelah membaca sumbernya.

## Skill untuk fase berikutnya

| Skill | Pemicu yang benar |
| --- | --- |
| engineering:debug | Ada kegagalan yang dapat direproduksi dan perlu diagnosis |
| engineering:code-review | Ada diff aplikasi dan bukti yang siap ditinjau |
| engineering:tech-debt | Ada kebutuhan refactor yang menghambat acceptance; bukan audit umum otomatis |
| engineering:deploy-checklist | Hanya ketika pengguna meminta deployment; tidak aktif dalam paket ini |
| engineering:incident-response | Insiden operasional nyata; tidak dipicu oleh gap mockup |
| engineering:standup | Permintaan pembaruan kerja dengan format standup |

## Skill yang tidak diperlukan untuk deliverable ini

| Kelompok | Alasan |
| --- | --- |
| imagegen | Bukti visual berasal dari aplikasi dan rekaman; gambar buatan tidak menggantikan pengujian |
| skill-creator, skill-installer, template-creator | Paket merupakan dokumen proyek dan template prompt, bukan instalasi skill pribadi |
| documents, pdf, presentations, spreadsheets, excel-live-control | Tidak ada artefak Office/PDF atau sesi spreadsheet yang diminta |
| sites, sites-remix | Tidak membangun atau menerbitkan situs baru; proyek ini aplikasi lokal yang sudah ada |
| plugin-management | Akses HTTP publik dan file lokal memadai; tidak membutuhkan koneksi akun baru |
| work-pets:create-pet, work-pets:pets, work-pets:update-pet | Tidak ada tugas ChatGPT Pets |

Daftar ini memetakan seluruh kelompok skill yang tersedia saat penyusunan. Bila kebutuhan baru muncul, pilih skill berdasarkan kemampuan dan batas otorisasinya, bukan kesamaan kata kunci. Hormati instruksi pengguna yang sudah diterima; jangan menambahkan approval hanya karena skill menyebut proses umum.
