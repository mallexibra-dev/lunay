import type {
  AppData,
  CycleContext,
  CycleRecord,
  DayKind,
  DayStatus,
  FlowIntensity,
  PeriodLog,
  PhaseId,
} from '@/types/cycle.type';
import { addDaysISO, diffDaysISO, rangeISO, todayISO } from './date';

/**
 * Mesin prediksi siklus.
 *
 * Prinsip: rata-rata sederhana dari 3-6 siklus terakhir yang sudah selesai
 * (sesuai praktik umum pelacak siklus). Ovulasi diestimasi 14 hari sebelum
 * haid berikutnya; jendela subur dimulai 5 hari sebelum ovulasi dan berakhir
 * 1 hari setelahnya.
 */

const OVULATION_LUTEAL_PHASE_DAYS = 14;
const FERTILE_DAYS_BEFORE_OVULATION = 5;
const FERTILE_DAYS_AFTER_OVULATION = 1;
const MAX_AVG_BASIS = 6;

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

const byStartDesc = (a: PeriodLog, b: PeriodLog) => (a.start < b.start ? 1 : -1);

/** Hari haid terakhir yang punya catatan aliran. */
export const lastFlowDay = (period: PeriodLog): string | null => {
  const days = Object.keys(period.flows).sort();
  return days.length > 0 ? days[days.length - 1] : null;
};

/** Lama haid (hari): dari mulai sampai hari ber-aliran terakhir. */
export const periodLengthOf = (period: PeriodLog): number => {
  const last = lastFlowDay(period);
  if (!last) return 1;
  return diffDaysISO(period.start, last) + 1;
};

/** Susun riwayat siklus kronologis dari log haid. */
export const buildCycles = (periods: PeriodLog[]): CycleRecord[] => {
  const sorted = [...periods].sort(byStartDesc);
  return sorted.map((period, i) => ({
    id: period.id,
    start: period.start,
    // Siklus = jarak antar hari pertama haid
    cycleLength:
      i === 0 ? null : diffDaysISO(sorted[i].start, sorted[i - 1].start),
    periodLength: periodLengthOf(period),
  }));
};

export interface CycleAverages {
  avgCycleLength: number | null;
  avgPeriodLength: number | null;
  basis: number;
}

/** Rata-rata dari maksimal 6 siklus terakhir yang selesai. */
export const computeAverages = (
  cycles: CycleRecord[],
  fallbackCycleLength: number = DEFAULT_CYCLE_LENGTH
): CycleAverages => {
  const lengths = cycles
    .map((c) => c.cycleLength)
    .filter((n): n is number => n !== null && n >= 15 && n <= 60)
    .slice(0, MAX_AVG_BASIS);

  const periodLengths = cycles
    .slice(0, MAX_AVG_BASIS)
    .map((c) => c.periodLength);

  const mean = (arr: number[]) =>
    arr.length === 0
      ? null
      : Math.round(arr.reduce((s, n) => s + n, 0) / arr.length);

  return {
    avgCycleLength: mean(lengths) ?? (cycles.length > 0 ? fallbackCycleLength : null),
    avgPeriodLength: mean(periodLengths),
    basis: lengths.length,
  };
};

export const computeOvulation = (nextPeriodStart: string): string =>
  addDaysISO(nextPeriodStart, -OVULATION_LUTEAL_PHASE_DAYS);

export const computeFertileWindow = (nextPeriodStart: string) => {
  const ovulation = computeOvulation(nextPeriodStart);
  return {
    ovulation,
    start: addDaysISO(ovulation, -FERTILE_DAYS_BEFORE_OVULATION),
    end: addDaysISO(ovulation, FERTILE_DAYS_AFTER_OVULATION),
  };
};

/** Fase siklus untuk hari ke-N (1-based). */
export const phaseOfDay = (
  cycleDay: number,
  cycleLength: number,
  periodLength: number
): PhaseId => {
  const ovulation = cycleLength - OVULATION_LUTEAL_PHASE_DAYS;
  const fertileStart = ovulation - FERTILE_DAYS_BEFORE_OVULATION;
  const fertileEnd = ovulation + FERTILE_DAYS_AFTER_OVULATION;

  if (cycleDay <= periodLength) return 'menstrual';
  if (cycleDay < fertileStart) return 'follicular';
  if (cycleDay <= fertileEnd) return 'ovulatory';
  return 'luteal';
};

/** Hitung seluruh konteks siklus untuk "hari ini". */
export const buildCycleContext = (
  data: Pick<AppData, 'periods' | 'settings'>,
  today: string = todayISO()
): CycleContext => {
  const sorted = [...data.periods].sort(byStartDesc);
  const cycles = buildCycles(sorted);
  const averages = computeAverages(cycles, data.settings.defaultCycleLength);

  const periodDays: Record<string, FlowIntensity> = {};
  for (const period of sorted) {
    for (const [day, flow] of Object.entries(period.flows)) {
      periodDays[day] = flow;
    }
  }

  const lastPeriod = sorted[0] ?? null;
  // "Berjalan" = belum ditandai selesai, atau tanggal selesai >= hari ini.
  // Haid yang sudah lewat tanggal selesainya BUKAN haid aktif.
  const currentPeriod =
    sorted.find((p) => p.end === null || diffDaysISO(today, p.end) >= 0) ?? null;

  const avgCycleLength = averages.avgCycleLength;
  const estimate =
    avgCycleLength ?? data.settings.defaultCycleLength ?? DEFAULT_CYCLE_LENGTH;
  const periodLenEstimate =
    averages.avgPeriodLength ?? data.settings.defaultPeriodLength ?? DEFAULT_PERIOD_LENGTH;

  const lastStart = lastPeriod?.start ?? null;
  const nextPeriodStart =
    lastStart !== null ? addDaysISO(lastStart, estimate) : null;

  const fertileWindow =
    nextPeriodStart !== null ? computeFertileWindow(nextPeriodStart) : null;

  const cycleDay =
    lastStart !== null && diffDaysISO(lastStart, today) >= 0
      ? diffDaysISO(lastStart, today) + 1
      : null;

  const phase =
    cycleDay !== null ? phaseOfDay(cycleDay, estimate, periodLenEstimate) : null;

  const predictedPeriodDays =
    nextPeriodStart !== null
      ? rangeISO(nextPeriodStart, addDaysISO(nextPeriodStart, periodLenEstimate - 1))
      : [];

  return {
    today,
    cycleDay,
    cycleLengthEstimate: estimate,
    phase,
    lastPeriodStart: lastStart,
    currentPeriod,
    nextPeriodStart,
    daysUntilNextPeriod:
      nextPeriodStart !== null ? diffDaysISO(today, nextPeriodStart) : null,
    fertileWindow,
    avgCycleLength,
    avgPeriodLength: averages.avgPeriodLength,
    dataBasis: averages.basis,
    cycles,
    periodDays,
    predictedPeriodDays,
  };
};

/** Klasifikasi satu tanggal untuk kalender. */
export const getDayStatus = (date: string, ctx: CycleContext): DayStatus => {
  const isFuture = diffDaysISO(ctx.today, date) < 0;

  let kind: DayKind = 'plain';
  const flow = ctx.periodDays[date] ?? null;

  if (flow) {
    kind = 'period';
  } else if (ctx.predictedPeriodDays.includes(date)) {
    kind = 'predicted_period';
  } else if (ctx.fertileWindow) {
    const { start, end, ovulation } = ctx.fertileWindow;
    if (date === ovulation) kind = 'ovulation';
    else if (diffDaysISO(start, date) >= 0 && diffDaysISO(date, end) >= 0)
      kind = 'fertile';
  }

  // Hari ovulasi lebih spesifik daripada fase fertile biasa; fase untuk sel
  // non-haid dihitung dari posisi hari dalam siklus (bila valid).
  let cycleDay: number | null = null;
  let phase: PhaseId | null = null;
  if (ctx.lastPeriodStart && diffDaysISO(ctx.lastPeriodStart, date) >= 0) {
    cycleDay = diffDaysISO(ctx.lastPeriodStart, date) + 1;
    phase = phaseOfDay(cycleDay, ctx.cycleLengthEstimate, ctx.avgPeriodLength ?? DEFAULT_PERIOD_LENGTH);
  }

  return {
    date,
    kind,
    flow,
    isToday: date === ctx.today,
    isFuture,
    hasDailyLog: false, // diisi pemanggil yang punya akses dailyLogs
    cycleDay,
    phase,
  };
};

/** Derajat keteraturan siklus: simpangan baku panjang siklus. */
export const cycleRegularity = (cycles: CycleRecord[]): {
  stdDev: number | null;
  label: 'teratur' | 'cukup teratur' | 'bervariasi' | null;
} => {
  const lengths = cycles
    .map((c) => c.cycleLength)
    .filter((n): n is number => n !== null && n >= 15 && n <= 60);
  if (lengths.length < 2) return { stdDev: null, label: null };

  const mean = lengths.reduce((s, n) => s + n, 0) / lengths.length;
  const variance =
    lengths.reduce((s, n) => s + (n - mean) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  const label =
    stdDev <= 2 ? 'teratur' : stdDev <= 4.5 ? 'cukup teratur' : 'bervariasi';
  return { stdDev: Math.round(stdDev * 10) / 10, label };
};
