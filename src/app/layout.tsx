import type { Metadata, Viewport } from 'next';
import { ServiceWorkerRegister } from '@/components/pwa/sw-register';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s — HomeDocket',
    default: 'HomeDocket — Track Your Household Deadlines',
  },
  description:
    'Never miss an NCT, motor tax, insurance renewal, or utility contract deadline again. Free household management app built for Irish homes.',
  metadataBase: new URL('https://homedocket.app'),
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
        {/* Inline script to apply dark class before first paint — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var r=new Promise(function(resolve){var o=indexedDB.open("homedocket");o.onsuccess=function(){var db=o.result;try{var tx=db.transaction("settings","readonly");var st=tx.objectStore("settings");var g=st.get("theme_mode");g.onsuccess=function(){resolve(g.result?g.result.value:null)};g.onerror=function(){resolve(null)}}catch(e){resolve(null)}};o.onerror=function(){resolve(null)}});r.then(function(v){var dark=v==="dark"||(v!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(dark)d.classList.add("dark")}).catch(function(){})}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
