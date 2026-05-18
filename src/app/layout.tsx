import type { Metadata } from 'next';
import { Spectral, Nunito } from 'next/font/google';
import './globals.css';

const spectral = Spectral({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Бежевая лапа · workbook',
  description: 'Рабочая тетрадь к бизнес-плану груминг-студии',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover' as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${spectral.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
