'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LayoutList, List } from 'lucide-react';
import { useDashboard, type DashboardData } from '@/hooks/use-dashboard';
import { StatusBanner } from '@/components/dashboard/status-banner';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { GlanceRow } from '@/components/dashboard/glance-row';
import { ItemCard } from '@/components/dashboard/item-card';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryIcon } from '@/components/ui/category-icon';
import { formatDate } from '@/lib/dates';

type ViewMode = 'glance' | 'detail';

export default function DashboardPage() {
  const router = useRouter();
  const { getDashboardData } = useDashboard();
  const [data, setData] = useState<DashboardData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('glance');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [getDashboardData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (!activeCategoryId) return data.items;
    return data.items.filter((i) => i.categoryId === activeCategoryId);
  }, [data, activeCategoryId]);

  const handleItemClick = (id: string) => {
    router.push(`/item/${id}`);
  };

  const handleAddClick = () => {
    router.push('/add');
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'glance' ? 'detail' : 'glance'));
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setActiveCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[15px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div>
        <StatusBanner attentionCount={0} overallStatus="ok" />
        <EmptyState
          message="No items tracked yet. Tap + to add your first."
          action={
            <button
              type="button"
              onClick={handleAddClick}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
            >
              <Plus size={20} />
              Add Item
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner — Morning Coffee Glance */}
      <StatusBanner
        attentionCount={data.attentionCount}
        overallStatus={data.overallStatus}
      />

      {/* Upcoming Deadlines */}
      {data.upcomingDeadlines.length > 0 && (
        <section>
          <SectionHeader title="Upcoming" />
          <UpcomingDeadlines
            items={data.upcomingDeadlines}
            onItemClick={handleItemClick}
          />
        </section>
      )}

      {/* Category Filter Chips */}
      {data.categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-1 pb-1 -mx-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 flex min-h-[36px] items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              activeCategoryId === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            All
          </button>
          {data.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategoryFilter(cat.id)}
              className={`shrink-0 flex min-h-[36px] items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                activeCategoryId === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <CategoryIcon icon={cat.icon} size={14} />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      <section>
        <SectionHeader
          title={activeCategoryId ? `${data.categories.find((c) => c.id === activeCategoryId)?.name ?? 'Filtered'}` : 'All Items'}
          action={
            <button
              type="button"
              onClick={toggleViewMode}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label={`Switch to ${viewMode === 'glance' ? 'detail' : 'glance'} view`}
            >
              {viewMode === 'glance' ? (
                <LayoutList size={20} />
              ) : (
                <List size={20} />
              )}
            </button>
          }
        />

        {filteredItems.length === 0 ? (
          <EmptyState message="No items in this category." />
        ) : viewMode === 'glance' ? (
          <div>
            {filteredItems.map((item) => (
              <GlanceRow
                key={item.id}
                title={item.title}
                status={item.displayStatus}
                dateLabel={item.keyDateLabel}
                icon={<CategoryIcon icon={item.categoryIcon} size={16} />}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Last Checked */}
      {lastChecked && (
        <p className="text-center text-[13px] text-muted-foreground pb-2">
          Last checked {formatDate(lastChecked)}
        </p>
      )}

      {/* Floating Add Button */}
      <button
        type="button"
        onClick={handleAddClick}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary/80 text-primary-foreground shadow-lg transition-all hover:bg-primary active:bg-primary/70 active:scale-95"
        aria-label="Add new item"
      >
        <Plus size={28} strokeWidth={2} />
      </button>
    </div>
  );
}
