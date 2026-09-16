---
title: Variabel Lingkungan
description: Pola aman mengakses variabel lingkungan lewat modul env.ts.
order: 1
---

## Modul env.ts

Jangan memanggil `process.env` secara tersebar di kode. Kumpulkan semua variabel di `src/env.ts` lalu impor dari sana:

```ts
// src/env.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  API_BASE_URL: process.env.API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
};
```

Keuntungan pola ini:

- Satu tempat untuk melihat seluruh variabel yang dipakai aplikasi.
- Mudah memvalidasi atau mengganti nilai saat test (mis. lewat mock modul).
- Tipografer mengetahui daftar variabel yang sah, sehingga salah ketik tertangkap saat compile.

Cara pemakaian:

```ts
import { env } from '@/env';

const client = postgres(env.DATABASE_URL!);
```

## Menambah variabel baru

1. Tambahkan ke file `.env` lokal Anda, dan ke `.env.example` sebagai dokumentasi tim:

```env
SMTP_HOST="smtp.mailtrap.io"
```

2. Daftarkan di `src/env.ts`:

```ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  API_BASE_URL: process.env.API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  SMTP_HOST: process.env.SMTP_HOST,
};
```

3. Impor `env` di tempat yang membutuhkan. Jika variabel wajib ada, validasi saat startup agar gagal cepat:

```ts
if (!env.SMTP_HOST) {
  throw new Error('SMTP_HOST belum diset di .env');
}
```

## Sisi klien

Variabel yang dibutuhkan di browser harus berawalan `NEXT_PUBLIC_` agar di-embed saat build:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

Contoh pemakaiannya ada di `src/lib/axios.ts` sebagai `baseURL` instance `apiClient`. Perlu diingat:

- Variabel `NEXT_PUBLIC_` terbaca siapa pun di bundle, jadi jangan pernah menaruh secret di sana.
- Variabel tanpa prefix (seperti `DATABASE_URL`) hanya tersedia di server. Jangan pernah mengimpor `env` berisi secret dari komponen `'use client'`.
- Perubahan nilai env di development butuh restart `bun run dev`; di produksi butuh build ulang untuk variabel `NEXT_PUBLIC_`.

## Validasi dengan Zod (opsional)

Untuk proyek yang butuh jaminan lebih kuat, bungkus `process.env` dengan skema Zod di `src/env.ts`:

```ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),
  API_BASE_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const env = envSchema.parse(process.env);
```

Dengan pola ini, aplikasi menolak jalan sejak awal bila ada variabel wajib yang hilang atau salah bentuk.
