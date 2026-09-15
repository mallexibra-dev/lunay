---
title: Koneksi Database
description: Pola koneksi Drizzle ORM yang siap serverless.
order: 3
---

## Stack

- **drizzle-orm** — ORM type-safe berbasis SQL
- **postgres-js** — driver PostgreSQL
- **drizzle-kit** — migrasi dan studio (lihat `drizzle.config.ts`)

## Pola koneksi

`src/db/index.ts` memakai pola singleton agar satu instance dipakai berulang:

```ts
function getDatabaseClient() {
  if (!client) {
    client = postgres(env.DATABASE_URL!, {
      max: 1, // aman untuk environment serverless
      prepare: false,
    });
  }
  return client;
}

export function getDb() {
  if (!db) {
    const client = getDatabaseClient();
    db = drizzle(client, { schema: {} }); // daftarkan tabel di sini
  }
  return db;
}

export { getDb as db };
```

Poin penting:

- `max: 1` menonaktifkan pooling di level driver — cocok untuk serverless yang membuka banyak instance; untuk server panjang (VPS/container) boleh dinaikkan.
- `prepare: false` menghindari masalah prepared statement pada koneksi serverless.
- Ada juga `migrationDb` yang dipakai drizzle-kit untuk menjalankan migrasi.

## Cara memakai

Panggil `getDb()` dari server component atau route handler:

```ts
import { getDb } from '@/db';

const rows = await getDb().select().from(users);
```

Skema masih kosong di starter kit — lanjut ke [Skema & Migrasi](/docs/database/schema) untuk membuat tabel pertama Anda.
