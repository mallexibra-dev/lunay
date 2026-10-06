'use client';

import Link from 'next/link';
import { Bell, ChevronRight, Lock, Settings } from 'lucide-react';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { greeting, formatLong } from '@/lib/cycle/date';
import { LABELS } from '@/lib/cycle/labels';
import { CycleRing, phaseChipClass } from '@/app/(app)/_components/cycle-ring';
import { PredictionCard } from '@/app/(app)/_components/prediction-card';
import {
  PeriodQuickCard,
  QuickLinks,
} from '@/app/(app)/_components/today-quick-log';

export default function TodayPage() {
  const { data, ctx, lock } = useCycleStore();
  const { settings } = data;
  const phase = ctx.phase;

  const dailyLogToday = data.dailyLogs.find((l) => l.date === ctx.today);
  const activeReminders = data.reminders.filter((r) => r.enabled);

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <header className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-[13px] text-muted-foreground'>
            {greeting()}
            {settings.displayName ? `, ${settings.displayName}` : ''}
          </p>
          <h1 className='font-display text-[1.55rem] leading-tight font-semibold tracking-tight text-foreground'>
            {formatLong(ctx.today)}
          </h1>
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          {settings.pinHash && (
            <button
              type='button'
              onClick={lock}
              aria-label='Kunci aplikasi sekarang'
              className='grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
            >
              <Lock className='size-[18px]' />
            </button>
          )}
          <Link
            href='/settings'
            aria-label='Pengaturan'
            className='grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
          >
            <Settings className='size-[18px]' />
          </Link>
        </div>
      </header>

      {/* Ring siklus + penjelasan fase */}
      {phase && ctx.cycleDay !== null ? (
        <section className='flex flex-col items-center gap-5'>
          <CycleRing
            cycleDay={ctx.cycleDay}
            cycleLength={ctx.cycleLengthEstimate}
            phase={phase}
          />
          <div className='w-full rounded-2xl border-2border-border bg-card p-4'>
            <div className='flex items-center gap-2'>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${phaseChipClass(phase)}`}
              >
                Fase {LABELS.phase[phase].label}
              </span>
              <span className='text-[11px] text-muted-foreground'>
                {LABELS.phase[phase].tagline}
              </span>
            </div>
            <p className='mt-2.5 text-[13px] leading-relaxed text-muted-foreground'>
              {LABELS.phase[phase].description}
            </p>
          </div>
        </section>
      ) : (
        <section className='rounded-2xl border-2border-dashed border-border bg-card/60 p-6 text-center'>
          <p className='font-display text-lg font-semibold text-foreground'>
            Selamat datang di Lunay
          </p>
          <p className='mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground'>
            Mulai dengan mencatat haidmu — Lunay akan memetakan fase, masa
            subur, dan prediksi siklus berikutnya untukmu.
          </p>
        </section>
      )}

      <PredictionCard ctx={ctx} />

      {/* Haid kilat */}
      <PeriodQuickCard ctx={ctx} />

      {/* Tautan cepat */}
      <section>
        <h2 className='mb-2.5 text-[13px] font-semibold text-foreground'>
          Catat hari ini
        </h2>
        <QuickLinks />
        {dailyLogToday &&
          (dailyLogToday.symptoms.length > 0 ||
            dailyLogToday.moods.length > 0 ||
            dailyLogToday.fluid) && (
            <p className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
              <span className='size-1.5 rounded-full bg-phase-ovulatory' />
              Catatan harian hari ini sudah terisi
            </p>
          )}
      </section>

      {/* Pengingat aktif */}
      {activeReminders.length > 0 && (
        <section>
          <h2 className='mb-2.5 text-[13px] font-semibold text-foreground'>
            Pengingat aktif
          </h2>
          <div className='divide-y divide-border overflow-hidden rounded-2xl border-2border-border bg-card'>
            {activeReminders.slice(0, 3).map((reminder) => (
              <Link
                key={reminder.id}
                href='/settings'
                className='flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/60'
              >
                <span className='grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'>
                  <Bell className='size-3.5' />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[13px] font-medium text-foreground'>
                    {reminder.label}
                  </span>
                  <span className='block text-[11px] text-muted-foreground'>
                    {reminder.type === 'period' &&
                      `${reminder.daysBefore} hari sebelum perkiraan haid`}
                    {reminder.type === 'medication' && `Setiap hari · ${reminder.time}`}
                    {reminder.type === 'hygiene' &&
                      `Saat haid · tiap ${reminder.intervalHours} jam`}
                  </span>
                </span>
                <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
