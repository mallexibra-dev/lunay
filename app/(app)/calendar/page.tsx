'use client';

import { useMemo, useState } from 'react';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { CycleCalendar } from './_components/cycle-calendar';
import { DayDetailSheet } from './_components/day-detail-sheet';

export default function CalendarPage() {
  const { data, ctx } = useCycleStore();
  const [selected, setSelected] = useState<string | null>(null);

  const loggedDates = useMemo(
    () => new Set(data.dailyLogs.map((l) => l.date)),
    [data.dailyLogs]
  );

  return (
    <div className='flex flex-col gap-5'>
      <header>
        <h1 className='font-display text-2xl font-semibold tracking-tight text-foreground'>
          Kalender Siklus
        </h1>
        <p className='mt-1 text-[13px] text-muted-foreground'>
          Ketuk tanggal mana pun untuk melihat atau melengkapi catatan.
        </p>
      </header>

      <CycleCalendar
        ctx={ctx}
        loggedDates={loggedDates}
        onPickDay={setSelected}
      />

      {selected && (
        <DayDetailSheet
          date={selected}
          ctx={ctx}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        />
      )}
    </div>
  );
}
