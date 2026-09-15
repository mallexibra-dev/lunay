---
title: Form & Validasi
description: React Hook Form + Zod dengan komponen Form dari shadcn.
order: 1
---

## 1. Buat skema Zod

Letakkan skema di `src/validations/`:

```ts
// src/validations/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.email('Email tidak valid'),
  role: z.enum(['admin', 'member']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

## 2. Hubungkan dengan useForm

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createUserSchema, type CreateUserInput } from '@/validations/user';

export function CreateUserForm() {
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', role: 'member' },
  });

  const onSubmit = (values: CreateUserInput) => {
    // kirim ke API, mis. via useMutation
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder='Nama lengkap' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Simpan</Button>
      </form>
    </Form>
  );
}
```

## Kenapa pola ini

- **Satu skema, dua sisi** — Zod memvalidasi form di klien dan bisa dipakai ulang di route handler untuk memvalidasi body request.
- **Pesan error otomatis** — `FormMessage` menampilkan pesan dari skema tanpa kode tambahan.
- **Type-safe** — `z.infer` menjamin tipe form dan tipe payload API tidak pernah berbeda.
