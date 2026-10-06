import type { z } from 'zod';
import type {
  appDataSchema,
  appSettingsSchema,
  cervicalFluidSchema,
  dailyLogSchema,
  flowIntensitySchema,
  moodSchema,
  periodLogSchema,
  phaseSchema,
  reminderSchema,
  symptomSchema,
} from '@/schemas/cycle.schema';

// ---------------------------------------------------------------------------
// Domain (hasil infer skema)
// ---------------------------------------------------------------------------

export type FlowIntensity = z.infer<typeof flowIntensitySchema>;
export type CervicalFluid = z.infer<typeof cervicalFluidSchema>;
export type SymptomId = z.infer<typeof symptomSchema>;
export type MoodId = z.infer<typeof moodSchema>;
export type PhaseId = z.infer<typeof phaseSchema>;
export type ReminderType = z.infer<typeof reminderSchema>['type'];

export type PeriodLog = z.infer<typeof periodLogSchema>;
export type DailyLog = z.infer<typeof dailyLogSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type AppSettings = z.infer<typeof appSettingsSchema>;
export type AppData = z.infer<typeof appDataSchema>;

// ---------------------------------------------------------------------------
// Hasil komputasi mesin siklus
// ---------------------------------------------------------------------------

/** Satu siklus lengkap yang sudah terekam. */
export interface CycleRecord {
  id: string;
  /** yyyy-MM-dd hari pertama haid */
  start: string;
  /** Panjang siklus (hari) — null untuk siklus terakhir yang belum selesai */
  cycleLength: number | null;
  /** Lama hari haid (hari terakhir dengan aliran) */
  periodLength: number;
}

export interface FertileWindow {
  start: string;
  end: string;
  /** Tanggal ovulasi (puncak kesuburan) */
  ovulation: string;
}

/**
 * Konteks siklus yang sudah dihitung untuk "hari ini".
 * Semua tanggal berformat yyyy-MM-dd (waktu lokal).
 */
export interface CycleContext {
  today: string;
  /** Hari ke-N siklus berjalan; null bila belum ada data haid */
  cycleDay: number | null;
  /** Estimasi panjang siklus berjalan (rata-rata atau nilai default) */
  cycleLengthEstimate: number;
  phase: PhaseId | null;
  lastPeriodStart: string | null;
  /** Haid yang sedang berjalan (belum diakhiri), bila ada */
  currentPeriod: PeriodLog | null;
  /** Perkiraan tanggal haid berikutnya */
  nextPeriodStart: string | null;
  /** Selisih hari ke perkiraan berikutnya; negatif berarti terlambat */
  daysUntilNextPeriod: number | null;
  fertileWindow: FertileWindow | null;
  /** Rata-rata dari riwayat nyata; null bila < 1 siklus selesai */
  avgCycleLength: number | null;
  avgPeriodLength: number | null;
  /** Berapa siklus terakhir dipakai untuk rata-rata (3-6) */
  dataBasis: number;
  cycles: CycleRecord[];
  /** Tanggal dengan haid terekam -> intensitas */
  periodDays: Record<string, FlowIntensity>;
  /** Rentang perkiraan haid berikutnya */
  predictedPeriodDays: string[];
}

export type DayKind =
  | 'plain'
  | 'period'
  | 'predicted_period'
  | 'fertile'
  | 'ovulation';

/** Warna/status satu sel kalender. */
export interface DayStatus {
  date: string;
  kind: DayKind;
  flow: FlowIntensity | null;
  isToday: boolean;
  isFuture: boolean;
  /** Ada catatan harian (gejala/mood/cairan) di tanggal ini */
  hasDailyLog: boolean;
  cycleDay: number | null;
  phase: PhaseId | null;
}

/** Satu temuan otomatis di layar Wawasan. */
export interface CycleInsight {
  id: string;
  title: string;
  detail: string;
  tone: 'neutral' | 'positive' | 'attention';
}
