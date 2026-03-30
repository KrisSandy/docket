'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import {
  checkPermission,
  requestPermission,
  type NotificationPermissionState,
} from '@/lib/notifications';

export function NotificationPermissionBanner() {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkPermission().then(setPermissionState);
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const result = await requestPermission();
    setPermissionState(result);
  }, []);

  // Don't show if granted, loading, or dismissed
  if (permissionState === null || permissionState === 'granted' || dismissed) {
    return null;
  }

  if (permissionState === 'denied') {
    return (
      <div
        className="mx-4 mb-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30"
        role="alert"
      >
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Notifications are disabled
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            HomeDocket uses reminders to alert you before deadlines. Enable notifications in your
            device settings to stay on top of renewals and compliance dates.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-1 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
          aria-label="Dismiss notification banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // prompt state — show request button
  return (
    <div
      className="mx-4 mb-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30"
      role="alert"
    >
      <Bell className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Enable reminders
        </p>
        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
          Get notified before deadlines so you never miss a renewal or compliance date.
        </p>
        <button
          onClick={handleRequestPermission}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Enable notifications
        </button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-lg p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50"
        aria-label="Dismiss notification banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
