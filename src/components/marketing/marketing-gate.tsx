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
 * - Native subsequent launches: the pre-hydration inline script in
 *   `(marketing)/page.tsx` already redirects before paint in the common
 *   case. This effect is a fallback for the rare case that script didn't
 *   run — it uses the same synchronous localStorage check, so there's no
 *   async gap that could flash the marketing page.
 */
export function MarketingGate({ children }: MarketingGateProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isNativePlatform()) return;
    if (hasSeenMarketing()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return <>{children}</>;
}
