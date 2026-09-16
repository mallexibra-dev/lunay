---
title: Logging & Middleware
description: Winston logging dan proxy middleware bawaan.
order: 7
---

## Logger (Winston)

`src/lib/logger.ts` menyiapkan logger Winston dengan output:

| Output              | Isi                              | Rotasi                |
| ------------------- | -------------------------------- | --------------------- |
| `logs/error.log`    | Khusus level `error`             | 5 MB per file, maks 5 |
| `logs/combined.log` | Semua level                      | 5 MB per file, maks 5 |
| Console             | Berwarna, hanya saat development | tidak berlaku         |

Level minimum: `info` di produksi, `debug` di lingkungan lain. Folder `logs/` dibuat otomatis bila belum ada, dan setiap entri punya `timestamp` serta `defaultMeta` berisi nama service dan environment.

```ts
import { logger } from '@/lib/logger';

logger.info('Pesan umum', { userId: 1 });
logger.error('Ada yang gagal', new Error('contoh'));
```

Helper siap pakai agar format log seragam:

| Helper                                               | Fungsi                                 |
| ---------------------------------------------------- | -------------------------------------- |
| `logApiRequest(req, startTime?)`                     | Catat request masuk                    |
| `logApiResponse(req, res, startTime)`                | Catat respons + durasi                 |
| `logApiError(req, error, status?)`                   | Catat error API                        |
| `logDatabaseOperation(op, table, duration?, error?)` | Catat operasi database                 |
| `logAuthEvent(event, userId?, email?, ip?, error?)`  | Catat kejadian autentikasi             |
| `logSecurityEvent(event, details, ip?)`              | Catat kejadian keamanan                |
| `logPerformance(op, duration, details?)`             | Catat performa (warn jika > 1 detik)   |
| `logEvent(event, details)`                           | Catat aksi pengguna/peristiwa aplikasi |

Contoh pemakaian di route handler:

```ts
import { logDatabaseOperation } from '@/lib/logger';
import { getDb } from '@/db';
import { users } from '@/db/schema';

const start = Date.now();
try {
  const rows = await getDb().select().from(users);
  logDatabaseOperation('select', 'users', Date.now() - start);
  return rows;
} catch (error) {
  logDatabaseOperation('select', 'users', Date.now() - start, error);
  throw error;
}
```

Format outputnya JSON terstruktur (di file) sehingga mudah dicari dan diparse oleh pengumpul log nantinya:

```json
{
  "level": "info",
  "message": "Database Operation",
  "service": "codasia-web-starter",
  "environment": "production",
  "type": "database_operation",
  "operation": "select",
  "table": "users",
  "duration": 12,
  "timestamp": "2026-01-01 10:00:00"
}
```

Untuk kebutuhan lain (mengirim ke Loki, Datadog, dsb.), tambahkan transport baru di `src/lib/logger.ts`:

```ts
logger.add(new winston.transports.Http({ host: 'log-collector', port: 80 }));
```

## Proxy middleware

`proxy.ts` di root proyek adalah middleware Next.js 16 (pengganti `middleware.ts`) yang membungkus setiap request. Posisinya wajib sejajar dengan folder `app/`: karena starter ini menaruh `app/` di root (bukan `src/app/`), Next.js hanya mengenali `proxy.ts` di root proyek. File bernama sama di dalam `src/` diabaikan tanpa error, jadi periksa baris `Proxy (Middleware)` pada output `bun run build` bila ragu:

1. **Security header** pada semua respons: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, dan `Referrer-Policy: strict-origin-when-cross-origin`.
2. **Rate limiting** untuk `/api/*`: 100 request per 15 menit per kombinasi IP+path. Melebihi itu mendapat `429` dengan body `{ success: false, message: 'Too many requests' }`.
3. **CORS** untuk `/api/*`: hanya origin di daftar `allowedOrigins` yang diberi header CORS (`Allow-Origin`, `Allow-Methods`, `Allow-Headers`, `Allow-Credentials`). Request `OPTIONS` dijawab langsung dengan `200`.
4. **Logging otomatis**: setiap request dicatat `logger.info('Proxy request', ...)`, request `/api/*` dicatat lagi lewat `logApiRequest`, dan durasi total dicatat lewat `logPerformance`.

Header rate limit yang terpasang pada respons API yang lolos:

| Header                  | Isi                                    |
| ----------------------- | -------------------------------------- |
| `X-RateLimit-Limit`     | 100                                    |
| `X-RateLimit-Remaining` | Sisa kuota pada jendela waktu berjalan |
| `X-RateLimit-Reset`     | Timestamp jendela direset              |

Sesuaikan daftar origin saat deploy:

```ts
// proxy.ts
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourdomain.com', // ganti dengan domain produksi Anda
];
```

File statis (`_next/static`, `_next/image`, `favicon.ico`, `public`) dikecualikan lewat `config.matcher`.

## Batasan dan upgrade path

- Penyimpanan rate limit berupa `Map` di memori proses. Valid untuk satu instance; untuk beberapa replica pindahkan ke Redis atau penyimpanan bersama lain agar hitungan terbagi rata.
- File log hidup di disk instance yang sama. Di serverless keduanya tidak persisten; arahkan transport ke layanan log eksternal bila membutuhkan riwayat.
