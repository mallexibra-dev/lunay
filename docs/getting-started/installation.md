---
title: Instalasi
description: Langkah menyiapkan dan menjalankan proyek di lokal.
order: 1
---

## Prasyarat

- **Node.js** 20 atau lebih baru
- **Bun** sebagai package manager
- **PostgreSQL** untuk database

## Langkah instalasi

1. Install dependencies:

```bash
bun install
```

2. Salin file environment:

```bash
cp .env.example .env
```

3. Sesuaikan kredensial database di `.env`, lalu jalankan migrasi:

```bash
bun run db:push
```

4. Jalankan server development:

```bash
bun run dev
```

Aplikasi tersedia di [http://localhost:3000](http://localhost:3000).
