import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AnimatedBackground } from '@/components/animated-background';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  variable: '--font-tajawal',
  display: 'swap',
  weight: ['300', '400', '500', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'محمـد ماركت | Mhmd Market - نظام إدارة السوبر ماركت الاحترافي',
  description: 'نظام متكامل لإدارة السوبر ماركت مع فودافون كاش، نقطة بيع، مخازن، موردين، عملاء، عروض، ولاء، وتقارير احترافية.',
  keywords: ['سوبر ماركت', 'فودافون كاش', 'كاشير', 'نقطة بيع', 'إدارة مخزون', 'Mhmd Market'],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Mhmd Market' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${tajawal.variable} font-sans`}>
        <Providers>
          <AnimatedBackground />
          {children}
        </Providers>
      </body>
    </html>
  );
}
