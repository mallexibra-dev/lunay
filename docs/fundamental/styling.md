---
title: Styling & Tema
description: Tailwind CSS v4, token warna, dark mode, dan penggabungan class.
order: 3
---

## Tailwind v4 tanpa file config

Proyek ini memakai Tailwind CSS v4 yang dikonfigurasi lewat CSS, bukan `tailwind.config.ts`:

```css
/* src/styles/globals.css */
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  /* ...token lain */
}
```

Class utility dipakai langsung di komponen, dan urutannya dirapikan otomatis oleh `prettier-plugin-tailwindcss` saat `bun run format`.

## Token tema di :root dan .dark

Warna dan radius didefinisikan sebagai variabel OKLCH dengan dua blok: nilai default (terang) di `:root` dan gelap di `.dark`, semuanya di `src/styles/globals.css`:

| Token                            | Dipakai untuk                     |
| -------------------------------- | --------------------------------- |
| `background` / `foreground`      | Latar halaman dan teks utama      |
| `primary` / `primary-foreground` | Warna aksi utama (tombol, tautan) |
| `secondary`, `muted`, `accent`   | Warna pendukung dan teks redup    |
| `card`, `popover`                | Permukaan kartu dan dropdown      |
| `destructive`                    | Aksi berbahaya (hapus, error)     |
| `border`, `input`, `ring`        | Garis pembatas dan fokus          |
| `radius`                         | Sudut melengkung seluruh komponen |

Mengubah satu variabel mengubah seluruh aplikasi. Contoh: ganti warna merek dengan mengubah `--primary` di kedua blok:

```css
:root {
  --primary: oklch(0.55 0.18 255); /* biru, mode terang */
}

.dark {
  --primary: oklch(0.7 0.15 255); /* biru lebih terang, mode gelap */
}
```

## Dark mode (sudah terpasang)

Mode gelap diatur oleh `next-themes`. Di `app/layout.tsx`, `ThemeProvider` sudah membungkus aplikasi dengan konfigurasi berikut:

```tsx
<html lang='en' suppressHydrationWarning>
  <body>
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
```

Tema aktif tersimpan sebagai class `dark` pada `<html>` (dipilih `light`, `dark`, atau mengikuti sistem), dan pilihan pengguna diingat di `localStorage`. `suppressHydrationWarning` diperlukan agar React tidak memprotes class yang ditambahkan sebelum hidrasi.

Di halaman `/docs`, tombol ikon matahari/bulan di header (di sebelah tombol pencarian) berpindah antara mode terang dan gelap. Implementasinya di `app/docs/_components/theme-toggle.tsx`:

```tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className='size-4 dark:hidden' />
      <Moon className='hidden size-4 dark:inline' />
    </button>
  );
};
```

Tiga cara menerapkan tema di kode Anda sendiri:

```tsx
// 1. Varian dark: pada class Tailwind
<div className='bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100' />

// 2. Token tema, otomatis ikut mode tanpa varian dark:
<div className='bg-background text-foreground' />
<div className='bg-card border-border' />

// 3. Hook useTheme untuk tombol atau logika kustom
'use client';
import { useTheme } from 'next-themes';

function StatusTema() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme('light')}>Tema sekarang: {theme}</button>;
}
```

Komponen shadcn/ui di `src/components/ui` seluruhnya berbasis token, jadi semuanya ikut gelap tanpa perubahan apa pun.

## Class kustom

Class kustom didefinisikan di `globals.css`. Contoh di starter kit:

```css
/* Utility baru dengan sintaks @utility (Tailwind v4) */
@utility no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* Class biasa untuk pola berulang */
.docs-prose :where(ul, ol) :where(ul, ol) {
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
}
```

## Menggabungkan class

Selalu pakai `cn()` (clsx + tailwind-merge) untuk class kondisional agar konflik utility terselesaikan:

```tsx
import { cn } from '@/lib/utils';

<div
  className={cn(
    'rounded-lg border p-4',
    isActive && 'border-primary bg-primary/10',
    className
  )}
/>;
```

Jika `className` dari luar berisi `p-8` sementara komponen sudah punya `p-4`, `tailwind-merge` otomatis memilih `p-8` sebagai pemenang.
