'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

const stripFrontmatter = (markdown: string) =>
  markdown.replace(/^---\n[\s\S]*?\n---\n/, '').trim();

export const CopyPageButton = ({
  title,
  description,
  content,
}: {
  title: string;
  description?: string;
  content: string;
}) => {
  const timerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const parts = [`# ${title}`];
    if (description) parts.push('', description);
    parts.push('', stripFrontmatter(content));

    try {
      await navigator.clipboard.writeText(parts.join('\n'));
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      aria-label='Salin halaman sebagai markdown'
      title='Salin halaman sebagai markdown'
      className='inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary'
    >
      {copied ? (
        <Check className='size-3.5 text-emerald-600 dark:text-emerald-400' />
      ) : (
        <Copy className='size-3.5' />
      )}
      {copied ? 'Tersalin' : 'Salin halaman'}
    </button>
  );
};
