---
title: Instalasi
description: Menyiapkan lingkungan dan menjalankan proyek pertama kali.
order: 1
---

## Prasyarat

| Perangkat  | Versi minimum | Kegunaan                                            |
| ---------- | ------------- | --------------------------------------------------- |
| Node.js    | 20            | Runtime untuk Next.js dan drizzle-kit               |
| Bun        | 1.x           | Package manager dan task runner (`bun run ...`)     |
| PostgreSQL | 14+           | Database utama (lokal, Docker, atau layanan remote) |

Cek instalasi Bun:

```bash
bun --version
```

Jika belum terpasang, ikuti instruksi di [bun.sh](https://bun.sh).

## Menyiapkan PostgreSQL

Cara tercepat untuk development adalah Docker:

```bash
docker run --name starter-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=website_starter \
  -p 5432:5432 -d postgres:16
```

Atau pakai PostgreSQL yang sudah ada di mesin Anda; yang penting satu database kosong tersedia untuk proyek ini.

## Langkah instalasi

1. Clone repositori dan masuk ke foldernya:

```bash
git clone https://github.com/codasia/website-starter.git
cd website-starter
```

2. Install dependencies:

```bash
bun install
```

3. Buat file `.env` di root proyek (bisa menyalin dari `.env.example`):

```bash
cp .env.example .env
```

Lalu sesuaikan kredensial PostgreSQL Anda:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/website_starter"
API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

4. Terapkan skema database. Skema masih kosong di starter kit, tetapi perintah ini memastikan koneksi ke database benar-benar berjalan:

```bash
bun run db:push
```

5. Jalankan server development:

```bash
bun run dev
```

Aplikasi terbuka di [http://localhost:3000](http://localhost:3000), dan halaman dokumentasi (yang sedang Anda baca) tersedia di [http://localhost:3000/docs](http://localhost:3000/docs).

## Verifikasi

Pastikan semua quality gate hijau sebelum mulai menulis kode:

```bash
bun run lint          # ESLint, 0 error
bun run test:run      # Vitest, semua test lulus
bun run build         # Production build sukses
```

## Masalah umum

| Gejala                                       | Penyebab dan solusi                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ECONNREFUSED 127.0.0.1:5432` saat `db:push` | PostgreSQL belum berjalan, atau user/password/db di `DATABASE_URL` salah. Cek container Docker dengan `docker logs starter-db`. |
| Port 3000 sudah dipakai                      | Matikan proses lain di port itu, atau jalankan `bun run dev -- -p 3001`.                                                        |
| `bun install` gagal pada integritas package  | Bersihkan cache Bun dengan `bun pm cache rm` lalu ulangi `bun install`.                                                         |
| Halaman `/docs` kosong                       | Pastikan folder `docs/` berisi file `.md` dengan frontmatter `title`, dan setiap subfolder punya `index.md`.                    |
