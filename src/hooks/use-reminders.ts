import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db/database';
import type { Reminder } from '@/db/schema';
import { getDateFieldKeys } from '@/lib/templates';
import { DEFAULT_REMINDER_INTERVALS } from '@/constants/defaults';

export interface ReminderSummary {
  fieldKey: string;
  intervals: number[];
}

export function useReminders() {
  const getRemindersForItem = useCallback(async (itemId: string): Promise<Reminder[]> => {
    return db.reminders.where('itemId').equals(itemId).toArray();
  }, []);

  const getReminderSummary = useCallback(async (itemId: string): Promise<ReminderSummary[]> => {
    const reminders = await db.reminders.where('itemId').equals(itemId).toArray();
    const enabledReminders = reminders.filter((r) => r.isEnabled);

    // Group by fieldKey
    const grouped = new Map<string, number[]>();
    for (const r of enabledReminders) {
      const existing = grouped.get(r.fieldKey) ?? [];
      existing.push(r.daysBefore);
      grouped.set(r.fieldKey, existing);
    }

    return Array.from(grouped.entries()).map(([fieldKey, intervals]) => ({
      fieldKey,
      intervals: intervals.sort((a, b) => b - a),
    }));
  }, []);

  const createDefaultReminders = useCallback(async (
    itemId: string,
    categoryName: string
  ): Promise<void> => {
    const dateFieldKeys = getDateFieldKeys(categoryName);
    const intervals = DEFAULT_REMINDER_INTERVALS[categoryName] ?? [30, 14, 7];
    const now = new Date();

    const reminders: Reminder[] = [];
    for (const fieldKey of dateFieldKeys) {
      for (const daysBefore of intervals) {
        reminders.push({
          id: uuidv4(),
          itemId,
          fieldKey,
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

  return useMemo(() => ({
    getRemindersForItem,
    getReminderSummary,
    createDefaultReminders,
  }), [getRemindersForItem, getReminderSummary, createDefaultReminders]);
}
