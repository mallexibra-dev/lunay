import type {
  AppData,
  CycleContext,
  CycleInsight,
  DailyLog,
  SymptomId,
} from '@/types/cycle.type';
import { LABELS } from './labels';
import { diffDaysISO, formatShort } from './date';
import { cycleRegularity } from './engine';

/**
 * Analisis pola: menyimpulkan temuan ringkas dari riwayat, mis.
 * "Kram sering muncul saat haid". Semua fungsi murni & aman untuk
 * data minim (mengembalikan array kosong bila data belum cukup).
 */

const MIN_LOGS_FOR_PATTERNS = 3;

interface PhaseBucketTally {
  beforePeriod: number;
  duringPeriod: number;
  aroundOvulation: number;
  other: number;
  total: number;
}

/** Kelompokkan satu gejala berdasarkan posisinya dalam siklus. */
const tallySymptom = (
  symptom: SymptomId,
  logs: DailyLog[],
  ctx: CycleContext
): PhaseBucketTally => {
  const tally: PhaseBucketTally = {
    beforePeriod: 0,
    duringPeriod: 0,
    aroundOvulation: 0,
    other: 0,
    total: 0,
  };

  for (const log of logs) {
    if (!log.symptoms.includes(symptom)) continue;
    tally.total += 1;

    // Cari haid terdekat sebelum tanggal log
    const starts = ctx.cycles.map((c) => c.start).sort();
    const prevStart = [...starts].reverse().find((s) => diffDaysISO(s, log.date) >= 0);
    if (!prevStart) {
      tally.other += 1;
      continue;
    }

    const dayOfCycle = diffDaysISO(prevStart, log.date) + 1; // 1-based
    const nextStart = starts.find((s) => diffDaysISO(log.date, s) > 0);
    const cycleLength =
      nextStart !== undefined
        ? diffDaysISO(prevStart, nextStart)
        : ctx.cycleLengthEstimate;

    const periodLen = ctx.avgPeriodLength ?? 5;
    const ovulationDay = cycleLength - 14;

    if (dayOfCycle <= periodLen) {
      tally.duringPeriod += 1;
    } else if (Math.abs(dayOfCycle - ovulationDay) <= 2) {
      tally.aroundOvulation += 1;
    } else if (cycleLength - dayOfCycle <= 2) {
      // 2 hari menjelang haid berikutnya
      tally.beforePeriod += 1;
    } else {
      tally.other += 1;
    }
  }

  return tally;
};

const insightForSymptom = (
  symptom: SymptomId,
  tally: PhaseBucketTally
): CycleInsight | null => {
  if (tally.total < 2) return null;
  const label = LABELS.symptoms[symptom].label.toLowerCase();

  if (tally.duringPeriod >= 2 && tally.duringPeriod / tally.total >= 0.6) {
    return {
      id: `symptom-${symptom}-period`,
      title: `${LABELS.symptoms[symptom].label} saat haid`,
      detail: `${LABELS.symptoms[symptom].label} biasanya muncul selama masa haid (${tally.duringPeriod} dari ${tally.total} kali tercatat).`,
      tone: 'neutral',
    };
  }
  if (tally.beforePeriod >= 2 && tally.beforePeriod / tally.total >= 0.6) {
    return {
      id: `symptom-${symptom}-pre`,
      title: `${LABELS.symptoms[symptom].label} menjelang haid`,
      detail: `${label.charAt(0).toUpperCase() + label.slice(1)} sering muncul 1-2 hari sebelum haid dimulai (${tally.beforePeriod} dari ${tally.total} kali).`,
      tone: 'neutral',
    };
  }
  if (tally.aroundOvulation >= 2 && tally.aroundOvulation / tally.total >= 0.6) {
    return {
      id: `symptom-${symptom}-ovu`,
      title: `${LABELS.symptoms[symptom].label} di sekitar ovulasi`,
      detail: `${LABELS.symptoms[symptom].label} cenderung muncul di sekitar masa subur (${tally.aroundOvulation} dari ${tally.total} kali).`,
      tone: 'neutral',
    };
  }
  return null;
};

/** Susun daftar wawasan untuk layar Wawasan & laporan. */
export const buildInsights = (data: AppData, ctx: CycleContext): CycleInsight[] => {
  const insights: CycleInsight[] = [];
  const logs = [...data.dailyLogs].sort((a, b) => (a.date < b.date ? 1 : -1));

  // 1. Keteraturan siklus
  const regularity = cycleRegularity(ctx.cycles);
  if (regularity.label && ctx.avgCycleLength) {
    insights.push({
      id: 'regularity',
      title: `Siklusmu ${regularity.label}`,
      detail:
        regularity.label === 'teratur'
          ? `Panjang siklusmu stabil di sekitar ${ctx.avgCycleLength} hari (variasi ±${regularity.stdDev} hari).`
          : `Panjang siklusmu berkisar ${ctx.avgCycleLength} hari dengan variasi ±${regularity.stdDev} hari. Variasi wajar sampai ±7 hari.`,
      tone: regularity.label === 'bervariasi' ? 'attention' : 'positive',
    });
  }

  // 2. Tren panjang siklus: bandingkan 3 siklus terakhir vs 3 sebelumnya
  const lengths = ctx.cycles
    .map((c) => c.cycleLength)
    .filter((n): n is number => n !== null);
  if (lengths.length >= 4) {
    const recent = lengths.slice(0, 3);
    const older = lengths.slice(3, 6);
    const avg = (arr: number[]) => arr.reduce((s, n) => s + n, 0) / arr.length;
    const delta = avg(recent) - avg(older);
    if (Math.abs(delta) >= 2) {
      insights.push({
        id: 'length-trend',
        title: delta < 0 ? 'Siklus cenderung memendek' : 'Siklus cenderung memanjang',
        detail: `Tiga siklus terakhir rata-rata ${Math.abs(Math.round(delta))} hari ${delta < 0 ? 'lebih pendek' : 'lebih panjang'} dibanding sebelumnya.`,
        tone: 'neutral',
      });
    }
  }

  // 3. Konsistensi durasi haid
  if (ctx.cycles.length >= 3 && ctx.avgPeriodLength) {
    const durations = ctx.cycles.map((c) => c.periodLength);
    const unique = new Set(durations);
    if (durations.length >= 3 && unique.size === 1) {
      insights.push({
        id: 'period-duration',
        title: 'Durasi haid konsisten',
        detail: `Haidmu teratur berlangsung ${ctx.avgPeriodLength} hari pada ${durations.length} siklus terakhir.`,
        tone: 'positive',
      });
    }
  }

  // 4. Pola gejala per fase
  if (logs.length >= MIN_LOGS_FOR_PATTERNS) {
    const allSymptoms = new Set<SymptomId>();
    logs.forEach((l) => l.symptoms.forEach((s) => allSymptoms.add(s)));

    const found: CycleInsight[] = [];
    for (const symptom of allSymptoms) {
      const tally = tallySymptom(symptom, logs, ctx);
      const insight = insightForSymptom(symptom, tally);
      if (insight) found.push(insight);
    }
    insights.push(...found.slice(0, 3));

    // Gejala tersering
    const counts = new Map<SymptomId, number>();
    for (const symptom of allSymptoms) {
      counts.set(
        symptom,
        logs.filter((l) => l.symptoms.includes(symptom)).length
      );
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 3 && !found.some((f) => f.title.includes(LABELS.symptoms[top[0]].label))) {
      insights.push({
        id: 'top-symptom',
        title: `Gejala tersering: ${LABELS.symptoms[top[0]].label}`,
        detail: `${LABELS.symptoms[top[0]].label} tercatat pada ${top[1]} hari berbeda.`,
        tone: 'neutral',
      });
    }
  }

  // 5. Cairan subur terakhir
  const lastEggWhite = [...logs]
    .reverse()
    .find((l) => l.fluid === 'egg_white');
  if (lastEggWhite && ctx.fertileWindow) {
    insights.push({
      id: 'fluid-fertile',
      title: 'Sinyal kesuburan terdeteksi',
      detail: `Cairan seperti putih telur terakhir tercatat ${formatShort(lastEggWhite.date)} — tanda klasik masa subur.`,
      tone: 'neutral',
    });
  }

  return insights;
};
