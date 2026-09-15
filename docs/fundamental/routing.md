---
title: Routing
description: App Router, layout, halaman dinamis, dan penulisan route handler API.
order: 2
---

## File-based routing

Folder di dalam `app/` menjadi route. Starter kit ini sendiri memakai hampir semua polanya di `app/docs/`:

```
app/docs/
├── layout.tsx          # Membungkus semua halaman /docs (header, sidebar, search)
├── [[...slug]]/
│   └── page.tsx        # /docs, /docs/panduan-awal, /docs/panduan-awal/commands, ...
└── media/[...path]/
    └── route.ts        # Route handler penyaji gambar dokumentasi
```

- **`page.tsx`** merender halaman. Di Next.js 16, `params` berupa Promise sehingga harus di-`await`:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
}
```

- **`layout.tsx`** membungkus children di dalam routenya dan tidak ikut re-render saat pindah halaman di dalam scope-nya. Cocok untuk shell UI seperti sidebar.
- **Catch-all opsional `[[...slug]]`** menangkap path dengan kedalaman berapa pun, termasuk route dasarnya (`/docs` tanpa segmen pun ikut tertangkap). Catch-all wajib `[...slug]` (dengan satu bracket) baru aktif setelah ada minimal satu segmen.
- **`_components/`** (awalan underscore) diabaikan sebagai route; isinya komponen pendukung folder tersebut.

Konvensi file lain yang dikenali App Router dan bisa Anda tambah kapan saja:

| File            | Fungsi                                           |
| --------------- | ------------------------------------------------ |
| `loading.tsx`   | UI fallback yang tampil selama segment memuat    |
| `error.tsx`     | UI error untuk segment (`'use client'` wajib)    |
| `not-found.tsx` | UI untuk `notFound()` dan route yang tak dikenal |
| `template.tsx`  | Seperti layout, tetapi remount setiap navigasi   |

## Route handler (API)

Buat folder `app/api/<nama>/route.ts` lalu ekspor fungsi HTTP method. Gunakan helper dari `src/lib/api-utils.ts` agar respons, logging, dan penanganan error seragam:

```ts
// app/api/users/route.ts
import { api, success, apiError, parseRequestBody } from '@/lib/api-utils';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { createUserSchema } from '@/validations/user';

export const GET = api.get(async () => {
  const rows = await getDb().select().from(users);
  return success(rows);
});

export const POST = api.post(async (req) => {
  const body = await parseRequestBody(req);
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return apiError.validation(
      'Data tidak valid',
      parsed.error.flatten().fieldErrors
    );
  }

  const [created] = await getDb().insert(users).values(parsed.data).returning();
  return success(created, 'User dibuat', { status: 201 });
});
```

Bentuk respons yang dihasilkan selalu sama:

```json
{
  "success": true,
  "message": "User dibuat",
  "data": { "id": 1 },
  "meta": { "timestamp": "2026-01-01T00:00:00.000Z", "requestId": "abc123" }
}
```

Helper yang tersedia: `success()`, `error()`, `apiError.validation()`, `apiError.notFound()`, `apiError.unauthorized()`, `apiError.forbidden()`, dan `apiError.serverError()`.

## Route dinamis di API

Untuk `app/api/users/[id]/route.ts`, parameter juga berupa Promise di Next.js 16. Bungkus handler dengan tipe context-nya:

```ts
// app/api/users/[id]/route.ts
import { api, success, apiError } from '@/lib/api-utils';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

type Context = { params: Promise<{ id: string }> };

export const GET = api.get<Context>(async (req, context) => {
  const { id } = await context!.params;
  const [row] = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, Number(id)));

  if (!row) return apiError.notFound('User tidak ditemukan');
  return success(row);
});
```

Wrapper `api.get<TContext>()` meneruskan context apa pun yang diberikan Next.js ke handler Anda, sekaligus mencatat log request dan respons beserta durasinya.

## Middleware

Semua request melewati `src/proxy.ts` (middleware Next.js 16) kecuali aset statis. Di situ setiap request mendapat security header, dan request `/api/*` mendapat rate limiting serta CORS. Detailnya di [Logging & Middleware](/docs/panduan-teknis).
