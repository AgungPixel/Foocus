# Foocus

Ruang kerja pribadi yang sederhana dan minim distraksi untuk mengelola tugas dan catatan di satu tempat. Data tersimpan lokal di browser kamu, dan bisa disinkronkan otomatis antar perangkat lewat kode sync.

## Fitur

- **Dashboard**: ringkasan jumlah tugas yang belum selesai, jumlah catatan, dan akses cepat ke catatan terbaru.
- **Tasks**: daftar tugas dengan centang selesai. Tugas yang sudah selesai otomatis dibersihkan setelah 24 jam.
- **Notes**: catatan dan halaman terpadu berbasis blok (paragraf, heading, bullet, to-do) dengan shortcut Markdown (`# `, `## `, `- `, `[] `), dukungan paste Markdown multi-baris, sub-halaman bersarang, live preview Markdown, serta salin/unduh sebagai file `.md`.
- **Sync**: sinkronisasi dua arah (_Two-Way Smart Merge_ per item dengan _tombstones_) untuk menyamakan Tasks dan Notes antar perangkat secara otomatis tanpa saling menimpa.
- **Tampilan gelap** hitam pekat minimalis dengan aksen neon (`#CCFF00`) dan sidebar yang bisa dilipat.

## Teknologi

| Bagian            | Teknologi                                           |
| ----------------- | --------------------------------------------------- |
| Framework         | [SvelteKit](https://svelte.dev/docs/kit) + Svelte 5 |
| Bahasa            | TypeScript                                          |
| Styling           | Tailwind CSS v4, Skeleton UI                        |
| Ikon              | lucide-svelte                                       |
| Render Markdown   | marked                                              |
| Penyimpanan lokal | `localStorage`                                      |
| Penyimpanan sync  | Cloudflare KV                                       |
| Deploy            | Cloudflare (`adapter-cloudflare`)                   |
| Test              | Vitest, Playwright                                  |

## Memulai

Prasyarat: [Node.js](https://nodejs.org) versi LTS terbaru dan npm.

```sh
git clone https://github.com/AgungPixel/Foocus.git
cd Foocus
npm install
npm run dev
```

Buka alamat yang tampil di terminal (biasanya http://localhost:5173).

## Perintah yang tersedia

| Perintah          | Fungsi                               |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Menjalankan server development       |
| `npm run build`   | Membuat build produksi               |
| `npm run preview` | Melihat hasil build secara lokal     |
| `npm run check`   | Memeriksa tipe TypeScript dan Svelte |
| `npm run format`  | Merapikan kode dengan Prettier       |
| `npm run lint`    | Mengecek format kode                 |
| `npm test`        | Menjalankan unit test dan e2e test   |

## Struktur project

```text
src/
├── lib/
│   ├── actions/      # Svelte actions (tooltip, autoresize)
│   ├── components/   # Komponen UI (Sidebar)
│   ├── stores/       # State + penyimpanan (notes, todos, sync)
│   ├── types/        # Tipe TypeScript bersama
│   └── utils/        # Helper Markdown & mesin merge sync
└── routes/
    ├── +layout.svelte    # Kerangka halaman (header + sidebar + status sync)
    ├── +page.svelte      # Dashboard
    ├── todos/            # Halaman Tasks
    ├── notes/            # Daftar catatan & editor blok terpadu (+ sub-halaman)
    ├── pages/            # Redirect kompatibilitas ke /notes
    ├── sync/             # Halaman pengaturan sync
    └── api/sync/[code]/  # Endpoint penyimpanan sync (Cloudflare KV)
```

## Menyiapkan Sync

Sync memakai Cloudflare KV sebagai tempat penyimpanan (gratis dalam kuota _free tier_).

1. Buat KV namespace:
   ```sh
   npx wrangler kv namespace create FOOCUS_KV
   ```
2. Salin `id` yang muncul ke `wrangler.jsonc`, pada bagian `kv_namespaces`.
3. Deploy ke Cloudflare:
   ```sh
   npm run build
   npx wrangler deploy
   ```
4. Buka halaman **Sync** di aplikasi yang sudah ter-deploy, buat kode sync di perangkat pertama, lalu masukkan kode yang sama di perangkat lain.

Catatan penting:

- Kode sync berfungsi seperti password. Siapa pun yang memilikinya bisa mengakses dan menggabungkan data kamu.
- Sync menggunakan **Two-Way Smart Merge** per item (`updatedAt` terbaru menang, penghapusan dilacak dengan _tombstone_) dan hanya mengirim `PUT` ke Cloudflare KV jika ada perubahan data.

## Penyimpanan data

Tanpa sync, semua data hanya ada di `localStorage` browser kamu. Menghapus data situs atau berganti browser berarti data tidak ikut terbawa.

## Lisensi

Belum ditentukan.
