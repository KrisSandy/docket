/**
 * Backup/restore utilities.
 * Handles serialization, validation, schema migration, and CSV export.
 */

import type { Category, Item, ItemField, Reminder, HistoryEntry, AppSettings } from '@/db/schema';

/** Current schema version — increment when DB structure changes. */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Structure of an exported backup file (before encryption).
 */
export interface BackupData {
  appVersion: string;
  schemaVersion: number;
  exportedAt: string;
  categories: Category[];
  items: Item[];
  itemFields: ItemField[];
  reminders: Reminder[];
  history: HistoryEntry[];
  settings: AppSettings[];
}

/**
 * Validate that parsed JSON matches the BackupData structure.
 * Returns null if valid, or an error message string.
 */
export function validateBackupStructure(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return 'Backup data is not a valid object';
  }

  const backup = data as Record<string, unknown>;

  if (typeof backup.schemaVersion !== 'number') {
    return 'Missing or invalid schema version';
  }

  if (typeof backup.exportedAt !== 'string') {
    return 'Missing export date';
  }

  const requiredArrays = ['categories', 'items', 'itemFields', 'reminders', 'history', 'settings'];
  for (const key of requiredArrays) {
    if (!Array.isArray(backup[key])) {
      return `Missing or invalid table: ${key}`;
    }
  }

  return null; // Valid
}

/**
 * Coerce a JSON-parsed value that should be a Date back into a Date.
 * JSON.parse turns Date instances into ISO strings; IndexedDB will happily
 * store those strings but any consumer calling `.getTime()` on them will
 * crash (see the item-detail "stuck on Loading" regression). This helper
 * normalises safely — nulls and undefined pass through unchanged so
 * optional fields like `dismissedUntil` stay null.
 */
function coerceDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function requireDate(value: unknown, fallback: Date = new Date(0)): Date {
  return coerceDate(value) ?? fallback;
}

/**
 * Rehydrate all Date fields across the backup payload.
 *
 * JSON round-tripping a BackupData loses Date types. This function must be
 * called before `bulkAdd`-ing rows back into Dexie so that IndexedDB stores
 * real Date objects and downstream `.getTime()` calls never crash.
 */
export function rehydrateBackupDates(data: BackupData): BackupData {
  return {
    ...data,
    categories: data.categories.map((c) => ({
      ...c,
      createdAt: requireDate(c.createdAt),
      updatedAt: requireDate(c.updatedAt),
    })),
    items: data.items.map((i) => ({
      ...i,
      dismissedUntil: coerceDate(i.dismissedUntil),
      createdAt: requireDate(i.createdAt),
      updatedAt: requireDate(i.updatedAt),
    })),
    itemFields: data.itemFields.map((f) => ({
      ...f,
      createdAt: requireDate(f.createdAt),
      updatedAt: requireDate(f.updatedAt),
    })),
    reminders: data.reminders.map((r) => ({
      ...r,
      lastNotifiedAt: coerceDate(r.lastNotifiedAt),
      createdAt: requireDate(r.createdAt),
    })),
    history: data.history.map((h) => ({
      ...h,
      changedAt: requireDate(h.changedAt),
    })),
  };
}

/**
 * Check if backup needs migration and apply transforms.
 */
export function migrateBackupData(data: BackupData): BackupData {
  // Schema v1 → current: no migration needed
  if (data.schemaVersion >= CURRENT_SCHEMA_VERSION) {
    return rehydrateBackupDates(data);
  }

  // V1 → V2: Add dismissedUntil to items, changeType to history
  if (data.schemaVersion < 2) {
    data = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        dismissedUntil: (item as unknown as Record<string, unknown>).dismissedUntil ?? null,
      })),
      history: data.history.map((entry) => ({
        ...entry,
        changeType: (entry as unknown as Record<string, unknown>).changeType ?? 'edit',
      })),
    } as BackupData;
  }

  // Always rehydrate Date fields before handing data back to Dexie.
  return rehydrateBackupDates({ ...data, schemaVersion: CURRENT_SCHEMA_VERSION });
}

/**
 * Convert backup data to a flat CSV string.
 * One row per item, with all fields as columns.
 */
export function backupToCSV(data: BackupData): string {
  if (data.items.length === 0) {
    return 'No items to export';
  }

  // Collect all unique field keys across all items
  const allFieldKeys = new Set<string>();
  for (const field of data.itemFields) {
    allFieldKeys.add(field.fieldKey);
  }

  const fieldKeysSorted = Array.from(allFieldKeys).sort();

  // Build field lookup: itemId → { fieldKey → fieldValue }
  const fieldsByItem = new Map<string, Map<string, string>>();
  for (const field of data.itemFields) {
    if (!fieldsByItem.has(field.itemId)) {
      fieldsByItem.set(field.itemId, new Map());
    }
    fieldsByItem.get(field.itemId)!.set(field.fieldKey, field.fieldValue ?? '');
  }

  // Build category lookup
  const categoryNames = new Map<string, string>();
  for (const cat of data.categories) {
    categoryNames.set(cat.id, cat.name);
  }

  // CSV header
  const headers = ['ID', 'Title', 'Category', 'Service Type', 'Status', 'Created', 'Updated', ...fieldKeysSorted];
  const rows: string[] = [headers.map(escapeCSV).join(',')];

  // CSV rows
  for (const item of data.items) {
    const itemFields = fieldsByItem.get(item.id) ?? new Map<string, string>();
    const row = [
      item.id,
      item.title,
      categoryNames.get(item.categoryId) ?? '',
      item.serviceType ?? '',
      item.status,
      String(item.createdAt),
      String(item.updatedAt),
      ...fieldKeysSorted.map((key) => itemFields.get(key) ?? ''),
    ];
    rows.push(row.map(escapeCSV).join(','));
  }

  return rows.join('\n');
}

/**
 * Escape a value for CSV (handles commas, quotes, newlines).
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
