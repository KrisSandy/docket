import { describe, it, expect } from 'vitest';
import { migrateBackupData, CURRENT_SCHEMA_VERSION, type BackupData } from '@/lib/backup';

describe('backup migration v1 → v2', () => {
  it('schema version is now 2', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(2);
  });

  it('migrates v1 items to add dismissedUntil: null', () => {
    const v1Data = {
      appVersion: '0.1.0',
      schemaVersion: 1,
      exportedAt: '2026-03-30T12:00:00.000Z',
      categories: [],
      items: [
        {
          id: 'item-1',
          categoryId: 'cat-1',
          title: 'Test',
          status: 'active',
          serviceType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      itemFields: [],
      reminders: [],
      history: [],
      settings: [],
    } as unknown as BackupData;

    const result = migrateBackupData(v1Data);
    expect(result.schemaVersion).toBe(2);
    expect(result.items[0]).toHaveProperty('dismissedUntil', null);
  });

  it('migrates v1 history entries to add changeType: edit', () => {
    const v1Data = {
      appVersion: '0.1.0',
      schemaVersion: 1,
      exportedAt: '2026-03-30T12:00:00.000Z',
      categories: [],
      items: [],
      itemFields: [],
      reminders: [],
      history: [
        {
          id: 'h1',
          itemId: 'item-1',
          fieldKey: 'nct_date',
          oldValue: null,
          newValue: '2026-06-01',
          changedAt: new Date(),
        },
      ],
      settings: [],
    } as unknown as BackupData;

    const result = migrateBackupData(v1Data);
    expect(result.history[0]).toHaveProperty('changeType', 'edit');
  });

  it('does not modify v2 data', () => {
    const v2Data = {
      appVersion: '0.1.0',
      schemaVersion: 2,
      exportedAt: '2026-03-30T12:00:00.000Z',
      categories: [],
      items: [
        {
          id: 'item-1',
          categoryId: 'cat-1',
          title: 'Test',
          status: 'active',
          serviceType: null,
          dismissedUntil: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      itemFields: [],
      reminders: [],
      history: [
        {
          id: 'h1',
          itemId: 'item-1',
          fieldKey: 'nct_date',
          oldValue: null,
          newValue: '2026-06-01',
          changeType: 'renewal',
          changedAt: new Date(),
        },
      ],
      settings: [],
    } as unknown as BackupData;

    const result = migrateBackupData(v2Data);
    expect(result.schemaVersion).toBe(2);
    expect(result.items[0].dismissedUntil).toBeNull();
    expect(result.history[0].changeType).toBe('renewal');
  });
});
