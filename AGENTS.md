<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:component-organization-rules -->
# Component Organization

## Folder Structure Conventions

### `_components/`
Components yang **hanya digunakan di route/page tertentu saja**.
- Ditempatkan di folder yang sama dengan `page.tsx` atau di dalam folder route
- Contoh: `app/students/dashboard/_components/` atau `app/(auth)/auth/signin/_components/`
- Scope: lokal, tidak boleh di-import di luar route/feature tersebut

### `components/ui/`
Base components dari **shadcn/ui**.
- Hanya berisi komponen primitif/ui dasar (Button, Input, Card, dsb)
- Tidak mengandung business logic
- Dibuat melalui `npx shadcn@latest add <component>`

### `components/shared/`
Komponen yang **dipakai di banyak route/page**.
- Berisi komposisi dari `components/ui` dengan business logic
- Bisa di-import di mana saja
- Contoh: Header, Footer, Sidebar, Navigation, DataTable dengan logika spesifik

### `services/`
Data access dan server-side business logic per domain.
- Struktur folder: `services/<domain>/queries.ts` dan `services/<domain>/actions.ts`
- `<domain>` memakai lowercase plural name, contoh: `courses`, `submissions`, `certificates`
- `queries.ts` hanya untuk read-only database queries/data fetching
- `actions.ts` untuk mutation/write operation dan Server Actions (`"use server"`)
- Jangan taruh logic database/ORM (Prisma, Drizzle, dsb) langsung di `page.tsx` jika logic tersebut reusable atau mulai kompleks
- Contoh: `services/courses/queries.ts`, `services/courses/actions.ts`

### `schemas/`
Validation schemas menggunakan Zod.
- Semua file schema ditempatkan di root `schemas/`
- Naming convention: `<domain>.schema.ts`
- Berisi schema validasi input untuk query/action/form/API
- Tidak berisi database query atau business mutation
- Contoh: `schemas/course.schema.ts`, `schemas/submission.schema.ts`, `schemas/user.schema.ts`

### `types/`
Shared TypeScript types.
- Semua file type ditempatkan di root `types/`
- Naming convention: `<domain>.type.ts`
- Berisi type reusable, termasuk type hasil `z.infer` dari `schemas/`
- Tidak berisi runtime logic
- Contoh: `types/course.type.ts`, `types/submission.type.ts`, `types/user.type.ts`

### `lib/`
Utility functions dan helpers.
- Fungsi reusable tanpa side-effect (pure functions), kecuali singleton/wrapper seperti database/ORM client (Prisma, Drizzle, dsb)
- Contoh: formatters, validators, cn utility, API client wrappers
- Bisa di-import di mana saja

### `hooks/`
Custom React hooks.
- Reusable logic dengan state/side-effects
- Naming convention: `use` prefix (useAuth, useFetch, useLocalStorage)
- Contoh: useDebounce, useMediaQuery, useForm
- Bisa di-import di mana saja

### `app/`
Next.js App Router pages dan layouts.
- `page.tsx` - Halaman utama route
- `layout.tsx` - Layout yang membungkus route
- `loading.tsx` - Loading state untuk route
- `error.tsx` - Error boundary untuk route
- `not-found.tsx` - 404 page untuk route
- `route.ts` - API endpoints (HTTP handlers)
- Folder dengan `()` - Route groups (tidak mempengaruhi URL)
- Folder dengan `_` - Private folders (tidak menjadi route)

### `public/`
Static assets.
- Gambar, icons, fonts, favicon
- Diakses langsung via URL: `/images/logo.png`
- Tidak perlu import, cukup referensikan path-nya

## Naming & Export Conventions

### File Naming
- **Component files** (selain `components/ui/`): PascalCase
  - Benar: `UserProfile.tsx`, `DataTable.tsx`, `Header.tsx`
  - Salah: `userProfile.tsx`, `data-table.tsx`, `header.tsx`
- **components/ui/**: lowercase (default shadcn convention)
  - Benar: `button.tsx`, `input.tsx`, `card.tsx`
- **Hook files**: camelCase dengan `use` prefix
  - Benar: `useAuth.ts`, `useDataTable.ts`
- **Utility files**: camelCase
  - Benar: `formatDate.ts`, `cn.ts`
- **Service folders**: lowercase plural domain name
  - Benar: `services/courses/queries.ts`, `services/courses/actions.ts`
  - Salah: `services/CourseService.ts`, `services/courseActions.ts`
- **Schema files**: lowercase singular domain dengan suffix `.schema.ts`
  - Benar: `course.schema.ts`, `submission.schema.ts`, `user.schema.ts`
  - Salah: `courseSchema.ts`, `Course.schema.ts`
- **Type files**: lowercase singular domain dengan suffix `.type.ts`
  - Benar: `course.type.ts`, `submission.type.ts`, `user.type.ts`
  - Salah: `courseTypes.ts`, `Course.type.ts`

### Export Style
- **Components** (semua kecuali page.tsx): `export const`
  ```tsx
  export const UserProfile = ({ name }: { name: string }) => {
    return <div>{name}</div>
  }
  ```
- **page.tsx**: `export default function`
  ```tsx
  export default function HomePage() {
    return <div>Hello</div>
  }
  ```
- **Layouts, Loading, Error, NotFound**: `export default function`
  ```tsx
  export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <section>{children}</section>
  }
  ```
- **Hooks**: `export function`
  ```tsx
  export function useAuth() {
    // ...
  }
  ```
- **Utilities**: `export const` (pure functions) atau `export function`
  ```tsx
  export const formatDate = (date: Date) => { ... }
  // atau
  export function cn(...inputs: ClassValue[]) { ... }
  ```
- **Services queries**: `export const`
  ```tsx
  export const getCourseBySlug = async (slug: string) => { ... }
  ```
- **Services actions**: file harus diawali `"use server"` dan menggunakan `export const`
  ```tsx
  "use server"

  export const createCourse = async (input: CreateCourseInput) => { ... }
  ```
- **Schemas**: `export const`
  ```tsx
  export const createCourseSchema = z.object({ ... })
  ```
- **Types**: `export type`
  ```tsx
  export type CreateCourseInput = z.infer<typeof createCourseSchema>
  ```

## Decision Tree

```txt
Need to create a component?
|
|- Apakah hanya untuk route ini saja?
|  `- Ya -> Buat di `<route>/_components/`
|
|- Apakah komponen UI dasar/primitif?
|  `- Ya -> Gunakan/buat di `components/ui/` (via shadcn)
|
`- Dipakai di banyak route?
   `- Ya -> Buat di `components/shared/`

Need to create something else?
|
|- Database read/query untuk domain?
|  `- Ya -> Buat di `services/<domain>/queries.ts`
|
|- Database mutation / Server Action untuk domain?
|  `- Ya -> Buat di `services/<domain>/actions.ts`
|
|- Validasi input dengan Zod?
|  `- Ya -> Buat di `schemas/<domain>.schema.ts`
|
|- Type reusable?
|  `- Ya -> Buat di `types/<domain>.type.ts`
|
|- Utility/helper function?
|  `- Ya -> Buat di `lib/`
|
|- Reusable logic dengan state/side-effects?
|  `- Ya -> Buat custom hook di `hooks/`
|
`- Static asset (gambar, icon, font)?
   `- Ya -> Taruh di `public/`
```
<!-- END:component-organization-rules -->
