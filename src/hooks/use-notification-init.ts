'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { rescheduleAllReminders } from '@/lib/reminder-sync';
import { registerNotificationTapHandler, removeNotificationTapHandler } from '@/lib/notification-tap-handler';
import { db } from '@/db/database';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

/**
 * Hook to initialize the notification system on app launch.
 *
 * Handles three responsibilities:
 * 1. Registers the notification tap handler (once)
 * 2. Reschedules all reminders on cold start and return-to-foreground
 * 3. Checks notification permission state
 *
 * Should be called once in the app layout.
 */
export function useNotificationInit() {
  const router = useRouter();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      // 1. Register tap handler — routes notification taps to item detail
      registerNotificationTapHandler((itemId: string) => {
        router.push(`/item?id=${itemId}`);
      });

      // 2. Check if notifications are enabled before rescheduling
      const setting = await db.settings.get(NOTIFICATIONS_ENABLED_KEY);
      const isEnabled = setting?.value !== 'false'; // Default to enabled

      if (isEnabled) {
        // Reschedule all reminders from DB state.
        // Critical for Android where OEM battery optimization can silently
        // drop pending notifications (Samsung, Xiaomi, Huawei, OnePlus).
        await rescheduleAllReminders();
      }
    };

    init();

    return () => {
      removeNotificationTapHandler();
    };
  }, [router]);

  // 3. Re-sync when app returns to foreground (tab becomes visible again).
  // This catches the case where the OS killed pending notifications while
  // the app was backgrounded — especially common on Android.
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;

      const setting = await db.settings.get(NOTIFICATIONS_ENABLED_KEY);
      const isEnabled = setting?.value !== 'false';

      if (isEnabled) {
        await rescheduleAllReminders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
