import { db } from '@/db/database';
import {
  scheduleReminder,
  cancelReminder,
  cancelAllRemindersForItem,
  cancelAllNotifications,
} from '@/lib/notifications';

/**
 * When a date field is updated, cancel old reminders and schedule new ones
 * for that field on the given item.
 */
export async function onDateFieldUpdated(
  itemId: string,
  fieldKey: string,
  newDate: Date | null
): Promise<void> {
  const reminders = await db.reminders
    .where('[itemId+fieldKey]')
    .equals([itemId, fieldKey])
    .toArray();

  for (const reminder of reminders) {
    // Cancel old notification
    await cancelReminder(reminder.id);

    // Schedule new one if date is set and reminder is enabled
    if (newDate && reminder.isEnabled) {
      await scheduleReminder(reminder.id, itemId, newDate, reminder.daysBefore);
    }
  }
}

/**
 * When an item is archived, cancel all its reminders.
 */
export async function onItemArchived(itemId: string): Promise<void> {
  const reminders = await db.reminders.where('itemId').equals(itemId).toArray();
  const reminderIds = reminders.map((r) => r.id);
  await cancelAllRemindersForItem(reminderIds);

  // Mark reminders as disabled in DB
  await db.reminders.where('itemId').equals(itemId).modify({ isEnabled: false });
}

/**
 * When an item is deleted, cancel all its reminders and remove from DB.
 */
export async function onItemDeleted(itemId: string): Promise<void> {
  const reminders = await db.reminders.where('itemId').equals(itemId).toArray();
  const reminderIds = reminders.map((r) => r.id);
  await cancelAllRemindersForItem(reminderIds);

  // Delete reminders from DB
  await db.reminders.where('itemId').equals(itemId).delete();
}

/**
 * When an item is unarchived, re-enable and reschedule its reminders.
 */
export async function onItemUnarchived(itemId: string): Promise<void> {
  // Re-enable all reminders
  await db.reminders.where('itemId').equals(itemId).modify({ isEnabled: true });

  // Get all date fields for this item
  const dateFields = await db.itemFields
    .where('itemId')
    .equals(itemId)
    .filter((f) => f.fieldType === 'date' && f.fieldValue !== null && f.fieldValue !== '')
    .toArray();

  const fieldDateMap = new Map<string, Date>();
  for (const field of dateFields) {
    const date = new Date(field.fieldValue!);
    if (!isNaN(date.getTime())) {
      fieldDateMap.set(field.fieldKey, date);
    }
  }

  // Schedule notifications for all reminders
  const reminders = await db.reminders.where('itemId').equals(itemId).toArray();
  for (const reminder of reminders) {
    const deadlineDate = fieldDateMap.get(reminder.fieldKey);
    if (deadlineDate) {
      await scheduleReminder(reminder.id, itemId, deadlineDate, reminder.daysBefore);
    }
  }
}

/**
 * Full resync — cancel all and reschedule from DB state.
 * Called on app launch and when re-enabling notifications globally.
 */
export async function rescheduleAllReminders(): Promise<void> {
  // Cancel everything
  await cancelAllNotifications();

  // Get all active items
  const activeItems = await db.items.where('status').equals('active').toArray();
  const activeItemIds = new Set(activeItems.map((item) => item.id));

  // Get all enabled reminders for active items
  const allReminders = await db.reminders.toArray();
  const enabledReminders = allReminders.filter(
    (r) => r.isEnabled && activeItemIds.has(r.itemId)
  );

  // Build field date map
  const fieldDateMap = new Map<string, Date>();
  for (const itemId of activeItemIds) {
    const dateFields = await db.itemFields
      .where('itemId')
      .equals(itemId)
      .filter((f) => f.fieldType === 'date' && f.fieldValue !== null && f.fieldValue !== '')
      .toArray();

    for (const field of dateFields) {
      const date = new Date(field.fieldValue!);
      if (!isNaN(date.getTime())) {
        fieldDateMap.set(`${itemId}:${field.fieldKey}`, date);
      }
    }
  }

  // Schedule each reminder
  for (const reminder of enabledReminders) {
    const deadlineDate = fieldDateMap.get(`${reminder.itemId}:${reminder.fieldKey}`);
    if (deadlineDate) {
      await scheduleReminder(
        reminder.id,
        reminder.itemId,
        deadlineDate,
        reminder.daysBefore
      );
    }
  }
}
