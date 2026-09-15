---
title: Form & Validasi
description: React Hook Form + Zod dengan komponen Form dari shadcn.
order: 1
---

## 1. Buat skema Zod

Letakkan skema di `src/validations/`, satu file per domain:

```ts
// src/validations/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.email('Email tidak valid'),
  role: z.enum(['admin', 'member'], 'Pilih salah satu peran'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

Satu skema ini nanti dipakai di dua tempat: resolver form di klien dan validator body request di server.

## 2. Hubungkan dengan useForm

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createUserSchema, type CreateUserInput } from '@/validations/user';
import { useCreateUser } from '@/hooks/use-create-user';

export function CreateUserForm() {
  const createUser = useCreateUser();

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', role: 'member' },
  });

  const onSubmit = (values: CreateUserInput) => {
    createUser.mutate(values, {
      onSuccess: () => {
        form.reset(); // kembali ke defaultValues
        toast.success('User dibuat');
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='max-w-md space-y-4'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder='Nama lengkap' {...field} />
              </FormControl>
              <FormDescription>Nama yang tampil di profil.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='nama@mail.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='role'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peran</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Pilih peran' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='member'>Member</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={createUser.isPending}>
          {createUser.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </Form>
  );
}
```

Struktur `FormItem > FormLabel + FormControl + FormMessage` yang mengikat ke `form.control` membuat label, error `aria-*`, dan pesan validasi tersambung otomatis tanpa kode tambahan.

## 3. Reuse skema di route handler

Skema yang sama memvalidasi body di server, sehingga aturan klien dan server tidak mungkin berbeda:

```ts
// app/api/users/route.ts
import { api, success, apiError, parseRequestBody } from '@/lib/api-utils';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { createUserSchema } from '@/validations/user';

export const POST = api.post(async (req) => {
  const body = await parseRequestBody(req);
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return apiError.validation(
      'Data tidak valid',
      parsed.error.flatten().fieldErrors
    );
  }

  const [created] = await getDb().insert(users).values(parsed.data).returning();

  return success(created, 'User dibuat', { status: 201 });
});
```

Hook `useCreateUser` yang dipakai form cukup membungkus `apiClient.post('/users', values)` dengan `useMutation` seperti pada [React Query](/docs/data-fetching#usemutation).

## Kenapa pola ini

- **Satu skema, dua sisi.** Zod memvalidasi form di klien dan body request di server dari definisi yang sama.
- **Pesan error otomatis.** `FormMessage` menampilkan pesan dari skema tanpa kode tambahan; pesan bahasa Indonesia ditulis langsung di skema.
- **Type-safe.** `z.infer` menjamin tipe form dan tipe payload API tidak pernah berbeda.
- **Status loading gratis.** `form.formState.isSubmitting` dan `mutation.isPending` tersedia tanpa state manual.

## Pola lain yang sering dibutuhkan

```tsx
// Set error server ke field tertentu
form.setError('email', { message: 'Email sudah dipakai' });

// Nilai form saat ini tanpa submit
form.getValues('name');

// Set nilai secara programatik
form.setValue('role', 'admin');

// Trigger validasi manual
await form.trigger('email');

// Form dalam dialog: reset saat ditutup
useEffect(() => {
  if (!open) form.reset();
}, [open, form]);
```
