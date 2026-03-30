'use client';

import { ExternalLink, AlertTriangle } from 'lucide-react';

/**
 * Help text shown in Settings for Android users about battery optimization
 * potentially affecting notification reliability.
 */
export function AndroidNotificationHelp() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Battery optimization may affect reminders
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Some Android devices aggressively limit background apps, which can prevent reminders
            from arriving on time. If you notice missed reminders, disable battery optimization
            for HomeDocket in your device settings.
          </p>
          <a
            href="https://dontkillmyapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900"
          >
            <span>Fix for your device</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
