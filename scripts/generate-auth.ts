/**
 * Generator autentikasi Codasia (Better Auth).
 *
 * Pakai: bun run auth [--create] [--no-ui] [--no-push] [--yes] [--force]
 *
 * Menghasilkan wiring Better Auth siap pakai: instance server, client,
 * route handler, skema Drizzle, variabel .env (terdaftar di src/env.ts),
 * proteksi route di proxy.ts, dan (opsional) halaman login/register
 * dengan pola RHF + Zod + shadcn/ui.
 */
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';

const ROOT = process.cwd();

const KNOWN_ARGS = [
  '--create',
  'create',
  '--no-ui',
  '--no-push',
  '--yes',
  '--force',
];

// ---------------------------------------------------------------------------
// Template file hasil generate
// ---------------------------------------------------------------------------

const AUTH_TS = `import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from '@/db';
import { env } from '@/env';
import * as authSchema from '@/db/auth-schema';

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    // Aktifkan setelah Anda punya pengirim email (Resend, SMTP, dsb.):
    // requireEmailVerification: true,
  },
  // Social login: buka komentar provider yang dipakai, lalu isi
  // kredensialnya di file .env (variabelnya sudah ada di src/env.ts).
  // socialProviders: {
  //   google: {
  //     clientId: env.GOOGLE_CLIENT_ID!,
  //     clientSecret: env.GOOGLE_CLIENT_SECRET!,
  //   },
  //   github: {
  //     clientId: env.GITHUB_CLIENT_ID!,
  //     clientSecret: env.GITHUB_CLIENT_SECRET!,
  //   },
  // },
});

export type Session = typeof auth.$Infer.Session;
`;

const AUTH_CLIENT_TS = `import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
`;

const AUTH_ROUTE_TS = `import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

export const { GET, POST } = toNextJsHandler(auth.handler);
`;

const AUTH_SCHEMA_TS = `// Tabel autentikasi Better Auth. Hasil generate dari "bun run auth".
// Bila menambah plugin Better Auth (admin, organization, dll.), regenerate
// dengan: bunx @better-auth/cli generate --output src/db/auth-schema.ts
import {
  boolean,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
`;

const VALIDATIONS_AUTH_TS = `import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
`;

const AUTH_LAYOUT_TSX = `export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='grid min-h-screen place-items-center bg-background px-4'>
      {children}
    </div>
  );
}
`;

const LOGIN_PAGE_TSX = `'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { loginSchema, type LoginInput } from '@/validations/auth';

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message ?? 'Gagal masuk');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl') ?? '/';

    toast.success('Berhasil masuk');
    router.push(callbackUrl);
  };

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle className='text-xl'>Masuk</CardTitle>
        <CardDescription>Gunakan email dan password Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='nama@mail.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Password Anda'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </Form>
        <p className='mt-4 text-center text-sm text-muted-foreground'>
          Belum punya akun?{' '}
          <Link
            href='/register'
            className='font-medium text-primary underline-offset-4 hover:underline'
          >
            Daftar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
`;

const REGISTER_PAGE_TSX = `'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { registerSchema, type RegisterInput } from '@/validations/auth';

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: RegisterInput) => {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message ?? 'Gagal mendaftar');
      return;
    }

    toast.success('Akun dibuat. Selamat datang!');
    router.push('/');
  };

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <CardTitle className='text-xl'>Daftar</CardTitle>
        <CardDescription>Buat akun baru untuk mulai.</CardDescription>
      </CardHeader>
      <CardContent>
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
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='nama@mail.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Minimal 8 karakter'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>
        </Form>
        <p className='mt-4 text-center text-sm text-muted-foreground'>
          Sudah punya akun?{' '}
          <Link
            href='/login'
            className='font-medium text-primary underline-offset-4 hover:underline'
          >
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
`;

const ENV_EXAMPLE_BLOCK = `

# Better Auth
BETTER_AUTH_SECRET="ganti-dengan-secret-acak"
BETTER_AUTH_URL="http://localhost:3000"

# Social login (opsional: buka blok socialProviders di src/lib/auth.ts)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
`;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

interface Flags {
  noUi: boolean;
  noPush: boolean;
  yes: boolean;
  force: boolean;
}

const created: string[] = [];

function rel(...parts: string[]): string {
  return path.join(ROOT, ...parts);
}

function bail(): never {
  p.cancel('Dibatalkan.');
  process.exit(0);
}

async function ask(message: string): Promise<boolean> {
  const answer = await p.confirm({ message, initialValue: true });
  if (p.isCancel(answer)) bail();
  return answer as boolean;
}

function readFileSafe(file: string): string | null {
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

function writeFileIfMissing(
  file: string,
  content: string,
  force: boolean
): void {
  const label = path.relative(ROOT, file);
  if (existsSync(file) && !force) {
    p.log.warn(`Lewati, sudah ada: ${label}`);
    return;
  }
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
  created.push(label);
  p.log.step(`Dibuat: ${label}`);
}

function hasPackage(name: string): boolean {
  const pkg = JSON.parse(readFileSync(rel('package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
}

function installBetterAuth(): void {
  if (hasPackage('better-auth')) return;
  const s = p.spinner();
  s.start('Memasang better-auth...');
  execSync('bun add better-auth', { cwd: ROOT, stdio: 'inherit' });
  s.stop('better-auth terpasang.');
}

function patchDbIndex(): void {
  const file = rel('src/db/index.ts');
  const original = readFileSafe(file);
  if (!original) {
    p.log.error('src/db/index.ts tidak ditemukan. Batal.');
    process.exit(1);
  }
  if (original.includes('auth-schema')) {
    p.log.step('src/db/index.ts sudah mendaftarkan auth schema.');
    return;
  }
  let content = original.replace(
    "import { env } from '@/env';",
    "import { env } from '@/env';\nimport * as authSchema from './auth-schema';"
  );
  content = content.replace(
    /db = drizzle\(client, \{ schema: \{\} \}\);[^\n]*/,
    'db = drizzle(client, { schema: { ...authSchema } });'
  );
  if (content === original) {
    p.log.error(
      'Pola src/db/index.ts tidak dikenali. Daftarkan authSchema manual.'
    );
    return;
  }
  writeFileSync(file, content, 'utf8');
  p.log.step('Diperbarui: src/db/index.ts (schema auth terdaftar)');
}

function patchProxy(): void {
  const file = rel('proxy.ts');
  const original = readFileSafe(file);
  if (!original) {
    p.log.error('proxy.ts tidak ditemukan. Batal.');
    process.exit(1);
  }
  if (original.includes('protectedRoutes')) {
    p.log.step('proxy.ts sudah punya proteksi sesi.');
    return;
  }
  let content = original.replace(
    "import { logger, logPerformance, logApiRequest } from '@/lib/logger';",
    "import { logger, logPerformance, logApiRequest } from '@/lib/logger';\nimport { auth } from '@/lib/auth';"
  );
  content = content.replace(
    'export async function proxy(request: NextRequest) {',
    "// Prefix route yang wajib login. Proteksi dievaluasi di proxy sehingga\n// tidak perlu guard per halaman. Contoh: ['/dashboard', '/admin'].\nconst protectedRoutes: string[] = [];\n\nexport async function proxy(request: NextRequest) {"
  );
  content = content.replace(
    '  const { pathname } = request.nextUrl;',
    `  const { pathname } = request.nextUrl;

  // Redirect ke /login bila route terproteksi diakses tanpa sesi
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (isProtected) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }`
  );
  if (content === original) {
    p.log.error(
      'Pola proxy.ts tidak dikenali. Tambahkan proteksi route manual.'
    );
    return;
  }
  writeFileSync(file, content, 'utf8');
  p.log.step('Diperbarui: proxy.ts (proteksi route aktif)');
}

function patchEnvFile(file: string, secret: string | null): void {
  const label = path.relative(ROOT, file);
  const current = readFileSafe(file);

  if (!current) {
    const body = [
      '# Lengkapi DATABASE_URL dari .env.example bila belum ada.',
      `BETTER_AUTH_SECRET="${secret ?? 'ganti-dengan-secret-acak'}"`,
      'BETTER_AUTH_URL="http://localhost:3000"',
      '',
    ].join('\n');
    writeFileSync(file, body, 'utf8');
    p.log.step(`Dibuat: ${label}`);
    return;
  }

  if (current.includes('BETTER_AUTH_SECRET')) {
    p.log.step(`${label} sudah berisi BETTER_AUTH_SECRET.`);
    return;
  }

  appendFileSync(
    file,
    `\n# Better Auth\nBETTER_AUTH_SECRET="${secret ?? 'ganti-dengan-secret-acak'}"\nBETTER_AUTH_URL="http://localhost:3000"\n`,
    'utf8'
  );
  p.log.step(`Diperbarui: ${label}`);
}

function patchEnvExample(): void {
  const file = rel('.env.example');
  const current = readFileSafe(file);
  if (!current) return; // .env.example wajib ada di starter kit
  if (current.includes('BETTER_AUTH_SECRET')) {
    p.log.step('.env.example sudah berisi konfigurasi Better Auth.');
    return;
  }
  appendFileSync(file, ENV_EXAMPLE_BLOCK, 'utf8');
  p.log.step('Diperbarui: .env.example');
}

function patchEnvTs(): void {
  const file = rel('src/env.ts');
  const original = readFileSafe(file);
  if (!original) {
    p.log.error('src/env.ts tidak ditemukan. Batal.');
    process.exit(1);
  }
  if (original.includes('BETTER_AUTH_SECRET')) {
    p.log.step('src/env.ts sudah mendaftarkan variabel auth.');
    return;
  }
  const content = original.replace(
    '  NODE_ENV: process.env.NODE_ENV,',
    `  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  // Social login (opsional, isi nilainya di .env):
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV,`
  );
  if (content === original) {
    p.log.error(
      'Pola src/env.ts tidak dikenali. Daftarkan variabel auth manual.'
    );
    return;
  }
  writeFileSync(file, content, 'utf8');
  p.log.step('Diperbarui: src/env.ts (variabel auth terdaftar)');
}

function generateUi(flags: Flags): void {
  writeFileIfMissing(
    rel('src/validations/auth.ts'),
    VALIDATIONS_AUTH_TS,
    flags.force
  );
  writeFileIfMissing(
    rel('app/(auth)/layout.tsx'),
    AUTH_LAYOUT_TSX,
    flags.force
  );
  writeFileIfMissing(
    rel('app/(auth)/login/page.tsx'),
    LOGIN_PAGE_TSX,
    flags.force
  );
  writeFileIfMissing(
    rel('app/(auth)/register/page.tsx'),
    REGISTER_PAGE_TSX,
    flags.force
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const unknown = argv.filter((arg) => !KNOWN_ARGS.includes(arg));
  const flags: Flags = {
    noUi: argv.includes('--no-ui'),
    noPush: argv.includes('--no-push'),
    yes: argv.includes('--yes'),
    force: argv.includes('--force'),
  };

  p.intro('Generator Autentikasi Codasia (Better Auth)');

  if (unknown.length > 0) {
    p.log.warn(`Argumen diabaikan: ${unknown.join(', ')}`);
  }
  if (existsSync(rel('src/lib/auth.ts')) && !flags.force) {
    p.log.warn(
      'src/lib/auth.ts sudah ada. Gunakan --force untuk menimpa file hasil generate.'
    );
  }

  const includeUi = flags.noUi
    ? false
    : flags.yes
      ? true
      : await ask('Sertakan halaman login dan register?');
  const runPush = flags.noPush
    ? false
    : flags.yes
      ? true
      : await ask('Jalankan "bun run db:push" setelah generate?');

  installBetterAuth();

  writeFileIfMissing(rel('src/db/auth-schema.ts'), AUTH_SCHEMA_TS, flags.force);
  writeFileIfMissing(rel('src/lib/auth.ts'), AUTH_TS, flags.force);
  writeFileIfMissing(
    rel('src/lib/auth-client.ts'),
    AUTH_CLIENT_TS,
    flags.force
  );
  writeFileIfMissing(
    rel('app/api/auth/[...all]/route.ts'),
    AUTH_ROUTE_TS,
    flags.force
  );

  patchDbIndex();
  patchProxy();
  patchEnvFile(rel('.env'), randomBytes(32).toString('base64url'));
  patchEnvExample();
  patchEnvTs();

  if (includeUi) generateUi(flags);

  if (runPush) {
    const s = p.spinner();
    s.start('Menjalankan bun run db:push...');
    try {
      execSync('bun run db:push', { cwd: ROOT, stdio: 'inherit' });
      s.stop('Skema database terpasang.');
    } catch {
      s.stop('db:push gagal. Jalankan manual: bun run db:push');
    }
  }

  p.outro(
    `Selesai. ${created.length} file dibuat.\n\n` +
      'Langkah lanjutan:\n' +
      '1. Cek kredensial di .env (BETTER_AUTH_SECRET, BETTER_AUTH_URL).\n' +
      '2. /login dan /register siap dipakai (bila UI disertakan).\n' +
      '3. Aktifkan social login atau verifikasi email di src/lib/auth.ts.\n' +
      '4. Panduan lengkap: /docs/autentikasi'
  );
}

main().catch((error) => {
  p.log.error(String(error));
  process.exit(1);
});
