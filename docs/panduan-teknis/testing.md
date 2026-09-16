---
title: Testing
description: Vitest, React Testing Library, MSW, dan struktur penulisan test.
order: 1
---

## Perangkat

- **Vitest** sebagai test runner; `globals: true` membuat `describe`/`it`/`expect` tersedia tanpa impor (tetap dianjurkan mengimpor dari `vitest` agar autocomplete tipenya jalan).
- **jsdom** sebagai environment agar komponen bisa dirender seperti di browser.
- **React Testing Library** + **jest-dom**; matcher seperti `toBeInTheDocument()` diaktifkan lewat `src/test/setup.ts`.
- **MSW** terinstal untuk mocking API. File `src/test/mocks/handlers.ts` dan `server.ts` masih template kosong; cara mengisinya ada di bawah.

## Konfigurasi

`vitest.config.ts` menentukan environment, setup, alias, dan coverage:

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'threads', // 'threads' lebih stabil daripada 'forks' (default) di Windows
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'drizzle/',
        '.next/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
```

## Struktur

```
src/test/
├── components/     # test komponen UI
├── lib/            # test utilitas (cn, formatter)
├── mocks/          # handler & server MSW
└── setup.ts        # dijalankan sebelum semua test
```

## Menulis test komponen

```tsx
// src/test/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Klik' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button disabled>Klik</Button>);
    expect(screen.getByRole('button', { name: 'Klik' })).toBeDisabled();
  });
});
```

## Menambahkan MSW

Isi `src/test/mocks/handlers.ts` dengan endpoint yang ingin dimock:

```ts
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/posts', () =>
    HttpResponse.json({
      success: true,
      message: 'OK',
      data: [{ id: 1, title: 'Halo' }],
    })
  ),
];
```

Lalu hidupkan server di `src/test/mocks/server.ts`:

```ts
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

Dan pasang di `src/test/setup.ts` agar setiap file test mendapat mock yang bersih:

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Dengan pola ini, hook React Query yang memanggil `apiClient` bisa dites tanpa server sungguhan.

## Menjalankan

```bash
bun run test          # mode watch saat development
bun run test:run      # sekali jalan (dipakai di CI)
bun run test:ui       # antarmuka browser
bun run test:coverage # laporan coverage
```

## Kebiasaan yang dianjurkan

- Satu file test per unit: komponen di `src/test/components/`, utilitas di `src/test/lib/`.
- Gunakan `userEvent` alih-alih `fireEvent` untuk interaksi yang menyerupai pengguna asli.
- Query berdasarkan peran aksesibilitas (`getByRole`, `getByLabelText`) supaya tahan refactor, bukan `getByTestId`.
- Untuk kode yang bergantung waktu, gunakan `vi.useFakeTimers()` agar test deterministik.
- Jalankan `bun run test:run` sebelum push; ini juga yang sebaiknya dipasang di CI.
