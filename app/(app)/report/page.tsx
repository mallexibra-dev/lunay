'use client';

import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import type { SymptomId } from '@/types/cycle.type';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { cycleRegularity } from '@/lib/cycle/engine';
import { buildInsights } from '@/lib/cycle/patterns';
import { LABELS, SYMPTOM_IDS } from '@/lib/cycle/labels';
import { formatLong } from '@/lib/cycle/date';
import { LunayWordmark } from '@/components/shared/lunay-logo';

const displayIdentity = (displayName: string) =>
  displayName.trim() || '(tanpa nama — mode anonim)';

/** Ringkasan satu angka pada laporan. */
const ReportStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className='border-b border-border pb-2'>
    <p className='text-[10px] font-medium tracking-wide text-muted-foreground uppercase'>
      {label}
    </p>
    <p className='app-figure mt-1 text-xl font-semibold text-foreground'>
      {value}
    </p>
  </div>
);

export default function ReportPage() {
  const { data, ctx, hydrated } = useCycleStore();

  if (!hydrated) {
    return (
      <div className='app-theme grid min-h-dvh place-items-center bg-background text-foreground'>
        <span className='text-sm text-muted-foreground'>Menyiapkan laporan…</span>
      </div>
    );
  }

  const regularity = cycleRegularity(ctx.cycles);
  const insights = buildInsights(data, ctx);

  // Rekap gejala: frekuensi kemunculan
  const symptomCounts = SYMPTOM_IDS.map((id) => ({
    id,
    count: data.dailyLogs.filter((l) => l.symptoms.includes(id)).length,
  }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  const logCount = data.dailyLogs.length;

  return (
    <div className='app-theme min-h-dvh bg-background text-foreground'>
      {/* Toolbar cetak (tidak ikut tercetak) */}
      <div className='app-no-print mx-auto flex w-full max-w-md items-center justify-between px-5 pt-6'>
        <Link
          href='/insights'
          className='inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='size-4' />
          Kembali
        </Link>
        <button
          type='button'
          onClick={() => window.print()}
          className='inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
        >
          <Printer className='size-4' />
          Simpan sebagai PDF
        </button>
      </div>

      <article className='app-report-page mx-auto w-full max-w-md px-6 pt-8 pb-16'>
        {/* Kepala laporan */}
        <header className='flex items-start justify-between gap-4 border-b-2 border-foreground pb-5'>
          <div>
            <LunayWordmark />
            <h1 className='mt-4 font-display text-2xl font-semibold tracking-tight text-foreground'>
              Ringkasan Siklus & Kesehatan
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              Dibuat {formatLong(ctx.today)}
              {ctx.cycles.length > 0 &&
                ` · periode pantauan ${formatLong(ctx.cycles[ctx.cycles.length - 1].start)} – ${formatLong(ctx.today)}`}
            </p>
          </div>
        </header>

        {/* Identitas */}
        <section className='mt-5 grid grid-cols-2 gap-x-6 text-[13px]'>
          <p>
            <span className='text-muted-foreground'>Nama: </span>
            <span className='font-medium text-foreground'>
              {displayIdentity(data.settings.displayName)}
            </span>
          </p>
          <p>
            <span className='text-muted-foreground'>Catatan harian: </span>
            <span className='font-medium text-foreground'>{logCount} hari</span>
          </p>
        </section>

        {/* Ringkasan siklus */}
        <section className='mt-7'>
          <h2 className='mb-3 text-[13px] font-semibold tracking-wide text-foreground uppercase'>
            Ringkasan Siklus
          </h2>
          <div className='grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4'>
            <ReportStat
              label='Rata-rata siklus'
              value={ctx.avgCycleLength ? `${ctx.avgCycleLength} hari` : '–'}
            />
            <ReportStat
              label='Rata-rata haid'
              value={ctx.avgPeriodLength ? `${ctx.avgPeriodLength} hari` : '–'}
            />
            <ReportStat
              label='Siklus tercatat'
              value={String(ctx.cycles.length)}
            />
            <ReportStat
              label='Keteraturan'
              value={regularity.label ?? '–'}
            />
          </div>
          {ctx.nextPeriodStart && (
            <p className='mt-3 text-[13px] text-muted-foreground'>
              Perkiraan haid berikutnya: {formatLong(ctx.nextPeriodStart)}
              {ctx.fertileWindow &&
                ` · masa subur ${formatLong(ctx.fertileWindow.start)} – ${formatLong(ctx.fertileWindow.end)}`}
              .
            </p>
          )}
        </section>

        {/* Riwayat siklus */}
        <section className='mt-7'>
          <h2 className='mb-3 text-[13px] font-semibold tracking-wide text-foreground uppercase'>
            Riwayat Siklus
          </h2>
          {ctx.cycles.length === 0 ? (
            <p className='text-[13px] text-muted-foreground'>
              Belum ada catatan haid.
            </p>
          ) : (
            <table className='w-full border-collapse text-[13px]'>
              <thead>
                <tr className='border-b border-border text-left text-[10.5px] tracking-wide text-muted-foreground uppercase'>
                  <th className='py-2 pr-3 font-medium'>No.</th>
                  <th className='py-2 pr-3 font-medium'>Haid dimulai</th>
                  <th className='py-2 pr-3 font-medium'>Lama haid</th>
                  <th className='py-2 font-medium'>Panjang siklus</th>
                </tr>
              </thead>
              <tbody>
                {[...ctx.cycles].reverse().map((cycle, i) => (
                  <tr key={cycle.id} className='border-b border-border/70'>
                    <td className='py-2 pr-3 text-muted-foreground'>
                      {ctx.cycles.length - i}
                    </td>
                    <td className='py-2 pr-3 text-foreground'>
                      {formatLong(cycle.start)}
                    </td>
                    <td className='py-2 pr-3 text-foreground'>
                      {cycle.periodLength} hari
                    </td>
                    <td className='py-2 text-foreground'>
                      {cycle.cycleLength ? `${cycle.cycleLength} hari` : 'berjalan'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Gejala */}
        <section className='mt-7'>
          <h2 className='mb-3 text-[13px] font-semibold tracking-wide text-foreground uppercase'>
            Gejala Tercatat
          </h2>
          {symptomCounts.length === 0 ? (
            <p className='text-[13px] text-muted-foreground'>
              Belum ada catatan gejala.
            </p>
          ) : (
            <ul className='flex flex-col gap-1.5'>
              {symptomCounts.map((row) => (
                <li
                  key={row.id}
                  className='flex items-baseline justify-between gap-4 text-[13px]'
                >
                  <span className='text-foreground'>
                    {LABELS.symptoms[row.id as SymptomId].label}
                  </span>
                  <span className='flex-1 border-b border-dotted border-border' />
                  <span className='font-medium text-foreground'>
                    {row.count} hari
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pola */}
        {insights.length > 0 && (
          <section className='mt-7'>
            <h2 className='mb-3 text-[13px] font-semibold tracking-wide text-foreground uppercase'>
              Pola yang Terdeteksi
            </h2>
            <ul className='list-disc pl-5 text-[13px] leading-relaxed text-foreground'>
              {insights.map((insight) => (
                <li key={insight.id} className='mb-1'>
                  {insight.title} — {insight.detail}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer */}
        <footer className='mt-10 border-t border-border pt-4 text-[10.5px] leading-relaxed text-muted-foreground'>
          Laporan ini dihasilkan otomatis oleh Lunay dari catatan pribadi
          pengguna dan bersifat informatif — bukan diagnosis medis. Diskusikan
          dengan dokter atau bidan untuk penilaian profesional.
        </footer>
      </article>
    </div>
  );
}
