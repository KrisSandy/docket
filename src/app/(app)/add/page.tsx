'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight } from 'lucide-react';
import { db } from '@/db/database';
import type { Category } from '@/db/schema';
import { BackButton } from '@/components/layout/back-button';
import { CategoryIcon } from '@/components/ui/category-icon';

export default function AddItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('package');
  const [customError, setCustomError] = useState('');

  const AVAILABLE_ICONS = [
    'package', 'car', 'zap', 'home', 'shield', 'flame',
    'smartphone', 'tv', 'droplets', 'wifi',
  ];

  useEffect(() => {
    const load = async () => {
      const cats = await db.categories.orderBy('sortOrder').toArray();
      setCategories(cats);
    };
    load();
  }, []);

  const handleCategorySelect = (category: Category) => {
    router.push(`/add/${category.id}?name=${encodeURIComponent(category.name)}`);
  };

  const handleCreateCustom = async () => {
    const trimmed = customName.trim();
    if (!trimmed) {
      setCustomError('Category name is required');
      return;
    }

    // Check for duplicate
    const existing = await db.categories.where('name').equalsIgnoreCase(trimmed).first();
    if (existing) {
      setCustomError('A category with this name already exists');
      return;
    }

    const { v4: uuidv4 } = await import('uuid');
    const maxSort = categories.length > 0 ? Math.max(...categories.map((c) => c.sortOrder)) : -1;
    const now = new Date();

    const newCategory: Category = {
      id: uuidv4(),
      name: trimmed,
      icon: customIcon,
      sortOrder: maxSort + 1,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.categories.add(newCategory);
    setShowCustomDialog(false);
    setCustomName('');
    setCustomIcon('package');
    setCustomError('');

    // Navigate to add item with the new category
    router.push(`/add/${newCategory.id}?name=${encodeURIComponent(newCategory.name)}`);
  };

  return (
    <div>
      <BackButton href="/dashboard" label="Dashboard" />

      <h1 className="mt-4 text-[28px] font-bold tracking-tight">
        Add Item
      </h1>
      <p className="mt-1 text-[15px] text-muted-foreground">
        Select a category to get started.
      </p>

      <div className="mt-6 space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategorySelect(category)}
            className="flex w-full items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 min-h-[44px] text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CategoryIcon icon={category.icon} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[15px] font-semibold">{category.name}</span>
              {!category.isDefault && (
                <span className="ml-2 text-[11px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">Custom</span>
              )}
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        ))}

        {/* Create Custom Category */}
        <button
          type="button"
          onClick={() => setShowCustomDialog(true)}
          className="flex w-full items-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-4 min-h-[44px] text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Plus size={24} />
          </div>
          <span className="flex-1 text-[15px] font-medium text-muted-foreground">Create Custom Category</span>
        </button>
      </div>

      {/* Custom Category Dialog */}
      {showCustomDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-[18px] font-semibold">New Category</h3>

            {/* Category Name */}
            <div className="mt-4">
              <label htmlFor="custom-cat-name" className="mb-2 block text-[13px] text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="custom-cat-name"
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setCustomError('');
                }}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                placeholder="e.g., Subscriptions"
                autoFocus
              />
              {customError && (
                <p className="mt-1 text-[13px] text-destructive">{customError}</p>
              )}
            </div>

            {/* Icon Picker */}
            <div className="mt-4">
              <p className="mb-2 text-[13px] text-muted-foreground">Icon</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCustomIcon(icon)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      customIcon === icon
                        ? 'bg-primary/10 text-primary border-2 border-primary'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <CategoryIcon icon={icon} size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCustomDialog(false);
                  setCustomName('');
                  setCustomIcon('package');
                  setCustomError('');
                }}
                className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustom}
                className="min-h-[44px] rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
