'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
        <div className="text-center">
          <h2 className="text-[18px] font-semibold">Something went wrong</h2>
          <p className="mt-2 text-[15px] text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
