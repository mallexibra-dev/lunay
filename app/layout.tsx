import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { QueryClientProviderWrapper } from '@/components/layouts/query-client-provider';
import { ThemeProvider } from '@/components/layouts/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ServiceWorkerRegister } from '@/components/shared/service-worker-register';
import { CycleStoreProvider } from '@/hooks/use-cycle-store';
import '@/styles/globals.css';

// Poppins — satu-satunya font app.
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
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
    // (html { font-family }) bisa membaca var(--font-poppins).
    <html lang='id' suppressHydrationWarning className={poppins.variable}>
      {/* font-sans = var(--font-poppins) langsung di body, tak bergantung chain preflight */}
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
