import type { AppData, CycleContext } from '@/types/cycle.type';
import { NOTIF_LOG_KEY } from './storage';

/**
 * Pengingat lokal via Notification API + toast in-app.
 *
 * Catatan jujur soal batasannya: web app tidak bisa mengirim push saat
 * browser tertutup (butuh PWA + service worker + server push). Pengingat
 * di sini aktif selama aplikasi terbuka — dan semua pengingat tetap tampil
 * sebagai daftar di aplikasi walau izin notifikasi tidak diberikan.
 */

export interface DueReminder {
  id: string;
  title: string;
  body: string;
}

interface FiredLog {
  /** kunci unik per pengingat -> tanggal ISO terakhir dikirim */
  [key: string]: string;
}

const loadFiredLog = (): FiredLog => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(NOTIF_LOG_KEY) ?? '{}') as FiredLog;
  } catch {
    return {};
  }
};

const saveFiredLog = (log: FiredLog): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NOTIF_LOG_KEY, JSON.stringify(log));
  } catch {
    // diam
  }
};

export const notificationSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export const notificationPermission = (): NotificationPermission | 'unsupported' =>
  notificationSupported() ? Notification.permission : 'unsupported';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!notificationSupported()) return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
};

/** Kirim notifikasi OS; kembalikan false bila tidak diizinkan. */
export const showSystemNotification = (title: string, body: string): boolean => {
  if (!notificationSupported() || Notification.permission !== 'granted') return false;
  try {
    new Notification(title, { body, tag: title });
    return true;
  } catch {
    return false;
  }
};

/**
 * Cek semua pengingat yang jatuh tempo "sekarang".
 * Dipanggil berkala selama aplikasi terbuka; idempoten per hari/jam.
 */
export const collectDueReminders = (
  data: AppData,
  ctx: CycleContext,
  now: Date = new Date()
): DueReminder[] => {
  const due: DueReminder[] = [];
  const today = ctx.today;
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
  const log = loadFiredLog();
  const firedToday = (key: string) => log[key] === today;
  const markFired = (key: string) => {
    log[key] = today;
  };

  for (const reminder of data.reminders) {
    if (!reminder.enabled) continue;

    if (reminder.type === 'period') {
      // 1-3 hari sebelum perkiraan haid
      if (
        ctx.nextPeriodStart &&
        ctx.daysUntilNextPeriod !== null &&
        ctx.daysUntilNextPeriod > 0 &&
        ctx.daysUntilNextPeriod <= reminder.daysBefore &&
        !firedToday(`period:${ctx.nextPeriodStart}`)
      ) {
        due.push({
          id: `period:${ctx.nextPeriodStart}`,
          title: 'Haidmu diperkirakan segera dimulai',
          body: `Sekitar ${ctx.daysUntilNextPeriod} hari lagi berdasarkan siklusmu. Siapkan kebutuhanmu.`,
        });
        markFired(`period:${ctx.nextPeriodStart}`);
      }
    }

    if (reminder.type === 'medication') {
      // Harian, pada jam yang ditentukan
      if (hhmm >= reminder.time && !firedToday(`med:${reminder.id}:${today}`)) {
        due.push({
          id: `med:${reminder.id}:${today}`,
          title: reminder.label,
          body: `Saatnya ${reminder.label.toLowerCase()} (${reminder.time}).`,
        });
        markFired(`med:${reminder.id}:${today}`);
      }
    }

    if (reminder.type === 'hygiene') {
      // Hanya saat haid aktif, sekali per N jam
      const isBleedingToday = Boolean(ctx.periodDays[today]);
      const lastKey = `hygiene:${reminder.id}`;
      const lastFired = log[lastKey];
      const elapsedHours = lastFired
        ? (now.getTime() - new Date(lastFired).getTime()) / 3_600_000
        : Number.POSITIVE_INFINITY;

      if (isBleedingToday && elapsedHours >= reminder.intervalHours) {
        due.push({
          id: `${lastKey}:${now.getTime()}`,
          title: 'Pengingat higiene',
          body: 'Sudah waktunya mengganti pembalut / tampon / cup.',
        });
        log[lastKey] = now.toISOString();
      }
    }
  }

  if (due.length > 0) saveFiredLog(log);
  return due;
};
