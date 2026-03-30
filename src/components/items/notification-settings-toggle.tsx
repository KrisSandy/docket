'use client';

import { Bell, BellOff } from 'lucide-react';
import { useNotificationSettings } from '@/hooks/use-notification-settings';

export function NotificationSettingsToggle() {
  const { isEnabled, permissionState, loading, toggleNotifications } = useNotificationSettings();

  if (loading) {
    return (
      <div className="animate-pulse flex items-center justify-between rounded-xl bg-muted p-4">
        <div className="h-5 w-32 rounded bg-muted-foreground/20" />
        <div className="h-6 w-11 rounded-full bg-muted-foreground/20" />
      </div>
    );
  }

  const effectivelyEnabled = isEnabled && permissionState === 'granted';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl bg-card p-4">
        <div className="flex items-center gap-3">
          {effectivelyEnabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {effectivelyEnabled ? 'Reminders are active' : 'Reminders are paused'}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          role="switch"
          aria-checked={isEnabled}
          onClick={() => toggleNotifications(!isEnabled)}
          className={`relative inline-flex h-7 w-12 min-h-[44px] min-w-[44px] items-center rounded-full transition-colors ${
            isEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
          aria-label={isEnabled ? 'Disable notifications' : 'Enable notifications'}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Warning when disabled */}
      {!isEnabled && (
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30" role="alert">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            All reminders are paused. You will not receive any deadline notifications until
            notifications are re-enabled.
          </p>
        </div>
      )}

      {/* Warning when OS permission denied */}
      {isEnabled && permissionState === 'denied' && (
        <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30" role="alert">
          <p className="text-sm text-red-700 dark:text-red-300">
            Notification permission is denied by your device. Enable notifications in your
            device settings to receive reminders.
          </p>
        </div>
      )}
    </div>
  );
}
