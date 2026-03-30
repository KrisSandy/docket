import { LocalNotifications, type ActionPerformed } from '@capacitor/local-notifications';

export type NavigateToItemFn = (itemId: string) => void;

let isListenerRegistered = false;

/**
 * Register a listener for notification taps.
 * Handles all three scenarios:
 * - App in foreground (navigate directly)
 * - App in background (resume + navigate)
 * - App closed (cold start + navigate)
 *
 * Should be called once on app initialization.
 *
 * @param navigateToItem - Callback to navigate to the item detail screen
 */
export async function registerNotificationTapHandler(
  navigateToItem: NavigateToItemFn
): Promise<void> {
  if (isListenerRegistered) return;

  try {
    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (action: ActionPerformed) => {
        const itemId = action.notification.extra?.itemId;
        if (typeof itemId === 'string' && itemId.length > 0) {
          navigateToItem(itemId);
        }
      }
    );
    isListenerRegistered = true;
  } catch {
    // Web environment — no Capacitor runtime. No-op.
  }
}

/**
 * Remove the notification tap listener.
 * Call on app teardown if needed.
 */
export async function removeNotificationTapHandler(): Promise<void> {
  if (!isListenerRegistered) return;

  try {
    await LocalNotifications.removeAllListeners();
    isListenerRegistered = false;
  } catch {
    // Web fallback — no-op
  }
}

/**
 * Check if there's a pending notification action from a cold start.
 * Some platforms deliver the notification action that launched the app
 * through a different mechanism. This handles that case.
 */
export function extractItemIdFromExtra(extra: Record<string, unknown> | undefined): string | null {
  if (!extra) return null;
  const itemId = extra.itemId;
  if (typeof itemId === 'string' && itemId.length > 0) {
    return itemId;
  }
  return null;
}
