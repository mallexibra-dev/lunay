---
title: React Query
description: Mengambil dan menyimpan state server dengan TanStack React Query.
order: 4
---

## Sudah terpasang global

`QueryClientProvider` membungkus aplikasi di `app/layout.tsx` (dengan DevTools yang hanya tampil di development). Konfigurasi defaultnya ada di `src/lib/query-client.ts`:

```ts
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // satu percobaan ulang sebelum dianggap gagal
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // data dianggap segar selama 5 menit
    },
  },
});
```

Artinya: query gagal diulang satu kali, pindah tab tidak memicu fetch ulang, dan data yang masih segar (di bawah 5 menit) langsung dipakai dari cache tanpa request baru.

## useQuery

`useQuery` adalah hook untuk **membaca** state server: data yang hidup di backend seperti daftar produk, profil pengguna, atau statistik. Yang diurusnya: caching per `queryKey`, deduplikasi (beberapa komponen yang meminta key sama hanya memicu satu request), retry saat gagal, refetch otomatis saat data basi, dan siklus status siap pakai (`isPending`, `isError`, `isSuccess`). Komponen Anda cukup merender hasilnya.

Pola yang dipakai di proyek Codasia: bungkus setiap query sebagai hook kustom di `src/hooks/` agar komponen tetap bersih dan query bisa dipakai ulang:

```ts
// src/hooks/use-posts.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export type Post = { id: number; title: string; body: string };

export function usePosts(page = 1) {
  return useQuery({
    queryKey: ['posts', { page }],
    queryFn: () => apiClient.get<Post[]>('/posts', { page, limit: 10 }),
  });
}
```

Pemakaian di komponen:

```tsx
'use client';

import { usePosts } from '@/hooks/use-posts';

export function PostList() {
  const { data, isPending, isError, error } = usePosts();

  if (isPending) return <p>Memuat...</p>;
  if (isError) return <p>Gagal: {error.message}</p>;

  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

Perbedaan status yang penting:

- **`isPending`**: belum ada data sama sekali (fetch pertama).
- **`isFetching`**: sedang ada request, tetapi data lama bisa tetap ditampilkan. Gunakan ini untuk indikator refresh halus.
- **`isError` / `error`**: query gagal setelah retry habis.

## useMutation

Kalau `useQuery` untuk membaca, `useMutation` untuk **menulis**: membuat, mengubah, atau menghapus data di server (POST/PUT/PATCH/DELETE). Karakteristiknya berbeda dari query:

- Hasil mutation **tidak di-cache** dan **tidak diulang otomatis**. Setiap klik tombol simpan memang harus benar-benar menembak server, jadi tidak ada cache yang relevan.
- Status yang tersedia: `isPending` saat request berjalan, `isError`/`error` saat gagal, `isSuccess`/`data` saat berhasil, dan `variables` yang menyimpan payload terakhir yang dikirim.
- Callback `onSuccess`, `onError`, dan `onSettled` adalah tempat efek samping: toast, reset form, dan invalidasi query terkait.

Kebiasaan wajib di proyek Codasia: setelah mutation berhasil, `invalidateQueries` setiap kunci data yang terdampak supaya cache klien kembali sinkron dengan server. Contoh di bawah membatalkan semua query berawalan `posts`:

```ts
// src/hooks/use-create-post.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import type { Post } from './use-posts';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPost: { title: string; body: string }) =>
      apiClient.post<Post>('/posts', newPost),
    onSuccess: (post) => {
      toast.success(`Postingan "${post.title}" dibuat`);
      // invalidasi agar daftar mengambil data terbaru
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      toast.error('Gagal membuat postingan');
    },
  });
}
```

Pemakaiannya bersama form:

```tsx
'use client';

import { useCreatePost } from '@/hooks/use-create-post';

export function NewPostForm() {
  const createPost = useCreatePost();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        createPost.mutate({
          title: String(form.get('title')),
          body: String(form.get('body')),
        });
      }}
    >
      <input name='title' required />
      <textarea name='body' required />
      <button type='submit' disabled={createPost.isPending}>
        {createPost.isPending ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}
```

### mutate atau mutateAsync

- `mutate(...)` tidak mengembalikan Promise; hasilnya ditangani lewat callback `onSuccess`/`onError` (yang diteruskan saat memanggil, atau yang didefinisikan di hook). Ini pilihan default di komponen karena tidak bisa menimbulkan unhandled rejection.
- `await mutateAsync(...)` mengembalikan Promise dan melempar error saat gagal. Cocok bila langkah berikutnya harus menunggu selesai (mis. redirect), atau Anda ingin `try/catch` di tempat yang sama.

```ts
const createPost = useCreatePost();

// Gaya callback
createPost.mutate(payload, {
  onSuccess: () => router.push('/posts'),
});

// Gaya async
try {
  await createPost.mutateAsync(payload);
  router.push('/posts');
} catch {
  // kegagalan ditangani di sini
}
```

## Aturan queryKey

- Susun dari umum ke spesifik: `['posts']`, `['posts', { page }]`, `['posts', id]`.
- Sertakan semua parameter yang mengubah hasil; bila tidak, dua pemanggilan berbeda akan berbagi cache yang salah.
- `invalidateQueries({ queryKey: ['posts'] })` membatalkan semua kunci berawalan `posts`, termasuk `['posts', { page: 2 }]`.

## Query bergantung

Aktifkan query kedua hanya setelah data pertama siap:

```ts
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: () => apiClient.get<User>(`/users/${email}`),
});

const { data: posts } = useQuery({
  queryKey: ['posts', { author: user?.id }],
  queryFn: () => apiClient.get<Post[]>(`/users/${user!.id}/posts`),
  enabled: Boolean(user?.id), // jangan jalan sebelum user ada
});
```

## DevTools

Saat `bun run dev`, tombol React Query muncul di pojok layar. Dari sana Anda bisa melihat isi cache setiap queryKey, statusnya, dan memicu fetch ulang manual. Sangat membantu untuk memverifikasi apakah `staleTime` dan invalidasi berjalan sesuai harapan.
