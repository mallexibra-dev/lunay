import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Nunito } from 'next/font/google';
import { QueryClientProviderWrapper } from '@/components/layouts/query-client-provider';
import { ThemeProvider } from '@/components/layouts/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ServiceWorkerRegister } from '@/components/shared/service-worker-register';
import { CycleStoreProvider } from '@/hooks/use-cycle-store';
import '@/styles/globals.css';

// Nunito — satu-satunya font app (permintaan eksplisit).
const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lunay — Pelacak Siklus & Kesehatan Wanita',
  description:
    'Catat haid, gejala, dan sinyal tubuhmu; lihat prediksi siklus dan wawasan kesehatan. Data tersimpan privat di perangkatmu.',
  applicationName: 'Lunay',
  appleWebApp: {
    capable: true,
    title: 'Lunay',
    statusBarStyle: 'default',
  },
};

// Lunay selalu terang (tanpa dark mode).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fefafc',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Variabel font dipasang di <html> agar preflight Tailwind
    // (html { font-family }) bisa membaca var(--font-nunito).
    <html lang='id' suppressHydrationWarning className={`${nunito.variable} ${geistMono.variable}`}>
      {/* font-sans = var(--font-nunito) langsung di body, tak bergantung chain preflight */}
      <body className='font-sans antialiased'>
        <ThemeProvider>
          <CycleStoreProvider>
            {children}
            <Toaster position='top-center' />
            <ServiceWorkerRegister />
          </CycleStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
