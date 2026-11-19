# Foocus

Ruang kerja pribadi yang sederhana dan minim distraksi untuk mengelola tugas, catatan, dan halaman tulisan di satu tempat. Data tersimpan di browser kamu, dan bisa disamakan antar perangkat lewat kode sync.

## Fitur

- **Dashboard**: ringkasan jumlah tugas yang belum selesai dan jumlah catatan.
- **Tasks**: daftar tugas dengan centang selesai. Tugas yang sudah selesai otomatis dihapus setelah 24 jam.
- **Notes**: catatan Markdown dengan toolbar (bold, italic, heading, list, link, gambar) dan mode preview. Bisa disalin dan diunduh sebagai file `.md`.
- **Pages**: halaman tulisan berbasis blok (paragraf, heading, bullet, to-do) dengan shortcut Markdown (`# `, `## `, `- `, `[] `) dan sub-halaman.
- **Sync**: samakan Tasks, Notes, dan Pages antar perangkat memakai satu kode sync.
- **Tampilan gelap** yang responsif, dengan sidebar yang bisa dilipat.

## Teknologi

| Bagian                   | Teknologi                                           |
| ------------------------ | --------------------------------------------------- |
| Framework                | [SvelteKit](https://svelte.dev/docs/kit) + Svelte 5 |
| Bahasa                   | TypeScript                                          |
| Styling                  | Tailwind CSS v4, Skeleton UI                        |
| Ikon                     | lucide-svelte                                       |
| Editor & render Markdown | EasyMDE, marked                                     |
| Penyimpanan lokal        | `localStorage`                                      |
| Penyimpanan sync         | Cloudflare KV                                       |
| Deploy                   | Cloudflare (`adapter-cloudflare`)                   |
| Test                     | Vitest, Playwright                                  |

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

```
src/
├── lib/
│   ├── actions/      # Svelte actions (tooltip, autoresize)
│   ├── components/   # Komponen UI (Sidebar)
│   ├── stores/       # State + penyimpanan (notes, todos, pages, sync)
│   └── types/        # Tipe TypeScript bersama
└── routes/
    ├── +layout.svelte    # Kerangka halaman (header + sidebar)
    ├── +page.svelte      # Dashboard
    ├── todos/            # Halaman Tasks
    ├── notes/            # Halaman Notes
    ├── pages/            # Daftar halaman dan editor blok
    ├── sync/             # Halaman pengaturan sync
    └── api/sync/[code]/  # Endpoint penyimpanan sync (Cloudflare KV)
```

## Menyiapkan Sync

Sync memakai Cloudflare KV sebagai tempat penyimpanan.

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

- Kode sync berfungsi seperti password. Siapa pun yang memilikinya bisa membaca dan menimpa data kamu.
- **Upload** menimpa data di cloud, **Download** menimpa data di perangkat. Belum ada penggabungan otomatis.

## Penyimpanan data

Tanpa sync, semua data hanya ada di `localStorage` browser kamu. Menghapus data situs atau berganti browser berarti data tidak ikut terbawa.

## Lisensi

Belum ditentukan.
