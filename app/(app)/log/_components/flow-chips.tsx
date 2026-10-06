'use client';

import { X } from 'lucide-react';
import type { FlowIntensity } from '@/types/cycle.type';
import { FLOW_IDS, LABELS } from '@/lib/cycle/labels';
import { cn } from '@/lib/utils';

/** Sekelompok chip intensitas aliran untuk satu tanggal. */
export const FlowChips = ({
  current,
  onSelect,
  onClear,
  compact,
}: {
  current: FlowIntensity | null;
  onSelect: (flow: FlowIntensity) => void;
  onClear?: () => void;
  compact?: boolean;
}) => (
  <div className={cn('flex flex-wrap gap-1.5')}>
    {FLOW_IDS.map((flow) => {
      const active = current === flow;
      return (
        <button
          key={flow}
          type='button'
          onClick={() => (active && onClear ? onClear() : onSelect(flow))}
          aria-pressed={active}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            compact && 'px-2.5 py-1 text-[11px]',
            active
              ? 'border-phase-menstrual bg-phase-menstrual-soft text-phase-menstrual'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
          )}
        >
          {LABELS.flow[flow].label}
        </button>
      );
    })}
    {onClear && current && (
      <button
        type='button'
        onClick={onClear}
        aria-label='Hapus catatan aliran tanggal ini'
        className='grid size-7 place-items-center self-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive'
      >
        <X className='size-3.5' />
      </button>
    )}
  </div>
);
