import type { Metadata, Viewport } from 'next';
import { DM_Sans, Bricolage_Grotesque } from 'next/font/google';
import { ServiceWorkerRegister } from '@/components/pwa/sw-register';
import { ServiceWorkerCleanupScript } from '@/components/pwa/sw-cleanup-script';
import { ThemeInit } from '@/components/pwa/theme-init';
import { StatusBarShield } from '@/components/layout/status-bar-shield';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: {
    template: '%s — HomeDocket',
    default: 'HomeDocket — Track Your Household Deadlines',
  },
  description:
    'Never miss an NCT, motor tax, insurance renewal, or utility contract deadline again. Free household management app built for Irish homes.',
  metadataBase: new URL('https://homedocket.app'),
  icons: {
    icon: '/logo-icon.svg',
    apple: '/icons/icon-192.png',
  },
  openGraph: {
    siteName: 'HomeDocket',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#B3311B',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ServiceWorkerCleanupScript />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`antialiased ${dmSans.variable} ${bricolageGrotesque.variable}`}
        suppressHydrationWarning
      >
        <ThemeInit />
        <StatusBarShield />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
