import { useCallback, useEffect, useState } from 'react';
import { db } from '@/db/database';
import {
  checkPermission,
  cancelAllNotifications,
  type NotificationPermissionState,
} from '@/lib/notifications';
import { rescheduleAllReminders } from '@/lib/reminder-sync';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

export interface NotificationSettingsState {
  /** Whether the user has enabled notifications in app settings */
  isEnabled: boolean;
  /** Native OS permission state */
  permissionState: NotificationPermissionState;
  /** Whether we're still loading the initial state */
  loading: boolean;
}

/**
 * Hook for managing the global notification toggle in Settings.
 */
export function useNotificationSettings() {
  const [state, setState] = useState<NotificationSettingsState>({
    isEnabled: true,
    permissionState: 'prompt',
    loading: true,
  });

  // Load initial state
  useEffect(() => {
    async function load() {
      const [setting, permission] = await Promise.all([
        db.settings.get(NOTIFICATIONS_ENABLED_KEY),
        checkPermission(),
      ]);

      setState({
        isEnabled: setting?.value !== 'false', // Default to enabled
        permissionState: permission,
        loading: false,
      });
    }

    load();
  }, []);

  /**
   * Toggle notifications globally on/off.
   * When disabled: cancels all pending notifications and shows warning.
   * When re-enabled: reschedules all reminders from DB state.
   */
  const toggleNotifications = useCallback(async (enabled: boolean): Promise<void> => {
    // Persist to settings
    await db.settings.put({
      key: NOTIFICATIONS_ENABLED_KEY,
      value: String(enabled),
    });

    if (enabled) {
      // Re-enable: reschedule everything from DB
      await rescheduleAllReminders();
    } else {
      // Disable: cancel all pending notifications
      await cancelAllNotifications();
    }

    setState((prev) => ({ ...prev, isEnabled: enabled }));
  }, []);

  return {
    ...state,
    toggleNotifications,
  };
}
