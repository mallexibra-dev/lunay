---
title: Klien API
description: Instance Axios dengan interceptor dan method bertipe.
order: 1
---

## apiClient

`src/lib/axios.ts` mendefinisikan class `ApiClient` dan mengekspor instance siap pakai:

```ts
import { apiClient } from '@/lib/axios';

const posts = await apiClient.get<Post[]>('/posts');
const created = await apiClient.post<Post>('/posts', { title: 'Halo' });
const updated = await apiClient.put<Post>(`/posts/${id}`, data);
const patched = await apiClient.patch<Post>(`/posts/${id}`, data);
await apiClient.delete(`/posts/${id}`);
const media = await apiClient.upload<Media>('/upload', formData);
```

Semua method mengembalikan `response.data` langsung (bukan objek `AxiosResponse`), dengan generic untuk menentukan tipe hasilnya.

Konfigurasi default:

| Opsi           | Nilai                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| `baseURL`      | `NEXT_PUBLIC_API_URL`, atau `http://localhost:3000/api` bila tidak diset |
| `timeout`      | 30000 ms (30 detik)                                                      |
| `Content-Type` | `application/json`                                                       |

Ada juga `apiClient.request()` untuk kasus khusus, dan `getAxiosInstance()` bila Anda butuh instance Axios mentah (mis. untuk interceptor tambahan).

## Interceptor

**Request interceptor** menempelkan header `Authorization: Bearer <token>` bila ada token di `localStorage` (kunci `auth_token`), dan mencatat waktu mulai request:

```ts
this.instance.interceptors.request.use((config) => {
  const token = this.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { startTime: new Date() };
  return config;
});
```

**Response interceptor** mencatat durasi panggilan di console, lalu menangani error per status:

| Status | Perlakuan otomatis                           |
| ------ | -------------------------------------------- |
| 401    | Token di `localStorage` dihapus (sesi habis) |
| 403    | Dicatat: akses ditolak                       |
| 404    | Dicatat: resource tidak ditemukan            |
| 429    | Dicatat: rate limit terlampaui               |
| 500    | Dicatat: server error                        |

Error tanpa respons (koneksi putus) dan error konfigurasi request juga dicatat dengan pesan berbeda.

## Kelola token

Helper yang tersedia di `src/lib/axios.ts`:

```ts
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/axios';

setAuthToken(token); // simpan setelah login
getAuthToken(); // baca token saat ini, null bila belum ada
clearAuthToken(); // hapus saat logout
```

Contoh alur login:

```ts
const { token } = await apiClient.post<{ token: string }>('/auth/login', {
  email,
  password,
});
setAuthToken(token);
```

## Menangani error di komponen

Interceptor hanya mencatat; keputusan UI tetap di tangan Anda. Tangkap `AxiosError` dan baca respons dari server (formatnya dihasilkan helper `api-utils`):

```ts
import axios from 'axios';
import { apiClient } from '@/lib/axios';

try {
  await apiClient.post('/posts', body);
} catch (err) {
  if (axios.isAxiosError(err)) {
    const { success, message, errors } = err.response?.data ?? {};
    // tampilkan message/errors ke pengguna
  } else {
    // error di luar HTTP
  }
}
```

## Upload file

```ts
const formData = new FormData();
formData.append('file', fileInput.files![0]);

const result = await apiClient.upload<{ url: string }>('/upload', formData);
```

Method `upload` otomatis mengganti `Content-Type` menjadi `multipart/form-data`.

## Instance kedua untuk backend lain

```ts
import { createApiClient } from '@/lib/axios';

export const paymentApi = createApiClient({
  baseURL: 'https://payment.example.com',
  timeout: 10000,
  headers: { 'X-Client': 'website-starter' },
});
```

Instance hasil `createApiClient` mendapat interceptor yang sama (token dan penanganan error), hanya konfigurasinya berbeda.

## Route handler di sisi server

Untuk respons API internal, jangan membangun JSON manual. Gunakan wrapper `api`/`success`/`apiError` dari `src/lib/api-utils.ts` seperti pada [Routing](/docs/fundamental/routing#route-handler-api), sehingga bentuk respons seragam dengan yang diharapkan penanganan error di klien.
