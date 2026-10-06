'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LunayLogo } from '@/components/shared/lunay-logo';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { BottomNav } from './bottom-nav';
import { LockScreen } from './lock-screen';
import { ReminderRunner } from './reminder-runner';

/**
 * Kerangka aplikasi: splash saat hidrasi, gerbang onboarding & kunci PIN,
 * lalu konten + tab bar bawah (disembunyikan di halaman laporan agar
 * hasil cetak bersih).
 */
export const AppShell = ({ children }: { children: ReactNode }) => {
  const { hydrated, locked, data } = useCycleStore();
  const pathname = usePathname();
  const router = useRouter();

  const isReport = pathname.startsWith('/report');

  useEffect(() => {
    if (hydrated && !data.settings.onboarded) {
      router.replace('/onboarding');
    }
  }, [hydrated, data.settings.onboarded, router]);

  if (!hydrated) {
    return (
      <div className='app-theme grid min-h-dvh place-items-center bg-background text-foreground'>
        <div className='flex flex-col items-center gap-3'>
          <LunayLogo className='size-12 animate-pulse' />
          <span className='sr-only'>Memuat Lunay…</span>
        </div>
      </div>
    );
  }

  if (locked) return <LockScreen />;

  return (
    <div className='app-theme min-h-dvh bg-background text-foreground'>
      {/* Padding bawah menyediakan ruang tab bar fixed + safe-area iOS */}
      <main className='app-shell-main mx-auto w-full max-w-md px-5 pt-6 pb-[calc(6rem_+_env(safe-area-inset-bottom))]'>
        {children}
      </main>
      {!isReport && <BottomNav />}
      <ReminderRunner />
    </div>
  );
};
