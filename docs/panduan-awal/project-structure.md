---
title: Struktur Proyek
description: Penjelasan isi setiap folder dan konvensi penempatan kode.
order: 2
---

## Peta folder

```
website-starter/
├── app/                    # Route dan halaman (App Router)
│   ├── docs/               #   Halaman dokumentasi (markdown → page)
│   ├── layout.tsx          #   Root layout + React Query provider
│   └── page.tsx            #   Halaman beranda
├── docs/                   # Sumber markdown untuk halaman /docs
├── drizzle/                # File migrasi hasil db:generate
├── public/                 # Aset statis
├── src/
│   ├── components/
│   │   ├── ui/             #   Komponen shadcn/ui
│   │   └── layouts/        #   Provider (React Query, dsb.)
│   ├── db/                 # Koneksi Drizzle, skema, seeder
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilitas inti
│   │   ├── axios.ts        #   Instance ApiClient + interceptor
│   │   ├── api-utils.ts    #   Wrapper route handler + helper respons
│   │   ├── query-client.ts #   Konfigurasi React Query
│   │   ├── logger.ts       #   Winston + helper logging
│   │   └── utils.ts        #   cn() untuk merge class Tailwind
│   ├── styles/             # globals.css (Tailwind) + variables.css (token tema)
│   ├── test/               # Setup dan file test (Vitest)
│   ├── types/              # Tipe TypeScript bersama
│   ├── utils/              # Helper kecil (formatter tanggal, dll.)
│   ├── validations/        # Skema Zod
│   ├── env.ts              # Akses variabel lingkungan
│   └── proxy.ts            # Middleware: security header, rate limit, CORS
├── .env                    # Variabel lingkungan (tidak di-commit)
└── drizzle.config.ts       # Konfigurasi drizzle-kit
```

## Konvensi

- **Alias `@/`** menunjuk ke folder `src/` — contoh: `import { cn } from '@/lib/utils'`.
- **Komponen shadcn** berada di `src/components/ui` dan dipanggil langsung, tanpa index barrel.
- **Halaman dokumentasi** juga berupa file markdown di `docs/` — folder menjadi bagian navigasi, mesin rendernya ada di `app/docs/[[...slug]]/page.tsx`.
- **Skema Zod** diletakkan di `src/validations/`, satu file per domain.
