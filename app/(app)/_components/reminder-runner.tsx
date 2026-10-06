'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useCycleStore } from '@/hooks/use-cycle-store';
import {
  collectDueReminders,
  showSystemNotification,
} from '@/lib/cycle/notifications';

/**
 * Loop pengingat: cek tiap 45 detik selama aplikasi terbuka.
 * Pengingat jatuh tempo muncul sebagai toast in-app dan (bila diizinkan)
 * notifikasi sistem.
 */
export const ReminderRunner = () => {
  const { data, ctx } = useCycleStore();

  useEffect(() => {
    const tick = () => {
      const due = collectDueReminders(data, ctx);
      for (const reminder of due) {
        toast(reminder.title, { description: reminder.body, duration: 12000 });
        showSystemNotification(reminder.title, reminder.body);
      }
    };

    tick();
    const timer = setInterval(tick, 45_000);
    return () => clearInterval(timer);
  }, [data, ctx]);

  return null;
};
