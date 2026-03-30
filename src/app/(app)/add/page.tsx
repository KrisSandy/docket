'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Zap, Home, Wifi, Shield, ChevronRight } from 'lucide-react';
import { db } from '@/db/database';
import type { Category } from '@/db/schema';
import { BackButton } from '@/components/layout/back-button';

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  car: <Car size={24} />,
  zap: <Zap size={24} />,
  home: <Home size={24} />,
  wifi: <Wifi size={24} />,
  shield: <Shield size={24} />,
};

export default function AddItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

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
              {CATEGORY_ICON_MAP[category.icon] ?? <Home size={24} />}
            </div>
            <span className="flex-1 text-[15px] font-semibold">{category.name}</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
