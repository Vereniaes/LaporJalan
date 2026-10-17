# Menjalankan agent pack

Dokumen ini adalah petunjuk untuk implementasi aplikasi pada masa berikutnya, hanya setelah pengguna secara eksplisit meminta eksekusi tersebut. Penyusunan atau pembukaan pack ini sendiri hanya mengotorisasi dokumentasi. Markdown tidak otomatis menjadi system prompt, aturan runtime, agent aktif, atau izin mengubah aplikasi.

## Prasyarat

Baca [GUARDRAILS](./GUARDRAILS.md), [MODEL-POLICY](./MODEL-POLICY.md), [PHASES](./PHASES.md), [HARNESS](./HARNESS.md), [ANALYSIS](./ANALYSIS.md), [ADR-001](./ADR-001.md), dan [SKILLS](./SKILLS.md). Periksa pedoman root, catatan, requirements, mockup, kode terkait, serta status working tree. Lindungi perubahan lokal; jangan commit/push atau reset destruktif. Tugas dokumentasi ini tidak memasang dependency. Pada implementasi berikutnya, instalasi dev-only harness dapat termasuk izin eksekusi jika permintaan pengguna dan PHASES mencakupnya; jangan meminta ulang persetujuan yang sudah diberikan.

Codex desktop menjadi jalur utama dengan pilihan model utama pengguna GPT-6 Ultra. Nama tampilan tersebut tidak boleh ditebak menjadi API model ID. OpenCode v2 hanya fallback yang belum dipasang; jangan mengklaim tersedia atau memasangnya otomatis. Periksa dukungan runtime sebelum memakai contoh parameter dari dokumentasi ini.

## Prompt peluncuran siap salin

Membaca dokumen ini tidak memulai implementasi. Menyalin dan mengirim blok berikut sebagai pesan pengguna menjadi permintaan eksekusi baru dengan cakupan yang tertulis. Blok ini tidak memerlukan penggantian placeholder.

```text
Implementasikan LaporJalan sesuai agent pack di
LaporJalan/knowledge/oyenza-agent-pack pada workspace ini.

Permintaan ini mengotorisasi implementasi aplikasi frontend P0-P7 dalam
allowed paths PHASES.md, pengujian lokal, dan harness dev-only yang diperlukan
HARNESS.md. Penambahan dependency dev-only serta perubahan package.json/lockfile
untuk harness diizinkan pada fase yang mencakupnya. Tidak mengotorisasi upgrade
engine, perubahan kontrak API/database, backend, deployment, commit, atau push.
Jangan meminta ulang keputusan produk yang telah diterima.

Mulai dengan membaca guardrails.md root, instruksi proyek yang berlaku,
catatan, frontend requirements, mockup yang tersedia, dan kode terkait.
Kemudian baca berkas pack berikut sebelum keputusan atau perubahan:
README.md, GUARDRAILS.md, MODEL-POLICY.md, PHASES.md, HARNESS.md,
ANALYSIS.md, ADR-001.md, SKILLS.md, BOOTSTRAP.md,
templates/task.json, templates/result.json, dan templates/run.json.
Catat artefak yang tidak ditemukan; jangan mengarang desain atau hasil uji.

Baca dan masukkan isi lengkap prompts/common.md serta
prompts/orchestrator.md ke konteks pelaksanaan. Gunakan kemampuan native
subagent runtime untuk delegasi. Sebelum setiap spawn, baca dan masukkan
isi lengkap common.md dan prompt peran terkait ke pesan child bersama
tujuan, keputusan yang diterima, allowed paths eksklusif, acceptance IDs,
baseline, lokasi bukti, serta snapshot budget. Markdown bukan system prompt
otomatis. Child tidak membuat child. Maksimal dua child aktif, termasuk QA
dan reviewer; satu writer per file. Reviewer/visual QA hanya membaca kode.

Model utama mengikuti pilihan GPT-6 Ultra pada Codex desktop; jangan menebak
API model ID. Child researcher memakai gpt-6-luna medium; planner,
map-geometry, visual-qa, repair, reviewer memakai gpt-6.1-sol high;
ui dan harness memakai gpt-6.1-sol medium. Atur model dan effort eksplisit
melalui parameter runtime dengan fork_turns=none bila didukung. Jangan
diam-diam mewariskan Astra/Ultra. Bila kemampuan wajib tidak tersedia,
catat kendala dan lanjutkan hanya pekerjaan independen yang telah diizinkan.
Jangan memasang OpenCode atau berpindah engine secara otomatis.

Simpan git status, diff awal dan hash berkas yang sudah berubah; pertahankan
dirty tree. Orchestrator menjadi satu-satunya penulis ledger dan baseline.
Buat task/result/run dari template aktual. Semua hasil yang belum berjalan
tetap not_run, exit code null, evidence kosong; jangan mengarang pass.

Kerjakan berurutan: P0 baseline; P1 kamera dan skala; P2 feasibility satu
lubang; P3 integrasi; P4 kota/UI; P5 kejujuran CCTV; P6 test dan repair;
P7 handoff. P0 wajib memeriksa versi terkunci dan environment. P2 wajib
membuktikan cekungan di bawah jalan terlihat dan occlusion benar pada
shared canvas/context MapLibre sebelum P3. Jangan menghapus canvas peta,
memanggil forceContextLoss, atau mengangkat mesh sebagai pengganti lubang.
Gunakan skala fisik 1:1 dengan bantuan keterlihatan berlabel terpisah.
Label GPS acak, dimensi heuristik, dan media CCTV sesuai sumber sebenarnya.

Bekukan acceptance, fixture dan baseline sebelum fixer menerima defect.
Catat cycle sebelum dispatch repair: maksimum 12 repair cycle per sesi,
dua attempt per defect. Crash, retry, rename defect, pergantian worker,
restart dan continuation tidak mereset penghitung. Eskalasi tidak memberi
attempt tambahan. Muat ledger/checkpoint lama jika sesi ini continuation;
permintaan baru ini dapat membuka budget sesi baru hanya bila memang
pekerjaan baru, bukan untuk menyamarkan cap sesi yang sedang dilanjutkan.

Jalankan gate otomatis, visual, dan review independen sesuai HARNESS.md.
Berhenti saat acceptance terpenuhi, budget habis, stagnasi terjadi, atau
scope produk belum jelas. Untuk keputusan scope baru gunakan /grillme
dengan tiga opsi konkret dan dampaknya. Serahkan hasil dengan file berubah,
command/exit code, screenshot/viewport/state, gate status, defect terbuka,
risiko dan ledger. not_run bukan passed, build bukan bukti parity, dan
screenshot bukan bukti 60 FPS. Tidak ada self approval, commit, atau push.
```

## Checklist pelaksanaan

- [ ] Pastikan ada instruksi pengguna yang secara eksplisit meminta implementasi aplikasi dan tetapkan scope yang disetujui.
- [ ] Baca semua kontrak dan kode terkait; catat keputusan lama, baseline, dirty tree, dan risiko.
- [ ] Buat sesi serta ledger dari [run](./templates/run.json): session ID, waktu, batas 12 repair cycle, attempt per defect, dan ownership. Pada continuation, muat ledger lama terlebih dahulu.
- [ ] Isi task menggunakan [task](./templates/task.json) dan tetapkan acceptance sebelum perubahan.
- [ ] Baca teks [common](./prompts/common.md) dan [orchestrator](./prompts/orchestrator.md), lalu masukkan keduanya ke konteks orchestrator yang menjalankan pekerjaan.
- [ ] Untuk setiap child, baca teks common dan satu prompt peran, lalu gabungkan keduanya secara eksplisit di pesan tugas bersama konteks task. Menyebut path saja tidak menjamin child membaca atau menerima instruksi.
- [ ] Verifikasi dispatch memakai model/effort eksplisit dan `fork_turns=none` bila didukung. Jangan diam-diam mewariskan Astra/Ultra jika runtime tidak mendukung override; laporkan kendala sebelum dispatch.
- [ ] Jalankan maksimal dua child aktif, tanpa grandchildren dan tanpa dua writer pada berkas yang sama.
- [ ] Jalankan gate P0 sampai P7, pemeriksaan independen, dan pembaruan ledger sampai acceptance atau kondisi berhenti.
- [ ] Kirim handoff dengan hasil terukur, bukti, risiko, dan pekerjaan tersisa; persetujuan writer sendiri tidak mencukupi.

## Dispatch peran

| Peran | Prompt yang dibaca bersama common | Model child | Effort |
| --- | --- | --- | --- |
| Researcher | [researcher](./prompts/researcher.md) | `gpt-6-luna` | `medium` |
| Planner | [planner](./prompts/planner.md) | `gpt-6.1-sol` | `high` |
| Map geometry | [map-geometry](./prompts/map-geometry.md) | `gpt-6.1-sol` | `high` |
| UI | [ui](./prompts/ui.md) | `gpt-6.1-sol` | `medium` |
| Visual QA | [visual-qa](./prompts/visual-qa.md) | `gpt-6.1-sol` | `high` |
| Harness | [harness](./prompts/harness.md) | `gpt-6.1-sol` | `medium` |
| Repair | [repair](./prompts/repair.md) | `gpt-6.1-sol` | `high` |
| Reviewer | [reviewer](./prompts/reviewer.md) | `gpt-6.1-sol` | `high` |

Nama owner fase dipetakan ke worker aktual pada `task.owner` dan lock ledger: `frontend-map`/`geometry` memakai peran map-geometry sesuai task, `frontend-ui` memakai ui, dan `verifier` memakai harness atau visual-qa sesuai pemeriksaan. Nama owner tidak membuat worker tambahan. Dua peran yang menulis berkas sama harus dijadwalkan berurutan.

Contoh kontrak pesan dispatch, bukan kode yang dijalankan otomatis:

```text
[Isi lengkap prompts/common.md]
[Isi lengkap prompts/<role>.md]

Task: <task yang sesuai templates/task.json>
Context: <scope yang diterima, fase, baseline, keputusan, dependency hasil>
Ownership: <read paths, exclusive write paths, evidence paths>
Acceptance: <criteria beku dan pemeriksaan yang harus dijalankan>
Session: <session ID, batas waktu, cycle terpakai/tersisa, attempt per defect>
Runtime: model=<model tabel>, effort=<effort tabel>, fork_turns=none
Output: <hasil yang sesuai templates/result.json>
No grandchildren. Tidak ada self approval.
```

Jika `fork_turns=none` menghilangkan riwayat percakapan, sertakan keputusan dan temuan yang dibutuhkan di `Context`. Jangan mengandalkan child mengetahui file atau persetujuan yang belum diberikan. `model`, `effort`, dan `fork_turns` harus dikirim melalui parameter runtime yang benar-benar didukung, bukan hanya ditulis dalam pesan lalu dianggap diterapkan. Laporkan model aktual bila tersedia; jika tidak, tandai verifikasi model belum tersedia.

## Urutan dan kondisi berhenti

P0 membangun baseline; P1 membenahi kamera dan skala; P2 membuktikan feasibility satu lubang on-map; P3 mengintegrasikan; P4 menata kota/UI; P5 membenahi kejujuran CCTV; P6 menguji dan memperbaiki; P7 menyerahkan hasil. Gate P2 wajib menunjukkan cekungan terlihat di bawah jalan dan occlusion yang benar. Geometry melayang tidak dapat menggantikan target fisik 1:1. Bantuan keterlihatan diberi label terpisah.

Setiap repair cycle dicatat sebelum perubahan dan verifikasi. Maksimum 12 cycle total sesi, dua attempt per defect. Penggantian worker, retry, rename defect, dan continuation tidak mereset counter. Setelah batas tercapai, eskalasikan tanpa retry tambahan. Permintaan baru pengguna dapat mengotorisasi sesi baru; escalation atau resume otomatis tidak memberi anggaran baru.

Hentikan dispatch ketika acceptance sudah terpenuhi, budget habis, stagnasi muncul, atau cakupan produk tidak jelas. Untuk keputusan produk baru, sajikan `/grillme` dengan tiga opsi beserta dampaknya; keputusan yang sudah diterima tidak perlu ditanyakan ulang.

Handoff memuat task/fase, berkas berubah, command dan exit code, matriks acceptance, screenshot dengan viewport/state, defect terbuka, risiko, ledger terkini, dan langkah berikutnya. `not_run` harus disebutkan beserta alasan dan tidak boleh dihitung sebagai `pass`. Screenshot tidak membuktikan 60 FPS; build tidak membuktikan parity; gambar CCTV tidak membuktikan live. Jangan menyatakan verifikasi yang tidak dijalankan.
