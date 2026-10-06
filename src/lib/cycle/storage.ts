import { appDataSchema } from '@/schemas/cycle.schema';
import type {
  AppData,
  AppSettings,
  FlowIntensity,
  Reminder,
} from '@/types/cycle.type';
import { addDaysISO, todayISO } from './date';

/**
 * Persistensi lokal (localStorage). Seluruh data pengguna tidak pernah
 * meninggalkan perangkat — prinsip privacy by design.
 */

export const STORAGE_KEY = 'lunay.data.v1';
export const NOTIF_LOG_KEY = 'lunay.notif.v1';

export const defaultSettings = (): AppSettings => ({
  displayName: '',
  defaultCycleLength: 28,
  defaultPeriodLength: 5,
  pinHash: null,
  pinSalt: null,
  biometricEnabled: false,
  biometricCredentialId: null,
  pinLength: null,
  notificationsEnabled: false,
  onboarded: false,
});

export const defaultReminders = (): Reminder[] => [
  {
    id: 'period-alert',
    type: 'period',
    enabled: true,
    label: 'Pengingat haid',
    time: '09:00',
    daysBefore: 2,
    intervalHours: 4,
  },
];

export const emptyAppData = (): AppData => ({
  version: 1,
  periods: [],
  dailyLogs: [],
  reminders: defaultReminders(),
  settings: defaultSettings(),
});

/** Muat data dari localStorage; null bila kosong/rusak. Aman di server. */
export const loadAppData = (): AppData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = appDataSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const saveAppData = (data: AppData): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage penuh/diblokir — biarkan app tetap jalan di memori
  }
};

export const clearAppData = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(NOTIF_LOG_KEY);
  } catch {
    // diam
  }
};

/** Serialisasi untuk backup/berbagi dengan dokter. */
export const serializeAppData = (data: AppData): string =>
  JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2);

export const parseImportedData = (raw: string): AppData | null => {
  try {
    const json = JSON.parse(raw) as Record<string, unknown>;
    // Zod membuang kunci asing (mis. `exportedAt`) saat parsing.
    const parsed = appDataSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Data contoh (untuk mencoba app tanpa mengisi manual)
// ---------------------------------------------------------------------------

/** ~6 siklus contoh dengan gejala yang menempel pada fase — untuk demo. */
export const buildDemoData = (today: string = todayISO()): AppData => {
  const data = emptyAppData();
  data.settings.onboarded = true;
  data.settings.displayName = 'Demo';

  // Haid: 5 siklus selesai + 1 sedang berjalan. Dibangun MUNDUR dari haid
  // yang sedang berjalan agar jeda antar mulai konsisten 27-29 hari — kalau
  // dibangun maju lalu dipatok ke hari ini, jeda terakhir jadi outlier
  // artifisial yang merusak rata-rata prediksi.
  const gaps = [28, 29, 27, 29, 28]; // dari haid terbaru ke terlama
  const periodLengths = [5, 4, 5, 5, 4, 4]; // lama -> baru

  const lastStart = addDaysISO(today, -3);
  const starts = [lastStart];
  for (const gap of gaps) {
    starts.unshift(addDaysISO(starts[0], -gap));
  }
  // starts: [t-144, t-116, t-87, t-60, t-31, t-3] (lama -> baru)

  const flowsPool = ['light', 'medium', 'medium', 'heavy', 'light'];
  const periods: AppData['periods'] = starts.map((start, i) => {
    const duration = periodLengths[i];
    const flows: Record<string, FlowIntensity> = {};
    for (let d = 0; d < duration; d++) {
      flows[addDaysISO(start, d)] = flowsPool[
        (d + i) % flowsPool.length
      ] as FlowIntensity;
    }
    return {
      id: `demo-p${i}`,
      start,
      // Haid terakhir masih berjalan (belum ada tanggal selesai)
      end: i === starts.length - 1 ? null : addDaysISO(start, duration - 1),
      flows,
    };
  });
  data.periods = periods;

  // Catatan harian: kram saat haid, sakit kepala menjelang haid
  const logs: AppData['dailyLogs'] = [];
  periods.forEach((period) => {
    // kram di 2 hari pertama haid
    for (let d = 0; d < 2; d++) {
      logs.push({
        date: addDaysISO(period.start, d),
        symptoms: ['cramps', 'fatigue'],
        moods: d === 0 ? ['sensitive'] : ['calm'],
        fluid: null,
        note: '',
      });
    }
    // sakit kepala + irritasi 2 hari sebelum haid berikutnya (kecuali siklus terakhir)
    if (period.end) {
      logs.push({
        date: addDaysISO(period.end, 1),
        symptoms: ['headache'],
        moods: ['irritable'],
        fluid: 'creamy',
        note: '',
      });
      logs.push({
        date: addDaysISO(period.start, 12),
        symptoms: [],
        moods: ['energetic', 'happy'],
        fluid: 'egg_white',
        note: '',
      });
    }
  });
  data.dailyLogs = logs.sort((a, b) => (a.date < b.date ? -1 : 1));

  return data;
};
