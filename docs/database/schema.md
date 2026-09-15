---
title: Skema & Migrasi
description: Membuat tabel, migrasi, studio, dan seeding.
order: 1
---

## Menulis tabel

Definisikan tabel di `src/db/schema.ts`:

```ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## Daftarkan di koneksi

Supaya query relasional dan tipe `db.query.*` mengenali tabelnya, masukkan ke objek `schema` di `src/db/index.ts`:

```ts
import * as schema from './schema';

db = drizzle(client, { schema });
```

## Migrasi

| Perintah              | Kapan dipakai                                            |
| --------------------- | -------------------------------------------------------- |
| `bun run db:generate` | Buat file SQL migrasi di `drizzle/` dari perubahan skema |
| `bun run db:migrate`  | Terapkan file migrasi ke database                        |
| `bun run db:push`     | Sinkronkan skema langsung — cepat untuk development      |
| `bun run db:studio`   | Buka Drizzle Studio untuk menjelajah data                |

Alur produksi yang disarankan: ubah skema → `db:generate` → commit file migrasi → `db:migrate` saat deploy.

## Query dasar

```ts
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = getDb();

// SELECT
const all = await db.select().from(users);
const one = await db.select().from(users).where(eq(users.email, 'a@b.com'));

// INSERT
await db.insert(users).values({ name: 'Budi', email: 'budi@mail.com' });

// UPDATE / DELETE
await db.update(users).set({ name: 'Budi S' }).where(eq(users.id, 1));
await db.delete(users).where(eq(users.id, 1));
```

## Seeding

Isi data awal di `src/db/seed.ts` lalu jalankan:

```bash
bun run db:seed
```

Fungsi `seed()` di file tersebut sudah menangani error dan exit code — cukup tambahkan `db.insert(...)` Anda di bagian yang ditandai.
