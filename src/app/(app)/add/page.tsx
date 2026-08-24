'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus } from 'lucide-react';
import { db } from '@/db/database';
import type { Category } from '@/db/schema';
import { CategoryIcon, CATEGORY_ACCENTS, DEFAULT_ACCENT } from '@/components/ui/category-icon';

/** Short blurbs for the default categories, matching the Hearth design's category grid. */
const CATEGORY_SUBTITLES: Record<string, string> = {
  Vehicle: 'NCT, tax, insurance',
  Utilities: '6 service types',
  Housing: 'Mortgage, LPT, lease',
  Insurance: 'Home, life, pet',
};

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
    router.push(`/add/form?categoryId=${category.id}&name=${encodeURIComponent(category.name)}`);
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
    router.push(`/add/form?categoryId=${newCategory.id}&name=${encodeURIComponent(newCategory.name)}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-sm"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-[13px] font-bold text-muted-foreground">Step 1 of 2</span>
      </div>

      <h1 className="mt-4 font-heading text-[34px] leading-[1.02] font-bold tracking-tight">
        What are we
        <br />
        keeping an eye on?
      </h1>

      <div className="mt-5.5 grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const accent = CATEGORY_ACCENTS[category.icon] ?? DEFAULT_ACCENT;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category)}
              className="flex min-h-37.5 flex-col justify-between rounded-xl bg-card p-5 text-left shadow-sm"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}
              >
                <CategoryIcon icon={category.icon} size={23} />
              </span>
              <span>
                <span className="block font-heading text-[19px] font-bold tracking-tight">
                  {category.name}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                  {CATEGORY_SUBTITLES[category.name] ?? (category.isDefault ? '' : 'Custom category')}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Create Custom Category */}
      <button
        type="button"
        onClick={() => setShowCustomDialog(true)}
        className="mt-3 flex w-full items-center gap-3.5 rounded-xl border-1.5 border-dashed border-border p-4.5 text-left text-muted-foreground"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
          <Plus size={21} strokeWidth={2} />
        </span>
        <span className="text-[15px] font-bold">Something else</span>
      </button>

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
                className="min-h-11 rounded-full px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustom}
                className="min-h-11 rounded-full bg-primary px-5 py-3 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
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
