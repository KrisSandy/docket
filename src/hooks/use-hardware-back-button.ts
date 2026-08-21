'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { invokeTopBackHandler } from '@/lib/back-handler-stack';
import { isNativePlatform } from '@/lib/first-launch';

// The app's true home screen — pressing back here should background the
// app (standard Android behaviour) rather than navigate or exit.
const ROOT_PATH = '/dashboard';

/**
 * Wires the Android hardware/gesture back button to in-app navigation.
 *
 * Without this, Capacitor falls back to the WebView's own history, which
 * is unreliable for a client-routed SPA and often just closes the app.
 * Priority order per press:
 *   1. Topmost registered back handler (see useBackHandler) — e.g. cancel
 *      an in-progress edit instead of leaving the screen.
 *   2. Browser history back, when there's somewhere to go.
 *   3. Minimize the app on the dashboard (the root screen).
 *
 * Should be called once in the app layout. No-ops on web.
 */
export function useHardwareBackButton(): void {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!isNativePlatform()) return;

    let removeListener: (() => void) | undefined;
    let cancelled = false;

    const setup = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('backButton', () => {
          if (invokeTopBackHandler()) return;

          if (pathnameRef.current === ROOT_PATH) {
            App.minimizeApp();
            return;
          }

          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push(ROOT_PATH);
          }
        });
        if (cancelled) {
          listener.remove();
        } else {
          removeListener = () => listener.remove();
        }
      } catch {
        // Web / no native runtime — no-op.
      }
    };

    setup();
    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, [router]);
}
