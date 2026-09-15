---
title: Testing
description: Vitest, React Testing Library, dan struktur penulisan test.
order: 1
---

## Perangkat

- **Vitest** sebagai test runner (globals sudah aktif, tidak perlu impor `describe`/`it` — tetap dianjurkan untuk autocomplete tipe)
- **jsdom** sebagai environment agar bisa merender komponen
- **React Testing Library** + **jest-dom** (matcher seperti `toBeInTheDocument()` diaktifkan lewat `src/test/setup.ts`)
- **MSW** tersedia untuk mocking API (lihat `src/test/mocks/`)

## Struktur

```
src/test/
├── components/     # test komponen UI
├── lib/            # test utilitas (cn, formatter)
├── mocks/          # handler & server MSW
└── setup.ts        # dijalankan sebelum semua test
```

## Menulis test

```tsx
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
});
```

## Menjalankan

```bash
bun run test          # mode watch saat development
bun run test:run      # sekali jalan (dipakai di CI)
bun run test:ui       # antarmuka browser
bun run test:coverage # laporan coverage
```

Test dijalankan dengan pool `threads` (bukan `forks`) karena lebih stabil di Windows — pengaturan ini ada di `vitest.config.ts`.

## Kebiasaan yang dianjurkan

- Satu file test per unit: komponen di `src/test/components/`, utilitas di `src/test/lib/`.
- Gunakan `userEvent` alih-alih `fireEvent` untuk interaksi yang menyerupai pengguna asli.
- Query berdasarkan peran aksesibilitas (`getByRole`, `getByLabelText`) — lebih tahan refactor daripada `getByTestId`.
