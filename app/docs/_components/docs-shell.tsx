'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, BookOpen, Menu, X } from 'lucide-react';
import type { DocsNavSection } from '@/types/docs';
import { DocsSearch } from './DocsSearch';
import { ThemeToggle } from './theme-toggle';

export const DocsShell = ({
  sections,
  children,
}: {
  sections: DocsNavSection[];
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hrefOf = (slug: string[]) => `/docs/${slug.join('/')}`;
  const isActive = (slug: string[]) => pathname === hrefOf(slug);

  const sidebar = (
    <nav className='flex flex-col gap-7 px-3 py-5'>
      {sections.length === 0 && (
        <p className='px-3 text-xs text-muted-foreground'>
          Belum ada dokumentasi.
        </p>
      )}
      {sections.map((section) => (
        <div key={section.slug}>
          <p className='mb-2 px-3 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'>
            {section.title}
          </p>
          <div className='flex flex-col gap-0.5'>
            {section.items.map((item) => {
              const active = isActive(item.slug);
              return (
                <Link
                  key={hrefOf(item.slug)}
                  href={hrefOf(item.slug)}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm leading-snug transition ${
                    active
                      ? 'bg-primary font-medium text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md'>
        <div className='flex h-14 items-center justify-between gap-3 px-4 lg:px-6'>
          <div className='flex min-w-0 items-center gap-3'>
            <button
              onClick={() => setOpen((v) => !v)}
              className='inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground lg:hidden'
              aria-label='Menu dokumentasi'
            >
              {open ? <X className='size-4' /> : <Menu className='size-4' />}
            </button>
            <Link
              href='/docs'
              onClick={() => setOpen(false)}
              className='flex min-w-0 items-center gap-2.5'
            >
              <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm'>
                <BookOpen className='size-4' />
              </span>
              <span className='min-w-0 leading-tight'>
                <span className='block truncate text-sm font-semibold text-foreground'>
                  Dokumentasi
                </span>
                <span className='hidden truncate text-[11px] text-muted-foreground sm:block'>
                  Codasia Web Starter
                </span>
              </span>
            </Link>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <DocsSearch sections={sections} />
            <ThemeToggle />
            <Link
              href='/'
              className='inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground transition hover:text-foreground hover:shadow-sm'
            >
              <ArrowLeft className='size-3.5' />
              <span className='hidden sm:inline'>Kembali ke aplikasi</span>
            </Link>
          </div>
        </div>
      </header>

      <div className='flex'>
        <aside
          className={`fixed top-14 z-20 no-scrollbar h-[calc(100vh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r border-border bg-card transition-transform lg:sticky lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebar}
        </aside>

        {open && (
          <div
            className='fixed inset-0 top-14 z-10 bg-black/30 backdrop-blur-[2px] lg:hidden'
            onClick={() => setOpen(false)}
          />
        )}

        <main className='min-w-0 flex-1'>{children}</main>
      </div>
    </div>
  );
};
