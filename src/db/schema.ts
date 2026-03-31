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
  }
}
