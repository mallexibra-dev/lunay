'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { CervicalFluid, CycleContext, MoodId, SymptomId } from '@/types/cycle.type';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { FLUID_IDS, LABELS, MOOD_IDS, SYMPTOM_IDS } from '@/lib/cycle/labels';
import { addDaysISO, formatShort, todayISO } from '@/lib/cycle/date';
import { cn } from '@/lib/utils';

/** Strip 7 hari terakhir untuk memilih tanggal catatan. */
const DateStrip = ({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (date: string) => void;
}) => {
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i - 6));

  return (
    <div className='flex items-center gap-2'>
      <div className='no-scrollbar flex flex-1 gap-1.5 overflow-x-auto'>
        {days.map((day) => {
          const active = day === selected;
          const dayNum = Number(day.slice(8, 10));
          const weekday = formatShort(day).split(',')[0];
          return (
            <button
              key={day}
              type='button'
              onClick={() => onSelect(day)}
              aria-pressed={active}
              className={cn(
                'flex w-11 shrink-0 flex-col items-center gap-0.5 rounded-xl border py-2 transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-medium uppercase',
                  active ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                {weekday}
              </span>
              <span className='text-sm font-semibold'>{dayNum}</span>
            </button>
          );
        })}
      </div>
      <input
        type='date'
        value={selected}
        max={today}
        onChange={(e) => e.target.value && onSelect(e.target.value)}
        aria-label='Pilih tanggal lain'
        className='h-11 w-[7.5rem] shrink-0 rounded-xl border border-input bg-card px-2 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
      />
    </div>
  );
};

const ChipGroup = <T extends string>({
  options,
  selected,
  onToggle,
  label,
}: {
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  label: (value: T) => string;
}) => (
  <div className='flex flex-wrap gap-1.5' role='group'>
    {options.map((value) => {
      const active = selected.includes(value);
      return (
        <button
          key={value}
          type='button'
          onClick={() => onToggle(value)}
          aria-pressed={active}
          className={cn(
            'rounded-full border px-3.5 py-2 text-xs font-medium transition-colors',
            active
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
          )}
        >
          {label(value)}
        </button>
      );
    })}
  </div>
);

/** Bagian catatan harian: gejala, mood, cairan serviks, dan catatan bebas. */
export const DailySection = ({ ctx }: { ctx: CycleContext }) => {
  const { data, toggleSymptom, toggleMood, setFluid, setNote } = useCycleStore();
  const [date, setDate] = useState(ctx.today);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const log = data.dailyLogs.find((l) => l.date === date);

  const flashSaved = () => {
    setJustSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 1400);
  };

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    []
  );

  const wrap =
    <T,>(action: (value: T) => void) =>
    (value: T) => {
      action(value);
      flashSaved();
    };

  return (
    <div className='flex flex-col gap-5'>
      <DateStrip selected={date} onSelect={setDate} />

      <p className='-mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
        <Check
          className={cn(
            'size-3.5 text-phase-ovulatory transition-opacity',
            justSaved ? 'opacity-100' : 'opacity-0'
          )}
        />
        {justSaved ? 'Tersimpan' : 'Semua perubahan tersimpan otomatis'}
      </p>

      {/* Gejala fisik */}
      <section>
        <h3 className='mb-2 text-[13px] font-semibold text-foreground'>
          Gejala fisik
        </h3>
        <ChipGroup<SymptomId>
          options={SYMPTOM_IDS}
          selected={log?.symptoms ?? []}
          onToggle={wrap((v: SymptomId) => toggleSymptom(date, v))}
          label={(v) => LABELS.symptoms[v].label}
        />
      </section>

      {/* Suasana hati */}
      <section>
        <h3 className='mb-2 text-[13px] font-semibold text-foreground'>
          Suasana hati
        </h3>
        <ChipGroup<MoodId>
          options={MOOD_IDS}
          selected={log?.moods ?? []}
          onToggle={wrap((v: MoodId) => toggleMood(date, v))}
          label={(v) => LABELS.moods[v].label}
        />
      </section>

      {/* Cairan serviks */}
      <section>
        <h3 className='mb-2 text-[13px] font-semibold text-foreground'>
          Cairan serviks
        </h3>
        <p className='mb-2.5 text-xs text-muted-foreground'>
          Amati pembukaannya hari ini untuk membaca sinyal kesuburan.
        </p>
        <div className='grid grid-cols-2 gap-2'>
          {FLUID_IDS.map((fluid) => {
            const active = log?.fluid === fluid;
            return (
              <button
                key={fluid}
                type='button'
                onClick={() => {
                  setFluid(date, active ? null : (fluid as CervicalFluid));
                  flashSaved();
                }}
                aria-pressed={active}
                className={cn(
                  'rounded-xl border p-3 text-left transition-colors',
                  active
                    ? 'border-phase-ovulatory bg-phase-ovulatory-soft'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                <p
                  className={cn(
                    'text-[13px] font-semibold',
                    active ? 'text-phase-ovulatory' : 'text-foreground'
                  )}
                >
                  {LABELS.fluid[fluid].label}
                </p>
                <p className='mt-0.5 text-[11px] leading-snug text-muted-foreground'>
                  {LABELS.fluid[fluid].description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Catatan bebas */}
      <section>
        <h3 className='mb-2 text-[13px] font-semibold text-foreground'>
          Catatan untuk dirimu
        </h3>
        <textarea
          value={log?.note ?? ''}
          onChange={(e) => {
            setNote(date, e.target.value);
          }}
          onBlur={flashSaved}
          rows={3}
          placeholder='Contoh: kram ringan setelah olahraga, mood stabil…'
          className='w-full resize-none rounded-xl border border-input bg-card px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
        />
      </section>
    </div>
  );
};
