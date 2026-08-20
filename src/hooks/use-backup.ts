import { useCallback, useMemo } from 'react';
import { db } from '@/db/database';
import { encryptData, decryptData } from '@/lib/encryption';
import {
  type BackupData,
  CURRENT_SCHEMA_VERSION,
  validateBackupStructure,
  migrateBackupData,
  backupToCSV,
} from '@/lib/backup';
import { rescheduleAllReminders } from '@/lib/reminder-sync';
import { cancelAllNotifications } from '@/lib/notifications';
import { clearMarketingSeen } from '@/lib/first-launch';

export type { BackupData };

export function useBackup() {
  /**
   * Export all DB tables as a BackupData object.
   */
  const exportData = useCallback(async (): Promise<BackupData> => {
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
      appVersion: '0.1.0',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      categories,
      items,
      itemFields,
      reminders,
      history,
      settings,
    };
  }, []);

  /**
   * Export data as encrypted JSON string.
   */
  const exportEncrypted = useCallback(
    async (passphrase: string): Promise<string> => {
      const data = await exportData();
      const json = JSON.stringify(data);
      return encryptData(json, passphrase);
    },
    [exportData]
  );

  /**
   * Export data as unencrypted JSON string (for GDPR export).
   */
  const exportJSON = useCallback(async (): Promise<string> => {
    const data = await exportData();
    return JSON.stringify(data, null, 2);
  }, [exportData]);

  /**
   * Export data as CSV string (for GDPR export).
   */
  const exportCSV = useCallback(async (): Promise<string> => {
    const data = await exportData();
    return backupToCSV(data);
  }, [exportData]);

  /**
   * Restore from an encrypted backup file.
   * Decrypts → validates → migrates → replaces local DB → reschedules notifications.
   *
   * @throws Error on wrong passphrase, invalid structure, or DB failure
   */
  const restoreFromEncrypted = useCallback(
    async (encryptedContent: string, passphrase: string): Promise<void> => {
      // Decrypt
      const json = await decryptData(encryptedContent, passphrase);

      // Parse
      let parsed: unknown;
      try {
        parsed = JSON.parse(json);
      } catch {
        throw new Error('Backup file contains invalid data');
      }

      // Validate structure
      const validationError = validateBackupStructure(parsed);
      if (validationError) {
        throw new Error(`Invalid backup: ${validationError}`);
      }

      // Migrate if needed
      const data = migrateBackupData(parsed as BackupData);

      // Cancel all existing notifications before wiping
      await cancelAllNotifications();

      // Replace all local data in a single transaction
      await db.transaction(
        'rw',
        [db.categories, db.items, db.itemFields, db.reminders, db.history, db.settings],
        async () => {
          // Clear all tables
          await db.categories.clear();
          await db.items.clear();
          await db.itemFields.clear();
          await db.reminders.clear();
          await db.history.clear();
          await db.settings.clear();

          // Bulk insert from backup
          if (data.categories.length > 0) await db.categories.bulkAdd(data.categories);
          if (data.items.length > 0) await db.items.bulkAdd(data.items);
          if (data.itemFields.length > 0) await db.itemFields.bulkAdd(data.itemFields);
          if (data.reminders.length > 0) await db.reminders.bulkAdd(data.reminders);
          if (data.history.length > 0) await db.history.bulkAdd(data.history);
          if (data.settings.length > 0) await db.settings.bulkAdd(data.settings);
        }
      );

      // Reschedule all notifications from restored data
      await rescheduleAllReminders();

      // Update last backup date
      await db.settings.put({
        key: 'last_backup_date',
        value: new Date().toISOString(),
      });
    },
    []
  );

  /**
   * Delete all user data (GDPR compliance).
   * Cancels notifications, wipes all tables. Biometric settings are reset
   * as part of the settings table wipe below.
   */
  const deleteAllData = useCallback(async (): Promise<void> => {
    // Cancel all notifications first
    await cancelAllNotifications();

    // Wipe all tables atomically
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

    // The has-seen-marketing flag lives in localStorage, not the settings
    // table, so it needs to be cleared explicitly to reset first-launch
    // state on a full data wipe.
    clearMarketingSeen();
  }, []);

  /**
   * Get the last backup date from settings.
   */
  const getLastBackupDate = useCallback(async (): Promise<string | null> => {
    const setting = await db.settings.get('last_backup_date');
    return setting?.value ?? null;
  }, []);

  return useMemo(
    () => ({
      exportData,
      exportEncrypted,
      exportJSON,
      exportCSV,
      restoreFromEncrypted,
      deleteAllData,
      getLastBackupDate,
    }),
    [exportData, exportEncrypted, exportJSON, exportCSV, restoreFromEncrypted, deleteAllData, getLastBackupDate]
  );
}
