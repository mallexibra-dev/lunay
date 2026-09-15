---
title: Dokumentasi
description: Panduan lengkap penggunaan Next.js Starter Kit.
---

Selamat datang di **dokumentasi internal Codasia** untuk Next.js Starter Kit. Dokumen ini adalah acuan baku yang dipakai di seluruh proyek Next.js Codasia: cara memasang, struktur proyek, konvensi, hingga pola pemakaian setiap lapisan. Saat memulai proyek baru, perlakukan semua yang tertulis di sini sebagai standar tim.

## Apa saja isinya

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** dengan tema berbasis token (terang/gelap) dan **shadcn/ui**
- **Drizzle ORM** + PostgreSQL dengan pola koneksi siap serverless
- **TanStack React Query** untuk state server, sudah terpasang di root layout
- **Axios** dengan interceptor terstruktur untuk klien API
- **React Hook Form + Zod** untuk form dan validasi
- **Winston** untuk logging terstruktur, plus proxy dengan security header dan rate limiting
- **Vitest + React Testing Library** untuk pengujian
- **Dark mode** siap pakai lewat `next-themes`, dengan tombol ganti tema di halaman `/docs`

## Peta dokumentasi

| Modul                                  | Isi                                                  |
| -------------------------------------- | ---------------------------------------------------- |
| [Panduan Awal](/docs/panduan-awal)     | Instalasi, struktur proyek, dan perintah CLI         |
| [Konsep Dasar](/docs/fundamental)      | Variabel lingkungan, routing, styling, dan dark mode |
| [Database](/docs/database)             | Koneksi Drizzle, skema, migrasi, query, dan seeding  |
| [Data Fetching](/docs/data-fetching)   | Klien API Axios dan React Query                      |
| [Antarmuka](/docs/antarmuka)           | Komponen shadcn/ui serta form + validasi             |
| [Panduan Teknis](/docs/panduan-teknis) | Logging, middleware, testing, dan deployment         |

Mulai dari [Instalasi](/docs/panduan-awal/installation), atau pilih modul di atas.
