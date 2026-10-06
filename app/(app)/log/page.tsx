'use client';

import { useState } from 'react';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { PeriodSection } from './_components/period-section';
import { DailySection } from './_components/daily-section';
import { cn } from '@/lib/utils';

type LogTab = 'period' | 'daily';

const TABS: { id: LogTab; label: string }[] = [
  { id: 'period', label: 'Haid' },
  { id: 'daily', label: 'Catatan Harian' },
];

export default function LogPage() {
  const { ctx } = useCycleStore();
  const [tab, setTab] = useState<LogTab>('period');

  return (
    <div className='flex flex-col gap-5'>
      <header>
        <h1 className='font-display text-2xl font-semibold tracking-tight text-foreground'>
          Catat
        </h1>
        <p className='mt-1 text-[13px] text-muted-foreground'>
          Semakin rutin mencatat, semakin akurat prediksi dan wawasannya.
        </p>
      </header>

      {/* Segmented control */}
      <div
        role='tablist'
        aria-label='Jenis catatan'
        className='grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1'
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            role='tab'
            aria-selected={tab === item.id}
            type='button'
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-xl py-2.5 text-[13px] font-semibold transition-all',
              tab === item.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'period' && <PeriodSection ctx={ctx} />}
      {tab === 'daily' && <DailySection ctx={ctx} />}
    </div>
  );
}
