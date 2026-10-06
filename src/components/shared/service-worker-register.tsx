'use client';

import { useEffect } from 'react';

/**
 * Daftarkan service worker hanya di production.
 *
 * Di development aset Next memakai URL yang tidak berubah antar-recompile,
 * jadi cache-first SW akan menyajikan CSS/JS basi. Karena itu di dev SW
 * justru di-unregister dan cache lunay-* dibersihkan agar self-healing.
 */
export const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      if ('caches' in window) {
        void caches.keys().then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith('lunay-'))
              .map((key) => caches.delete(key))
          )
        );
      }
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // browser lama / konteks tidak aman — app tetap jalan normal
    });
  }, []);

  return null;
};
