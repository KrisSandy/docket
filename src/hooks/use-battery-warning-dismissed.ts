import { useCallback, useEffect, useState } from 'react';
import { db } from '@/db/database';

const BATTERY_WARNING_DISMISSED_KEY = 'battery_optimization_warning_dismissed';

export interface BatteryWarningDismissedState {
  /** Whether the user has permanently dismissed the battery optimization warning */
  dismissed: boolean;
  /** Whether we're still loading the initial state */
  loading: boolean;
  /** Permanently dismiss the warning */
  dismiss: () => Promise<void>;
}

/**
 * Hook for the "never show again" state of the Android battery optimization
 * warning shown in Settings.
 */
export function useBatteryWarningDismissed(): BatteryWarningDismissedState {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const setting = await db.settings.get(BATTERY_WARNING_DISMISSED_KEY);
      setDismissed(setting?.value === 'true');
      setLoading(false);
    }

    load();
  }, []);

  const dismiss = useCallback(async (): Promise<void> => {
    await db.settings.put({
      key: BATTERY_WARNING_DISMISSED_KEY,
      value: 'true',
    });
    setDismissed(true);
  }, []);

  return { dismissed, loading, dismiss };
}
