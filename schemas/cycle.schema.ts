import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat yyyy-MM-dd');

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Jam harus berformat HH:mm');

// ---------------------------------------------------------------------------
// Enum domain
// ---------------------------------------------------------------------------

export const flowIntensitySchema = z.enum([
  'spotting',
  'light',
  'medium',
  'heavy',
]);

export const cervicalFluidSchema = z.enum([
  'dry',
  'sticky',
  'creamy',
  'egg_white',
]);

export const symptomSchema = z.enum([
  'cramps',
  'bloating',
  'acne',
  'headache',
  'fatigue',
  'backache',
  'nausea',
  'tender_breasts',
]);

export const moodSchema = z.enum([
  'happy',
  'calm',
  'energetic',
  'sensitive',
  'irritable',
  'anxious',
  'sad',
  'angry',
]);

export const reminderTypeSchema = z.enum(['period', 'medication', 'hygiene']);

export const phaseSchema = z.enum([
  'menstrual',
  'follicular',
  'ovulatory',
  'luteal',
]);

// ---------------------------------------------------------------------------
// Entitas
// ---------------------------------------------------------------------------

export const periodLogSchema = z.object({
  id: z.string().min(1),
  start: isoDateSchema,
  end: isoDateSchema.nullable(),
  flows: z.record(z.string(), flowIntensitySchema),
});

export const dailyLogSchema = z.object({
  date: isoDateSchema,
  symptoms: z.array(symptomSchema),
  moods: z.array(moodSchema),
  fluid: cervicalFluidSchema.nullable(),
  note: z.string(),
});

export const reminderSchema = z.object({
  id: z.string().min(1),
  type: reminderTypeSchema,
  enabled: z.boolean(),
  label: z.string().min(1).max(60),
  /** HH:mm — untuk pengingat harian (obat/kontrasepsi) */
  time: timeSchema,
  /** 1-3 hari sebelum perkiraan haid — untuk pengingat periode */
  daysBefore: z.number().int().min(1).max(3),
  /** Jam sekali per N jam — untuk pengingat higiene saat haid */
  intervalHours: z.number().int().min(2).max(12),
});

export const appSettingsSchema = z.object({
  displayName: z.string().max(40),
  defaultCycleLength: z.number().int().min(20).max(45),
  defaultPeriodLength: z.number().int().min(2).max(10),
  pinHash: z.string().nullable(),
  pinSalt: z.string().nullable(),
  biometricEnabled: z.boolean(),
  /** rawId (base64) kredensial WebAuthn untuk buka kunci via biometrik */
  biometricCredentialId: z.string().nullable(),
  /** Panjang PIN terdaftar (4-6) supaya layar kunci tahu kapan submit */
  pinLength: z.number().int().min(4).max(6).nullable(),
  notificationsEnabled: z.boolean(),
  onboarded: z.boolean(),
});

export const appDataSchema = z.object({
  version: z.literal(1),
  periods: z.array(periodLogSchema),
  dailyLogs: z.array(dailyLogSchema),
  reminders: z.array(reminderSchema),
  settings: appSettingsSchema,
});

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

export const startPeriodFormSchema = z.object({
  start: isoDateSchema,
});

export const medicationReminderFormSchema = z.object({
  label: z.string().min(1, 'Nama wajib diisi').max(60),
  time: timeSchema,
});

export const displayNameFormSchema = z.object({
  displayName: z.string().max(40),
});

export const pinFormSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN harus 4-6 angka'),
});
