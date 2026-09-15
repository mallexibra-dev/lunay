---
title: Struktur Proyek
description: Penjelasan struktur folder dan konvensi starter kit.
order: 2
---

## Struktur folder

```
website-starter/
├── app/                  # Route (App Router)
├── src/
│   ├── components/       # Komponen (ui/ = shadcn, layouts/)
│   ├── db/               # Skema dan koneksi Drizzle
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilitas inti (axios, logger, dll)
│   ├── styles/           # globals.css dan variables.css
│   ├── types/            # Tipe TypeScript bersama
│   ├── utils/            # Helper kecil
│   └── validations/      # Skema Zod
├── docs/                 # Sumber markdown untuk halaman /docs
└── drizzle.config.ts
```

## Konvensi

- Komponen UI dari shadcn berada di `src/components/ui`.
- Alias `@/` menunjuk ke folder `src/`.
- Halaman dokumentasi ini juga berupa file markdown di folder `docs/`.
