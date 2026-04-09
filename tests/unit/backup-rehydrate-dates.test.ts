import { describe, it, expect } from 'vitest';
import {
  rehydrateBackupDates,
  migrateBackupData,
  CURRENT_SCHEMA_VERSION,
  type BackupData,
} from '@/lib/backup';

/**
 * Regression tests for the "stuck on Loading..." item-detail bug.
 *
 * Root cause: the restore path was `JSON.parse(json)` → `bulkAdd` without
 * rehydrating Date fields. Dates in JSON become ISO strings, which were
 * then stored directly in IndexedDB. Any consumer calling `.getTime()`
 * on those fields crashed with "getTime is not a function" — specifically
 * observed in `getHistoryForItem`, which left the item detail screen
 * stuck on its loading fallback forever.
 *
 * These tests pin the rehydration contract so the regression cannot come
 * back silently.
 */

function makeJsonRoundTrippedBackup(): BackupData {
  // Simulate what happens when a backup is read off disk: Date instances
  // are serialised to ISO strings by JSON.stringify, then parsed back as
  // plain strings by JSON.parse. This is exactly the payload shape that
  // used to poison IndexedDB.
  const original: BackupData = {
    appVersion: '0.1.0',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: '2026-03-30T12:00:00.000Z',
    categories: [
      {
        id: 'cat-1',
        name: 'Vehicle',
        icon: 'car',
        sortOrder: 0,
        isDefault: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ],
    items: [
      {
        id: 'item-1',
        categoryId: 'cat-1',
        title: 'Car',
        status: 'active',
        serviceType: 'car',
        dismissedUntil: new Date('2026-04-01T00:00:00.000Z'),
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      },
      {
        id: 'item-2',
        categoryId: 'cat-1',
        title: 'Bike',
        status: 'active',
        serviceType: 'motorbike',
        dismissedUntil: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
    itemFields: [
      {
        id: 'f1',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        fieldValue: '2026-06-15',
        fieldType: 'date',
        label: 'NCT Date',
        isTemplateField: true,
        sortOrder: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
    reminders: [
      {
        id: 'r1',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        daysBefore: 30,
        isEnabled: true,
        lastNotifiedAt: new Date('2026-02-01T00:00:00.000Z'),
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: 'r2',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        daysBefore: 7,
        isEnabled: true,
        lastNotifiedAt: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ],
    history: [
      {
        id: 'h1',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: null,
        newValue: '2026-06-01',
        changeType: 'edit',
        changedAt: new Date('2026-01-10T00:00:00.000Z'),
      },
      {
        id: 'h2',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: '2026-06-01',
        newValue: '2026-06-15',
        changeType: 'renewal',
        changedAt: new Date('2026-02-10T00:00:00.000Z'),
      },
    ],
    settings: [],
  };

  // Round-trip through JSON to get the same "all dates are strings" shape
  // that caused the bug.
  return JSON.parse(JSON.stringify(original)) as BackupData;
}

describe('rehydrateBackupDates', () => {
  it('converts every Date-typed field on every table back to a Date instance', () => {
    const parsed = makeJsonRoundTrippedBackup();

    // Sanity check — the fixture is actually the broken shape we expect.
    expect(typeof (parsed.history[0] as unknown as { changedAt: string }).changedAt).toBe('string');
    expect(typeof (parsed.items[0] as unknown as { createdAt: string }).createdAt).toBe('string');

    const healed = rehydrateBackupDates(parsed);

    // categories
    expect(healed.categories[0].createdAt).toBeInstanceOf(Date);
    expect(healed.categories[0].updatedAt).toBeInstanceOf(Date);

    // items (including the optional dismissedUntil)
    expect(healed.items[0].createdAt).toBeInstanceOf(Date);
    expect(healed.items[0].updatedAt).toBeInstanceOf(Date);
    expect(healed.items[0].dismissedUntil).toBeInstanceOf(Date);
    expect(healed.items[1].dismissedUntil).toBeNull();

    // itemFields
    expect(healed.itemFields[0].createdAt).toBeInstanceOf(Date);
    expect(healed.itemFields[0].updatedAt).toBeInstanceOf(Date);

    // reminders (including the optional lastNotifiedAt)
    expect(healed.reminders[0].createdAt).toBeInstanceOf(Date);
    expect(healed.reminders[0].lastNotifiedAt).toBeInstanceOf(Date);
    expect(healed.reminders[1].lastNotifiedAt).toBeNull();

    // history — this is the field that was crashing item detail
    expect(healed.history[0].changedAt).toBeInstanceOf(Date);
    expect(healed.history[1].changedAt).toBeInstanceOf(Date);

    // ...and crucially, .getTime() must now work (the exact call that
    // used to throw "b.changedAt.getTime is not a function").
    expect(() =>
      healed.history.sort(
        (a, b) => b.changedAt.getTime() - a.changedAt.getTime()
      )
    ).not.toThrow();
  });

  it('preserves the ISO timestamp value, it does not reset it', () => {
    const parsed = makeJsonRoundTrippedBackup();
    const healed = rehydrateBackupDates(parsed);

    expect(healed.history[0].changedAt.toISOString()).toBe('2026-01-10T00:00:00.000Z');
    expect(healed.items[0].dismissedUntil?.toISOString()).toBe(
      '2026-04-01T00:00:00.000Z'
    );
  });

  it('is idempotent — passing already-healed data through again is a no-op', () => {
    const parsed = makeJsonRoundTrippedBackup();
    const once = rehydrateBackupDates(parsed);
    const twice = rehydrateBackupDates(once);

    expect(twice.history[0].changedAt.toISOString()).toBe(
      once.history[0].changedAt.toISOString()
    );
    expect(twice.items[0].createdAt).toBeInstanceOf(Date);
  });
});

describe('migrateBackupData — rehydrates Dates as part of migration', () => {
  it('returns Date instances even when the input is a fresh JSON.parse', () => {
    // This is the exact code path the restore hook takes:
    //   JSON.parse(decrypted) → validate → migrate → bulkAdd
    // Before the fix, bulkAdd was seeing string dates.
    const parsed = makeJsonRoundTrippedBackup();

    const healed = migrateBackupData(parsed);

    expect(healed.history[0].changedAt).toBeInstanceOf(Date);
    expect(healed.items[0].createdAt).toBeInstanceOf(Date);
    expect(healed.items[0].dismissedUntil).toBeInstanceOf(Date);
    expect(healed.reminders[0].lastNotifiedAt).toBeInstanceOf(Date);
  });

  it('rehydrates Dates even when migrating a v1 backup forward', () => {
    const v1Parsed = {
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
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
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
          changedAt: '2026-01-10T00:00:00.000Z',
        },
      ],
      settings: [],
    } as unknown as BackupData;

    const healed = migrateBackupData(v1Parsed);

    expect(healed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(healed.items[0].createdAt).toBeInstanceOf(Date);
    expect(healed.items[0]).toHaveProperty('dismissedUntil', null);
    expect(healed.history[0].changedAt).toBeInstanceOf(Date);
    expect(healed.history[0]).toHaveProperty('changeType', 'edit');
  });

  it('does not break when dates are already Date instances', () => {
    const data: BackupData = {
      appVersion: '0.1.0',
      schemaVersion: CURRENT_SCHEMA_VERSION,
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
          changeType: 'edit',
          changedAt: new Date('2026-01-10T00:00:00.000Z'),
        },
      ],
      settings: [],
    };

    const healed = migrateBackupData(data);
    expect(healed.history[0].changedAt).toBeInstanceOf(Date);
    expect(healed.history[0].changedAt.toISOString()).toBe('2026-01-10T00:00:00.000Z');
  });
});
