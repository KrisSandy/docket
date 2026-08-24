import { getMarketingRedirectScript } from '@/lib/first-launch';

/**
 * Inline script rendered as the first thing in `(marketing)/page.tsx`'s
 * output. The browser executes it synchronously while parsing the raw
 * HTML — before React hydrates — so a native "seen" launch redirects to
 * /dashboard before any marketing content ever paints. `MarketingGate`'s
 * effect is the fallback for the rare case this doesn't run.
 */
export function MarketingRedirectScript() {
  return (
    <script
      id="marketing-redirect"
      dangerouslySetInnerHTML={{ __html: getMarketingRedirectScript() }}
    />
  );
}
