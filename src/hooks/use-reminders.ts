import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db/database';
import type { Reminder } from '@/db/schema';
import { getDateFieldKeys, getTemplateFields } from '@/lib/templates';
import { loadPreferences, resolveOffsets } from '@/lib/reminder-preferences';
import {
  scheduleReminder as scheduleNotification,
  cancelReminder as cancelNotification,
  cancelAllRemindersForItem as cancelAllNotificationsForItem,
  cancelAllNotifications,
} from '@/lib/notifications';
import { getNotifyTimeLocal } from '@/lib/reminder-preferences';

export interface ReminderSummary {
  fieldKey: string;
  intervals: number[];
  /** True when user explicitly chose "no reminders" for this field. */
  isDisabled: boolean;
}

export interface ReminderWithSchedule extends Reminder {
  nextTriggerDate: Date | null;
}

export function useReminders() {
  const getRemindersForItem = useCallback(async (itemId: string): Promise<Reminder[]> => {
    return db.reminders.where('itemId').equals(itemId).toArray();
  }, []);

  const getReminderSummary = useCallback(async (itemId: string): Promise<ReminderSummary[]> => {
    const reminders = await db.reminders.where('itemId').equals(itemId).toArray();

    // Group all reminders by fieldKey
    const grouped = new Map<string, Reminder[]>();
    for (const r of reminders) {
      const existing = grouped.get(r.fieldKey) ?? [];
      existing.push(r);
      grouped.set(r.fieldKey, existing);
    }

    return Array.from(grouped.entries()).map(([fieldKey, fieldReminders]) => {
      const hasSentinel = fieldReminders.some(
        (r) => r.daysBefore === -1 && !r.isEnabled
      );
      const enabledIntervals = fieldReminders
        .filter((r) => r.isEnabled && r.daysBefore >= 0)
        .map((r) => r.daysBefore)
        .sort((a, b) => b - a);

      return {
        fieldKey,
        intervals: enabledIntervals,
        isDisabled: hasSentinel,
      };
    });
  }, []);

  const createDefaultReminders = useCallback(async (
    itemId: string,
    categoryName: string,
    serviceType?: string | null
  ): Promise<void> => {
    // Use full template fields so we can respect per-field reminderOffsets
    const templateFields = getTemplateFields(categoryName, serviceType as import('@/types').ServiceType ?? null);
    const dateFields = templateFields.filter((f) => f.fieldType === 'date');

    const prefs = await loadPreferences();
    const globalIntervals = resolveOffsets(prefs, categoryName);
    const now = new Date();

    const reminders: Reminder[] = [];
    for (const field of dateFields) {
      // Use field-specific offsets when defined (e.g. billing_date → [3 days])
      const intervals = field.reminderOffsets ?? globalIntervals;
      for (const daysBefore of intervals) {
        reminders.push({
          id: uuidv4(),
          itemId,
          fieldKey: field.fieldKey,
          daysBefore,
          isEnabled: true,
          lastNotifiedAt: null,
          createdAt: now,
        });
      }
    }

    if (reminders.length > 0) {
      await db.reminders.bulkAdd(reminders);
    }
  }, []);

  /**
   * Toggle a reminder on/off for a specific fieldKey + daysBefore combination.
   * If enabling: creates the reminder in DB and schedules the notification.
   * If disabling: removes the reminder from DB and cancels the notification.
   */
  const toggleReminder = useCallback(async (
    itemId: string,
    fieldKey: string,
    daysBefore: number,
    deadlineDate: Date | null
  ): Promise<void> => {
    // Check if reminder already exists
    const existing = await db.reminders
      .where('[itemId+fieldKey]')
      .equals([itemId, fieldKey])
      .filter((r) => r.daysBefore === daysBefore)
      .first();

    if (existing) {
      // Disable: delete from DB and cancel notification
      await db.reminders.delete(existing.id);
      await cancelNotification(existing.id);
    } else {
      // Enable: create in DB and schedule notification
      const id = uuidv4();
      await db.reminders.add({
        id,
        itemId,
        fieldKey,
        daysBefore,
        isEnabled: true,
        lastNotifiedAt: null,
        createdAt: new Date(),
      });

      // Schedule notification if we have a deadline date
      if (deadlineDate) {
        const notifyTime = await getNotifyTimeLocal();
        await scheduleNotification(id, itemId, deadlineDate, daysBefore, notifyTime);
      }
    }
  }, []);

  /**
   * Add a custom reminder interval for a specific field.
   */
  const addCustomReminder = useCallback(async (
    itemId: string,
    fieldKey: string,
    daysBefore: number,
    deadlineDate: Date | null
  ): Promise<void> => {
    // Check it doesn't already exist
    const existing = await db.reminders
      .where('[itemId+fieldKey]')
      .equals([itemId, fieldKey])
      .filter((r) => r.daysBefore === daysBefore)
      .first();

    if (existing) return; // Already exists

    const id = uuidv4();
    await db.reminders.add({
      id,
      itemId,
      fieldKey,
      daysBefore,
      isEnabled: true,
      lastNotifiedAt: null,
      createdAt: new Date(),
    });

    if (deadlineDate) {
      const notifyTime = await getNotifyTimeLocal();
      await scheduleNotification(id, itemId, deadlineDate, daysBefore, notifyTime);
    }
  }, []);

  /**
   * Disable all reminders for a specific field and plant a sentinel row
   * (`daysBefore: -1, isEnabled: false`) so that bulk reschedule operations
   * know the user explicitly opted out — and don't silently re-create defaults.
   */
  const disableFieldReminders = useCallback(async (
    itemId: string,
    fieldKey: string
  ): Promise<void> => {
    // Get all existing reminders for this field
    const existing = await db.reminders
      .where('[itemId+fieldKey]')
      .equals([itemId, fieldKey])
      .toArray();

    // Cancel notifications and delete rows
    for (const rem of existing) {
      await cancelNotification(rem.id);
      await db.reminders.delete(rem.id);
    }

    // Plant sentinel
    await db.reminders.add({
      id: uuidv4(),
      itemId,
      fieldKey,
      daysBefore: -1,
      isEnabled: false,
      lastNotifiedAt: null,
      createdAt: new Date(),
    });
  }, []);

  /**
   * Replace all reminders for a field with a new set of offsets.
   * Clears existing rows (including any sentinel), then creates new ones.
   * Used when the user picks a preset on the item detail screen.
   */
  const setFieldReminders = useCallback(async (
    itemId: string,
    fieldKey: string,
    offsets: number[],
    deadlineDate: Date | null
  ): Promise<void> => {
    // Delete all existing for this field
    const existing = await db.reminders
      .where('[itemId+fieldKey]')
      .equals([itemId, fieldKey])
      .toArray();
    for (const rem of existing) {
      await cancelNotification(rem.id);
      await db.reminders.delete(rem.id);
    }

    // Create new rows
    const notifyTime = await getNotifyTimeLocal();
    const now = new Date();
    for (const daysBefore of offsets) {
      const id = uuidv4();
      await db.reminders.add({
        id,
        itemId,
        fieldKey,
        daysBefore,
        isEnabled: true,
        lastNotifiedAt: null,
        createdAt: now,
      });
      if (deadlineDate) {
        await scheduleNotification(id, itemId, deadlineDate, daysBefore, notifyTime);
      }
    }
  }, []);

  /**
   * Cancel all reminders for an item (e.g., when archiving/deleting).
   */
  const cancelRemindersForItem = useCallback(async (itemId: string): Promise<void> => {
    const reminders = await db.reminders.where('itemId').equals(itemId).toArray();
    const reminderIds = reminders.map((r) => r.id);

    // Cancel all notifications
    await cancelAllNotificationsForItem(reminderIds);

    // Delete from DB
    await db.reminders.where('itemId').equals(itemId).delete();
  }, []);

  /**
   * Reschedule all reminders for an item (e.g., when a date field changes).
   * Cancels existing notifications and schedules new ones based on current field values.
   */
  const rescheduleRemindersForItem = useCallback(async (
    itemId: string,
    fieldDateMap: Map<string, Date>
  ): Promise<void> => {
    const notifyTime = await getNotifyTimeLocal();
    const reminders = await db.reminders.where('itemId').equals(itemId).toArray();

    for (const reminder of reminders) {
      // Cancel existing notification
      await cancelNotification(reminder.id);

      // Schedule new notification if we have the date for this field
      const deadlineDate = fieldDateMap.get(reminder.fieldKey);
      if (deadlineDate && reminder.isEnabled) {
        await scheduleNotification(reminder.id, itemId, deadlineDate, reminder.daysBefore, notifyTime);
      }
    }
  }, []);

  /**
   * Reschedule ALL reminders across all items.
   * Used on app launch and when re-enabling notifications globally.
   */
  const rescheduleAllReminders = useCallback(async (): Promise<void> => {
    // Cancel everything first
    await cancelAllNotifications();

    // Get all enabled reminders
    const allReminders = await db.reminders.where('isEnabled').equals(1).toArray();

    // Get all active items
    const activeItems = await db.items.where('status').equals('active').toArray();
    const activeItemIds = new Set(activeItems.map((item) => item.id));

    // Build a map of itemId+fieldKey → date value
    const fieldValues = new Map<string, Date>();
    for (const itemId of activeItemIds) {
      const fields = await db.itemFields
        .where('itemId')
        .equals(itemId)
        .filter((f) => f.fieldType === 'date' && f.fieldValue !== null && f.fieldValue !== '')
        .toArray();

      for (const field of fields) {
        const date = new Date(field.fieldValue!);
        if (!isNaN(date.getTime())) {
          fieldValues.set(`${itemId}:${field.fieldKey}`, date);
        }
      }
    }

    // Schedule each reminder at the user's preferred time
    const notifyTime = await getNotifyTimeLocal();
    for (const reminder of allReminders) {
      if (!activeItemIds.has(reminder.itemId)) continue;

      const deadlineDate = fieldValues.get(`${reminder.itemId}:${reminder.fieldKey}`);
      if (deadlineDate) {
        await scheduleNotification(
          reminder.id,
          reminder.itemId,
          deadlineDate,
          reminder.daysBefore,
          notifyTime
        );
      }
    }
  }, []);

  /**
   * Restore all reminders for an item (e.g., when unarchiving).
   */
  const restoreRemindersForItem = useCallback(async (
    itemId: string,
    fieldDateMap: Map<string, Date>
  ): Promise<void> => {
    // Re-enable all reminders for this item
    const reminders = await db.reminders.where('itemId').equals(itemId).toArray();

    const notifyTime = await getNotifyTimeLocal();
    for (const reminder of reminders) {
      await db.reminders.update(reminder.id, { isEnabled: true });

      const deadlineDate = fieldDateMap.get(reminder.fieldKey);
      if (deadlineDate) {
        await scheduleNotification(reminder.id, itemId, deadlineDate, reminder.daysBefore, notifyTime);
      }
    }
  }, []);

  return useMemo(() => ({
    getRemindersForItem,
    getReminderSummary,
    createDefaultReminders,
    toggleReminder,
    addCustomReminder,
    disableFieldReminders,
    setFieldReminders,
    cancelRemindersForItem,
    rescheduleRemindersForItem,
    rescheduleAllReminders,
    restoreRemindersForItem,
  }), [
    getRemindersForItem,
    getReminderSummary,
    createDefaultReminders,
    toggleReminder,
    addCustomReminder,
    disableFieldReminders,
    setFieldReminders,
    cancelRemindersForItem,
    rescheduleRemindersForItem,
    rescheduleAllReminders,
    restoreRemindersForItem,
  ]);
}
