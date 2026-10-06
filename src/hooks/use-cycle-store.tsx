'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppData,
  AppSettings,
  CervicalFluid,
  CycleContext,
  DailyLog,
  FlowIntensity,
  MoodId,
  PeriodLog,
  Reminder,
  SymptomId,
} from '@/types/cycle.type';
import { buildCycleContext } from '@/lib/cycle/engine';
import { diffDaysISO } from '@/lib/cycle/date';
import {
  clearAppData,
  emptyAppData,
  loadAppData,
  saveAppData,
} from '@/lib/cycle/storage';

/**
 * Single source of truth seluruh data aplikasi (local-first).
 * State di memori + persist otomatis ke localStorage setiap berubah.
 */

const UNLOCK_KEY = 'lunay.unlocked';

const newId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

interface CycleStore {
  data: AppData;
  /** false sampai localStorage selesai dibaca (hindari SSR mismatch) */
  hydrated: boolean;
  ctx: CycleContext;
  /** Terkunci bila PIN aktif dan sesi belum dibuka */
  locked: boolean;
  unlock: () => void;
  lock: () => void;

  // Haid
  startPeriod: (start: string) => void;
  endPeriod: (end: string) => void;
  setFlow: (date: string, flow: FlowIntensity | null) => void;
  deletePeriod: (id: string) => void;

  // Catatan harian
  toggleSymptom: (date: string, symptom: SymptomId) => void;
  toggleMood: (date: string, mood: MoodId) => void;
  setFluid: (date: string, fluid: CervicalFluid | null) => void;
  setNote: (date: string, note: string) => void;

  // Pengaturan & pengingat
  updateSettings: (patch: Partial<AppSettings>) => void;
  upsertReminder: (reminder: Reminder) => void;
  toggleReminder: (id: string) => void;
  removeReminder: (id: string) => void;

  // Data
  replaceData: (data: AppData) => void;
  resetAll: () => void;
}

const CycleStoreContext = createContext<CycleStore | null>(null);

const todayWithin = (period: PeriodLog, today: string): boolean =>
  diffDaysISO(period.start, today) >= 0 &&
  (period.end === null || diffDaysISO(today, period.end) >= 0);

/** Pastikan ada periode yang mencakup `date`; kembalikan [data, periodId]. */
const ensurePeriodCovering = (
  data: AppData,
  date: string
): [AppData, string | null] => {
  const existing = data.periods.find(
    (p) => diffDaysISO(p.start, date) >= 0 && (p.end === null || diffDaysISO(date, p.end) >= 0)
  );
  if (existing) return [data, existing.id];

  // Perluasan: bila date menempel (H+1) dengan periode terbuka/terakhir
  const last = [...data.periods].sort((a, b) => (a.start < b.start ? 1 : -1))[0];
  if (last && last.end === null && diffDaysISO(last.start, date) > 0) {
    return [data, last.id];
  }

  const period: PeriodLog = { id: newId(), start: date, end: null, flows: {} };
  return [
    { ...data, periods: [...data.periods, period] },
    period.id,
  ];
};

export function CycleStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => emptyAppData());
  const [hydrated, setHydrated] = useState(false);
  const [locked, setLocked] = useState(true);

  // Hidrasi dari localStorage — harus lewat effect agar render awal SSR
  // dan klien identik (tanpa hydration mismatch). setState di sini memang
  // disengaja: sinkronisasi satu kali dengan sistem eksternal (localStorage).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const loaded = loadAppData();
    setData(loaded ?? emptyAppData());
    setHydrated(true);
    setLocked(
      loaded ? loaded.settings.pinHash !== null : false
    );
    if (loaded?.settings.pinHash && sessionStorage.getItem(UNLOCK_KEY) === '1') {
      setLocked(false);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist otomatis
  useEffect(() => {
    if (hydrated) saveAppData(data);
  }, [data, hydrated]);

  const ctx = useMemo(() => buildCycleContext(data), [data]);

  const patchData = useCallback(
    (fn: (prev: AppData) => AppData) => setData((prev) => fn(prev)),
    []
  );

  // --- Haid ---------------------------------------------------------------

  const startPeriod = useCallback(
    (start: string) =>
      patchData((prev) => {
        if (prev.periods.some((p) => todayWithin(p, start))) return prev;
        // Tutup periode lama yang masih terbuka sebelum mulai yang baru
        const periods = prev.periods.map((p) =>
          p.end === null && p.start < start ? { ...p, end: start } : p
        );
        return {
          ...prev,
          periods: [...periods, { id: newId(), start, end: null, flows: {} }],
        };
      }),
    [patchData]
  );

  const endPeriod = useCallback(
    (end: string) =>
      patchData((prev) => {
        const open = [...prev.periods]
          .sort((a, b) => (a.start < b.start ? 1 : -1))
          .find((p) => p.end === null);
        if (!open) return prev;
        return {
          ...prev,
          periods: prev.periods.map((p) =>
            p.id === open.id
              ? { ...p, end: diffDaysISO(open.start, end) >= 0 ? end : open.start }
              : p
          ),
        };
      }),
    [patchData]
  );

  const setFlow = useCallback(
    (date: string, flow: FlowIntensity | null) =>
      patchData((prev) => {
        const [withPeriod, periodId] = ensurePeriodCovering(prev, date);
        if (!periodId) return prev;

        return {
          ...withPeriod,
          periods: withPeriod.periods.map((p) => {
            if (p.id !== periodId) return p;
            const flows = { ...p.flows };
            if (flow === null) delete flows[date];
            else flows[date] = flow;

            // Tanpa aliran tersisa -> hapus periode kosong
            if (Object.keys(flows).length === 0) {
              return null;
            }
            // Rapikan rentang start/end
            const days = Object.keys(flows).sort();
            const start = days[0];
            const end = p.end === null ? null : days[days.length - 1];
            return { ...p, start, end, flows };
          }).filter((p): p is PeriodLog => p !== null),
        };
      }),
    [patchData]
  );

  const deletePeriod = useCallback(
    (id: string) =>
      patchData((prev) => ({
        ...prev,
        periods: prev.periods.filter((p) => p.id !== id),
      })),
    [patchData]
  );

  // --- Catatan harian ------------------------------------------------------

  const mutateDailyLog = useCallback(
    (date: string, fn: (base: DailyLog) => DailyLog) =>
      patchData((prev) => {
        const existing = prev.dailyLogs.find((l) => l.date === date);
        const base: DailyLog = existing ?? {
          date,
          symptoms: [],
          moods: [],
          fluid: null,
          note: '',
        };
        const updated: DailyLog = fn(base);
        const logs = existing
          ? prev.dailyLogs.map((l) => (l.date === date ? updated : l))
          : [...prev.dailyLogs, updated];
        // Buang log benar-benar kosong agar file tetap ramping
        const isEmpty =
          updated.symptoms.length === 0 &&
          updated.moods.length === 0 &&
          updated.fluid === null &&
          updated.note.trim() === '';
        return {
          ...prev,
          dailyLogs: isEmpty
            ? logs.filter((l) => l.date !== date)
            : logs.sort((a, b) => (a.date < b.date ? -1 : 1)),
        };
      }),
    [patchData]
  );

  const toggleSymptom = useCallback(
    (date: string, symptom: SymptomId) =>
      mutateDailyLog(date, (base) => ({
        ...base,
        symptoms: base.symptoms.includes(symptom)
          ? base.symptoms.filter((s) => s !== symptom)
          : [...base.symptoms, symptom],
      })),
    [mutateDailyLog]
  );

  const toggleMood = useCallback(
    (date: string, mood: MoodId) =>
      mutateDailyLog(date, (base) => ({
        ...base,
        moods: base.moods.includes(mood)
          ? base.moods.filter((m) => m !== mood)
          : [...base.moods, mood],
      })),
    [mutateDailyLog]
  );

  const setFluid = useCallback(
    (date: string, fluid: CervicalFluid | null) =>
      mutateDailyLog(date, (base) => ({ ...base, fluid })),
    [mutateDailyLog]
  );

  const setNote = useCallback(
    (date: string, note: string) => mutateDailyLog(date, (base) => ({ ...base, note })),
    [mutateDailyLog]
  );

  // --- Pengaturan & pengingat ----------------------------------------------

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) =>
      patchData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })),
    [patchData]
  );

  const upsertReminder = useCallback(
    (reminder: Reminder) =>
      patchData((prev) => {
        const exists = prev.reminders.some((r) => r.id === reminder.id);
        return {
          ...prev,
          reminders: exists
            ? prev.reminders.map((r) => (r.id === reminder.id ? reminder : r))
            : [...prev.reminders, reminder],
        };
      }),
    [patchData]
  );

  const toggleReminder = useCallback(
    (id: string) =>
      patchData((prev) => ({
        ...prev,
        reminders: prev.reminders.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        ),
      })),
    [patchData]
  );

  const removeReminder = useCallback(
    (id: string) =>
      patchData((prev) => ({
        ...prev,
        reminders: prev.reminders.filter((r) => r.id !== id),
      })),
    [patchData]
  );

  // --- Data -----------------------------------------------------------------

  const replaceData = useCallback((next: AppData) => setData(next), []);

  const resetAll = useCallback(() => {
    clearAppData();
    setData(emptyAppData());
  }, []);

  const unlock = useCallback(() => {
    sessionStorage.setItem(UNLOCK_KEY, '1');
    setLocked(false);
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(UNLOCK_KEY);
    setLocked(true);
  }, []);

  const value = useMemo<CycleStore>(
    () => ({
      data,
      hydrated,
      ctx,
      locked,
      unlock,
      lock,
      startPeriod,
      endPeriod,
      setFlow,
      deletePeriod,
      toggleSymptom,
      toggleMood,
      setFluid,
      setNote,
      updateSettings,
      upsertReminder,
      toggleReminder,
      removeReminder,
      replaceData,
      resetAll,
    }),
    [
      data,
      hydrated,
      ctx,
      locked,
      unlock,
      lock,
      startPeriod,
      endPeriod,
      setFlow,
      deletePeriod,
      toggleSymptom,
      toggleMood,
      setFluid,
      setNote,
      updateSettings,
      upsertReminder,
      toggleReminder,
      removeReminder,
      replaceData,
      resetAll,
    ]
  );

  return (
    <CycleStoreContext.Provider value={value}>
      {children}
    </CycleStoreContext.Provider>
  );
}

export function useCycleStore(): CycleStore {
  const store = useContext(CycleStoreContext);
  if (!store) {
    throw new Error('useCycleStore harus dipakai di dalam CycleStoreProvider');
  }
  return store;
}
