---
title: Pengenalan
description: Gambaran umum starter kit, yang sudah termasuk, dan cara kerjanya.
order: 1
---

Codasia Web Starter adalah basis proyek resmi Codasia yang menyatukan framework, styling, database, state management, dan testing dalam satu konfigurasi yang sudah teruji, sehingga Anda bisa langsung menulis fitur tanpa setup dari nol.

Dokumentasi ini bersifat internal dan menjadi acuan baku bagi seluruh proyek Next.js di Codasia. Konvensi pada halaman-halaman berikut adalah best practice yang diharapkan berlaku di setiap proyek, bukan sekadar saran.

## Stack utama

| Lapisan      | Teknologi                                     |
| ------------ | --------------------------------------------- |
| Framework    | Next.js 16 (App Router), React 19, TypeScript |
| Styling      | Tailwind CSS v4, shadcn/ui, tw-animate-css    |
| Database     | Drizzle ORM, postgres-js, PostgreSQL          |
| State server | TanStack React Query (+ DevTools)             |
| Klien API    | Axios                                         |
| Form         | React Hook Form, Zod, @hookform/resolvers     |
| Logging      | Winston                                       |
| Testing      | Vitest, React Testing Library, MSW            |

## Prinsip yang dipakai

1. **Konvensi di atas konfigurasi.** Alias `@/` menunjuk `src/`, skema Zod di `src/validations/`, tabel database di `src/db/schema.ts`. Anda tidak perlu memutuskan ulang hal yang sama setiap kali membuat file baru.
2. **Type-safe dari ujung ke ujung.** Skema Zod menghasilkan tipe form, skema Drizzle menghasilkan tipe baris database, dan helper API membungkus respons dengan tipe generik.
3. **Siap serverless sejak awal.** Koneksi database memakai `max: 1` dan `prepare: false`, dan middleware Next.js 16 (`proxy.ts`) membungkus setiap request dengan security header dan rate limiting.

## Langkah berikutnya

1. [Instalasi](/docs/panduan-awal/installation): siapkan lingkungan dan jalankan proyek pertama kali, termasuk database PostgreSQL.
2. [Struktur Proyek](/docs/panduan-awal/project-structure): kenali isi setiap folder dan alur sebuah request dari browser sampai database.
3. [Perintah CLI](/docs/panduan-awal/commands): daftar lengkap script `package.json` yang bisa Anda jalankan dengan `bun run`.
