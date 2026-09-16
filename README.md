# Codasia Web Starter

Starter kit internal Codasia untuk memulai proyek Next.js dengan standar tim: Next.js 16, TypeScript, Tailwind CSS v4 + shadcn/ui, Drizzle ORM, React Query, testing siap pakai, dan dokumentasi teknis lengkap yang bisa dibuka di `/docs`.

## Fitur

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** dengan token tema terang/gelap (`next-themes`) dan 50+ komponen **shadcn/ui**
- **Drizzle ORM** + PostgreSQL dengan pola koneksi siap serverless (`max: 1`, `prepare: false`)
- **TanStack React Query** untuk state server, sudah terpasang di root layout
- **Axios** dengan interceptor terstruktur (`apiClient` + helper token)
- **React Hook Form + Zod** untuk form dan validasi
- **Winston** untuk logging terstruktur, plus `proxy.ts` dengan security header, rate limiting, dan CORS
- **Vitest + React Testing Library + MSW** untuk pengujian
- **Autentikasi on-demand** via Better Auth: satu perintah `bun run auth`
- **Dokumentasi internal** di `/docs`: pencarian, dark mode, tombol copy per kode dan per halaman

## Prasyarat

- Node.js 20.9+ (disarankan versi LTS)
- [Bun](https://bun.sh) versi terbaru
- PostgreSQL yang bisa diakses

## Mulai cepat

1. Clone dan masuk ke folder proyek:

   ```bash
   git clone https://github.com/codasia/website-starter.git
   cd website-starter
   ```

2. Pasang dependency:

   ```bash
   bun install
   ```

3. Salin template env lalu isi `DATABASE_URL`:

   ```bash
   cp .env.example .env
   ```

4. Sinkronkan skema ke database:

   ```bash
   bun run db:push
   ```

5. Jalankan server development:

   ```bash
   bun run dev
   ```

   Aplikasi ada di [http://localhost:3000](http://localhost:3000) dan dokumentasi teknis di [http://localhost:3000/docs](http://localhost:3000/docs).

## Autentikasi (opsional)

Starter sengaja dikirim tanpa auth agar tetap bersih. Satu perintah berikut menambahkan seluruh wiring [Better Auth](https://www.better-auth.com):

```bash
bun run auth
```

Hasilnya: instance `auth` server dan client, route handler `/api/auth/*`, tabel auth di `src/db/auth-schema.ts`, variabel `.env`, halaman `/login` dan `/register` (RHF + Zod + shadcn/ui), serta proteksi route terpusat di `proxy.ts`:

```ts
// proxy.ts
// Pengunjung tanpa sesi dialihkan ke /login?callbackUrl=<path>
const protectedRoutes: string[] = []; // isi mis. ['/dashboard', '/admin']
```

Panduan lengkapnya ada di modul [Autentikasi](/docs/autentikasi).

## Script

Semua perintah dijalankan dengan `bun run <script>`.

| Script          | Fungsi                                    |
| --------------- | ----------------------------------------- |
| `dev`           | Server development                        |
| `build`         | Build produksi                            |
| `start`         | Jalankan hasil build produksi             |
| `lint`          | Periksa kode dengan ESLint                |
| `format`        | Format seluruh file (Prettier)            |
| `format:check`  | Verifikasi format tanpa mengubah file     |
| `db:generate`   | Buat file migrasi dari `src/db/schema.ts` |
| `db:migrate`    | Terapkan file migrasi ke database         |
| `db:push`       | Sinkronkan skema langsung (tanpa migrasi) |
| `db:studio`     | Buka Drizzle Studio                       |
| `db:seed`       | Jalankan seeder dari `src/db/seed.ts`     |
| `auth`          | Generator autentikasi Better Auth         |
| `test`          | Vitest mode watch                         |
| `test:run`      | Vitest sekali jalan (untuk CI)            |
| `test:ui`       | Antarmuka browser Vitest                  |
| `test:coverage` | Test dengan laporan coverage              |

## Struktur proyek

```text
app/                         # App Router: halaman dan API routes
├── docs/                    # Halaman /docs (renderer markdown)
├── layout.tsx               # Root layout (React Query + theme provider)
└── page.tsx                 # Halaman utama
docs/                        # Konten dokumentasi (markdown + media)
drizzle/                     # File migrasi hasil db:generate
scripts/                     # Script utilitas (generator auth)
public/                      # Aset statis
src/
├── components/
│   ├── ui/                  # Komponen shadcn/ui
│   └── layouts/             # Provider (React Query, next-themes)
├── db/                      # Koneksi Drizzle, schema.ts, seed.ts
├── hooks/                   # Custom hooks
├── lib/                     # api-utils, axios, logger, query-client
├── styles/                  # globals.css + token tema terang/gelap
├── test/                    # Setup Vitest, RTL, dan mock MSW
├── types/
├── utils/
├── validations/             # Skema Zod, satu file per domain
└── env.ts                   # Akses variabel lingkungan terpusat
proxy.ts                     # Middleware: security header, rate limit, CORS
drizzle.config.ts
vitest.config.ts
```

Catatan: `proxy.ts` wajib berada di root proyek (sejajar dengan `app/`). File dengan nama sama di dalam `src/` diabaikan Next.js tanpa error.

## Contoh pemakaian

### API route

```ts
// app/api/hello/route.ts
import { api, success } from '@/lib/api-utils';

export const GET = api.get(async () => {
  return success({ message: 'Hello, Codasia!' });
});
```

Handler dibungkus `api.get/post/put/delete` sehingga otomatis mendapat logging dan penanganan error. Respons distandarkan lewat helper `success()` / `error()` dari `src/lib/api-utils.ts`.

### Data fetching di klien

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => apiClient.get('/posts'),
  });
}
```

### Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('merender tombol', () => {
  render(<Button>Klik saya</Button>);
  expect(screen.getByRole('button', { name: 'Klik saya' })).toBeInTheDocument();
});
```

Jalankan dengan `bun run test:run`.

## Keamanan dan proxy

`proxy.ts` membungkus setiap request:

1. Security header: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
2. Rate limiting untuk `/api/*`: 100 request per 15 menit per kombinasi IP+path.
3. CORS untuk `/api/*`: sesuaikan `allowedOrigins` saat deploy.
4. Logging setiap request via Winston.

Setelah generator auth dijalankan, file yang sama juga menampung `protectedRoutes` untuk proteksi sesi.

## Deployment

```bash
bun run build
bun run start
```

- Set `DATABASE_URL` di lingkungan produksi, ditambah `BETTER_AUTH_SECRET` dan `BETTER_AUTH_URL` bila memakai auth.
- Bila memakai alur migrasi, jalankan `bun run db:migrate` sebelum aplikasi start.
- Ganti `https://yourdomain.com` di `allowedOrigins` pada `proxy.ts` dengan domain produksi Anda.

## Dokumentasi

Dokumentasi teknis lengkap (bahasa Indonesia) tersedia di halaman `/docs`:

| Modul                                  | Isi                                                  |
| -------------------------------------- | ---------------------------------------------------- |
| [Panduan Awal](/docs/panduan-awal)     | Instalasi, struktur proyek, dan perintah CLI         |
| [Konsep Dasar](/docs/fundamental)      | Variabel lingkungan, routing, styling, dan dark mode |
| [Autentikasi](/docs/autentikasi)       | Generator auth Better Auth dan arsitekturnya         |
| [Database](/docs/database)             | Koneksi Drizzle, skema, migrasi, query, dan seeding  |
| [Data Fetching](/docs/data-fetching)   | Klien API Axios dan React Query                      |
| [Antarmuka](/docs/antarmuka)           | Komponen shadcn/ui serta form + validasi             |
| [Panduan Teknis](/docs/panduan-teknis) | Logging, middleware, testing, dan deployment         |

## Kontribusi

1. Buat branch dari `master` untuk perubahan Anda.
2. Ikuti konvensi yang tertulis di `/docs`.
3. Pastikan `bun run lint`, `bun run format:check`, dan `bun run test:run` hijau sebelum membuka pull request.

Ada kendala atau pertanyaan? Buka issue di repo ini.
