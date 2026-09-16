import Link from 'next/link';
import {
  BookOpen,
  Database,
  FlaskConical,
  GitBranch,
  KeyRound,
  Layers,
  Palette,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CopyCommand } from '@/components/shared/copy-command';
import { Button } from '@/components/ui/button';

const CLONE_COMMAND =
  'git clone https://github.com/codasia/website-starter.git';

const REPO_URL = 'https://github.com/codasia/website-starter';

const features = [
  {
    icon: Zap,
    title: 'Next.js 16 + React 19',
    description:
      'App Router dengan Turbopack dan TypeScript yang siap produksi.',
  },
  {
    icon: Palette,
    title: 'Tailwind CSS v4',
    description: 'Token tema terang/gelap dan 50+ komponen shadcn/ui.',
  },
  {
    icon: Database,
    title: 'Drizzle ORM',
    description:
      'PostgreSQL dengan koneksi siap serverless dan migrasi terkontrol.',
  },
  {
    icon: RefreshCw,
    title: 'TanStack Query',
    description: 'State server dengan caching dan pola hooks yang konsisten.',
  },
  {
    icon: KeyRound,
    title: 'Auth satu perintah',
    description:
      'bun run auth menghasilkan Better Auth lengkap beserta halaman login.',
  },
  {
    icon: ShieldCheck,
    title: 'Proxy & keamanan',
    description:
      'Security header, rate limiting, CORS, dan proteksi route terpusat.',
  },
  {
    icon: FlaskConical,
    title: 'Testing',
    description: 'Vitest, React Testing Library, dan MSW terkonfigurasi.',
  },
  {
    icon: BookOpen,
    title: 'Dokumentasi internal',
    description: 'Panduan teknis berbahasa Indonesia lengkap di /docs.',
  },
];

export default function HomePage() {
  return (
    <main className='relative min-h-screen overflow-hidden bg-background'>
      <div aria-hidden className='pointer-events-none absolute inset-0'>
        <div className='absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black_35%,transparent_100%)] bg-[size:56px_56px] opacity-60' />
        <div className='absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl' />
      </div>

      <div className='relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10'>
        <header className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <span className='grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25'>
              <Layers className='size-5' />
            </span>
            <span className='text-sm font-semibold tracking-tight text-foreground'>
              Codasia Web Starter
            </span>
          </div>
          <a
            href={REPO_URL}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground'
          >
            <GitBranch className='size-4' />
            Repository
          </a>
        </header>

        <section className='flex flex-1 flex-col items-center justify-center py-20 text-center'>
          <h1 className='max-w-3xl text-4xl font-bold tracking-tight text-balance text-foreground sm:text-6xl'>
            Bangun produk lebih cepat dengan{' '}
            <span className='bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
              standar tim
            </span>
          </h1>
          <p className='mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg'>
            Next.js 16, Tailwind CSS v4, shadcn/ui, Drizzle ORM, React Query,
            testing siap pakai, dan dokumentasi teknis lengkap. Semua sudah
            terkonfigurasi sehingga Anda langsung menulis fitur.
          </p>

          <div className='mt-8 w-full max-w-xl'>
            <CopyCommand command={CLONE_COMMAND} />
          </div>

          <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
            <Button asChild size='lg'>
              <Link href='/docs'>
                <BookOpen className='size-4' />
                Buka Dokumentasi
              </Link>
            </Button>
            <Button asChild size='lg' variant='outline'>
              <Link href='/docs/autentikasi'>
                <KeyRound className='size-4' />
                Pasang Auth
              </Link>
            </Button>
          </div>
        </section>

        <section className='grid gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-4'>
          {features.map((feature) => (
            <div
              key={feature.title}
              className='group rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md'
            >
              <span className='mb-4 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground'>
                <feature.icon className='size-5' />
              </span>
              <p className='text-sm font-semibold text-foreground'>
                {feature.title}
              </p>
              <p className='mt-1.5 text-[13px] leading-relaxed text-muted-foreground'>
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <footer className='flex flex-col items-center gap-1 border-t pt-6 text-center text-xs text-muted-foreground'>
          <p>Codasia Web Starter dikelola oleh tim engineering Codasia.</p>
          <p>
            Dokumentasi teknis:{' '}
            <Link
              href='/docs'
              className='font-medium text-primary hover:underline'
            >
              /docs
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
