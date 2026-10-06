'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyCommand({ command }: { command: string }) {
  const timerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className='flex items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 shadow-sm'>
      <code className='min-w-0 flex-1 truncate text-left font-mono text-sm text-foreground'>
        {command}
      </code>
      <button
        type='button'
        onClick={handleCopy}
        aria-label={copied ? 'Perintah tersalin' : 'Salin perintah'}
        title={copied ? 'Tersalin' : 'Salin perintah'}
        className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:border-primary/40 hover:text-foreground'
      >
        {copied ? (
          <Check className='size-4 text-emerald-600 dark:text-emerald-400' />
        ) : (
          <Copy className='size-4' />
        )}
      </button>
    </div>
  );
}
