import type { Metadata, Viewport } from 'next';
import { ServiceWorkerRegister } from '@/components/pwa/sw-register';
import { ThemeInit } from '@/components/pwa/theme-init';
import { StatusBarShield } from '@/components/layout/status-bar-shield';
import './globals.css';

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
  themeColor: '#0073ff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeInit />
        <StatusBarShield />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
