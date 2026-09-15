import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryClientProviderWrapper } from '@/components/layouts/query-client-provider';
import { ThemeProvider } from '@/components/layouts/theme-provider';
import '@/styles/globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next.js Starter Kit',
  description: 'A comprehensive Next.js 16 starter kit with modern tools',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
