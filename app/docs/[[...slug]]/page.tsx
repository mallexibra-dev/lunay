import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookMarked, ChevronRight } from 'lucide-react';
import { getDocsNav, getDocsPage } from '@/lib/docs/queries';
import { MarkdownRenderer } from '../_components/markdown-renderer';

const humanize = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;

  const page = getDocsPage(slug);
  if (!page) notFound();

  const sections = slug.length === 0 ? getDocsNav() : [];

  const crumbs = slug.slice(0, -1).map((segment, index) => ({
    href: `/docs/${slug.slice(0, index + 1).join('/')}`,
    label: humanize(segment),
  }));

  return (
    <article className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-10 lg:py-12">
      <div className="mb-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-400">
          <Link href="/docs" className="transition hover:text-primary">
            Dokumentasi
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              <Link href={crumb.href} className="transition hover:text-primary">
                {crumb.label}
              </Link>
            </span>
          ))}
          {slug.length > 0 && (
            <span className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              <span className="text-slate-500">{page.title}</span>
            </span>
          )}
        </nav>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-[2rem] lg:leading-tight">
          {page.title}
        </h1>
        {page.description && (
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">{page.description}</p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="h-1 bg-primary" />
        <div className="p-6 lg:p-9">
          <MarkdownRenderer content={page.content} mediaBase={page.mediaBase} />
        </div>
      </div>

      {sections.length > 0 && (
        <section className="mt-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-slate-400 uppercase">
            Modul tersedia
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {sections.map((section) => {
              const first = section.items[0];
              if (!first) return null;
              return (
                <Link
                  key={section.slug}
                  href={`/docs/${first.slug.join('/')}`}
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <BookMarked className="size-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-primary">
                    {section.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {section.items.length} halaman dokumentasi
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {(page.prev || page.next) && (
        <nav className="mt-8 grid gap-3 sm:grid-cols-2">
          {page.prev ? (
            <Link
              href={page.prev.href}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <p className="flex items-center gap-1 text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                <ArrowLeft className="size-3" /> Sebelumnya
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-900 group-hover:text-primary">
                {page.prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {page.next && (
            <Link
              href={page.next.href}
              className={`group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md ${
                page.prev ? 'sm:text-right' : ''
              }`}
            >
              <p
                className={`flex items-center gap-1 text-[11px] font-medium tracking-wide text-slate-400 uppercase ${
                  page.prev ? 'sm:justify-end' : ''
                }`}
              >
                Berikutnya <ArrowRight className="size-3" />
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-900 group-hover:text-primary">
                {page.next.title}
              </p>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
