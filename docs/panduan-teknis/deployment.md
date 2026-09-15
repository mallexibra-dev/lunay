---
title: Deployment
description: Membangun dan menjalankan starter kit di produksi.
order: 2
---

## Build

```bash
bun run build
bun run start
```

`next build` mengerjakan kompilasi Turbopack, pengecekan TypeScript, dan prerender halaman statis. Halaman dinamis (mis. `/docs` yang membaca filesystem, dan route handler API) dirender saat request.

## Variabel lingkungan produksi

Pastikan terpasang di host Anda:

| Variabel              | Wajib | Fungsi                               |
| --------------------- | ----- | ------------------------------------ |
| `DATABASE_URL`        | ✅    | Koneksi PostgreSQL                   |
| `NODE_ENV`            | ✅    | Set `production`                     |
| `API_BASE_URL`        | ⚪    | Base URL untuk panggilan sisi server |
| `NEXT_PUBLIC_API_URL` | ⚪    | Base URL API yang dipakai browser    |

Ingat: variabel `NEXT_PUBLIC_` dibundel saat build, jadi nilainya harus sudah benar sebelum `bun run build` dijalankan, bukan hanya saat runtime.

## Checklist pra-deploy

1. **CORS di `proxy.ts`**: ganti `https://yourdomain.com` di `allowedOrigins` dengan domain Anda.
2. **Migrasi database**: jalankan `bun run db:migrate` (atau terapkan file SQL dari folder `drizzle/`) sebelum aplikasi start.
3. **Folder `logs/`**: Winston menulis ke `logs/error.log` dan `logs/combined.log`; pastikan proses punya izin menulis, atau alihkan ke penyimpanan log Anda.
4. **Rate limiting**: penyimpanan di memori hanya valid untuk satu instance. Untuk beberapa instance/replica, pindahkan store ke Redis.
5. **Database produksi**: `max: 1` pada koneksi aman untuk serverless; untuk VPS dengan satu proses boleh dinaikkan sesuai batas koneksi PostgreSQL Anda.

## Contoh Dockerfile

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build
COPY . .
RUN bun run build

# Run
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "start"]
```

Pastikan `DATABASE_URL` diinjeksikan saat runtime (`docker run -e DATABASE_URL=...`), bukan dibakar ke image.

## Catatan platform

- **VPS/container**: `bun run start` sudah cukup; letakkan reverse proxy (Nginx/Caddy) di depan untuk TLS dan kompresi.
- **Serverless (Vercel dan sejenisnya)**: koneksi database di `src/db/index.ts` sudah memakai `max: 1` dan `prepare: false` untuk pola ini. Perhatikan bahwa rate limiter di memori dan file log tidak persisten di lingkungan serverless; gunakan layanan eksternal untuk keduanya. Jalankan migrasi dari CI, bukan dari runtime serverless.

## Contoh pipeline CI

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run format:check
      - run: bun run test:run
      - run: bun run build
```

Pipeline di atas mengunci empat gerbang kualitas yang sama dengan yang Anda jalankan lokal: lint, format, test, dan build.
