---
title: React Query
description: Mengambil dan menyimpan state server dengan TanStack React Query.
order: 4
---

## Sudah terpasang global

`QueryClientProvider` sudah membungkus aplikasi di `app/layout.tsx` (dengan DevTools yang hanya tampil di development). Konfigurasi default di `src/lib/query-client.ts`:

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // data dianggap segar 5 menit
    },
  },
});
```

## useQuery

Gabungkan dengan `apiClient` dari [klien API](/docs/data-fetching/axios):

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

type Post = { id: number; title: string };

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => apiClient.get<Post[]>('/posts'),
  });
}

// di komponen
const { data, isPending, isError, error } = usePosts();
```

## useMutation

```tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPost: { title: string }) =>
      apiClient.post<Post>('/posts', newPost),
    onSuccess: () => {
      // invalidasi agar daftar mengambil data terbaru
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

## Tips

- Susun hook kustom seperti di atas di `src/hooks/` — komponen tetap bersih.
- Kunci query (`queryKey`) harus unik dan deskriptif; sertakan parameter: `['posts', { page }]`.
- Untuk data yang jarang berubah, `staleTime` default 5 menit sudah mengurangi request berulang.
