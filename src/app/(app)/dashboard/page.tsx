'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LayoutList, List } from 'lucide-react';
import { useDashboard, type DashboardData } from '@/hooks/use-dashboard';
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics';
import { Snackbar } from '@/components/ui/snackbar';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { GlanceRow } from '@/components/dashboard/glance-row';
import { ItemCard } from '@/components/dashboard/item-card';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryIcon } from '@/components/ui/category-icon';
import { formatDate } from '@/lib/dates';
import { db } from '@/db/database';

type ViewMode = 'glance' | 'detail';

const VIEW_MODE_KEY = 'dashboard_view_mode';

/** Stagger delay per item in milliseconds */
const STAGGER_MS = 40;
const STAGGER_DURATION_MS = 300;

function useStaggerAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return { isVisible, getItemStyle: (index: number): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity ${STAGGER_DURATION_MS}ms ease-out ${index * STAGGER_MS}ms, transform ${STAGGER_DURATION_MS}ms ease-out ${index * STAGGER_MS}ms`,
  })};
}

export default function DashboardPage() {
  const router = useRouter();
  const { getDashboardData } = useDashboard();
  const [data, setData] = useState<DashboardData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
      setLastChecked(new Date());
      if (dashboardData.attentionCount > 0) {
        setShowSnackbar(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getDashboardData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Restore persisted view mode from DB on mount
  useEffect(() => {
    db.settings.get(VIEW_MODE_KEY).then((setting) => {
      if (setting?.value === 'glance' || setting?.value === 'detail') {
        setViewMode(setting.value);
      }
    });
  }, []);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (!activeCategoryId) return data.items;
    return data.items.filter((i) => i.categoryId === activeCategoryId);
  }, [data, activeCategoryId]);

  const { getItemStyle } = useStaggerAnimation();

  const handleItemClick = (id: string) => {
    router.push(`/item/${id}`);
  };

  const handleAddClick = () => {
    router.push('/add');
  };

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'glance' ? 'detail' : 'glance';
      // Persist to DB so it survives navigation and page reloads
      db.settings.put({ key: VIEW_MODE_KEY, value: next });
      return next;
    });
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
        <EmptyState
          message="No items tracked yet. Tap + to add your first."
          action={
            <button
              type="button"
              onClick={handleAddClick}
              className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98]"
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
      {/* Summary Metrics */}
      <DashboardMetrics
        items={data.items}
        attentionCount={data.attentionCount}
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
            className={`shrink-0 flex min-h-[36px] items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-95 ${
              activeCategoryId === null
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
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
              className={`shrink-0 flex min-h-[36px] items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 active:scale-95 ${
                activeCategoryId === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
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
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-muted-foreground transition-all duration-150 hover:bg-muted/50 hover:text-foreground active:scale-90"
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
            {filteredItems.map((item, index) => (
              <GlanceRow
                key={item.id}
                title={item.title}
                status={item.displayStatus}
                dateLabel={item.keyDateLabel}
                icon={<CategoryIcon icon={item.categoryIcon} size={16} />}
                onClick={() => handleItemClick(item.id)}
                style={getItemStyle(index)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item.id)}
                style={getItemStyle(index)}
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
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-150 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-90"
        aria-label="Add new item"
      >
        <Plus size={28} strokeWidth={2} />
      </button>

      {/* Attention Snackbar */}
      {data.attentionCount > 0 && (
        <Snackbar
          message={`${data.attentionCount} item${data.attentionCount === 1 ? '' : 's'} need${data.attentionCount === 1 ? 's' : ''} attention`}
          status={data.overallStatus}
          duration={5000}
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
        />
      )}
    </div>
  );
}
