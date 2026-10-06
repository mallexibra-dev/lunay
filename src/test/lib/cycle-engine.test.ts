import { describe, expect, it } from 'vitest';
import {
  buildCycles,
  buildCycleContext,
  computeAverages,
  cycleRegularity,
  getDayStatus,
  phaseOfDay,
} from '@/lib/cycle/engine';
import { buildInsights } from '@/lib/cycle/patterns';
import { collectDueReminders } from '@/lib/cycle/notifications';
import {
  addDaysISO,
  diffDaysISO,
  rangeISO,
  toISODate,
} from '@/lib/cycle/date';
import { appDataSchema } from '@/schemas/cycle.schema';
import { buildDemoData, emptyAppData } from '@/lib/cycle/storage';
import { hashPin, makeSalt, verifyPin } from '@/lib/cycle/crypto';
import type { FlowIntensity, PeriodLog } from '@/types/cycle.type';

//helpers --------------------------------------------------------------

const flows = (start: string, days: number): Record<string, FlowIntensity> =>
  Object.fromEntries(
    rangeISO(start, addDaysISO(start, days - 1)).map((day, i) => [
      day,
      i === 0 ? 'light' : 'medium',
    ])
  );

const period = (
  id: string,
  start: string,
  days: number,
  end?: string
): PeriodLog => ({
  id,
  start,
  end: end ?? addDaysISO(start, days - 1),
  flows: flows(start, days),
});

//date utils -----------------------------------------------------------

describe('utilitas tanggal', () => {
  it('menghitung selisih dan menambah hari dengan benar', () => {
    expect(diffDaysISO('2026-01-01', '2026-01-31')).toBe(30);
    expect(addDaysISO('2026-01-31', 1)).toBe('2026-02-01');
    expect(rangeISO('2026-01-30', '2026-02-02')).toEqual([
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
      '2026-02-02',
    ]);
    expect(toISODate(new Date(2026, 9, 6))).toBe('2026-10-06');
  });
});

//engine ---------------------------------------------------------------

describe('mesin siklus', () => {
  it('menghitung panjang siklus antar tanggal mulai haid', () => {
    const cycles = buildCycles([
      period('a', '2026-06-01', 5),
      period('b', '2026-06-29', 4),
      period('c', '2026-07-27', 5),
    ]);
    expect(cycles).toHaveLength(3);
    expect(cycles[0].cycleLength).toBeNull(); // terbaru = sedang berjalan
    expect(cycles[1].cycleLength).toBe(28);
    expect(cycles[2].cycleLength).toBe(28); // terlama = selesai
    expect(cycles[2].periodLength).toBe(5);
  });

  it('merata-ratakan 3-6 siklus terakhir', () => {
    const cycles = buildCycles([
      period('a', '2026-06-01', 5),
      period('b', '2026-06-29', 4),
      period('c', '2026-07-27', 5),
      period('d', '2026-08-22', 5), // 26 hari
    ]);
    const averages = computeAverages(cycles, 28);
    // 3 siklus selesai: 28, 28, 26 -> rata-rata 27
    expect(averages.avgCycleLength).toBe(27);
    expect(averages.basis).toBe(3);
    expect(averages.avgPeriodLength).toBe(5);
  });

  it('memakai nilai default bila belum ada siklus selesai', () => {
    const cycles = buildCycles([period('a', '2026-08-24', 4)]);
    const averages = computeAverages(cycles, 30);
    expect(averages.avgCycleLength).toBe(30);
    expect(averages.basis).toBe(0);
  });

  it('menentukan fase siklus dengan benar (siklus 28 hari, haid 5 hari)', () => {
    // ovulasi = hari 14; subur = hari 9-15
    expect(phaseOfDay(3, 28, 5)).toBe('menstrual');
    expect(phaseOfDay(8, 28, 5)).toBe('follicular');
    expect(phaseOfDay(9, 28, 5)).toBe('ovulatory');
    expect(phaseOfDay(14, 28, 5)).toBe('ovulatory');
    expect(phaseOfDay(15, 28, 5)).toBe('ovulatory');
    expect(phaseOfDay(16, 28, 5)).toBe('luteal');
    expect(phaseOfDay(28, 28, 5)).toBe('luteal');
  });

  it('membangun konteks prediksi dari haid berjalan', () => {
    const data = emptyAppData();
    data.periods = [
      period('a', '2026-06-01', 5),
      period('b', '2026-06-29', 4),
      period('c', '2026-07-27', 5),
      {
        id: 'd',
        start: '2026-08-24',
        end: null,
        flows: flows('2026-08-24', 3),
      },
    ];

    const ctx = buildCycleContext(data, '2026-08-26');

    expect(ctx.cycleDay).toBe(3);
    expect(ctx.phase).toBe('menstrual');
    expect(ctx.currentPeriod?.id).toBe('d');
    // rata-rata 28 -> haid berikutnya 24 Agu + 28 = 21 Sep
    expect(ctx.nextPeriodStart).toBe('2026-09-21');
    expect(ctx.daysUntilNextPeriod).toBe(26);
    // ovulasi 14 hari sebelum haid berikutnya
    expect(ctx.fertileWindow?.ovulation).toBe('2026-09-07');
    expect(ctx.fertileWindow?.start).toBe('2026-09-02');
    expect(ctx.fertileWindow?.end).toBe('2026-09-08');
  });

  it('menandai status hari untuk kalender', () => {
    const data = emptyAppData();
    data.periods = [
      { id: 'a', start: '2026-09-28', end: null, flows: flows('2026-09-28', 4) },
    ];
    const ctx = buildCycleContext(data, '2026-10-01');

    // 29 Sep: hari haid ke-2 (aliran medium)
    const periodDay = getDayStatus('2026-09-29', ctx);
    expect(periodDay.kind).toBe('period');
    expect(periodDay.flow).toBe('medium');

    // 8 Okt: ovulasi (mulai 28 Sep + 28 = 26 Okt berikutnya -> ovulasi 12 Okt;
    // 8 Okt masuk jendela subur)
    expect(getDayStatus('2026-10-12', ctx).kind).toBe('ovulation');
    expect(getDayStatus('2026-10-08', ctx).kind).toBe('fertile');

    // hari biasa setelah masa subur
    expect(getDayStatus('2026-10-20', ctx).kind).toBe('plain');

    // rentang perkiraan haid berikutnya
    const predicted = getDayStatus('2026-10-26', ctx);
    expect(predicted.kind).toBe('predicted_period');
  });

  it('mengklasifikasi keteraturan dari simpangan baku', () => {
    const regular = buildCycles([
      period('a', '2026-06-01', 5),
      period('b', '2026-06-29', 5),
      period('c', '2026-07-27', 5),
      period('d', '2026-08-24', 5),
    ]);
    expect(cycleRegularity(regular).label).toBe('teratur');

    const varied = buildCycles([
      period('a', '2026-06-01', 5),
      period('b', '2026-06-24', 5), // 23 hari
      period('c', '2026-07-27', 5), // 33 hari
      period('d', '2026-08-29', 5), // 33 hari
    ]);
    expect(['bervariasi', 'cukup teratur']).toContain(
      cycleRegularity(varied).label
    );
  });
});

//pola -----------------------------------------------------------------

describe('analisis pola', () => {
  it('menemukan gejala yang menempel pada masa haid', () => {
    const data = emptyAppData();
    data.periods = [
      period('a', '2026-06-01', 5),
      period('b', '2026-06-29', 5),
      period('c', '2026-07-27', 5),
    ];
    // kram pada 2 hari pertama tiap haid
    data.dailyLogs = [
      '2026-06-01',
      '2026-06-02',
      '2026-06-29',
      '2026-06-30',
      '2026-07-27',
      '2026-07-28',
    ].map((date) => ({
      date,
      symptoms: ['cramps'],
      moods: [],
      fluid: null,
      note: '',
    }));

    const ctx = buildCycleContext(data, '2026-08-01');
    const insights = buildInsights(data, ctx);
    const cramps = insights.find((i) => i.id === 'symptom-cramps-period');
    expect(cramps).toBeDefined();
    expect(cramps?.detail).toContain('6 dari 6');
  });

  it('tidak menghasilkan pola gejala bila data terlalu sedikit', () => {
    const data = emptyAppData();
    data.periods = [period('a', '2026-07-27', 5)];
    data.dailyLogs = [
      {
        date: '2026-07-27',
        symptoms: ['cramps'],
        moods: [],
        fluid: null,
        note: '',
      },
    ];
    const ctx = buildCycleContext(data, '2026-07-28');
    const insights = buildInsights(data, ctx);
    expect(insights.find((i) => i.id.startsWith('symptom-'))).toBeUndefined();
  });
});

//audit kasus batas ------------------------------------------------------

describe('audit kasus batas', () => {
  it('siklus 35 hari: ovulasi hari ke-21, luteal tetap ~14 hari', () => {
    // ovu = 35-14 = 21; subur = 16..22
    expect(phaseOfDay(5, 35, 5)).toBe('menstrual');
    expect(phaseOfDay(15, 35, 5)).toBe('follicular');
    expect(phaseOfDay(16, 35, 5)).toBe('ovulatory');
    expect(phaseOfDay(21, 35, 5)).toBe('ovulatory');
    expect(phaseOfDay(22, 35, 5)).toBe('ovulatory');
    expect(phaseOfDay(23, 35, 5)).toBe('luteal');
    expect(phaseOfDay(35, 35, 5)).toBe('luteal');
  });

  it('haid yang sudah ditandai selesai bukan haid aktif', () => {
    const data = emptyAppData();
    data.periods = [period('a', '2026-09-01', 4)]; // selesai 4 Sep
    const ctx = buildCycleContext(data, '2026-09-15');

    expect(ctx.currentPeriod).toBeNull(); // kartu "Mulai haid?" tampil lagi
    expect(ctx.cycleDay).toBe(15);
    // hari ke-15 dari siklus 28 hari = ujung jendela subur
    expect(ctx.phase).toBe('ovulatory');
  });

  it('haid aktif bila tanggal selesai >= hari ini', () => {
    const data = emptyAppData();
    data.periods = [period('a', '2026-09-03', 4)]; // end = 6 Sep
    const ctx = buildCycleContext(data, '2026-09-06');
    expect(ctx.currentPeriod?.id).toBe('a');
  });

  it('haid telat (overdue): prediksi menunjuk tanggal lampau', () => {
    const data = emptyAppData();
    data.periods = [
      { id: 'a', start: '2026-09-06', end: null, flows: flows('2026-09-06', 4) },
    ];
    const ctx = buildCycleContext(data, '2026-10-06');

    expect(ctx.cycleDay).toBe(31);
    expect(ctx.phase).toBe('luteal');
    // 6 Sep + 28 = 4 Okt -> sudah lewat 2 hari
    expect(ctx.nextPeriodStart).toBe('2026-10-04');
    expect(ctx.daysUntilNextPeriod).toBe(-2);
    // hari ini masih masuk rentang perkiraan haid (4-7 Okt, est. 4 hari)
    expect(getDayStatus('2026-10-06', ctx).kind).toBe('predicted_period');
  });

  it('siklus ekstrem (>60 hari) disaring dari rata-rata', () => {
    // jeda: 26, 90 (lupa catat ~3 bulan), 27
    const starts = ['2026-01-01'];
    for (const gap of [26, 90, 27]) {
      starts.push(addDaysISO(starts[starts.length - 1], gap));
    }
    const data = emptyAppData();
    data.periods = starts.map((start, i) => period(`p${i}`, start, 4));

    const cycles = buildCycles(data.periods);
    const averages = computeAverages(cycles, 28);
    // hanya 27 & 26 yang lolos filter 15-60 -> rata-rata 26,5 ~ 27
    expect(averages.basis).toBe(2);
    expect(averages.avgCycleLength).toBe(27);
    expect(cycleRegularity(cycles).label).toBe('teratur'); // sd = 0,5
  });

  it('rata-rata memakai maksimal 6 siklus terakhir', () => {
    // 9 haid berjarak 29 hari = 8 siklus selesai, tapi basis cuma 6
    const starts = ['2026-01-01'];
    for (let i = 0; i < 8; i++) {
      starts.push(addDaysISO(starts[starts.length - 1], 29));
    }
    const cycles = buildCycles(
      starts.map((start, i) => period(`p${i}`, start, 4))
    );
    const averages = computeAverages(cycles, 28);
    expect(averages.basis).toBe(6);
    expect(averages.avgCycleLength).toBe(29);
  });

  it('tanggal aman di batas bulan & tahun kabisat', () => {
    expect(addDaysISO('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysISO('2026-02-28', 1)).toBe('2026-03-01'); // 2026 bukan kabisat
    expect(addDaysISO('2028-02-28', 1)).toBe('2028-02-29'); // 2028 kabisat
    expect(diffDaysISO('2025-12-31', '2026-01-01')).toBe(1);
    expect(addDaysISO('2026-09-20', 28)).toBe('2026-10-18');
  });

  it('data contoh: jeda konsisten 27-29 hari, prediksi 28 hari ke depan', () => {
    const demo = buildDemoData('2026-10-06');
    const cycles = buildCycles(demo.periods);
    const completed = cycles
      .filter((c): c is typeof c & { cycleLength: number } => c.cycleLength !== null)
      .map((c) => c.cycleLength);

    expect(completed.every((l) => l >= 27 && l <= 29)).toBe(true);
    expect(computeAverages(cycles, 28).avgCycleLength).toBe(28); // (28+29+27+29+28)/5 = 28,2
    expect(cycleRegularity(cycles).label).toBe('teratur'); // sd ~0,7

    const ctx = buildCycleContext(demo, '2026-10-06');
    expect(ctx.nextPeriodStart).toBe('2026-10-31'); // 3 Okt + 28
    expect(ctx.daysUntilNextPeriod).toBe(25);
    expect(ctx.fertileWindow?.ovulation).toBe('2026-10-17'); // 31 Okt - 14
    expect(ctx.fertileWindow?.start).toBe('2026-10-12');
    expect(ctx.fertileWindow?.end).toBe('2026-10-18');
  });

  it('pengingat higiene hanya saat ada aliran tercatat hari ini', () => {
    const data = emptyAppData();
    data.periods = [period('a', '2026-10-04', 4)]; // aliran 4-7 Okt
    data.reminders.push({
      id: 'hyg',
      type: 'hygiene',
      enabled: true,
      label: 'Higiene',
      time: '09:00',
      daysBefore: 2,
      intervalHours: 4,
    });

    // 6 Okt: masih haid -> pengingat jatuh tempo
    const ctxA = buildCycleContext(data, '2026-10-06');
    const dueA = collectDueReminders(data, ctxA, new Date(2026, 9, 6, 10, 0));
    expect(dueA.some((d) => d.id.startsWith('hygiene:'))).toBe(true);

    // 9 Okt: aliran sudah berhenti -> tidak ada pengingat higiene
    const ctxB = buildCycleContext(data, '2026-10-09');
    const dueB = collectDueReminders(data, ctxB, new Date(2026, 9, 9, 10, 0));
    expect(dueB.some((d) => d.id.startsWith('hygiene:'))).toBe(false);
  });

  it('pengingat obat sekali per hari pada jamnya', () => {
    const data = emptyAppData();
    data.periods = [period('a', '2026-10-04', 4)];
    data.reminders.push({
      id: 'med1',
      type: 'medication',
      enabled: true,
      label: 'Pil KB',
      time: '21:00',
      daysBefore: 2,
      intervalHours: 4,
    });
    const ctx = buildCycleContext(data, '2026-10-06');

    // sebelum jamnya: belum due
    const early = collectDueReminders(data, ctx, new Date(2026, 9, 6, 20, 59));
    expect(early.some((d) => d.id.startsWith('med:med1'))).toBe(false);

    // lewat jamnya: due sekali...
    const due = collectDueReminders(data, ctx, new Date(2026, 9, 6, 21, 30));
    expect(due.some((d) => d.id.startsWith('med:med1'))).toBe(true);

    // ...dan tidak berulang di hari yang sama
    const again = collectDueReminders(data, ctx, new Date(2026, 9, 6, 22, 0));
    expect(again.some((d) => d.id.startsWith('med:med1'))).toBe(false);
  });
});

//data & crypto ---------------------------------------------------------

describe('data & crypto', () => {
  it('data contoh valid terhadap skema', () => {
    const demo = buildDemoData('2026-10-06');
    expect(appDataSchema.safeParse(demo).success).toBe(true);
    expect(demo.periods.length).toBeGreaterThanOrEqual(4);
  });

  it('hash PIN memverifikasi dengan benar', async () => {
    const salt = makeSalt();
    const hash = await hashPin('1234', salt);
    expect(await verifyPin('1234', salt, hash)).toBe(true);
    expect(await verifyPin('9999', salt, hash)).toBe(false);
  });
});
