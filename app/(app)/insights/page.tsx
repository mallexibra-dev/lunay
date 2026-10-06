'use client';

import Link from 'next/link';
import { FileText, Info } from 'lucide-react';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { cycleRegularity } from '@/lib/cycle/engine';
import { buildInsights } from '@/lib/cycle/patterns';
import { CycleMetricChart } from './_components/cycle-charts';
import { cn } from '@/lib/utils';

/** Kartu statistik ringkas (stat tile, bukan chart). */
const StatTile = ({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
}) => (
  <div className='rounded-2xl border-2 border-border bg-card p-3.5'>
    <p className='text-[11px] font-medium text-muted-foreground'>{label}</p>
    <p className='app-figure mt-1 text-[1.65rem] leading-none font-semibold text-foreground'>
      {value}
      {unit && (
        <span className='ml-1 font-sans text-[11px] font-normal text-muted-foreground'>
          {unit}
        </span>
      )}
    </p>
    {hint && <p className='mt-1 text-[10.5px] text-muted-foreground'>{hint}</p>}
  </div>
);

export default function InsightsPage() {
  const { data, ctx } = useCycleStore();
  const insights = buildInsights(data, ctx);
  const regularity = cycleRegularity(ctx.cycles);
  const completedCount = ctx.cycles.filter((c) => c.cycleLength !== null).length;

  return (
    <div className='flex flex-col gap-5'>
      <header>
        <h1 className='font-display text-2xl font-semibold tracking-tight text-foreground'>
          Wawasan
        </h1>
        <p className='mt-1 text-[13px] text-muted-foreground'>
          Pola tubuhmu dari waktu ke waktu, dirangkum otomatis.
        </p>
      </header>

      {/* Statistik utama */}
      <section className='grid grid-cols-2 gap-2.5'>
        <StatTile
          label='Rata-rata siklus'
          value={ctx.avgCycleLength ? String(ctx.avgCycleLength) : '–'}
          unit={ctx.avgCycleLength ? 'hari' : undefined}
          hint={
            ctx.dataBasis > 0
              ? `dari ${ctx.dataBasis} siklus terakhir`
              : 'belum ada data'
          }
        />
        <StatTile
          label='Rata-rata haid'
          value={ctx.avgPeriodLength ? String(ctx.avgPeriodLength) : '–'}
          unit={ctx.avgPeriodLength ? 'hari' : undefined}
          hint={ctx.avgPeriodLength ? 'lama perdarahan' : 'belum ada data'}
        />
        <StatTile
          label='Siklus tercatat'
          value={String(ctx.cycles.length)}
          unit='siklus'
          hint={`${completedCount} selesai diukur`}
        />
        <StatTile
          label='Keteraturan'
          value={regularity.label ?? '–'}
          hint={regularity.stdDev !== null ? `variasi ±${regularity.stdDev} hari` : 'butuh ≥ 2 siklus'}
        />
      </section>

      {/* Grafik panjang siklus */}
      <section className='rounded-2xl border-2 border-border bg-card p-4'>
        <h2 className='text-[13px] font-semibold text-foreground'>
          Panjang siklus
        </h2>
        <p className='mb-2 text-[11.5px] text-muted-foreground'>
          Jarak antara hari pertama haid yang satu dan berikutnya.
        </p>
        <CycleMetricChart ctx={ctx} metric='cycleLength' />
      </section>

      {/* Grafik durasi haid */}
      <section className='rounded-2xl border-2 border-border bg-card p-4'>
        <h2 className='text-[13px] font-semibold text-foreground'>
          Durasi haid
        </h2>
        <p className='mb-2 text-[11.5px] text-muted-foreground'>
          Berapa hari perdarahan berlangsung di tiap siklus.
        </p>
        <CycleMetricChart ctx={ctx} metric='periodLength' />
      </section>

      {/* Pola otomatis */}
      <section>
        <h2 className='mb-2.5 text-[13px] font-semibold text-foreground'>
          Pola yang terdeteksi
        </h2>
        {insights.length === 0 ? (
          <div className='rounded-2xl border-2 border-dashed border-border bg-card/60 p-5 text-center'>
            <Info className='mx-auto mb-2 size-5 text-muted-foreground' />
            <p className='text-[13px] text-muted-foreground'>
              Pola muncul setelah beberapa siklus dan catatan harian
              terkumpul. Semakin sering mencatat, semakin kaya wawasannya.
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  'rounded-2xl border-2 p-3.5',
                  insight.tone === 'positive' &&
                    'border-phase-ovulatory/30 bg-phase-ovulatory-soft/50',
                  insight.tone === 'attention' && 'border-amber-500/40 bg-amber-500/10',
                  insight.tone === 'neutral' && 'border-border bg-card'
                )}
              >
                <p className='text-[13px] font-semibold text-foreground'>
                  {insight.title}
                </p>
                <p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>
                  {insight.detail}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ekspor laporan */}
      <Link
        href='/report'
        className='flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
      >
        <FileText className='size-4' />
        Buat Laporan untuk Dokter
      </Link>
      <p className='-mt-3 text-center text-[11px] text-muted-foreground'>
        Ringkasan PDF yang bisa dibagikan ke dokter atau bidan.
      </p>
    </div>
  );
}
