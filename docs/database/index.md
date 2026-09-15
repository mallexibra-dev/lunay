---
title: Koneksi Database
description: Pola koneksi Drizzle ORM yang siap serverless.
order: 3
---

## Stack

- **drizzle-orm**: ORM type-safe berbasis SQL
- **postgres-js**: driver PostgreSQL
- **drizzle-kit**: generator migrasi dan Drizzle Studio (konfigurasi di `drizzle.config.ts`)

## Pola koneksi

`src/db/index.ts` memakai pola singleton agar satu instance dipakai berulang sepanjang hidup proses:

```ts
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env';

let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDatabaseClient() {
  if (!client) {
    client = postgres(env.DATABASE_URL!, {
      max: 1, // pooling driver dimatikan, aman untuk serverless
      prepare: false,
    });
  }
  return client;
}

export function getDb() {
  if (!db) {
    const client = getDatabaseClient();
    db = drizzle(client, { schema: {} }); // daftarkan tabel Anda di sini
  }
  return db;
}

// Koneksi terpisah khusus untuk drizzle-kit menjalankan migrasi
export const migrationClient = postgres(env.DATABASE_URL!, { max: 1 });
export const migrationDb = drizzle(migrationClient, { schema: {} });

export { getDb as db };
```

Poin penting:

- **`max: 1`** menonaktifkan pooling di level driver. Di lingkungan serverless banyak instance kecil hidup bersamaan, dan masing-masing hanya boleh membuka satu koneksi agar tidak menghabiskan batas koneksi database. Untuk server panjang (VPS/container) nilainya boleh dinaikkan, misal `max: 10`.
- **`prepare: false`** menghindari masalah prepared statement pada koneksi yang pendek umurnya, khas serverless.
- **`migrationDb`** hanya dipakai drizzle-kit; pisah dari koneksi aplikasi supaya konfigurasinya bisa berbeda.
- Memanggil `getDb()` berulang tidak membuka koneksi baru; instance sama yang dikembalikan.

## Konfigurasi drizzle-kit

`drizzle.config.ts` mengatur sumber skema, folder output migrasi, dan kredensial:

```ts
import { defineConfig } from 'drizzle-kit';
import { env } from '@/env';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

## Cara memakai

Panggil `getDb()` dari server component atau route handler:

```ts
import { getDb } from '@/db';
import { users } from '@/db/schema';

const rows = await getDb().select().from(users);
```

## Transaksi

Untuk operasi yang harus berhasil semuanya atau tidak sama sekali, bungkus dalam `db.transaction`:

```ts
import { getDb } from '@/db';
import { users, profiles } from '@/db/schema';

await getDb().transaction(async (tx) => {
  const [user] = await tx
    .insert(users)
    .values({ name: 'Budi', email: 'budi@mail.com' })
    .returning();

  await tx.insert(profiles).values({ userId: user.id, bio: 'Halo' });
});
```

Jika salah satu statement melempar error, seluruh transaksi dibatalkan secara otomatis.

## Cek kesehatan koneksi

Cara cepat memastikan database hidup, misalnya untuk endpoint `/api/health`:

```ts
import { sql } from 'drizzle-orm';
import { getDb } from '@/db';

const result = await getDb().execute(sql`select 1`);
```

Skema masih kosong di starter kit. Lanjut ke [Skema & Migrasi](/docs/database/schema) untuk membuat tabel pertama Anda.
