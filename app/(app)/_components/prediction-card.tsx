'use client';

import { CalendarClock, Flower2, TriangleAlert } from 'lucide-react';
import type { CycleContext } from '@/types/cycle.type';
import { formatShort } from '@/lib/cycle/date';
import { cn } from '@/lib/utils';

/** Kartu prediksi: haid berikutnya + jendela subur (atau status terlambat). */
export const PredictionCard = ({ ctx }: { ctx: CycleContext }) => {
  const { nextPeriodStart, daysUntilNextPeriod, fertileWindow, dataBasis } = ctx;

  if (!nextPeriodStart || daysUntilNextPeriod === null) {
    return (
      <div className='rounded-2xl border-2 border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground'>
        Catat haid pertamamu di tab <span className='font-medium'>Catat</span>{' '}
        agar Lunay bisa mulai memprediksi siklusmu.
      </div>
    );
  }

  const overdue = daysUntilNextPeriod < 0;

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-4',
        overdue
          ? 'border-amber-500/40 bg-amber-500/10'
          : 'border-border bg-card'
      )}
    >
      <div className='flex items-start gap-3'>
        {overdue ? (
          <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600'>
            <TriangleAlert className='size-4.5' />
          </span>
        ) : (
          <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'>
            <CalendarClock className='size-4.5' />
          </span>
        )}
        <div className='min-w-0'>
          {overdue ? (
            <>
              <p className='text-sm font-semibold text-foreground'>
                Melewati perkiraan {Math.abs(daysUntilNextPeriod)} hari
              </p>
              <p className='mt-0.5 text-[13px] leading-relaxed text-muted-foreground'>
                Perkiraan sebelumnya {formatShort(nextPeriodStart)}. Kalau haid
                sudah mulai, catat di tab Catat agar prediksi menyesuaikan.
                Siklus yang bergeser sampai seminggu masih wajar.
              </p>
            </>
          ) : (
            <>
              <p className='text-sm font-semibold text-foreground'>
                Haid berikutnya{' '}
                {daysUntilNextPeriod === 0
                  ? 'diperkirakan hari ini'
                  : `± ${daysUntilNextPeriod} hari lagi`}
              </p>
              <p className='mt-0.5 text-[13px] text-muted-foreground'>
                Sekitar {formatShort(nextPeriodStart)}
                {dataBasis > 0
                  ? ` · dihitung dari ${dataBasis} siklus terakhir`
                  : ' · sementara memakai nilai default'}
              </p>
            </>
          )}

          {fertileWindow && !overdue && (
            <p className='mt-2.5 flex items-center gap-1.5 text-[13px] text-phase-ovulatory'>
              <Flower2 className='size-3.5 shrink-0' />
              <span>
                Masa subur: {formatShort(fertileWindow.start)} –{' '}
                {formatShort(fertileWindow.end)} · ovulasi{' '}
                {formatShort(fertileWindow.ovulation)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
