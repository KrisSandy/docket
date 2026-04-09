import Dexie, { type Table } from 'dexie';

export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  categoryId: string;
  title: string;
  status: 'active' | 'archived';
  serviceType: string | null;
  dismissedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemField {
  id: string;
  itemId: string;
  fieldKey: string;
  fieldValue: string | null;
  fieldType: 'text' | 'currency' | 'date' | 'number' | 'percentage' | 'url';
  label: string;
  isTemplateField: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  itemId: string;
  fieldKey: string;
  daysBefore: number;
  isEnabled: boolean;
  lastNotifiedAt: Date | null;
  createdAt: Date;
}

export type HistoryChangeType = 'edit' | 'renewal' | 'dismissal';

export interface HistoryEntry {
  id: string;
  itemId: string;
  fieldKey: string;
  oldValue: string | null;
  newValue: string | null;
  changeType: HistoryChangeType;
  changedAt: Date;
}

export interface AppSettings {
  key: string;
  value: string;
}

export class HomeDocketDB extends Dexie {
  categories!: Table<Category>;
  items!: Table<Item>;
  itemFields!: Table<ItemField>;
  reminders!: Table<Reminder>;
  history!: Table<HistoryEntry>;
  settings!: Table<AppSettings>;

  constructor() {
    super('homedocket');

    this.version(1).stores({
      categories: 'id, name, sortOrder, isDefault',
      items: 'id, categoryId, status, updatedAt, serviceType',
      itemFields: 'id, itemId, fieldKey, fieldType, [itemId+fieldKey]',
      reminders: 'id, itemId, fieldKey, [itemId+fieldKey]',
      history: 'id, itemId, changedAt',
      settings: 'key',
    });

    // V2: Add dismissedUntil to items, changeType to history
    this.version(2).stores({
      items: 'id, categoryId, status, updatedAt, serviceType, dismissedUntil',
    }).upgrade((tx) => {
      // Set defaults for existing records
      return Promise.all([
        tx.table('items').toCollection().modify((item) => {
          if (item.dismissedUntil === undefined) {
            item.dismissedUntil = null;
          }
        }),
        tx.table('history').toCollection().modify((entry) => {
          if (entry.changeType === undefined) {
            entry.changeType = 'edit';
          }
        }),
      ]);
    });

    // V3: Heal rows that have Date fields persisted as strings or numbers.
    //
    // BUG: before this version, the restore path (use-backup.ts) bulk-added
    // rows straight out of JSON.parse, which turns Dates into ISO strings.
    // Those strings were then stored in IndexedDB and subsequently crashed
    // any consumer that called `.getTime()` on them (see the item-detail
    // "stuck on Loading..." incident caused by getHistoryForItem).
    //
    // This upgrade walks every table with Date-typed fields and coerces the
    // value to a real Date. It is safe to re-run — Date instances pass
    // through untouched.
    this.version(3).upgrade((tx) => {
      const coerce = (v: unknown): Date | null => {
        if (v == null) return null;
        if (v instanceof Date) return v;
        if (typeof v === 'string' || typeof v === 'number') {
          const d = new Date(v);
          return Number.isNaN(d.getTime()) ? null : d;
        }
        return null;
      };
      const required = (v: unknown): Date => coerce(v) ?? new Date(0);

      return Promise.all([
        tx.table('categories').toCollection().modify((row) => {
          row.createdAt = required(row.createdAt);
          row.updatedAt = required(row.updatedAt);
        }),
        tx.table('items').toCollection().modify((row) => {
          row.createdAt = required(row.createdAt);
          row.updatedAt = required(row.updatedAt);
          row.dismissedUntil = coerce(row.dismissedUntil);
        }),
        tx.table('itemFields').toCollection().modify((row) => {
          row.createdAt = required(row.createdAt);
          row.updatedAt = required(row.updatedAt);
        }),
        tx.table('reminders').toCollection().modify((row) => {
          row.createdAt = required(row.createdAt);
          row.lastNotifiedAt = coerce(row.lastNotifiedAt);
        }),
        tx.table('history').toCollection().modify((row) => {
          row.changedAt = required(row.changedAt);
        }),
      ]);
    });
  }
}
