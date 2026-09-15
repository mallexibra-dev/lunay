---
title: Komponen UI
description: Memakai, menambah, dan menulis komponen shadcn/ui.
order: 5
---

## Komponen yang tersedia

Semua komponen shadcn/ui berada di `src/components/ui` (53 komponen). Kodenya milik proyek Anda sendiri, bebas dimodifikasi, dan seluruhnya berbasis token tema sehingga otomatis ikut mode terang/gelap.

| Kategori          | Komponen                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tombol & navigasi | `button`, `button-group`, `toggle`, `toggle-group`, `breadcrumb`, `pagination`, `navigation-menu`, `menubar`, `dropdown-menu`, `context-menu`, `sidebar` |
| Form & input      | `input`, `input-group`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `input-otp`, `label`, `form`, `field`, `calendar`           |
| Overlay & popup   | `dialog`, `alert-dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `hover-card`, `command`                                                               |
| Feedback          | `sonner` (toast), `alert`, `progress`, `skeleton`, `spinner`, `empty`                                                                                    |
| Tampilan data     | `table`, `card`, `badge`, `avatar`, `separator`, `tabs`, `accordion`, `collapsible`, `scroll-area`, `aspect-ratio`, `item`, `kbd`                        |
| Lainnya           | `carousel`, `chart`, `resizable`                                                                                                                         |

## Cara pakai

Impor langsung dari pathnya:

```tsx
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengumuman</CardTitle>
        <CardDescription>
          Pembaruan sistem malam ini pukul 22.00.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex gap-2'>
        <Button>Setuju</Button>
        <Button variant='outline'>Nanti</Button>
      </CardContent>
    </Card>
  );
}
```

Setiap komponen punya beberapa varian yang dikontrol lewat prop. Contoh pada Button:

```tsx
<Button variant='default'>Default</Button>
<Button variant='secondary'>Secondary</Button>
<Button variant='destructive'>Hapus</Button>
<Button variant='outline'>Outline</Button>
<Button variant='ghost'>Ghost</Button>
<Button variant='link'>Link</Button>

<Button size='sm'>Kecil</Button>
<Button size='lg'>Besar</Button>
<Button size='icon' aria-label='Tutup' />
```

## Menambah komponen baru

Gunakan CLI shadcn; komponen ditulis ke `src/components/ui` dan dependensinya dipasang otomatis:

```bash
bunx shadcn@latest add checkbox
```

Perhatikan bahwa komponen yang ditambahkan mungkin butuh komponen lain (mis. `form` butuh `label`); CLI mengurusnya sekalian.

## Menulis komponen sendiri

Ikat class Tailwind lewat `cn()` supaya prop `className` dari pemakai selalu bisa menimpa default:

```tsx
import { cn } from '@/lib/utils';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

export function Panel({ title, className, ...props }: PanelProps) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card p-4', className)}
      {...props}
    >
      <h3 className='text-sm font-semibold text-card-foreground'>{title}</h3>
    </div>
  );
}
```

Letakkan komponen umum di `src/components/` (di luar `ui/` bila bukan hasil CLI), dan ikuti pola komponen shadcn yang ada sebagai referensi gaya.

## Menggabungkan class

Semua komponen memakai `cn()` untuk class kondisional. Pakai juga di kode Anda supaya konflik class Tailwind tertangani otomatis. Detailnya di [Styling & Tema](/docs/fundamental/styling#menggabungkan-class).
