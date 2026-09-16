import type { Metadata } from 'next';
import { Geist_Mono, Poppins } from 'next/font/google';
import { QueryClientProviderWrapper } from '@/components/layouts/query-client-provider';
import { ThemeProvider } from '@/components/layouts/theme-provider';
import '@/styles/globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Codasia Web Starter',
  description:
    'Starter kit internal Codasia: Next.js 16, Tailwind CSS v4, shadcn/ui, Drizzle ORM, React Query, dan dokumentasi teknis lengkap di /docs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
