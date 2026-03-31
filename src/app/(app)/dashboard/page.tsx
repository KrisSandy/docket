'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LayoutList, List } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { useDashboard, type DashboardData } from '@/hooks/use-dashboard';
import { useItems } from '@/hooks/use-items';
import { useItemFields } from '@/hooks/use-item-fields';
import { useReminders } from '@/hooks/use-reminders';
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics';
import { StatusBanner } from '@/components/dashboard/status-banner';
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines';
import { ReviewSheet } from '@/components/dashboard/review-sheet';
import { RenewDialog } from '@/components/dashboard/renew-dialog';
import { DismissDialog, type DismissDuration } from '@/components/dashboard/dismiss-dialog';
import { GlanceRow } from '@/components/dashboard/glance-row';
import { ItemCard } from '@/components/dashboard/item-card';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryIcon } from '@/components/ui/category-icon';
import { LogoWordmark } from '@/components/ui/logo';
import { db } from '@/db/database';
import type { DashboardItem } from '@/types';
import type { HistoryEntry } from '@/db/schema';

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
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);

  const { dismissItem, clearDismissal } = useItems();
  const { getFieldsForItem, updateField } = useItemFields();
  const { rescheduleRemindersForItem } = useReminders();

  const loadData = useCallback(async () => {
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
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

  // Attention items for the review sheet
  const attentionItems = useMemo(() => {
    if (!data) return [];
    return data.items.filter((i) => i.displayStatus !== 'ok');
  }, [data]);

  const handleReviewOpen = () => {
    setReviewSheetOpen(true);
  };

  const handleRenewStart = (item: DashboardItem) => {
    setSelectedItem(item);
    setRenewDialogOpen(true);
  };

  const handleDismissStart = (item: DashboardItem) => {
    setSelectedItem(item);
    setDismissDialogOpen(true);
  };

  const handleRenewConfirm = async (item: DashboardItem, newDate: string) => {
    // Find the earliest deadline date field and update it
    const fields = await getFieldsForItem(item.id);
    const dateFields = fields.filter((f) => f.fieldType === 'date' && f.fieldValue);

    // Find the field that matches the earliest deadline
    let targetField = dateFields.find((f) => {
      if (!f.fieldValue) return false;
      const fieldDate = new Date(f.fieldValue);
      return item.earliestDeadline && fieldDate.getTime() === item.earliestDeadline.getTime();
    });

    // Fallback: use the first date field
    if (!targetField) {
      targetField = dateFields[0] ?? fields.find((f) => f.fieldType === 'date');
    }

    if (targetField) {
      await updateField(targetField.id, newDate, 'renewal');

      // Build field date map for rescheduling
      const fieldDateMap = new Map<string, Date>();
      for (const f of fields) {
        if (f.fieldType === 'date') {
          const dateVal = f.id === targetField!.id ? newDate : f.fieldValue;
          if (dateVal) {
            const d = new Date(dateVal);
            if (!isNaN(d.getTime())) fieldDateMap.set(f.fieldKey, d);
          }
        }
      }
      await rescheduleRemindersForItem(item.id, fieldDateMap);
    }

    // Clear any dismissal
    await clearDismissal(item.id);

    setRenewDialogOpen(false);
    setSelectedItem(null);
    await loadData();

    // Auto-close review sheet if no more attention items
    const freshData = await getDashboardData();
    if (freshData.attentionCount === 0) {
      setReviewSheetOpen(false);
      setBannerDismissed(false); // Reset banner to show "all clear"
    }
  };

  const handleDismissConfirm = async (item: DashboardItem, duration: DismissDuration) => {
    let dismissedUntil: Date;
    if (duration === 'indefinite') {
      dismissedUntil = new Date('2099-12-31');
    } else {
      dismissedUntil = addDays(new Date(), parseInt(duration));
    }

    await dismissItem(item.id, dismissedUntil);

    // Log history entry for the dismissal
    const historyEntry: HistoryEntry = {
      id: uuidv4(),
      itemId: item.id,
      fieldKey: '_dismissal',
      oldValue: null,
      newValue: dismissedUntil.toISOString(),
      changeType: 'dismissal',
      changedAt: new Date(),
    };
    await db.history.add(historyEntry);

    setDismissDialogOpen(false);
    setSelectedItem(null);
    await loadData();

    // Auto-close review sheet if no more attention items
    const freshData = await getDashboardData();
    if (freshData.attentionCount === 0) {
      setReviewSheetOpen(false);
      setBannerDismissed(false);
    }
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
        <LogoWordmark className="mb-8" />
        <EmptyState
          message="Track your NCT, insurance, and utility deadlines — never miss a renewal again."
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
      {/* App Header */}
      <LogoWordmark />

      {/* Status Banner */}
      {!bannerDismissed && (
        <StatusBanner
          attentionCount={data.attentionCount}
          overallStatus={data.overallStatus}
          onClick={data.overallStatus !== 'ok' ? handleReviewOpen : undefined}
          onDismiss={data.overallStatus !== 'ok' ? () => setBannerDismissed(true) : undefined}
        />
      )}

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
                isDismissed={item.dismissedUntil !== null && item.dismissedUntil !== undefined && item.dismissedUntil > new Date()}
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

      {/* Floating Add Button */}
      <button
        type="button"
        onClick={handleAddClick}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-150 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-90"
        aria-label="Add new item"
      >
        <Plus size={28} strokeWidth={2} />
      </button>

      {/* Review Sheet */}
      <ReviewSheet
        open={reviewSheetOpen}
        onOpenChange={setReviewSheetOpen}
        items={attentionItems}
        onRenew={handleRenewStart}
        onDismiss={handleDismissStart}
      />

      {/* Renew Dialog */}
      <RenewDialog
        open={renewDialogOpen}
        onOpenChange={setRenewDialogOpen}
        item={selectedItem}
        onConfirm={handleRenewConfirm}
      />

      {/* Dismiss Dialog */}
      <DismissDialog
        open={dismissDialogOpen}
        onOpenChange={setDismissDialogOpen}
        item={selectedItem}
        onConfirm={handleDismissConfirm}
      />

    </div>
  );
}
