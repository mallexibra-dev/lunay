'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CycleContext, DayStatus, FlowIntensity } from '@/types/cycle.type';
import { getDayStatus } from '@/lib/cycle/engine';
import { toISODate } from '@/lib/cycle/date';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as const;

const FLOW_FILL: Record<FlowIntensity, string> = {
  spotting: 'bg-phase-menstrual/40 text-foreground',
  light: 'bg-phase-menstrual/60 text-white',
  medium: 'bg-phase-menstrual/85 text-white',
  heavy: 'bg-phase-menstrual text-white',
};

/** Sel satu hari di kalender. */
const DayCell = ({
  status,
  hasDailyLog,
  onClick,
}: {
  status: DayStatus;
  hasDailyLog: boolean;
  onClick: () => void;
}) => {
  const { kind, flow, isToday, isFuture, date } = status;
  const dayNum = Number(date.slice(8, 10));

  return (
    <button
      type='button'
      onClick={onClick}
      className='relative flex aspect-square items-center justify-center'
      aria-label={date}
    >
      <span
        className={cn(
          'grid size-9 place-items-center rounded-full text-[13px] font-medium transition-colors',
          kind === 'plain' && !isFuture && 'text-foreground hover:bg-secondary',
          kind === 'plain' && isFuture && 'text-muted-foreground/60',
          kind === 'period' && flow && FLOW_FILL[flow],
          kind === 'predicted_period' &&
            'border border-dashed border-phase-menstrual/70 bg-phase-menstrual-soft/50 text-phase-menstrual',
          kind === 'fertile' &&
            'bg-phase-ovulatory-soft text-phase-ovulatory',
          kind === 'ovulation' &&
            'border-2 border-phase-ovulatory bg-phase-ovulatory-soft font-semibold text-phase-ovulatory',
          isToday &&
            'ring-2 ring-foreground ring-offset-1 ring-offset-background'
        )}
      >
        {dayNum}
      </span>
      {hasDailyLog && (
        <span className='absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary/70' />
      )}
    </button>
  );
};

interface CycleCalendarProps {
  ctx: CycleContext;
  loggedDates: Set<string>;
  onPickDay: (date: string) => void;
}

/** Grid bulanan berkode warna: haid, perkiraan, masa subur, ovulasi. */
export const CycleCalendar = ({
  ctx,
  loggedDates,
  onPickDay,
}: CycleCalendarProps) => {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const cells = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const lead = (first.getDay() + 6) % 7; // Senin = 0
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

    const out: (string | null)[] = Array.from({ length: lead }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      out.push(toISODate(new Date(cursor.year, cursor.month, day)));
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const shift = (delta: number) => {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const isCurrentMonth =
    cursor.year === new Date().getFullYear() &&
    cursor.month === new Date().getMonth();

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    'id-ID',
    { month: 'long', year: 'numeric' }
  );

  return (
    <div className='rounded-2xl border-2 border-border bg-card p-3.5'>
      {/* Navigasi bulan */}
      <div className='mb-3 flex items-center justify-between'>
        <button
          type='button'
          onClick={() => shift(-1)}
          aria-label='Bulan sebelumnya'
          className='grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
        >
          <ChevronLeft className='size-4.5' />
        </button>
        <div className='flex items-center gap-2'>
          <h2 className='font-display text-lg font-semibold text-foreground first-letter:uppercase'>
            {monthLabel}
          </h2>
          {!isCurrentMonth && (
            <button
              type='button'
              onClick={() =>
                setCursor({
                  year: new Date().getFullYear(),
                  month: new Date().getMonth(),
                })
              }
              className='rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary'
            >
              Hari ini
            </button>
          )}
        </div>
        <button
          type='button'
          onClick={() => shift(1)}
          aria-label='Bulan berikutnya'
          className='grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
        >
          <ChevronRight className='size-4.5' />
        </button>
      </div>

      {/* Judul hari */}
      <div className='mb-1 grid grid-cols-7'>
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className='py-1 text-center text-[10.5px] font-medium text-muted-foreground'
          >
            {day}
          </span>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className='grid grid-cols-7 gap-y-0.5'>
        {cells.map((date, i) =>
          date === null ? (
            <span key={`empty-${i}`} />
          ) : (
            <DayCell
              key={date}
              status={getDayStatus(date, ctx)}
              hasDailyLog={loggedDates.has(date)}
              onClick={() => onPickDay(date)}
            />
          )
        )}
      </div>

      {/* Legenda */}
      <div className='mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[10.5px] text-muted-foreground'>
        <span className='inline-flex items-center gap-1.5'>
          <span className='size-2.5 rounded-full bg-phase-menstrual' /> Haid
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <span className='size-2.5 rounded-full border border-dashed border-phase-menstrual bg-phase-menstrual-soft' />
          Perkiraan
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <span className='size-2.5 rounded-full bg-phase-ovulatory-soft ring-1 ring-phase-ovulatory/50' />
          Masa subur
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <span className='size-2.5 rounded-full bg-phase-ovulatory' /> Ovulasi
        </span>
      </div>
    </div>
  );
};
