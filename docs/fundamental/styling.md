---
title: Styling & Tema
description: Tailwind CSS v4, token warna, dan mode terang/gelap.
order: 3
---

## Tailwind v4 tanpa file config

Proyek ini memakai Tailwind CSS v4 yang dikonfigurasi lewat CSS, bukan `tailwind.config.ts`:

```css
/* src/styles/globals.css */
@import 'tailwindcss';
@import 'tw-animate-css';
@import './variables.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  /* ...token lain */
}
```

Class utility dipakai langsung di komponen, dan urutannya dirapikan otomatis oleh `prettier-plugin-tailwindcss` saat `bun run format`.

## Token tema di variables.css

Warna dan radius didefinisikan sebagai variabel OKLCH dalam `src/styles/variables.css` dengan dua blok: nilai default (terang) dan `.dark` (gelap). Utilitas seperti `bg-primary`, `text-muted-foreground`, atau `border-border` membaca token ini, jadi mengubah satu variabel mengubah seluruh aplikasi.

## Dark mode

Mode gelap diaktifkan dengan menambahkan class `dark` pada `<html>`. Package `next-themes` sudah terinstal — jika ingin mode toggle otomatis, bungkus aplikasi dengan `ThemeProvider` dari `next-themes` di `app/layout.tsx` dan set `attribute="class"`.

## Class kustom

Class kustom didefinisikan di `globals.css`. Contoh di starter kit: `.docs-prose` untuk kerapian list bertingkat pada halaman markdown. Untuk class utilitas kecil, gunakan pola `@layer utilities`.

## Menggabungkan class

Selalu pakai `cn()` (clsx + tailwind-merge) untuk class kondisional agar konflik utility terselesaikan:

```tsx
import { cn } from '@/lib/utils';

<div className={cn('p-4', isActive && 'bg-primary text-primary-foreground')} />;
```
