'use client';

import Link from 'next/link';
import { PenLine, Plus } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { CycleContext, FlowIntensity } from '@/types/cycle.type';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { getDayStatus } from '@/lib/cycle/engine';
import { formatLong } from '@/lib/cycle/date';
import { LABELS } from '@/lib/cycle/labels';
import { FlowChips } from '@/app/(app)/log/_components/flow-chips';
import { phaseChipClass } from '@/app/(app)/_components/cycle-ring';
import { cn } from '@/lib/utils';

/** Bottom sheet detail satu tanggal + aksi cepat. */
export const DayDetailSheet = ({
  date,
  ctx,
  onOpenChange,
}: {
  date: string | null;
  ctx: CycleContext;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data, setFlow, startPeriod } = useCycleStore();
  if (!date) return null;

  const status = getDayStatus(date, ctx);
  const log = data.dailyLogs.find((l) => l.date === date);
  const flow = ctx.periodDays[date] ?? null;

  const statusLabels: string[] = [];
  if (flow) statusLabels.push(`Haid · ${LABELS.flow[flow].label}`);
  else if (status.kind === 'predicted_period') statusLabels.push('Perkiraan haid');
  if (status.kind === 'fertile') statusLabels.push('Masa subur');
  if (status.kind === 'ovulation') statusLabels.push('Perkiraan ovulasi');
  if (date === ctx.today) statusLabels.push('Hari ini');

  return (
    <Drawer open onOpenChange={onOpenChange}>
      <DrawerContent className='app-theme bg-card'>
        <div className='mx-auto w-full max-w-md px-5 pb-8'>
          <DrawerHeader className='px-0 text-left'>
            <DrawerTitle className='font-display text-xl font-semibold text-foreground'>
              {formatLong(date)}
            </DrawerTitle>
            <DrawerDescription className='flex flex-wrap items-center gap-1.5 pt-1'>
              {status.cycleDay !== null && (
                <span className='rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground'>
                  Hari ke-{status.cycleDay}
                </span>
              )}
              {status.phase && (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    phaseChipClass(status.phase)
                  )}
                >
                  {LABELS.phase[status.phase].label}
                </span>
              )}
              {statusLabels.map((label) => (
                <span
                  key={label}
                  className='rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground'
                >
                  {label}
                </span>
              ))}
            </DrawerDescription>
          </DrawerHeader>

          <div className='flex flex-col gap-4'>
            {/* Aliran */}
            {!status.isFuture && (
              <div>
                <p className='mb-2 text-[13px] font-semibold text-foreground'>
                  Aliran haid
                </p>
                <FlowChips
                  compact
                  current={flow}
                  onSelect={(f: FlowIntensity) => setFlow(date, f)}
                  onClear={() => setFlow(date, null)}
                />
                {!flow && status.kind === 'plain' && (
                  <button
                    type='button'
                    onClick={() => {
                      startPeriod(date);
                      onOpenChange(false);
                    }}
                    className='mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-phase-menstrual'
                  >
                    <Plus className='size-3.5' />
                    Tandai haid dimulai di tanggal ini
                  </button>
                )}
              </div>
            )}

            {/* Isi catatan harian */}
            {log ? (
              <div className='rounded-xl border-2 border-border bg-background/50 p-3.5 text-[13px]'>
                {log.symptoms.length > 0 && (
                  <p className='text-foreground'>
                    <span className='text-muted-foreground'>Gejala:</span>{' '}
                    {log.symptoms.map((s) => LABELS.symptoms[s].label).join(', ')}
                  </p>
                )}
                {log.moods.length > 0 && (
                  <p className='mt-1 text-foreground'>
                    <span className='text-muted-foreground'>Mood:</span>{' '}
                    {log.moods.map((m) => LABELS.moods[m].label).join(', ')}
                  </p>
                )}
                {log.fluid && (
                  <p className='mt-1 text-foreground'>
                    <span className='text-muted-foreground'>Cairan:</span>{' '}
                    {LABELS.fluid[log.fluid].label}
                  </p>
                )}
                {log.note && (
                  <p className='mt-1.5 border-t border-border pt-1.5 text-muted-foreground italic'>
                    “{log.note}”
                  </p>
                )}
              </div>
            ) : (
              !status.isFuture && (
                <p className='rounded-xl bg-muted px-3.5 py-3 text-[13px] text-muted-foreground'>
                  Belum ada catatan harian untuk tanggal ini.
                </p>
              )
            )}

            <Link
              href='/log'
              onClick={() => onOpenChange(false)}
              className='flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
            >
              <PenLine className='size-4' />
              Buka catatan harian
            </Link>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
