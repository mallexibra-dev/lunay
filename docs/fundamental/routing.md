---
title: Routing
description: App Router, layout, dan penulisan route handler API.
order: 2
---

## File-based routing

Folder di dalam `app/` menjadi route. Starter kit ini sendiri memakai pola lengkapnya di `app/docs/`:

```
app/docs/
├── layout.tsx          # Membungkus semua halaman /docs (sidebar + search)
├── [[...slug]]/
│   └── page.tsx        # /docs, /docs/panduan-awal, /docs/panduan-awal/commands, ...
└── media/[...path]/
    └── route.ts        # Route handler penyaji gambar dokumentasi
```

- `page.tsx` merender halaman; params di Next.js 16 berupa Promise:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
}
```

- `layout.tsx` membungkus children di dalam routenya dan tidak ikut re-render saat pindah halaman.
- Catch-all `[[...slug]]` menangkap path dengan kedalaman berapa pun, termasuk route dasarnya.

## Route handler (API)

Buat folder `app/api/<nama>/route.ts` dan ekspor fungsi HTTP method. Gunakan helper dari `src/lib/api-utils.ts` agar respons dan penanganan error seragam:

```ts
// app/api/users/route.ts
import { api, success } from '@/lib/api-utils';
import { getDb } from '@/db';
import { users } from '@/db/schema';

export const GET = api.get(async () => {
  const rows = await getDb().select().from(users);
  return success(rows);
});

export const POST = api.post(async (req) => {
  const body = await req.json();
  // ...validasi dan simpan
  return success(body, 'Data dibuat', { status: 201 });
});
```

Helper yang tersedia: `success()`, `error()`, `apiError.validation()`, `apiError.notFound()`, `apiError.unauthorized()`, `apiError.forbidden()`, dan `apiError.serverError()`.

Semua request ke `/api/*` otomatis melewati `src/proxy.ts` — mendapat security header, rate limiting 100 request per 15 menit per IP, dan logging. Detailnya di [Logging & Middleware](/docs/panduan-teknis).
