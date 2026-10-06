import Link from 'next/link';
import { LunayLogo } from '@/components/shared/lunay-logo';

/** Halaman fallback service worker saat navigasi offline. */
export default function OfflinePage() {
  return (
    <div className='app-theme grid min-h-dvh place-items-center bg-background px-6 text-foreground'>
      <div className='w-full max-w-sm rounded-3xl border-2 border-border bg-card p-8 text-center shadow-sm'>
        <LunayLogo className='mx-auto size-12' />
        <h1 className='mt-4 font-display text-xl font-semibold tracking-tight'>
          Kamu sedang offline
        </h1>
        <p className='mt-2 text-[13px] leading-relaxed text-muted-foreground'>
          Tidak masalah — semua catatanmu tersimpan aman di perangkat ini.
          Sambungkan internet lagi lalu buka Lunay seperti biasa.
        </p>
        <Link
          href='/'
          className='mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
        >
          Coba lagi
        </Link>
      </div>
    </div>
  );
}
