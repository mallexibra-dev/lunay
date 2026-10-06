'use client';

import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { CycleContext } from '@/types/cycle.type';
import { formatDayMonth } from '@/lib/cycle/date';

/**
 * Chart siklus: satu seri per chart, satu hue tervalidasi (chart-accent)
 * untuk kedua mode. Identitas seri dibawa judul kartu, bukan warna.
 */

const AXIS_TICK = {
  fontSize: 10,
  fill: 'var(--muted-foreground)',
} as const;

const ChartTooltip = ({ active, payload, label, suffix }: TooltipProps<number, string> & { suffix?: string }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className='rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md'>
      <p className='font-medium text-foreground'>
        {value} hari {suffix}
      </p>
      <p className='text-muted-foreground'>{label}</p>
    </div>
  );
};

interface CycleChartProps {
  ctx: CycleContext;
  metric: 'cycleLength' | 'periodLength';
}

/** Diagram batang tipis: panjang siklus / durasi haid per siklus. */
export const CycleMetricChart = ({ ctx, metric }: CycleChartProps) => {
  const completed = [...ctx.cycles]
    .map((c, i) => ({
      name: `Siklus ${i + 1} · ${formatDayMonth(c.start)}`,
      label: formatDayMonth(c.start),
      value: metric === 'cycleLength' ? c.cycleLength : c.periodLength,
    }))
    .filter((row): row is { name: string; label: string; value: number } => row.value !== null)
    .slice(0, 12);

  if (completed.length < 2) {
    return (
      <p className='py-8 text-center text-[13px] text-muted-foreground'>
        Butuh minimal 2 siklus terekam untuk menggambar grafik. Terus catat
        haidmu, ya.
      </p>
    );
  }

  const avg =
    completed.reduce((s, r) => s + r.value, 0) / completed.length;

  return (
    <div className='h-44 w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={completed}
          margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
          barCategoryGap='30%'
        >
          <XAxis
            dataKey='label'
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            interval={0}
            angle={-35}
            textAnchor='end'
            height={38}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            width={34}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
            content={<ChartTooltip suffix={metric === 'cycleLength' ? 'antara haid' : 'aliran'} />}
          />
          <Bar
            dataKey='value'
            fill='var(--chart-accent)'
            radius={[4, 4, 0, 0]}
            maxBarSize={16}
          />
          <ReferenceLine
            y={Math.round(avg)}
            stroke='var(--muted-foreground)'
            strokeDasharray='3 3'
            strokeWidth={1}
            label={{
              value: `rata-rata ${Math.round(avg)}`,
              position: 'insideTopRight',
              fontSize: 9.5,
              fill: 'var(--muted-foreground)',
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
