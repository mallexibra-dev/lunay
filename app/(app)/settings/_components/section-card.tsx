'use client';

import type { ReactNode } from 'react';

/** Pembungkus satu seksi pengaturan. */
export const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section>
    <h2 className='mb-1.5 px-0.5 text-[13px] font-semibold text-foreground'>
      {title}
    </h2>
    {description && (
      <p className='mb-2 px-0.5 text-[11.5px] text-muted-foreground'>
        {description}
      </p>
    )}
    <div className='overflow-hidden rounded-2xl border-2 border-border bg-card'>
      {children}
    </div>
  </section>
);

export const SectionRow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 ${className ?? ''}`}
  >
    {children}
  </div>
);
