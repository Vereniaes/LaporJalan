# LaporJalan design system - "Miko lembut"

Versi 1, 10 November 2026. Token ada di `src/index.css` (blok "design system").

Acuan rasa: Oyenza (rekaman pemilik, 10 Nov). Yang dipakai darinya:
- kartu abu lembut tanpa garis;
- sudut besar;
- badge pastel;
- maskot di kartu;
- satu gerak maskot.

Warna dan maskot tetap milik LaporJalan: Miko si burung hantu pakai topi hijau dan rompi kuning.

## Prinsip

1. **Detail saja.** Tata letak dan posisi tidak berubah. Yang berubah: isi, sudut, bayangan, warna peran.
2. **Isi, bukan garis.** Kartu dan tombol sekunder dibedakan dengan `--surface-soft`/`--surface-sunk`, bukan border 1 px. Pengecualian: tepi input (lihat Input).
3. **Kuning = satu aksi utama per layar.** Pengecualian dari pemilik (10 Nov): tombol **Masuk** di header tetap kuning. Hijau = merek dan tautan. Pastel = status. Tidak ada warna lain tanpa peran.
4. **Miko menyapa, bukan menari.**
   - Loop pendek (~3 detik) main sekali saat Miko terlihat, lalu kembali ke gambar diam. Di bawah 5 detik, jadi tanpa tombol jeda (WCAG 2.2.2).
   - Tidak main saat reduced motion atau di perangkat lemah.

## Token

| Peran | Token | Catatan |
|---|---|---|
| Permukaan | `--surface`, `--surface-soft` (kartu), `--surface-sunk` (chip tidak aktif, track), `--line-strong` (tepi input) | ink 14,9:1 dan muted 5,6:1 di atas `--surface-soft` |
| Teks | `--ink`, `--ink-muted` | |
| Aksi utama | `--marking-yellow` dengan teks `--ink` | |
| Merek/tautan | `--sign-green` | |
| Pastel Miko | `--{green,yellow,brown,pink,blue}-{50,100,700}` | `-700` di atas `-50`: ≥ 7,5:1 |
| Radius | `--r-xs 8` · `--r-sm 12` (chip) · `--r-md 16` (tombol/input) · `--r-lg 22` (kartu) · `--r-xl 28` (popup/sheet) · `--r-pill` (badge saja) | inner = outer − padding |
| Bayangan | `--shadow-soft` (kartu) · `--shadow-float` (alat peta, kartu melayang) · `--shadow-pop` (popup) | |
| Fokus | `--focus-ring` | cincin hijau 2 px dengan jeda putih |
| Gerak | `--ease-out`, `--ease-swap`, `--ease-pop` (Miko saja), `--dur-press 120ms`, `--dur-ui 220ms` | |

Sumber warna Miko: sampel OKLCH, median piksel non-netral dari `public/home/miko/point-1024.webp`.

| Bahan | Warna | Hue |
|---|---|---|
| Topi | #3D764D | H151 |
| Rompi | #EAC24E | H90 |
| Bulu | #66412A | H52 |
| Pipi | #E09990 | H27 |

## Komponen

- **Kartu:**
  - `background: var(--surface-soft)`, `border-radius: var(--r-lg)`, tanpa ring;
  - bayangan hanya bila kartu melayang di atas peta;
  - slot maskot di kiri bila ada.
- **Badge status:**
  - pill `--r-pill`, 12 px/600, padding 3×9 px, latar `-50` + teks `-700`;
  - pemetaan status:

    | Status | Warna |
    |---|---|
    | Dilaporkan, Menunggu | kuning |
    | Koordinasi, Proses, Dikerjakan | biru |
    | Selesai | hijau |
    | Ditolak, Ditarik | pink |
    | Belum ada status | `--surface-sunk` + `--ink-muted` |

  - "Belum aktif" di landing memakai cokelat.
- **Tombol:**
  - primer kuning, `--r-md`, highlight dalam `inset 0 1px 0 rgb(255 255 255 / .45)`, tekan `scale(.97)` dalam `--dur-press`;
  - sekunder `--surface-soft`, tanpa border;
  - hover hanya di `(hover: hover) and (pointer: fine)`.
- **Tautan:**
  - di navigasi/header: hijau 600 tanpa garis bawah, garis bawah saat hover/focus;
  - di dalam kalimat: tetap bergaris bawah.
- **Chip/tab:**
  - tidak aktif: `--surface-soft`;
  - aktif: putih dengan cincin hijau 1,5 px dan teks hijau (pola tab Oyenza);
  - `--r-sm`.
- **Input:** putih (`--surface`), `--r-md`, garis 1 px `--line-strong` (#80868D).
  - Satu-satunya garis yang wajib: tepi input harus ≥ 3:1 terhadap kartu (WCAG 1.4.11); isi abu di atas kartu abu hanya 1,06:1.
  - Fokus: `--focus-ring`.
  - Error: teks `--pink-700` + latar `--pink-50`.
- **Popup/dialog:** `--r-xl`, `--shadow-pop`, backdrop `rgb(20 24 28 / .45)` + `backdrop-filter: blur(4px)`.
- **Pin peta:**
  - gelembung putih, cincin 2 px warna kategori, `--shadow-soft`;
  - cluster: `--green-50` dengan angka `--green-700`;
  - terpilih: cincin `--sign-green` 3 px.
- **Maskot:**
  - gambar Miko felt yang sudah ada (`public/home/miko/*.webp`) di kartu langkah, halaman masuk/daftar, popup lapor, daftar kosong, akun kosong;
  - animasi (`src/home/MikoMotion.tsx`, file di `public/home/miko/anim/`):
    - hero: melambai, dari pose `stand`;
    - 4 kartu langkah: HP, clipboard, pin, genangan.
  - Video dibuat di Google Flow dari pose felt itu sendiri, latar magenta dibuang (`knowledge/miko-wave-2026-11-10/`).
  - Miko 3D Spline tidak dipakai: tidak mirip Miko felt.

## Larangan (anti-slop)

- Garis 1 px untuk memisahkan kartu.
- Pill 999 px di mana-mana; pill hanya untuk badge.
- Ungu/gradien/glow.
- Emoji sebagai ikon.
- `transition: all`, `scale(0)`, ease-in.
- Animasi berulang tanpa tombol jeda.
- Warna tanpa peran.

## Mode gelap dan /peta yang lucu (11 November 2026)

Pemilik meminta: "kayak Oyenza, ada maskotnya, super cute, dark mode". Tata letak dan huruf tidak berubah.

**Mode gelap**

*Cara kerja*
- Hanya di `/peta`. Akar halaman diberi `.lj-theme-dark` lewat `src/public-reports/theme.ts`.
- Awalnya mengikuti perangkat. Tombol bulan/matahari di header lalu mengunci pilihan di `localStorage` (`lj-theme`).
- Landing dan `/akun` tetap terang. Peta di sana membaca `ThemeContext` dengan nilai default `light`.

*Token*
- Diganti di `.lj-theme-dark` (`index.css`).
- Variabel berantai seperti `--lj-ink: var(--asphalt)` dan `--focus-ring` sudah dihitung di `:root`, jadi harus ditulis ulang di cakupan gelap.

*Yang tidak ikut berubah*
- Teks di tombol kuning selalu `--on-accent` (#1D2023).
- Merah galat memakai `--danger` / `--danger-50`.

*Peta*
- `themeBasemap(map, theme)` di `src/map/basemap.ts`.
- Warna asli tiap lapisan disimpan sekali, jadi tema bisa ganti tanpa memuat ulang peta.
- Palet gelap: tanah slate #161b21, taman #1d3a2a, air #132c40, label #cdd3db.
- Peta raster Leaflet memakai filter invert + hue-rotate karena tile OSM tidak punya gaya gelap.
- Logo memakai `lockup-horizontal-dark.svg` (tinta #EEF1F5, hijau #5FD394).

*Kontras (diukur, 9.493 elemen teks)*
- 0 di bawah 4,5:1 di kedua tema.
- Terendah di mode gelap: 5,69:1 (badge status netral).

**Miko di /peta (klip Flow, latar magenta dibuang)**

| Tempat | Klip | Perilaku |
|---|---|---|
| Samping judul "Jalan di sekitar" | `anim/look.webp` (melihat sekitar, 5 s, 290 KB) | Main sekali saat terlihat, lalu diam di frame pertama (`look-192.webp`) |
| Di atas peta | `anim/fly.webp` (kepak di tempat, 290 KB) | Lintasan CSS `translateX` 3 s, satu kali per pemicu. Pemicu: laporan dimuat, "Cari di area ini", laporan terkirim |
| Daftar kosong | `anim/peek-puddle.webp` | Seperti di landing |
| Gagal memuat | `look` | Di kotak peringatan |
| Toast "Laporan terkirim" | gambar diam `look-192.webp` | Hilang setelah 5 s |

Aturan gerak Miko:
- Tidak pernah tampil dengan reduced motion atau di perangkat lemah (tier bukan `full`).
- Selalu `aria-hidden`. Arti pesannya disampaikan lewat teks.

**Detail lucu**
- **Chip kategori:** satu warna per kategori, sama dengan pin dan thumbnail (jalan cokelat, pembangunan kuning, saluran biru, pembakaran pink).
- **Thumbnail:** "empuk" (sorot dalam atas dan bayangan dalam bawah).
- **Kartu:** radius 28. Terangkat 2 px saat hover (hanya pointer halus), mengecil `.98` saat ditekan.
- **Pin:** gelembung dengan ekor kecil. Pin terpilih membesar 1,12 dengan `--ease-pop`.
- **Baris memuat:** pil hijau dengan Miko kecil.
