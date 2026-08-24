/**
 * First-launch marketing gate helpers.
 *
 * On native (iOS/Android via Capacitor), the marketing landing page should
 * only be shown on the very first app launch. Once the user taps "Open App",
 * the `has_seen_marketing` flag is written to localStorage and subsequent
 * launches skip straight to the dashboard.
 *
 * localStorage (not Dexie/IndexedDB) is the source of truth because it's
 * synchronous: on a native cold start, opening IndexedDB takes long enough
 * that an async check causes a visible flash of the marketing page before
 * the redirect fires. A synchronous check lets the pre-hydration inline
 * script in `(marketing)/page.tsx` redirect before the browser ever paints
 * marketing content, and lets `MarketingGate` redirect within the same
 * effect tick as a fallback.
 *
 * `useBackup().deleteAllData()` explicitly clears this key too, so a full
 * data wipe still resets first-launch state, matching the old behaviour
 * where the flag lived in the `settings` table that gets wiped.
 *
 * On web (next build static export served over HTTP), the gate is a no-op:
 * the marketing page is the primary SEO landing page and must always
 * render for crawlers and repeat visitors.
 */

export const HAS_SEEN_MARKETING_KEY = 'hd_has_seen_marketing';

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
 * Detects a Capacitor native WebView by origin alone, with no dependency on
 * `window.Capacitor` having attached yet.
 *
 * Capacitor serves this app from a `localhost` origin on a non-`http:`
 * scheme — `https://localhost` on Android (`androidScheme: 'https'` in
 * `capacitor.config.ts`), `capacitor://localhost` by default on iOS. That's
 * available synchronously the instant any script runs, unlike
 * `isNativePlatform()`, which reads `window.Capacitor` and can observe it
 * *before* Capacitor's native bridge has attached — a real, reproduced race
 * (see `getServiceWorkerCleanupScript`).
 *
 * `npm run dev`'s Next.js server is `http://localhost:PORT` (`http:`, with
 * a port) and the deployed web app is a real domain — neither is confused
 * for native by this check.
 *
 * Used only for the service-worker guard, where a false negative is
 * catastrophic (a stray SW causes an infinite reload loop on Android).
 * Every other native check in the app still uses `isNativePlatform()`.
 */
export function isCapacitorOrigin(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' && window.location.protocol !== 'http:';
}

/**
 * Synchronous read of the has-seen-marketing flag. Safe to call during
 * SSR (returns false) and cheap enough to call on every render — no
 * IndexedDB round-trip. Returns false on any storage error so the
 * marketing page is shown by default.
 */
export function hasSeenMarketing(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(HAS_SEEN_MARKETING_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Persists the has-seen-marketing flag so subsequent native launches
 * skip the marketing page and go straight to the dashboard.
 * Best-effort: any storage failure is swallowed so navigation still
 * proceeds.
 */
export function markMarketingSeen(): void {
  try {
    window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, 'true');
  } catch {
    // Best effort — the user experience (getting into the app) must not
    // be blocked by a storage failure. Worst case: marketing shows again
    // on the next launch, which is harmless.
  }
}

/**
 * Clears the has-seen-marketing flag. Called by the GDPR "delete all
 * data" flow so a full data wipe resets first-launch state.
 */
export function clearMarketingSeen(): void {
  try {
    window.localStorage.removeItem(HAS_SEEN_MARKETING_KEY);
  } catch {
    // Best effort — see markMarketingSeen.
  }
}

/**
 * Returns the JS source for the pre-hydration inline `<script>` embedded
 * in `(marketing)/page.tsx`. The browser executes this synchronously
 * while parsing the initial HTML — before React loads or hydrates — so
 * a native "seen" launch redirects before any marketing content paints,
 * instead of relying solely on `MarketingGate`'s post-hydration effect.
 *
 * Mirrors `isNativePlatform` + `hasSeenMarketing` exactly, but as a
 * standalone string since it must run outside the React/module graph.
 */
export function getMarketingRedirectScript(): string {
  const key = JSON.stringify(HAS_SEEN_MARKETING_KEY);
  return `(function(){try{var c=window.Capacitor;var n=c&&typeof c.isNativePlatform==='function'&&c.isNativePlatform();if(n&&window.localStorage.getItem(${key})==='true'){window.location.replace('/dashboard');}}catch(e){}})();`;
}

/**
 * Returns the JS source for a pre-hydration `<script>` (embedded in the
 * root layout's `<head>`, so it runs on every page) that unregisters any
 * active service worker when running natively.
 *
 * Deliberately checks the origin directly (see `isCapacitorOrigin`) rather
 * than `window.Capacitor` — an earlier version used the bridge check here
 * and a stray SW still got through in production, because this script can
 * run before Capacitor's native bridge attaches to `window`. The origin
 * check has no such gap: `location.hostname`/`location.protocol` are set
 * before any script executes at all.
 *
 * `ServiceWorkerRegister`'s React-level cleanup (a `useEffect`) is too
 * late to recover a device already stuck in the reload loop this guards
 * against: a stray SW's navigate-mode fetch handling can retrigger the
 * WebView's navigation before React ever finishes hydrating, so the
 * `useEffect` never gets a chance to run. This script runs during HTML
 * parsing — before any JS bundle loads — on *every* reload of the loop,
 * giving the async `unregister()` call many chances to win the race
 * instead of just one that arrives too late.
 */
export function getServiceWorkerCleanupScript(): string {
  return `(function(){try{if(location.hostname==='localhost'&&location.protocol!=='http:'&&navigator.serviceWorker){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});});}}catch(e){}})();`;
}
