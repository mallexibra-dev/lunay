'use client';

import { useState } from 'react';
import { CalendarPlus, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CycleContext, FlowIntensity } from '@/types/cycle.type';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { FlowChips } from './flow-chips';
import { LABELS } from '@/lib/cycle/labels';
import { diffDaysISO, formatShort, todayISO } from '@/lib/cycle/date';

/** Bagian Haid: mulai/akhiri, aliran per hari, dan riwayat. */
export const PeriodSection = ({ ctx }: { ctx: CycleContext }) => {
  const { data, startPeriod, endPeriod, setFlow, deletePeriod } =
    useCycleStore();
  const [startDate, setStartDate] = useState(todayISO());

  const sortedPeriods = [...data.periods].sort((a, b) =>
    a.start < b.start ? 1 : -1
  );
  const active = ctx.currentPeriod;

  const activeDays = active
    ? Object.keys(active.flows).sort()
    : [];

  const handleStart = () => {
    if (data.periods.some((p) => p.start === startDate)) {
      toast('Sudah ada catatan haid dengan tanggal mulai itu');
      return;
    }
    startPeriod(startDate);
    toast.success('Haid tercatat', { description: `Mulai ${formatShort(startDate)}` });
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* Mulai haid */}
      {!active && (
        <div className='rounded-2xl border-2border-border bg-card p-4'>
          <p className='text-sm font-semibold text-foreground'>Catat haid baru</p>
          <p className='mt-0.5 text-[13px] text-muted-foreground'>
            Pilih hari pertama haid, lalu tambahkan intensitas aliran tiap hari.
          </p>
          <div className='mt-3 flex items-center gap-2'>
            <input
              type='date'
              value={startDate}
              max={todayISO()}
              onChange={(e) => setStartDate(e.target.value)}
              className='h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
            />
            <button
              type='button'
              onClick={handleStart}
              className='inline-flex h-10 items-center gap-1.5 rounded-xl bg-phase-menstrual px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90'
            >
              <CalendarPlus className='size-4' />
              Mulai
            </button>
          </div>
        </div>
      )}

      {/* Haid berjalan */}
      {active && (
        <div className='rounded-2xl border-2border-phase-menstrual/30 bg-card p-4'>
          <div className='mb-1 flex items-center justify-between gap-2'>
            <p className='text-sm font-semibold text-foreground'>
              Haid berjalan · mulai {formatShort(active.start)}
            </p>
            <button
              type='button'
              onClick={() => {
                endPeriod(ctx.today);
                toast('Haid ditandai selesai');
              }}
              className='inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary'
            >
              <Check className='size-3.5 text-phase-menstrual' />
              Akhiri hari ini
            </button>
          </div>
          <p className='mb-3 text-[13px] text-muted-foreground'>
            Tandai aliran tiap hari. Hari tanpa aliran bisa dihapus — bila semua
            hari kosong, catatan haid ini ikut terhapus.
          </p>
          <div className='flex flex-col gap-2.5'>
            {activeDays.map((day) => (
              <div
                key={day}
                className='flex flex-col gap-1.5 rounded-xl bg-secondary/50 px-3 py-2.5'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-foreground'>
                    {formatShort(day)}
                    {day === ctx.today && (
                      <span className='ml-1.5 text-[10px] font-medium text-primary'>
                        hari ini
                      </span>
                    )}
                  </span>
                  <span className='text-[11px] text-muted-foreground'>
                    hari ke-{diffDaysISO(active.start, day) + 1}
                  </span>
                </div>
                <FlowChips
                  compact
                  current={active.flows[day] ?? null}
                  onSelect={(flow: FlowIntensity) => setFlow(day, flow)}
                  onClear={() => setFlow(day, null)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riwayat */}
      {sortedPeriods.length > 0 && (
        <div>
          <h3 className='mb-2 text-[13px] font-semibold text-foreground'>
            Riwayat haid
          </h3>
          <div className='divide-y divide-border overflow-hidden rounded-2xl border-2border-border bg-card'>
            {sortedPeriods.map((period) => {
              const days = Object.keys(period.flows);
              return (
                <div
                  key={period.id}
                  className='flex items-center gap-3 px-4 py-3'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='text-[13px] font-medium text-foreground'>
                      {formatShort(period.start)}
                      {period.end ? ` – ${formatShort(period.end)}` : ' – sekarang'}
                    </p>
                    <p className='text-[11px] text-muted-foreground'>
                      {days.length} hari aliran
                      {days[0] && ` · ${LABELS.flow[period.flows[days[0]]]?.label.toLowerCase() ?? ''} di awal`}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      deletePeriod(period.id);
                      toast('Catatan haid dihapus');
                    }}
                    aria-label={`Hapus catatan haid ${period.start}`}
                    className='grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                  >
                    <Trash2 className='size-4' />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
