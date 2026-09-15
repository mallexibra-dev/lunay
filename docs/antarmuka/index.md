---
title: Komponen UI
description: Memakai dan menambah komponen shadcn/ui.
order: 5
---

## Komponen yang tersedia

Semua komponen shadcn/ui berada di `src/components/ui` — sudah tersedia lebih dari 50 komponen: `button`, `card`, `dialog`, `dropdown-menu`, `table`, `tabs`, `form`, `toast` (sonner), dan lainnya. Lihat isinya langsung di folder tersebut; setiap komponen adalah milik proyek Anda dan bebas dimodifikasi.

## Cara pakai

Impor langsung dari pathnya:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Halo</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant='outline'>Klik saya</Button>
      </CardContent>
    </Card>
  );
}
```

## Menambah komponen baru

Gunakan CLI shadcn — komponen akan ditulis ke `src/components/ui` dan dependensinya disesuaikan:

```bash
bunx shadcn@latest add checkbox
```

## Menggabungkan class

Semua komponen memakai `cn()` untuk class kondisional. Pakai juga di kode Anda supaya konflik class Tailwind tertangani otomatis — detailnya di [Styling & Tema](/docs/fundamental/styling#menggabungkan-class).
