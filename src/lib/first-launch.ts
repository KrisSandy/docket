/**
 * First-launch marketing gate helpers.
 *
 * On native (iOS/Android via Capacitor), the marketing landing page should
 * only be shown on the very first app launch. Once the user taps "Open App",
 * the `has_seen_marketing` flag is written to the Dexie settings table and
 * subsequent launches redirect straight to the dashboard.
 *
 * Because the flag lives in the same `settings` table that is wiped by
 * `useBackup().deleteAllData()` (via `db.settings.clear()`), clearing all
 * data from Settings automatically resets first-launch state — so the
 * marketing page will be shown again on the next launch, exactly as
 * required. No extra reset logic needed.
 *
 * On web (next build static export served over HTTP), the gate is a no-op:
 * the marketing page is the primary SEO landing page and must always
 * render for crawlers and repeat visitors.
 */

import { db } from '@/db/database';

export const HAS_SEEN_MARKETING_KEY = 'has_seen_marketing';

/**
 * Returns true when the app is running inside a native Capacitor shell
 * (iOS or Android). Safe to call during SSR/SSG — returns false when
 * `window` is undefined.
 *
 * Mirrors the detection used in `lib/native-file.ts` so behaviour is
 * consistent across the codebase.
 */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined' || !('Capacitor' in window)) return false;
  const cap = (window as unknown as {
    Capacitor: { isNativePlatform?: () => boolean };
  }).Capacitor;
  return typeof cap.isNativePlatform === 'function' && cap.isNativePlatform();
}

/**
 * Reads the has-seen-marketing flag from the Dexie settings table.
 * Returns false on any DB error so the marketing page is shown by default.
 */
export async function hasSeenMarketing(): Promise<boolean> {
  try {
    const setting = await db.settings.get(HAS_SEEN_MARKETING_KEY);
    return setting?.value === 'true';
  } catch {
    return false;
  }
}

/**
 * Persists the has-seen-marketing flag so subsequent native launches
 * skip the marketing page and go straight to the dashboard.
 * Best-effort: any DB failure is swallowed so navigation still proceeds.
 */
export async function markMarketingSeen(): Promise<void> {
  try {
    await db.settings.put({ key: HAS_SEEN_MARKETING_KEY, value: 'true' });
  } catch {
    // Best effort — the user experience (getting into the app) must not
    // be blocked by a storage failure. Worst case: marketing shows again
    // on the next launch, which is harmless.
  }
}
