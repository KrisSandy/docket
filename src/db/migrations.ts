import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import { getTemplateFields } from '@/lib/templates';
import type { ItemField } from './schema';
import type { ServiceType } from '@/types';

/**
 * Run data migrations after schema upgrades.
 * Called on app initialization.
 *
 * Currently a no-op — we're on a single DB version (dev mode, delete-and-recreate).
 */
export async function runDataMigrations(): Promise<void> {
  // No migrations needed — single DB version during dev
}

/**
 * Add missing template fields to an existing item.
 * Compares current item fields against the template and creates any missing ones.
 * Returns the number of fields added.
 */
export async function addMissingTemplateFields(
  itemId: string,
  categoryName: string,
  serviceType?: ServiceType | null
): Promise<number> {
  const templateFields = getTemplateFields(categoryName, serviceType);
  const existingFields = await db.itemFields.where('itemId').equals(itemId).toArray();
  const existingKeys = new Set(existingFields.map((f) => f.fieldKey));

  const now = new Date();
  const newFields: ItemField[] = [];

  for (const tf of templateFields) {
    if (!existingKeys.has(tf.fieldKey)) {
      newFields.push({
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
      });
    }
  }

  if (newFields.length > 0) {
    await db.itemFields.bulkAdd(newFields);
  }

  return newFields.length;
}
