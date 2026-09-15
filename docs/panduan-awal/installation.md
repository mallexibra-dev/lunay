---
title: Instalasi
description: Menyiapkan lingkungan dan menjalankan proyek pertama kali.
order: 1
---

## Prasyarat

- **Node.js 20** atau lebih baru
- **Bun** sebagai package manager dan task runner
- **PostgreSQL** yang sudah berjalan (lokal atau remote)

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
DATABASE_URL="postgresql://user:password@localhost:5432/website_starter"
```

4. Terapkan skema database:

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
