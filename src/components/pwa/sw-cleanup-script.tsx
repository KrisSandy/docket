import { getServiceWorkerCleanupScript } from '@/lib/first-launch';

/**
 * Pre-hydration inline script, rendered in the root layout's `<head>` so it
 * runs on every page load before any JS bundle parses. Unregisters any
 * active service worker when running natively — see
 * `getServiceWorkerCleanupScript` for why this can't wait for React.
 */
export function ServiceWorkerCleanupScript() {
  return (
    <script
      id="sw-cleanup"
      dangerouslySetInnerHTML={{ __html: getServiceWorkerCleanupScript() }}
    />
  );
}
