'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type='button'
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label='Ganti tema terang/gelap'
      title='Ganti tema'
      className='inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground hover:shadow-sm'
    >
      <Sun className='size-4 dark:hidden' />
      <Moon className='hidden size-4 dark:inline' />
    </button>
  );
};
