import { useCallback, useMemo } from 'react';
import { db } from '@/db/database';

export interface ExportData {
  version: number;
  exportedAt: string;
  categories: unknown[];
  items: unknown[];
  itemFields: unknown[];
  reminders: unknown[];
  history: unknown[];
  settings: unknown[];
}

export function useBackup() {
  const exportData = useCallback(async (): Promise<ExportData> => {
    const [categories, items, itemFields, reminders, history, settings] =
      await Promise.all([
        db.categories.toArray(),
        db.items.toArray(),
        db.itemFields.toArray(),
        db.reminders.toArray(),
        db.history.toArray(),
        db.settings.toArray(),
      ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories,
      items,
      itemFields,
      reminders,
      history,
      settings,
    };
  }, []);

  const deleteAllData = useCallback(async (): Promise<void> => {
    await db.transaction(
      'rw',
      [db.categories, db.items, db.itemFields, db.reminders, db.history, db.settings],
      async () => {
        await db.categories.clear();
        await db.items.clear();
        await db.itemFields.clear();
        await db.reminders.clear();
        await db.history.clear();
        await db.settings.clear();
      }
    );
  }, []);

  return useMemo(
    () => ({
      exportData,
      deleteAllData,
    }),
    [exportData, deleteAllData]
  );
}
