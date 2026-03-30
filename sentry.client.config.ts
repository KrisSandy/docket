import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring sample rate (10% of transactions)
  tracesSampleRate: 0.1,

  // Session replay for debugging (1% of sessions, 100% of error sessions)
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  // Environment tag
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',

  // Filter out non-actionable errors
  beforeSend(event) {
    // Don't send events without a DSN configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return null;

    // Filter out browser extension errors
    if (event.exception?.values?.some((e) =>
      e.stacktrace?.frames?.some((f) => f.filename?.includes('extension'))
    )) {
      return null;
    }

    // Strip PII from breadcrumbs — never send provider names, amounts, or dates
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.category === 'ui.click') {
          // Only keep the element type, strip text content
          breadcrumb.message = breadcrumb.message?.replace(/>[^<]+</g, '><');
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Never send PII
  sendDefaultPii: false,
});
