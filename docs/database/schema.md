---
title: Skema & Migrasi
description: Membuat tabel, relasi, migrasi, query, dan seeding.
order: 1
---

## Menulis tabel

Definisikan tabel di `src/db/schema.ts`:

```ts
// src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  age: integer('age'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

Tipe kolom yang sering dipakai:

| Tipe Drizzle                    | Tipe PostgreSQL     | Catatan                                  |
| ------------------------------- | ------------------- | ---------------------------------------- |
| `text()`                        | `text`              | String tanpa batas panjang               |
| `varchar('x', { length: 255 })` | `varchar`           | String dengan batas panjang              |
| `integer()`, `bigint()`         | `integer`, `bigint` | Angka bulat                              |
| `boolean()`                     | `boolean`           | `true`/`false`                           |
| `timestamp()`                   | `timestamp`         | `defaultNow()` untuk nilai awal sekarang |
| `numeric()`                     | `numeric`           | Angka desimal presisi (uang)             |
| `jsonb()`                       | `jsonb`             | Objek JSON; tipai dengan `.$type<T>()`   |
| `pgEnum()`                      | `CREATE TYPE`       | Enumerasi nilai terbatas                 |

Contoh enum dan kolom JSON:

```ts
import { pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'member']);

export const users = pgTable('users', {
  // ...kolom lain
  role: roleEnum('role').default('member').notNull(),
  settings: jsonb('settings').$type<{ theme: 'light' | 'dark' }>(),
});
```

## Relasi antar tabel

Definisikan foreign key dan relasinya:

```ts
import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authorId: integer('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

## Daftarkan di koneksi

Supaya query relasional (`db.query.*`) mengenali tabelnya, masukkan ke objek `schema` di `src/db/index.ts`:

```ts
import * as schema from './schema';

db = drizzle(client, { schema });
```

Setelah terdaftar, query relasional bisa dipakai:

```ts
const rows = await db.query.users.findMany({
  with: { posts: true },
  limit: 10,
});
```

## Migrasi

| Perintah              | Kapan dipakai                                                 |
| --------------------- | ------------------------------------------------------------- |
| `bun run db:generate` | Buat file SQL migrasi di `drizzle/` dari perubahan skema      |
| `bun run db:migrate`  | Terapkan file migrasi ke database                             |
| `bun run db:push`     | Sinkronkan skema langsung tanpa file migrasi, cepat untuk dev |
| `bun run db:studio`   | Buka Drizzle Studio untuk menjelajah data                     |

Alur development boleh langsung `db:push` karena tidak meninggalkan riwayat. Alur produksi yang disarankan:

1. Ubah `src/db/schema.ts`.
2. `bun run db:generate`, lalu periksa file SQL yang dihasilkan di `drizzle/`.
3. Commit file migrasi bersama perubahan skema.
4. Saat deploy, jalankan `bun run db:migrate` sebelum aplikasi start.

Konfigurasi `strict: true` di `drizzle.config.ts` membuat drizzle-kit selalu meminta konfirmasi sebelum menulis perubahan yang berpotensi kehilangan data.

## Query dasar

```ts
import { getDb } from '@/db';
import { users, posts } from '@/db/schema';
import { eq, and, like, desc, count } from 'drizzle-orm';

const db = getDb();

// SELECT semua dan satu baris
const all = await db.select().from(users);
const one = await db.select().from(users).where(eq(users.email, 'a@b.com'));

// SELECT kolom tertentu + urutan + batas
const names = await db
  .select({ id: users.id, name: users.name })
  .from(users)
  .orderBy(desc(users.createdAt))
  .limit(10);

// Kondisi gabungan
const activeAdmins = await db
  .select()
  .from(users)
  .where(and(eq(users.isActive, true), eq(users.role, 'admin')));

// Pencarian
const found = await db.select().from(users).where(like(users.name, '%budi%'));

// JOIN
const withPosts = await db
  .select({ name: users.name, title: posts.title })
  .from(users)
  .innerJoin(posts, eq(posts.authorId, users.id));

// Agregasi
const [{ total }] = await db.select({ total: count() }).from(users);

// INSERT (dengan nilai kembali)
const [created] = await db
  .insert(users)
  .values({ name: 'Budi', email: 'budi@mail.com' })
  .returning();

// UPDATE dan DELETE
await db.update(users).set({ name: 'Budi S' }).where(eq(users.id, 1));
await db.delete(users).where(eq(users.id, 1));
```

## Seeding

Isi data awal di `src/db/seed.ts` lalu jalankan:

```bash
bun run db:seed
```

Kerangka filenya sudah menangani deteksi eksekusi langsung dan exit code saat gagal:

```ts
// src/db/seed.ts
import { pathToFileURL } from 'node:url';
import { getDb } from './index';
import { users } from './schema';

const db = getDb();

async function seed() {
  try {
    await db.insert(users).values([
      { name: 'Admin', email: 'admin@mail.com', role: 'admin' },
      { name: 'Budi', email: 'budi@mail.com' },
    ]);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

const isDirectRun =
  import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isDirectRun) {
  seed();
}

export { seed };
```
