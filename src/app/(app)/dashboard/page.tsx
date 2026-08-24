'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, Plus, Check } from 'lucide-react';
import { useDashboard, type DashboardData } from '@/hooks/use-dashboard';
import { useItems } from '@/hooks/use-items';
import { useItemFields } from '@/hooks/use-item-fields';
import { useReminders } from '@/hooks/use-reminders';
import { RightNowCard } from '@/components/dashboard/right-now-card';
import { NeedsYouRow } from '@/components/dashboard/needs-you-row';
import { AllSettledList } from '@/components/dashboard/all-settled-list';
import { RenewDialog } from '@/components/dashboard/renew-dialog';
import { CategoryIcon, CATEGORY_ACCENTS, DEFAULT_ACCENT } from '@/components/ui/category-icon';
import { LogoWordmark } from '@/components/ui/logo';
import type { DashboardItem } from '@/types';

/** The four default category icons shown on the first-run empty state —
 * matches the seeded default categories (Vehicle, Utilities, Housing, Insurance). */
const FIRST_RUN_ICONS = ['car', 'zap', 'home', 'shield'];

export default function DashboardPage() {
  const router = useRouter();
  const { getDashboardData } = useDashboard();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);

  const { clearDismissal } = useItems();
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

  const needsYouItems = useMemo(
    () => (data ? data.items.filter((i) => i.displayStatus !== 'ok') : []),
    [data]
  );
  const settledItems = useMemo(
    () => (data ? data.items.filter((i) => i.displayStatus === 'ok') : []),
    [data]
  );

  const handleItemClick = (id: string) => {
    router.push(`/item?id=${id}`);
  };

  const handleAddClick = () => {
    router.push('/add');
  };

  const handleRenewStart = (item: DashboardItem) => {
    setSelectedItem(item);
    setRenewDialogOpen(true);
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
      <div className="flex flex-1 flex-col">
        <LogoWordmark />
        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="mb-6 flex gap-2.5">
            {FIRST_RUN_ICONS.map((icon) => {
              const accent = CATEGORY_ACCENTS[icon] ?? DEFAULT_ACCENT;
              return (
                <span
                  key={icon}
                  className={`flex h-13 w-13 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}
                >
                  <CategoryIcon icon={icon} size={24} />
                </span>
              );
            })}
          </div>
          <h1 className="font-heading text-[40px] leading-[1.02] font-bold tracking-tight">
            Nothing is due.
            <br />
            Nothing is
            <br />
            tracked yet.
          </h1>
          <p className="mt-4.5 max-w-77.5 text-[15px] leading-relaxed text-muted-foreground">
            Add your NCT, motor tax, insurance renewals and utility contracts. Docket counts
            down and tells you before anything lapses.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Local only', 'No account', 'Works offline'].map((tag) => (
              <span
                key={tag}
                className="flex h-8.5 items-center rounded-full bg-muted px-3.5 text-[13px] font-semibold text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary py-4 text-[16px] font-bold text-primary-foreground shadow-lg shadow-primary/25"
        >
          <Plus size={21} strokeWidth={2.5} />
          Add your first item
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <LogoWordmark />
        <button
          type="button"
          onClick={() => router.push('/settings')}
          aria-label="Settings"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm"
        >
          <SettingsIcon size={19} strokeWidth={1.75} />
        </button>
      </div>

      {/* Right Now hero */}
      <RightNowCard attentionCount={needsYouItems.length} items={data.items} />

      {/* Needs You */}
      {needsYouItems.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-[19px] font-bold tracking-tight">Needs you</h2>
            <span className="text-[12px] font-bold text-muted-foreground">
              {needsYouItems.length}
            </span>
          </div>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {needsYouItems.map((item) => (
              <NeedsYouRow
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item.id)}
                onRenewClick={() => handleRenewStart(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Settled */}
      {settledItems.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-[19px] font-bold tracking-tight">All settled</h2>
            <span
              className="flex items-center gap-1.5 text-[12px] font-bold"
              style={{ color: 'var(--status-ok)' }}
            >
              <Check size={14} strokeWidth={2.5} />
              {settledItems.length}
            </span>
          </div>
          <div className="mt-2.5">
            <AllSettledList items={settledItems} onItemClick={handleItemClick} />
          </div>
        </section>
      )}

      {/* Renew Dialog */}
      <RenewDialog
        open={renewDialogOpen}
        onOpenChange={setRenewDialogOpen}
        item={selectedItem}
        onConfirm={handleRenewConfirm}
      />
    </div>
  );
}
