'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';
import type { DocsNavSection } from '@/types/docs';

export const DocsSearch = ({ sections }: { sections: DocsNavSection[] }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const hrefOf = (slug: string[]) => `/docs/${slug.join('/')}`;

  const goTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
        aria-label="Cari dokumentasi"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">Cari dokumentasi...</span>
        <kbd className="pointer-events-none hidden h-5 items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] text-slate-400 md:inline-flex">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Cari dokumentasi</DialogTitle>
        <CommandInput placeholder="Cari modul atau halaman..." />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          <CommandGroup heading="Umum">
            <CommandItem value="Dokumentasi beranda" onSelect={() => goTo('/docs')}>
              <FileText />
              Dokumentasi
            </CommandItem>
          </CommandGroup>
          {sections.map((section) => (
            <CommandGroup key={section.slug} heading={section.title}>
              {section.items.map((item) => (
                <CommandItem
                  key={hrefOf(item.slug)}
                  value={`${section.title} ${item.title}`}
                  onSelect={() => goTo(hrefOf(item.slug))}
                >
                  <FileText />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
