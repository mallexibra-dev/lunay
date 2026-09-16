---
title: Perintah CLI
description: Referensi seluruh script yang tersedia di package.json.
order: 3
---

Semua perintah dijalankan dengan `bun run <script>`.

## Development

| Perintah | Fungsi                                       |
| -------- | -------------------------------------------- |
| `dev`    | Jalankan server development (`next dev`)     |
| `build`  | Build produksi (`next build`)                |
| `start`  | Jalankan hasil build produksi (`next start`) |

## Kualitas kode

| Perintah       | Fungsi                                |
| -------------- | ------------------------------------- |
| `lint`         | Periksa kode dengan ESLint            |
| `format`       | Format seluruh file dengan Prettier   |
| `format:check` | Verifikasi format tanpa mengubah file |

## Database

| Perintah      | Fungsi                                         |
| ------------- | ---------------------------------------------- |
| `db:generate` | Buat file migrasi dari `src/db/schema.ts`      |
| `db:migrate`  | Terapkan file migrasi ke database              |
| `db:push`     | Terapkan skema langsung (tanpa file migrasi)   |
| `db:studio`   | Buka Drizzle Studio untuk melihat isi database |
| `db:seed`     | Jalankan seeder dari `src/db/seed.ts`          |

`db:push` praktis untuk masa development; gunakan `db:generate` + `db:migrate` ketika perlu riwayat migrasi yang terkontrol.

## Generator

| Perintah | Fungsi                                                                               |
| -------- | ------------------------------------------------------------------------------------ |
| `auth`   | Generator autentikasi Better Auth (detail di modul [Autentikasi](/docs/autentikasi)) |

## Testing

| Perintah        | Fungsi                                |
| --------------- | ------------------------------------- |
| `test`          | Jalankan Vitest dalam mode watch      |
| `test:ui`       | Buka antarmuka browser Vitest         |
| `test:run`      | Jalankan semua test sekali (untuk CI) |
| `test:coverage` | Jalankan test dengan laporan coverage |
