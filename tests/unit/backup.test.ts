import { describe, it, expect } from 'vitest';
import {
  validateBackupStructure,
  migrateBackupData,
  backupToCSV,
  CURRENT_SCHEMA_VERSION,
  type BackupData,
} from '@/lib/backup';

function makeBackupData(overrides?: Partial<BackupData>): BackupData {
  return {
    appVersion: '0.1.0',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: '2026-03-30T12:00:00.000Z',
    categories: [],
    items: [],
    itemFields: [],
    reminders: [],
    history: [],
    settings: [],
    ...overrides,
  };
}

describe('backup utilities', () => {
  describe('validateBackupStructure', () => {
    it('returns null for valid backup data', () => {
      const data = makeBackupData();
      expect(validateBackupStructure(data)).toBeNull();
    });

    it('rejects null', () => {
      expect(validateBackupStructure(null)).toBe('Backup data is not a valid object');
    });

    it('rejects non-object', () => {
      expect(validateBackupStructure('string')).toBe('Backup data is not a valid object');
    });

    it('rejects missing schemaVersion', () => {
      const data = { exportedAt: '2026-01-01', categories: [], items: [], itemFields: [], reminders: [], history: [], settings: [] };
      expect(validateBackupStructure(data)).toBe('Missing or invalid schema version');
    });

    it('rejects missing exportedAt', () => {
      const data = { schemaVersion: 1, categories: [], items: [], itemFields: [], reminders: [], history: [], settings: [] };
      expect(validateBackupStructure(data)).toBe('Missing export date');
    });

    it('rejects missing table arrays', () => {
      const data = { schemaVersion: 1, exportedAt: '2026-01-01' };
      expect(validateBackupStructure(data)).toContain('Missing or invalid table');
    });

    it('rejects non-array table fields', () => {
      const data = {
        schemaVersion: 1,
        exportedAt: '2026-01-01',
        categories: 'not-array',
        items: [],
        itemFields: [],
        reminders: [],
        history: [],
        settings: [],
      };
      expect(validateBackupStructure(data)).toBe('Missing or invalid table: categories');
    });

    it('validates all six required tables', () => {
      const tables = ['categories', 'items', 'itemFields', 'reminders', 'history', 'settings'];
      for (const table of tables) {
        const data: Record<string, unknown> = {
          schemaVersion: 1,
          exportedAt: '2026-01-01',
          categories: [],
          items: [],
          itemFields: [],
          reminders: [],
          history: [],
          settings: [],
        };
        delete data[table];
        expect(validateBackupStructure(data)).toBe(`Missing or invalid table: ${table}`);
      }
    });
  });

  describe('migrateBackupData', () => {
    it('returns data unchanged when at current schema version', () => {
      const data = makeBackupData();
      const result = migrateBackupData(data);
      expect(result).toEqual(data);
    });

    it('returns data unchanged when schema version is higher than current', () => {
      const data = makeBackupData({ schemaVersion: CURRENT_SCHEMA_VERSION + 1 });
      const result = migrateBackupData(data);
      expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION + 1);
    });

    it('updates schema version for older backups', () => {
      const data = makeBackupData({ schemaVersion: 0 });
      const result = migrateBackupData(data);
      expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    });
  });

  describe('backupToCSV', () => {
    it('returns message for empty items', () => {
      const data = makeBackupData();
      expect(backupToCSV(data)).toBe('No items to export');
    });

    it('generates correct CSV headers', () => {
      const data = makeBackupData({
        categories: [
          { id: 'cat-1', name: 'Vehicle', icon: 'car', sortOrder: 0, isDefault: true, createdAt: new Date(), updatedAt: new Date() },
        ],
        items: [
          { id: 'item-1', categoryId: 'cat-1', title: 'My Car', status: 'active', serviceType: 'car', createdAt: new Date(), updatedAt: new Date() },
        ],
        itemFields: [
          { id: 'f1', itemId: 'item-1', fieldKey: 'nct_date', fieldValue: '2026-06-15', fieldType: 'date', label: 'NCT Date', isTemplateField: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
        ],
      });

      const csv = backupToCSV(data);
      const lines = csv.split('\n');

      // Header should include base columns + field keys
      expect(lines[0]).toContain('ID');
      expect(lines[0]).toContain('Title');
      expect(lines[0]).toContain('Category');
      expect(lines[0]).toContain('nct_date');
    });

    it('generates one row per item', () => {
      const data = makeBackupData({
        items: [
          { id: 'item-1', categoryId: 'cat-1', title: 'Item 1', status: 'active', serviceType: null, createdAt: new Date(), updatedAt: new Date() },
          { id: 'item-2', categoryId: 'cat-1', title: 'Item 2', status: 'active', serviceType: null, createdAt: new Date(), updatedAt: new Date() },
        ],
      });

      const csv = backupToCSV(data);
      const lines = csv.split('\n');
      expect(lines.length).toBe(3); // header + 2 items
    });

    it('correctly maps field values to items', () => {
      const data = makeBackupData({
        categories: [
          { id: 'cat-1', name: 'Test', icon: 'test', sortOrder: 0, isDefault: true, createdAt: new Date(), updatedAt: new Date() },
        ],
        items: [
          { id: 'item-1', categoryId: 'cat-1', title: 'Test Item', status: 'active', serviceType: null, createdAt: new Date(), updatedAt: new Date() },
        ],
        itemFields: [
          { id: 'f1', itemId: 'item-1', fieldKey: 'provider', fieldValue: 'Acme Corp', fieldType: 'text', label: 'Provider', isTemplateField: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
        ],
      });

      const csv = backupToCSV(data);
      expect(csv).toContain('Acme Corp');
    });

    it('escapes CSV values containing commas', () => {
      const data = makeBackupData({
        items: [
          { id: 'item-1', categoryId: 'cat-1', title: 'Item, with comma', status: 'active', serviceType: null, createdAt: new Date(), updatedAt: new Date() },
        ],
      });

      const csv = backupToCSV(data);
      expect(csv).toContain('"Item, with comma"');
    });

    it('escapes CSV values containing double quotes', () => {
      const data = makeBackupData({
        items: [
          { id: 'item-1', categoryId: 'cat-1', title: 'Item "quoted"', status: 'active', serviceType: null, createdAt: new Date(), updatedAt: new Date() },
        ],
      });

      const csv = backupToCSV(data);
      expect(csv).toContain('"Item ""quoted"""');
    });

    it('handles items with no fields', () => {
      const data = makeBackupData({
        items: [
          { id: 'item-1', categoryId: 'cat-1', title: 'No Fields', status: 'active', serviceType: null, createdAt: new Date(), updatedAt: new Date() },
        ],
      });

      const csv = backupToCSV(data);
      const lines = csv.split('\n');
      expect(lines.length).toBe(2); // header + 1 item
    });

    it('includes category name in output', () => {
      const data = makeBackupData({
        categories: [
          { id: 'cat-1', name: 'Vehicle', icon: 'car', sortOrder: 0, isDefault: true, createdAt: new Date(), updatedAt: new Date() },
        ],
        items: [
          { id: 'item-1', categoryId: 'cat-1', title: 'Car', status: 'active', serviceType: null, createdAt: new Date(), updatedAt: new Date() },
        ],
      });

      const csv = backupToCSV(data);
      expect(csv).toContain('Vehicle');
    });
  });
});
