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

Cara pemakaian:

```ts
import { env } from '@/env';

const client = postgres(env.DATABASE_URL!);
```

## Menambah variabel baru

1. Tambahkan ke file `.env` (dan `.env.example` sebagai dokumentasi tim).
2. Daftarkan di `src/env.ts`.
3. Impor `env` di tempat yang membutuhkan.

## Sisi klien

Variabel yang dibutuhkan di browser harus berawalan `NEXT_PUBLIC_` agar di-embed saat build:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

Contoh pemakaiannya ada di `src/lib/axios.ts` sebagai `baseURL` instance ApiClient. Variabel tanpa prefix (seperti `DATABASE_URL`) hanya tersedia di server — jangan pernah memanggil `env` berisi secret dari komponen `'use client'`.
