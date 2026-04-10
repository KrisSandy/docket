import { LocalNotifications, type PermissionStatus } from '@capacitor/local-notifications';
import { subDays, startOfDay, isBefore, isEqual } from 'date-fns';
import { parseTime, DEFAULT_NOTIFY_TIME } from '@/lib/reminder-preferences';

/**
 * Notification permission state.
 */
export type NotificationPermissionState = 'granted' | 'denied' | 'prompt';

/**
 * Generic notification content — never contains PII.
 */
export const NOTIFICATION_TITLE = 'HomeDocket Reminder';
export const NOTIFICATION_BODY = 'You have an upcoming deadline. Tap to review.';

/**
 * Convert a string ID to a stable positive integer for Capacitor.
 * Capacitor requires numeric IDs for local notifications.
 */
export function hashToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // Convert to 32-bit integer
  }
  // Ensure positive, non-zero
  return Math.abs(hash) || 1;
}

/**
 * Build a deterministic notification ID from reminder + interval info.
 */
export function buildNotificationId(reminderId: string): number {
  return hashToInt(reminderId);
}

/**
 * Calculate the trigger datetime for a reminder.
 *
 * Pins the notification to `notifyTimeLocal` on the computed day,
 * so users get reminders at a sensible hour instead of midnight.
 *
 * Returns `null` if the fully-qualified trigger datetime is in the past.
 *
 * @param deadlineDate - The deadline date
 * @param daysBefore - Number of days before the deadline to trigger
 * @param notifyTimeLocal - "HH:mm" local time to fire (default "09:00")
 * @returns The trigger datetime, or null if it would be in the past
 */
export function calculateTriggerDate(
  deadlineDate: Date,
  daysBefore: number,
  notifyTimeLocal: string = DEFAULT_NOTIFY_TIME
): Date | null {
  const triggerDay = startOfDay(subDays(deadlineDate, daysBefore));
  const today = startOfDay(new Date());

  // If the trigger day is before today, skip entirely.
  if (isBefore(triggerDay, today)) {
    return null;
  }

  // Pin the trigger to the user's preferred time on that day.
  const { hours, minutes } = parseTime(notifyTimeLocal);
  const triggerDate = new Date(triggerDay);
  triggerDate.setHours(hours, minutes, 0, 0);

  // If the trigger day is today but the preferred time has already
  // passed, the caller (scheduleReminder) handles the "now + 10s"
  // fallback via the existing isTriggerToday branch. We still
  // return the date so the notification fires today rather than
  // being silently dropped.
  return triggerDate;
}

/**
 * Check if a trigger date is today.
 */
export function isTriggerToday(triggerDate: Date): boolean {
  return isEqual(startOfDay(triggerDate), startOfDay(new Date()));
}

/**
 * Build notification extra data for tap handling.
 */
export function buildNotificationExtra(itemId: string, reminderId: string): Record<string, string> {
  return {
    itemId,
    reminderId,
  };
}

/**
 * Check current notification permission status.
 * Returns 'granted' on web (no native permission needed).
 */
export async function checkPermission(): Promise<NotificationPermissionState> {
  try {
    const result: PermissionStatus = await LocalNotifications.checkPermissions();
    return normalizePermission(result.display);
  } catch {
    // Web fallback — no Capacitor runtime
    return 'granted';
  }
}

/**
 * Request notification permission.
 * Returns the resulting permission state.
 */
export async function requestPermission(): Promise<NotificationPermissionState> {
  try {
    const result: PermissionStatus = await LocalNotifications.requestPermissions();
    return normalizePermission(result.display);
  } catch {
    // Web fallback
    return 'granted';
  }
}

/**
 * Schedule a single local notification for a reminder.
 *
 * @param reminderId - Unique reminder ID (used to build notification ID)
 * @param itemId - The item this reminder belongs to (passed in notification extra)
 * @param deadlineDate - The deadline date
 * @param daysBefore - Days before deadline to fire notification
 * @param notifyTimeLocal - "HH:mm" local time to fire (default "09:00")
 * @returns true if scheduled, false if skipped (past date)
 */
export async function scheduleReminder(
  reminderId: string,
  itemId: string,
  deadlineDate: Date,
  daysBefore: number,
  notifyTimeLocal: string = DEFAULT_NOTIFY_TIME
): Promise<boolean> {
  const triggerDate = calculateTriggerDate(deadlineDate, daysBefore, notifyTimeLocal);

  if (triggerDate === null) {
    return false; // Past date — skip
  }

  const notificationId = buildNotificationId(reminderId);
  // When the trigger datetime is today but already in the past (user's
  // preferred time has passed), or the full triggerDate is today, schedule
  // 10 seconds in the future so native platforms don't silently drop it.
  let scheduleAt: Date;
  if (isTriggerToday(triggerDate) && triggerDate.getTime() <= Date.now()) {
    scheduleAt = new Date(Date.now() + 10_000);
  } else {
    scheduleAt = triggerDate;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: NOTIFICATION_TITLE,
          body: NOTIFICATION_BODY,
          schedule: { at: scheduleAt },
          extra: buildNotificationExtra(itemId, reminderId),
        },
      ],
    });
    return true;
  } catch {
    // Web or non-native environment — log and continue
    return false;
  }
}

/**
 * Cancel a single scheduled notification by reminder ID.
 */
export async function cancelReminder(reminderId: string): Promise<void> {
  const notificationId = buildNotificationId(reminderId);
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }],
    });
  } catch {
    // Web fallback — no-op
  }
}

/**
 * Cancel all notifications for a list of reminder IDs.
 */
export async function cancelAllRemindersForItem(reminderIds: string[]): Promise<void> {
  if (reminderIds.length === 0) return;

  const notifications = reminderIds.map((id) => ({
    id: buildNotificationId(id),
  }));

  try {
    await LocalNotifications.cancel({ notifications });
  } catch {
    // Web fallback — no-op
  }
}

/**
 * Cancel all pending notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch {
    // Web fallback — no-op
  }
}

/**
 * Normalize Capacitor permission string to our type.
 */
function normalizePermission(display: string): NotificationPermissionState {
  switch (display) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'prompt';
  }
}
