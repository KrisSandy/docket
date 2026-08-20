'use client';

import { useEffect } from 'react';
import { isNativePlatform } from '@/lib/first-launch';

/**
 * The service worker exists for the installable web PWA (offline support,
 * asset caching). It has no purpose inside the native Capacitor shell —
 * the app already reads bundled assets straight from Capacitor's local
 * server — and Android WebView's service worker support is unreliable
 * enough to cause real problems (observed: a navigate-mode fetch through
 * an installed SW triggering a reload loop). Skip registration natively.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (isNativePlatform()) return;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed — app still works without it
      });
    }
  }, []);

  return null;
}
