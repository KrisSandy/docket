import { useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db/database';
import type { Item, ItemField } from '@/db/schema';
import { getTemplateFields } from '@/lib/templates';
import type { ServiceType } from '@/types';

export interface CreateItemInput {
  categoryId: string;
  categoryName: string;
  title: string;
  serviceType?: string | null;
}

export interface UpdateItemInput {
  title?: string;
  status?: 'active' | 'archived';
}

export function useItems() {
  const createItem = useCallback(async (input: CreateItemInput): Promise<string> => {
    const now = new Date();
    const itemId = uuidv4();

    const item: Item = {
      id: itemId,
      categoryId: input.categoryId,
      title: input.title,
      status: 'active',
      serviceType: input.serviceType ?? null,
      dismissedUntil: null,
      createdAt: now,
      updatedAt: now,
    };

    // Create the item
    await db.items.add(item);

    // Create template fields (service-type-aware for Utilities)
    const templateFields = getTemplateFields(input.categoryName, (input.serviceType as ServiceType) ?? null);
    const fields: ItemField[] = templateFields.map((tf) => ({
      id: uuidv4(),
      itemId,
      fieldKey: tf.fieldKey,
      fieldValue: null,
      fieldType: tf.fieldType,
      label: tf.label,
      isTemplateField: true,
      sortOrder: tf.sortOrder,
      createdAt: now,
      updatedAt: now,
    }));

    if (fields.length > 0) {
      await db.itemFields.bulkAdd(fields);
    }

    return itemId;
  }, []);

  const getItem = useCallback(async (id: string): Promise<Item | undefined> => {
    return db.items.get(id);
  }, []);

  const updateItem = useCallback(async (id: string, updates: UpdateItemInput): Promise<void> => {
    await db.items.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    await db.transaction('rw', [db.items, db.itemFields, db.reminders, db.history], async () => {
      await db.itemFields.where('itemId').equals(id).delete();
      await db.reminders.where('itemId').equals(id).delete();
      await db.history.where('itemId').equals(id).delete();
      await db.items.delete(id);
    });
  }, []);

  const dismissItem = useCallback(async (id: string, dismissedUntil: Date): Promise<void> => {
    await db.items.update(id, {
      dismissedUntil,
      updatedAt: new Date(),
    });
  }, []);

  const clearDismissal = useCallback(async (id: string): Promise<void> => {
    await db.items.update(id, {
      dismissedUntil: null,
      updatedAt: new Date(),
    });
  }, []);

  const listItems = useCallback(async (filters?: { status?: 'active' | 'archived'; categoryId?: string }): Promise<Item[]> => {
    let collection = db.items.toCollection();

    if (filters?.status) {
      collection = db.items.where('status').equals(filters.status);
    }

    let items = await collection.toArray();

    if (filters?.categoryId) {
      items = items.filter((item) => item.categoryId === filters.categoryId);
    }

    // Sort by updatedAt descending (newest first)
    items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return items;
  }, []);

  return useMemo(() => ({
    createItem,
    getItem,
    updateItem,
    dismissItem,
    clearDismissal,
    deleteItem,
    listItems,
  }), [createItem, getItem, updateItem, dismissItem, clearDismissal, deleteItem, listItems]);
}
