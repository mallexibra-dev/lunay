---
title: Logging & Middleware
description: Winston logging dan proxy middleware bawaan.
order: 6
---

## Logger (Winston)

`src/lib/logger.ts` menyiapkan logger dengan output:

- `logs/error.log` — khusus level error
- `logs/combined.log` — semua log
- Console berwarna (hanya development)

Level log: `info` di produksi, `debug` di lingkungan lain. Rotasi otomatis per 5 MB, maksimal 5 file.

```ts
import { logger } from '@/lib/logger';

logger.info('Pesan umum', { userId: 1 });
logger.error('Ada yang gagal', new Error('contoh'));
```

Helper siap pakai agar format log seragam:

| Helper                                               | Fungsi                               |
| ---------------------------------------------------- | ------------------------------------ |
| `logApiRequest(req, startTime?)`                     | Catat request masuk                  |
| `logApiResponse(req, res, startTime)`                | Catat respons + durasi               |
| `logApiError(req, error, status?)`                   | Catat error API                      |
| `logDatabaseOperation(op, table, duration?, error?)` | Catat operasi database               |
| `logSecurityEvent(event, details, ip?)`              | Catat kejadian keamanan              |
| `logPerformance(op, duration, details?)`             | Catat performa (warn jika > 1 detik) |

## Proxy middleware

`src/proxy.ts` adalah middleware Next.js 16 (pengganti `middleware.ts`) yang membungkus setiap request:

1. **Security header** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
2. **Rate limiting** untuk `/api/*` — 100 request per 15 menit per IP+path, melebihi itu mendapat `429` dengan header `X-RateLimit-*`. Penyimpanannya di memori; untuk deployment multi-instance, ganti dengan Redis.
3. **CORS** untuk `/api/*` — hanya origin di daftar `allowedOrigins` yang diberi header CORS. Sesuaikan daftar tersebut saat deploy:

```ts
const allowedOrigins = [
  'http://localhost:3000',
  'https://yourdomain.com', // ganti dengan domain produksi Anda
];
```

4. **Logging otomatis** — setiap request dan durasinya dicatat lewat helper di atas.

File statis (`_next/static`, `_next/image`, `favicon.ico`, `public`) dikecualikan lewat `config.matcher`.
