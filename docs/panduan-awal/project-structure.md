---
title: Struktur Proyek
description: Penjelasan isi setiap folder dan konvensi penempatan kode.
order: 2
---

## Peta folder

```
website-starter/
├── app/                        # Route dan halaman (App Router)
│   ├── docs/                   #   Halaman dokumentasi (markdown → page)
│   │   ├── _components/        #     Shell, sidebar, search, theme toggle, renderer
│   │   ├── [[...slug]]/        #     Catch-all: /docs, /docs/<section>/<halaman>
│   │   └── media/[...path]/    #     Route handler penyaji gambar dokumentasi
│   ├── api/                    #   Route handler (contoh: app/api/users/route.ts)
│   ├── layout.tsx              #   Root layout: font, ThemeProvider, React Query
│   └── page.tsx                #   Halaman beranda
├── docs/                       # Sumber markdown untuk halaman /docs
├── drizzle/                    # File migrasi hasil db:generate
├── scripts/                    # Script utilitas (generator auth: bun run auth)
├── public/                     # Aset statis
├── src/
│   ├── components/
│   │   ├── ui/                 #   Komponen shadcn/ui (50+ file, milik proyek)
│   │   └── layouts/            #   Provider: React Query, next-themes
│   ├── db/                     # index.ts (koneksi), schema.ts, seed.ts
│   ├── hooks/                  # Custom React hooks (mis. use-mobile)
│   ├── lib/
│   │   ├── axios.ts            #   ApiClient (Axios) + interceptor + helper token
│   │   ├── api-utils.ts        #   Wrapper route handler + helper respons
│   │   ├── query-client.ts     #   Instance QueryClient (default global)
│   │   ├── docs/queries.ts     #   Pembaca filesystem untuk halaman /docs
│   │   ├── logger.ts           #   Winston + helper logging
│   │   └── utils.ts            #   cn() untuk merge class Tailwind
│   ├── styles/                 # globals.css (Tailwind) + variables.css (token tema)
│   ├── test/                   # Setup, file test, dan mock MSW (Vitest)
│   ├── types/                  # Tipe TypeScript bersama
│   ├── utils/                  # Helper kecil (formatter tanggal, angka, teks)
│   ├── validations/            # Skema Zod, satu file per domain
│   └── env.ts                  # Akses variabel lingkungan
├── .env                        # Variabel lingkungan (tidak di-commit)
├── .env.example                # Template variabel lingkungan untuk tim
├── proxy.ts                    # Middleware: security header, rate limit, CORS
├── drizzle.config.ts           # Konfigurasi drizzle-kit
└── vitest.config.ts            # Konfigurasi Vitest
```

## Konvensi

- **Alias `@/`** menunjuk ke folder `src/`. Contoh: `import { cn } from '@/lib/utils'`.
- **Komponen shadcn** berada di `src/components/ui` dan diimpor langsung dari pathnya, tanpa index barrel.
- **Skema Zod** diletakkan di `src/validations/`, satu file per domain (mis. `user.ts` untuk semua skema terkait user).
- **Tabel database** dideklarasikan di `src/db/schema.ts` dan didaftarkan ke objek `schema` di `src/db/index.ts`.
- **Halaman dokumentasi** berupa file markdown di `docs/`. Nama folder menjadi bagian navigasi, dan mesin rendernya ada di `app/docs/[[...slug]]/page.tsx`.
- **Folder dengan awalan underscore** seperti `app/docs/_components` diabaikan Next.js sebagai route; isinya hanya komponen pendukung.

## Alur satu request

Sebagai gambaran bagaimana bagian-bagian proyek saling terhubung, ini alur request `POST /api/users`:

1. **`proxy.ts`** (di root proyek) menerima request lebih dulu: mencatat log, memeriksa rate limit (100 request per 15 menit per IP+path untuk `/api/*`), dan menempelkan security header.
2. **Route handler** di `app/api/users/route.ts` (dibungkus `api.post(...)` dari `src/lib/api-utils.ts`) memvalidasi body dengan skema Zod dari `src/validations/`.
3. **`getDb()`** dari `src/db/index.ts` menjalankan query Drizzle berdasarkan tabel di `src/db/schema.ts`, dan helper `logDatabaseOperation` mencatat durasinya.
4. **`success()`** membungkus hasil menjadi JSON dengan bentuk `{ success, message, data, meta }`, lalu wrapper mencatat log respons beserta durasinya.

Di sisi browser, komponen memanggil endpoint tersebut lewat `apiClient` (`src/lib/axios.ts`) di dalam `useQuery`/`useMutation` dari React Query.
