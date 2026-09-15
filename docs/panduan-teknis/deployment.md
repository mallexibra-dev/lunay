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

`next build` mengerjakan kompilasi Turbopack, pengecekan TypeScript, dan prerender halaman statis. Halaman dinamis (contoh: `/docs` yang membaca filesystem, route handler API) dirender saat request.

## Variabel lingkungan produksi

Pastikan terpasang di host Anda:

| Variabel              | Wajib | Fungsi                               |
| --------------------- | ----- | ------------------------------------ |
| `DATABASE_URL`        | ✅    | Koneksi PostgreSQL                   |
| `NODE_ENV`            | ✅    | Set `production`                     |
| `API_BASE_URL`        | ⚪    | Base URL untuk panggilan sisi server |
| `NEXT_PUBLIC_API_URL` | ⚪    | Base URL API yang dipakai browser    |

## Checklist pra-deploy

1. **CORS di `src/proxy.ts`** — ganti `https://yourdomain.com` di `allowedOrigins` dengan domain Anda.
2. **Migrasi database** — jalankan `bun run db:migrate` (atau terapkan file SQL dari folder `drizzle/`) sebelum aplikasi start.
3. **Folder `logs/`** — Winston menulis ke `logs/error.log` dan `logs/combined.log`; pastikan proses punya izin menulis, atau alihkan ke penyimpanan log Anda.
4. **Rate limiting** — penyimpanan di memori hanya valid untuk satu instance. Untuk beberapa instance/replica, pindahkan store ke Redis.

## Catatan platform

- **VPS/container** — `bun run start` sudah cukup; letakkan reverse proxy (Nginx/Caddy) di depan untuk TLS.
- **Serverless (Vercel & sejenisnya)** — koneksi database di `src/db/index.ts` sudah memakai `max: 1` dan `prepare: false` untuk pola ini. Perhatikan bahwa rate limiter di memori dan file log tidak persisten di lingkungan serverless — gunakan layanan eksternal untuk keduanya.
