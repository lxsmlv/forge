import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";
import "./design-system.css";
import { AppShell } from "@/features/navigation/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { AblyRootProvider } from "@/lib/ably/root-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover' as const,
};

export const metadata: Metadata = {
  title: 'FORGE — Friends Club',
  description: 'Lift. Drive. Live well. A friends club for those who lift, drive, and live well.',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FORGE',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'FORGE — Friends Club',
    description: 'Lift. Drive. Live well. A friends club for those who lift, drive, and live well.',
    url: 'https://forgeclub.app',
    siteName: 'FORGE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FORGE — Friends Club',
    description: 'Lift. Drive. Live well.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white safe-top safe-bottom">
        <ThemeProvider>
          <AblyRootProvider>
            <AppShell>{children}</AppShell>
            <Toaster theme="dark" position="top-center" />
          </AblyRootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
