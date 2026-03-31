import { useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db/database';
import type { ItemField, HistoryEntry, HistoryChangeType } from '@/db/schema';
import type { FieldType } from '@/types';

export function useItemFields() {
  const getFieldsForItem = useCallback(async (itemId: string): Promise<ItemField[]> => {
    const fields = await db.itemFields.where('itemId').equals(itemId).toArray();
    return fields.sort((a, b) => a.sortOrder - b.sortOrder);
  }, []);

  const updateField = useCallback(async (
    fieldId: string,
    newValue: string | null,
    changeType: HistoryChangeType = 'edit'
  ): Promise<void> => {
    const field = await db.itemFields.get(fieldId);
    if (!field) throw new Error(`Field ${fieldId} not found`);

    const oldValue = field.fieldValue;

    // Update the field
    await db.itemFields.update(fieldId, {
      fieldValue: newValue,
      updatedAt: new Date(),
    });

    // Log history entry
    const historyEntry: HistoryEntry = {
      id: uuidv4(),
      itemId: field.itemId,
      fieldKey: field.fieldKey,
      oldValue,
      newValue,
      changeType,
      changedAt: new Date(),
    };

    await db.history.add(historyEntry);

    // Update parent item's updatedAt
    await db.items.update(field.itemId, {
      updatedAt: new Date(),
    });
  }, []);

  const addCustomField = useCallback(async (
    itemId: string,
    label: string,
    fieldType: FieldType
  ): Promise<string> => {
    const existingFields = await db.itemFields.where('itemId').equals(itemId).toArray();
    const maxSortOrder = existingFields.reduce((max, f) => Math.max(max, f.sortOrder), -1);

    const fieldKey = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const now = new Date();

    const field: ItemField = {
      id: uuidv4(),
      itemId,
      fieldKey,
      fieldValue: null,
      fieldType,
      label,
      isTemplateField: false,
      sortOrder: maxSortOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.itemFields.add(field);
    return field.id;
  }, []);

  const getFieldByKey = useCallback(async (itemId: string, fieldKey: string): Promise<ItemField | undefined> => {
    return db.itemFields.where('[itemId+fieldKey]').equals([itemId, fieldKey]).first();
  }, []);

  return useMemo(() => ({
    getFieldsForItem,
    updateField,
    addCustomField,
    getFieldByKey,
  }), [getFieldsForItem, updateField, addCustomField, getFieldByKey]);
}
