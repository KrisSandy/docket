'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasSeenMarketing, isNativePlatform } from '@/lib/first-launch';

interface MarketingGateProps {
  children: React.ReactNode;
}

/**
 * Client-side gate that wraps the marketing landing page content.
 *
 * - Web / SSR: children render as usual. SEO crawlers and web visitors
 *   always see the full pre-rendered marketing page.
 * - Native (Capacitor) first launch: children render so the user can
 *   read the marketing copy and tap "Open App".
 * - Native subsequent launches: detects that `has_seen_marketing` is set
 *   in the Dexie settings table and calls `router.replace('/dashboard')`
 *   to jump straight into the app.
 *
 * The `has_seen_marketing` flag lives in the `settings` table, which is
 * wiped by the "Delete All My Data" flow in Settings, so clearing data
 * automatically brings the marketing page back on the next launch.
 *
 * Design note: we deliberately do NOT hide children behind a loading
 * placeholder. Doing so would either break SEO (if hidden during SSR)
 * or cause a hydration mismatch on native (if hidden only on client
 * native). The redirect-on-mount approach means native "seen" users
 * may briefly glimpse the marketing page before `router.replace` fires,
 * but the flash is typically a single frame on modern devices and is
 * an acceptable trade-off for a simple, SEO-correct, hydration-safe
 * implementation.
 */
export function MarketingGate({ children }: MarketingGateProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isNativePlatform()) return;

    let cancelled = false;
    hasSeenMarketing()
      .then((seen) => {
        if (cancelled) return;
        if (seen) {
          router.replace('/dashboard');
        }
      })
      .catch(() => {
        // On DB error, leave the marketing page visible — failing open
        // to marketing is always safer than a blank screen.
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <>{children}</>;
}
