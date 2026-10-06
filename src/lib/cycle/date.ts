import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Semua tanggal domain memakai string `yyyy-MM-dd` waktu lokal (bukan Date /
 * UTC) agar bebas masalah zona waktu dan serialisasi.
 */

export const toISODate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const fromISODate = (iso: string): Date => parseISO(iso);

export const todayISO = (): string => toISODate(new Date());

export const addDaysISO = (iso: string, amount: number): string =>
  toISODate(addDays(fromISODate(iso), amount));

/** Selisih hari: b - a (positif bila b lebih lambat). */
export const diffDaysISO = (a: string, b: string): number =>
  differenceInCalendarDays(fromISODate(b), fromISODate(a));

export const isBeforeISO = (a: string, b: string): boolean => diffDaysISO(b, a) > 0;

/** Rentang tanggal inklusif, [start, end]. */
export const rangeISO = (start: string, end: string): string[] => {
  const out: string[] = [];
  let cursor = start;
  while (diffDaysISO(cursor, end) >= 0) {
    out.push(cursor);
    cursor = addDaysISO(cursor, 1);
  }
  return out;
};

/** "Sen, 6 Okt" — pendek untuk strip kalender. */
export const formatShort = (iso: string): string =>
  format(fromISODate(iso), 'EEE, d MMM', { locale: localeId });

/** "6 Oktober 2026" */
export const formatLong = (iso: string): string =>
  format(fromISODate(iso), 'd MMMM yyyy', { locale: localeId });

/** "6 Okt" */
export const formatDayMonth = (iso: string): string =>
  format(fromISODate(iso), 'd MMM', { locale: localeId });

/** "Senin" dst. */
export const formatWeekday = (iso: string): string =>
  format(fromISODate(iso), 'EEEE', { locale: localeId });

/** Sapaan sesuai jam (pagi/siang/sore/malam). */
export const greeting = (date: Date = new Date()): string => {
  const h = date.getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 19) return 'Selamat sore';
  return 'Selamat malam';
};
