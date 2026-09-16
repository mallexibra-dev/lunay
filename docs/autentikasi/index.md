---
title: Autentikasi
description: Generator Better Auth satu perintah dan arsitektur hasilnya.
order: 3
---

Starter kit sengaja dikirim **tanpa auth** agar tetap bersih, tetapi auth selalu satu perintah lagi lewat generator resmi Codasia. Generatornya memakai [Better Auth](https://www.better-auth.com) dengan adapter Drizzle, sehingga seluruh bagian yang dibutuhkannya (Drizzle, Zod, shadcn/ui) sudah tersedia di kit.

## Menjalankan generator

```bash
bun run auth
```

Perintah ini interaktif: ia bertanya apakah halaman login/register ikut dibuat dan apakah `db:push` dijalankan langsung. Semua pertanyaan bisa dilewati dengan flag:

```bash
bun run auth --create            # alias dari tanpa argumen
bun run auth --create --no-ui    # tanpa halaman login/register
bun run auth --create --no-push  # jangan jalankan db:push otomatis
bun run auth --create --yes      # terima semua default tanpa prompt
bun run auth --create --force    # timpa file hasil generate yang sudah ada
```

Generator tidak pernah menyentuh file Anda selain yang tercantum di bawah; file yang sudah ada dilewati, bukan ditimpa.

## File yang dihasilkan

| File                             | Isi                                                                       |
| -------------------------------- | ------------------------------------------------------------------------- |
| `src/lib/auth.ts`                | Instance `betterAuth` dengan `drizzleAdapter` + email/password            |
| `src/lib/auth-client.ts`         | `authClient` dari `better-auth/react` (`signIn`, `signOut`, `useSession`) |
| `app/api/auth/[...all]/route.ts` | Route handler `toNextJsHandler(auth.handler)`                             |
| `src/db/auth-schema.ts`          | Tabel `user`, `session`, `account`, `verification`                        |
| `src/db/index.ts`                | Diperbarui: `authSchema` didaftarkan ke objek `schema`                    |
| `proxy.ts`                       | Diperbarui: konfigurasi `protectedRoutes` untuk proteksi route            |
| `.env` dan `.env.example`        | `BETTER_AUTH_SECRET` (acak) dan `BETTER_AUTH_URL`                         |
| `src/env.ts`                     | Diperbarui: variabel auth dan social login terdaftar                      |
| `src/validations/auth.ts`        | `loginSchema` + `registerSchema` (bila UI disertakan)                     |
| `app/(auth)/login/page.tsx`      | Halaman `/login` (bila UI disertakan)                                     |
| `app/(auth)/register/page.tsx`   | Halaman `/register` (bila UI disertakan)                                  |

Halaman UI memakai pola yang sama dengan seluruh kit: React Hook Form + Zod + komponen `Card`/`Form` shadcn, toast error via sonner, dan otomatis ikut mode terang/gelap karena berbasis token tema.

## Variabel lingkungan

| Variabel                                    | Fungsi                                              |
| ------------------------------------------- | --------------------------------------------------- |
| `BETTER_AUTH_SECRET`                        | Kunci signing sesi. Wajib, digenerate otomatis      |
| `BETTER_AUTH_URL`                           | Base URL aplikasi (default `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opsional, untuk social login Google                 |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Opsional, untuk social login GitHub                 |

Generator juga mendaftarkan seluruh variabel di atas ke `src/env.ts`, sehingga di kode Anda mengambilnya lewat `env` dari `@/env`, bukan `process.env` langsung (lihat modul [Variabel Lingkungan](/docs/fundamental/environment)).

## Proteksi route di proxy.ts

Proteksi login tidak ditulis per halaman. Generator mendaftarkan konfigurasinya di `proxy.ts`, sehingga pengecekan sesi berjalan di satu tempat untuk semua route:

```ts
// proxy.ts
// Prefix route yang wajib login. Proteksi dievaluasi di proxy sehingga
// tidak perlu guard per halaman. Contoh: ['/dashboard', '/admin'].
const protectedRoutes: string[] = [];
```

Isi array dengan prefix route yang harus diproteksi. Pengunjung tanpa sesi yang membuka path di daftar itu langsung dialihkan ke `/login?callbackUrl=<path>`, dan setelah berhasil masuk dikembalikan ke halaman semula. Begini bentuk logikanya di dalam fungsi `proxy`:

```ts
// proxy.ts
const isProtected = protectedRoutes.some(
  (route) => pathname === route || pathname.startsWith(route + '/')
);
if (isProtected) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
}
```

Next.js 16 menjalankan proxy pada Node.js runtime, jadi `auth.api.getSession` aman dipanggil di sana dan validasinya benar-benar ke database, bukan sekadar menebak dari keberadaan cookie.

## Memakai sesi di kode

Setelah route diproteksi lewat proxy, halaman cukup membaca data sesinya tanpa guard tambahan. Di server component:

```tsx
// app/dashboard/page.tsx
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <p>Halo, {session?.user.name}</p>;
}
```

Tidak ada `redirect('/login')` di halaman karena itu tugas proxy. Tipe `session` adalah `Session | null`; untuk halaman yang masuk daftar `protectedRoutes`, nilainya pasti terisi saat dirender.

Di komponen klien, gunakan `useSession` dari auth client:

```tsx
'use client';

import { useSession } from '@/lib/auth-client';

export function UserProfile() {
  const { data, isPending } = useSession();

  if (isPending) return <p>Memuat...</p>;
  if (!data) return <p>Belum masuk.</p>;

  return <p>Masuk sebagai {data.user.email}</p>;
}
```

Logout:

```ts
import { authClient } from '@/lib/auth-client';

await authClient.signOut();
```

## Mengaktifkan social login

Social login sengaja dikirim sebagai blok terkomentari di `src/lib/auth.ts` karena kredensialnya spesifik per proyek:

```ts
// src/lib/auth.ts
socialProviders: {
  google: {
    clientId: env.GOOGLE_CLIENT_ID!,
    clientSecret: env.GOOGLE_CLIENT_SECRET!,
  },
},
```

Buka komentar provider yang dipakai, isi kredensialnya di `.env` (dari console Google Cloud / GitHub OAuth App), lalu restart dev server. Callback URL yang didaftarkan ke provider adalah `<BETTER_AUTH_URL>/api/auth/callback/<provider>`.

## Menambah plugin Better Auth

Plugin seperti `admin`, `organization`, atau `twoFactor` dipasang di dua sisi: opsi `plugins` di `src/lib/auth.ts` dan `plugins` di `src/lib/auth-client.ts`. Setiap plugin menambah kolom atau tabel baru, jadi regenerate skemanya lalu push:

```bash
bunx @better-auth/cli generate --output src/db/auth-schema.ts
bun run db:push
```

## Catatan teknis

- Sesi disimpan di tabel `session` (database-first) dengan cookie httpOnly; tidak ada JWT yang menyimpan data user.
- Proteksi route dievaluasi di `proxy.ts` melalui array `protectedRoutes`; menambah halaman terproteksi cukup mengedit satu baris, tanpa guard per halaman.
- Endpoint auth berada di `/api/auth/*`, sehingga ikut rate limiting 100 request per 15 menit dari proxy middleware. Naikkan bila perlu, atau kecualikan path auth dari rate limiter di `proxy.ts` sesuai kebutuhan.
- Verifikasi email dimatikan secara default. Aktifkan `requireEmailVerification` di `auth.ts` setelah Anda menyediakan pengirim email, lalu tambahkan handler `emailVerification.sendVerificationEmail`.
- Karena skema auth hidup di `src/db/auth-schema.ts` terpisah dari `schema.ts`, regenerate plugin tidak pernah menimpa tabel aplikasi Anda.
