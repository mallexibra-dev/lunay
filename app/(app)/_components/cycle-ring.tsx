'use client';

import type { PhaseId } from '@/types/cycle.type';
import { LABELS } from '@/lib/cycle/labels';
import { cn } from '@/lib/utils';

const PHASE_STROKE: Record<PhaseId, string> = {
  menstrual: 'text-phase-menstrual',
  follicular: 'text-phase-follicular',
  ovulatory: 'text-phase-ovulatory',
  luteal: 'text-phase-luteal',
};

const PHASE_CHIP: Record<PhaseId, string> = {
  menstrual: 'bg-phase-menstrual-soft text-phase-menstrual',
  follicular: 'bg-phase-follicular-soft text-phase-follicular',
  ovulatory: 'bg-phase-ovulatory-soft text-phase-ovulatory',
  luteal: 'bg-phase-luteal-soft text-phase-luteal',
};

export const phaseStrokeClass = (phase: PhaseId) => PHASE_STROKE[phase];
export const phaseChipClass = (phase: PhaseId) => PHASE_CHIP[phase];

interface CycleRingProps {
  cycleDay: number;
  cycleLength: number;
  phase: PhaseId;
}

/** Cincin progres siklus dengan arc berwarna fase. */
export const CycleRing = ({
  cycleDay,
  cycleLength,
  phase,
}: CycleRingProps) => {
  const size = 208;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(cycleDay / cycleLength, 0), 1);
  const offset = circumference * (1 - progress);

  return (
    <div
      className='relative mx-auto'
      style={{ width: size, height: size }}
      role='img'
      aria-label={`Hari ke-${cycleDay} siklus, fase ${LABELS.phase[phase].label}`}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          strokeWidth={stroke}
          className='stroke-muted'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke='currentColor'
          className={cn('transition-[stroke-dashoffset] duration-700', PHASE_STROKE[phase])}
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
          Hari siklus
        </span>
        <span className='app-figure text-[3.6rem] leading-none font-semibold text-foreground'>
          {cycleDay}
        </span>
        <span
          className={cn(
            'mt-2.5 rounded-full px-3 py-1 text-xs font-semibold',
            PHASE_CHIP[phase]
          )}
        >
          {LABELS.phase[phase].label}
        </span>
      </div>
    </div>
  );
};
