import { v4 as uuidv4 } from 'uuid';
import { db } from './database';
import type { Category } from './schema';

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Vehicle', icon: 'car', sortOrder: 0, isDefault: true },
  { name: 'Utilities', icon: 'zap', sortOrder: 1, isDefault: true },
  { name: 'Housing', icon: 'home', sortOrder: 2, isDefault: true },
  { name: 'Connectivity', icon: 'wifi', sortOrder: 3, isDefault: true },
  { name: 'Insurance', icon: 'shield', sortOrder: 4, isDefault: true },
];

export async function seedDefaultCategories(): Promise<void> {
  const existingCount = await db.categories.count();
  if (existingCount > 0) return;

  const now = new Date();
  const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  }));

  await db.categories.bulkAdd(categories);
}
