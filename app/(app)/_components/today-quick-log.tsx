'use client';

import Link from 'next/link';
import { CheckCircle2, Droplet, HeartPulse, Plus, Waves } from 'lucide-react';
import { toast } from 'sonner';
import type { CycleContext, FlowIntensity } from '@/types/cycle.type';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { FLOW_IDS, LABELS } from '@/lib/cycle/labels';
import { diffDaysISO } from '@/lib/cycle/date';
import { cn } from '@/lib/utils';

/** Baris tetes sesuai intensitas aliran. */
export const FlowDroplets = ({
  flow,
  className,
}: {
  flow: FlowIntensity;
  className?: string;
}) => (
  <span className={cn('inline-flex gap-0.5', className)} aria-hidden='true'>
    {Array.from({ length: LABELS.flow[flow].droplets }).map((_, i) => (
      <Droplet key={i} className='size-3 fill-current' />
    ))}
  </span>
);

const FlowPicker = ({
  current,
  onSelect,
}: {
  current: FlowIntensity | null;
  onSelect: (flow: FlowIntensity | null) => void;
}) => (
  <div className='grid grid-cols-4 gap-1.5'>
    {FLOW_IDS.map((flow) => {
      const active = current === flow;
      return (
        <button
          key={flow}
          type='button'
          onClick={() => onSelect(flow)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[11px] font-medium transition-colors',
            active
              ? 'border-phase-menstrual bg-phase-menstrual-soft text-phase-menstrual'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
          )}
          aria-pressed={active}
        >
          <FlowDroplets flow={flow} />
          {LABELS.flow[flow].label}
        </button>
      );
    })}
  </div>
);

/** Kartu haid kilat: mulai / aliran hari ini / akhiri. */
export const PeriodQuickCard = ({ ctx }: { ctx: CycleContext }) => {
  const { startPeriod, endPeriod, setFlow } = useCycleStore();
  const today = ctx.today;
  const todayFlow = ctx.periodDays[today] ?? null;
  const active = ctx.currentPeriod;

  const handleStart = () => {
    startPeriod(today);
    toast.success('Haid tercatat dimulai hari ini', {
      description: 'Jangan lupa pilih intensitas aliran di bawah.',
    });
  };

  if (!active) {
    return (
      <div className='rounded-2xl border-2 border-border bg-card p-4'>
        <p className='text-sm font-semibold text-foreground'>Mulai haid?</p>
        <p className='mt-0.5 mb-3 text-[13px] text-muted-foreground'>
          Kalau haidmu dimulai di hari lain, gunakan tab Catat.
        </p>
        <button
          type='button'
          onClick={handleStart}
          className='flex w-full items-center justify-center gap-2 rounded-xl bg-phase-menstrual px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90'
        >
          <Plus className='size-4' />
          Haid dimulai hari ini
        </button>
      </div>
    );
  }

  const periodDay = diffDaysISO(active.start, today) + 1;

  return (
    <div className='rounded-2xl border-2 border-phase-menstrual/30 bg-phase-menstrual-soft/60 p-4'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <div>
          <p className='text-sm font-semibold text-foreground'>
            Haid berlangsung · hari ke-{Math.max(periodDay, 1)}
          </p>
          <p className='text-[13px] text-muted-foreground'>
            {todayFlow
              ? `Aliran hari ini: ${LABELS.flow[todayFlow].label.toLowerCase()}`
              : 'Ada aliran hari ini?'}
          </p>
        </div>
        <button
          type='button'
          onClick={() => {
            endPeriod(today);
            toast('Haid ditandai selesai', {
              description: 'Bisa diubah kapan saja di tab Catat.',
            });
          }}
          className='inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary'
        >
          <CheckCircle2 className='size-3.5 text-phase-menstrual' />
          Akhiri
        </button>
      </div>
      <FlowPicker
        current={todayFlow}
        onSelect={(flow) => setFlow(today, flow)}
      />
    </div>
  );
};

/** Tautan cepat ke formulir catatan harian. */
export const QuickLinks = () => {
  const items = [
    {
      href: '/log',
      icon: HeartPulse,
      label: 'Gejala & Mood',
      hint: 'Kram, suasana hati, dll.',
    },
    {
      href: '/log',
      icon: Waves,
      label: 'Cairan Serviks',
      hint: 'Sinyal masa subur',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-2.5'>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className='group rounded-2xl border-2 border-border bg-card p-3.5 transition-colors hover:border-primary/40'
        >
          <span className='grid size-9 place-items-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary'>
            <item.icon className='size-4.5' />
          </span>
          <p className='mt-2.5 text-[13px] font-semibold text-foreground'>
            {item.label}
          </p>
          <p className='text-[11px] text-muted-foreground'>{item.hint}</p>
        </Link>
      ))}
    </div>
  );
};
