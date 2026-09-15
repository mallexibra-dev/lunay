---
title: Klien API
description: Instance Axios dengan interceptor dan method bertipe.
order: 1
---

## apiClient

`src/lib/axios.ts` mengekspor instance siap pakai:

```ts
import { apiClient } from '@/lib/axios';

const posts = await apiClient.get<Post[]>('/posts');
const created = await apiClient.post<Post>('/posts', { title: 'Halo' });
await apiClient.put(`/posts/${id}`, data);
await apiClient.patch(`/posts/${id}`, data);
await apiClient.delete(`/posts/${id}`);
await apiClient.upload<Media>('/upload', formData);
```

Konfigurasi default:

- `baseURL`: `NEXT_PUBLIC_API_URL`, atau `http://localhost:3000/api` jika tidak diset
- `timeout`: 30 detik
- `Content-Type`: `application/json`

## Interceptor

- **Request** — menempelkan `Authorization: Bearer <token>` jika ada token di `localStorage` (kunci `auth_token`), serta mencatat waktu mulai request.
- **Response** — menghitung durasi panggilan, dan menangani error per status: 401 menghapus token tersimpan, 403/404/429/500 dicatat ke console.

Kelola token dengan helper yang tersedia:

```ts
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/axios';

setAuthToken(token); // simpan setelah login
clearAuthToken(); // hapus saat logout
```

## Instance kedua untuk backend lain

```ts
import { createApiClient } from '@/lib/axios';

export const paymentApi = createApiClient({
  baseURL: 'https://payment.example.com',
  timeout: 10000,
});
```

## Route handler di sisi server

Untuk respons API internal, jangan membangun JSON manual — gunakan wrapper `api`/`success`/`apiError` dari `src/lib/api-utils.ts` seperti pada [Routing](/docs/fundamental/routing#route-handler-api), sehingga bentuk respons dan penanganan error seragam dengan yang diharapkan interceptor.
