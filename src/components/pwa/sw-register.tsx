'use client';

import { useEffect } from 'react';
import { isCapacitorOrigin } from '@/lib/first-launch';

/**
 * The service worker exists for the installable web PWA (offline support,
 * asset caching). It has no purpose inside the native Capacitor shell —
 * the app already reads bundled assets straight from Capacitor's local
 * server — and Android WebView's service worker support is unreliable
 * enough to cause real problems (observed: a navigate-mode fetch through
 * an installed SW triggering an infinite reload loop on the current route).
 *
 * Skip registration natively, and proactively unregister any SW that's
 * already controlling the page. This deliberately checks `isCapacitorOrigin()`
 * rather than `window.Capacitor`: an earlier version used the bridge check
 * here, which reads `window.Capacitor` — something Capacitor's native
 * bridge can attach a tick *after* this effect first runs. That race
 * reproduced in production (not just in testing): it let a real SW get
 * registered on-device. That registration then persists across
 * `adb install -r` / app updates (only a full uninstall clears WebView
 * storage), so a one-time bad registration left the app stuck in the
 * reload loop on every future launch, surviving updates that were meant to
 * fix it. `isCapacitorOrigin()` has no such gap — it reads `location.host`,
 * which is set before any script runs. Unregistering on every native
 * launch makes this self-healing instead of requiring a reinstall.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    if (isCapacitorOrigin()) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        })
        .catch(() => {
          // Best effort — nothing to clean up if this fails.
        });
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — app still works without it
    });
  }, []);

  return null;
}
