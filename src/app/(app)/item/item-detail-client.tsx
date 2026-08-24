'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Pencil,
  Archive,
  ChevronUp,
  ChevronRight,
  BellOff,
  Check,
} from 'lucide-react';
import { useItems } from '@/hooks/use-items';
import { useItemFields } from '@/hooks/use-item-fields';
import { useReminders } from '@/hooks/use-reminders';
import { useHistory } from '@/hooks/use-history';
import { FieldRenderer } from '@/components/items/field-renderer';
import { DateReminderButton } from '@/components/items/date-reminder-button';
import { ProgressRing } from '@/components/items/progress-ring';
import { ItemEditMode } from '@/components/items/item-edit-mode';
import { HistoryTimeline } from '@/components/items/history-timeline';
import { CategoryIcon } from '@/components/ui/category-icon';
import { RenewDialog } from '@/components/dashboard/renew-dialog';
import { DismissDialog, type DismissDuration } from '@/components/dashboard/dismiss-dialog';
import { db } from '@/db/database';
import type { Item, ItemField, HistoryEntry } from '@/db/schema';
import type { DashboardItem, DisplayStatus, ServiceType } from '@/types';
import { daysUntilDate, getEarliestDeadline, formatDate } from '@/lib/dates';
import { calculateStatus, getStatusColor, getStatusTint } from '@/lib/status';

const WINDOW_DAYS = 90;

export default function ItemDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') ?? '';

  const { getItem, updateItem, dismissItem, clearDismissal } = useItems();
  const { getFieldsForItem, updateField } = useItemFields();
  const { rescheduleRemindersForItem } = useReminders();
  const { getHistoryForItem } = useHistory();

  const [item, setItem] = useState<Item | null>(null);
  const [fields, setFields] = useState<ItemField[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [displayStatus, setDisplayStatus] = useState<DisplayStatus>('ok');
  const [isEditing, setIsEditing] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryIcon, setCategoryIcon] = useState<string>('package');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [itemData, fieldsData, history] = await Promise.all([
        getItem(id),
        getFieldsForItem(id),
        getHistoryForItem(id),
      ]);

      if (!itemData) {
        // Item no longer exists — bounce back to dashboard.
        // Stop loading first so we don't render "Loading..." forever if
        // navigation is delayed (e.g. on native webview history stacks).
        setIsLoading(false);
        router.push('/dashboard');
        return;
      }

      // Look up category name + icon for template field options and hero styling
      const category = await db.categories.get(itemData.categoryId);
      setCategoryName(category?.name ?? '');
      setCategoryIcon(category?.icon ?? 'package');

      setItem(itemData);
      setFields(fieldsData);
      setHistoryEntries(history);

      // Calculate display status (respect dismissal)
      const isDismissed = itemData.dismissedUntil !== null
        && itemData.dismissedUntil !== undefined
        && itemData.dismissedUntil > new Date();
      if (isDismissed) {
        setDisplayStatus('ok');
      } else {
        const dateValues = fieldsData
          .filter((f) => f.fieldType === 'date')
          .map((f) => f.fieldValue);
        const earliest = getEarliestDeadline(dateValues);
        const days = earliest ? daysUntilDate(earliest) : null;
        setDisplayStatus(calculateStatus(days));
      }
    } catch (err) {
      // Defensive: any Dexie / serialization error must surface instead of
      // leaving the screen stuck on "Loading..." (seen on Android webview).
      console.error('[item-detail] Failed to load item', err);
      setLoadError(
        err instanceof Error ? err.message : 'Something went wrong loading this item.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, getItem, getFieldsForItem, getHistoryForItem, router]);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Always mount the item detail page scrolled to the top.
  // Next.js App Router scroll restoration is unreliable when navigating
  // between routes whose content heights change after async data loads
  // (dashboard → item?id=xxx), so we force the reset here.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [id]);

  const handleArchive = async () => {
    if (!item) return;
    await updateItem(item.id, { status: 'archived' });
    router.push('/dashboard');
  };

  const handleEditSave = () => {
    setIsEditing(false);
    loadData();
  };

  const handleRetry = () => {
    setIsLoading(true);
    void loadData();
  };

  // ---------- Mark renewed / Snooze — reuse the dashboard's dialogs ----------

  const earliestDeadline = getEarliestDeadline(
    fields.filter((f) => f.fieldType === 'date').map((f) => f.fieldValue)
  );
  const daysUntilDeadline = earliestDeadline ? daysUntilDate(earliestDeadline) : null;

  const toDashboardItem = (): DashboardItem | null => {
    if (!item) return null;
    return {
      id: item.id,
      categoryId: item.categoryId,
      categoryName,
      categoryIcon,
      title: item.title,
      status: item.status,
      displayStatus,
      earliestDeadline,
      daysUntilDeadline,
      keyDateLabel: null,
      serviceType: (item.serviceType as ServiceType) ?? null,
      dismissedUntil: item.dismissedUntil ?? null,
    };
  };

  const handleRenewConfirm = async (dashboardItem: DashboardItem, newDate: string) => {
    const dateFields = fields.filter((f) => f.fieldType === 'date' && f.fieldValue);

    let targetField = dateFields.find((f) => {
      if (!f.fieldValue) return false;
      const fieldDate = new Date(f.fieldValue);
      return earliestDeadline && fieldDate.getTime() === earliestDeadline.getTime();
    });
    if (!targetField) {
      targetField = dateFields[0] ?? fields.find((f) => f.fieldType === 'date');
    }

    if (targetField) {
      await updateField(targetField.id, newDate, 'renewal');

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
      await rescheduleRemindersForItem(dashboardItem.id, fieldDateMap);
    }

    await clearDismissal(dashboardItem.id);
    setRenewDialogOpen(false);
    await loadData();
  };

  const handleDismissConfirm = async (dashboardItem: DashboardItem, duration: DismissDuration) => {
    let dismissedUntil: Date;
    if (duration === 'indefinite') {
      dismissedUntil = new Date('2099-12-31');
    } else {
      dismissedUntil = new Date();
      dismissedUntil.setDate(dismissedUntil.getDate() + parseInt(duration, 10));
    }
    await dismissItem(dashboardItem.id, dismissedUntil);
    setDismissDialogOpen(false);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[15px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-sm"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="mt-8 rounded-xl bg-card p-6 text-center shadow-sm">
          <h1 className="text-[18px] font-semibold">Couldn&apos;t load this item</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">{loadError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 min-h-11 rounded-full bg-primary px-5 py-3 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!item) return null;

  if (isEditing) {
    return (
      <ItemEditMode
        item={item}
        fields={fields}
        categoryName={categoryName}
        onSave={handleEditSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const dateFields = fields.filter((f) => f.fieldType === 'date');
  const recordFields = fields.filter((f) => f.fieldType !== 'date');
  const primaryDateField = dateFields.find(
    (f) => f.fieldValue && earliestDeadline && new Date(f.fieldValue).getTime() === earliestDeadline.getTime()
  );
  const ringDays = daysUntilDeadline ?? WINDOW_DAYS;
  const ringColor = getStatusColor(displayStatus);
  const ringTint = getStatusTint(displayStatus);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-sm"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm"
            aria-label="Edit"
          >
            <Pencil size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setShowArchiveConfirm(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm"
            aria-label="Archive"
          >
            <Archive size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Dismissed banner */}
      {item.dismissedUntil && item.dismissedUntil > new Date() && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
          <BellOff size={16} className="shrink-0 text-muted-foreground" />
          <p className="flex-1 text-[13px] text-muted-foreground">
            Snoozed {item.dismissedUntil.getFullYear() >= 2099 ? 'until you act' : `until ${formatDate(item.dismissedUntil)}`}
          </p>
          <button
            type="button"
            onClick={async () => {
              await clearDismissal(item.id);
              loadData();
            }}
            className="min-h-9 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Remove
          </button>
        </div>
      )}

      {/* Hero */}
      <div
        className="mt-1 flex items-center gap-5 rounded-xl p-6"
        style={{ background: ringTint }}
      >
        <ProgressRing daysRemaining={ringDays} color={ringColor} trackColor={ringTint} innerColor={ringTint}>
          <span className="font-heading text-[34px] leading-none font-bold tracking-tight" style={{ color: ringColor }}>
            {daysUntilDeadline !== null ? Math.abs(daysUntilDeadline) : '—'}
          </span>
          <span className="text-[11px] font-bold" style={{ color: ringColor }}>
            {daysUntilDeadline !== null && daysUntilDeadline < 0 ? 'overdue' : 'days'}
          </span>
        </ProgressRing>
        <div className="min-w-0">
          <div
            className="flex items-center gap-1.5 text-[12px] font-bold tracking-wider uppercase"
            style={{ color: ringColor }}
          >
            <CategoryIcon icon={categoryIcon} size={14} />
            {categoryName}
          </div>
          <h1 className="mt-2 truncate font-heading text-[30px] leading-[1.02] font-bold tracking-tight">
            {item.title}
          </h1>
          {earliestDeadline && (
            <div className="mt-2 text-[13px] font-medium" style={{ color: ringColor }}>
              {primaryDateField?.label ?? 'Due'} due {formatDate(earliestDeadline)}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={() => setRenewDialogOpen(true)}
          className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-[15px] font-bold text-background transition-colors hover:opacity-90"
        >
          <Check size={18} strokeWidth={2.5} />
          Mark renewed
        </button>
        <button
          type="button"
          onClick={() => setDismissDialogOpen(true)}
          className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-card px-5 py-3 text-[15px] font-bold text-muted-foreground shadow-sm"
        >
          Snooze
        </button>
      </div>

      {/* Dates */}
      {dateFields.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-heading text-[19px] font-bold tracking-tight">Dates</h2>
          <div className="overflow-hidden rounded-lg bg-card px-4 shadow-sm">
            {dateFields.map((field) => (
              <FieldRenderer
                key={field.id}
                label={field.label}
                value={field.fieldValue}
                fieldType={field.fieldType}
                fieldKey={field.fieldKey}
                trailing={
                  <DateReminderButton
                    itemId={item.id}
                    fieldKey={field.fieldKey}
                    fieldLabel={field.label}
                    deadlineDate={field.fieldValue ? new Date(field.fieldValue) : null}
                  />
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Record */}
      {(recordFields.length > 0 || historyEntries.length > 0) && (
        <section className="mt-6">
          <h2 className="mb-2 font-heading text-[19px] font-bold tracking-tight">Record</h2>
          <div className="overflow-hidden rounded-lg bg-card px-4 shadow-sm">
            {recordFields.map((field) => (
              <FieldRenderer
                key={field.id}
                label={field.label}
                value={field.fieldValue}
                fieldType={field.fieldType}
                fieldKey={field.fieldKey}
              />
            ))}
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
            >
              <span className="text-[14px] text-muted-foreground">History</span>
              <span className="flex items-center gap-1.5 text-[14px] font-bold text-primary">
                {historyEntries.length} {historyEntries.length === 1 ? 'change' : 'changes'}
                {showHistory ? <ChevronUp size={15} /> : <ChevronRight size={15} />}
              </span>
            </button>
          </div>
          {showHistory && (
            <div className="mt-2">
              <HistoryTimeline entries={historyEntries} fields={fields} />
            </div>
          )}
        </section>
      )}

      {/* Last Updated */}
      <p className="mt-6 text-[13px] text-muted-foreground">
        Last updated {formatDate(item.updatedAt)}
      </p>

      {/* Archive Confirmation Dialog */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-[18px] font-semibold">Archive this item?</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">
              This item will be moved to your archive. You can find it later in Settings &gt; Archived Items.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="min-h-11 rounded-full px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                className="min-h-11 rounded-full bg-destructive px-5 py-3 text-[15px] font-bold text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark renewed / Snooze dialogs — shared with the dashboard's "Needs you" list */}
      <RenewDialog
        open={renewDialogOpen}
        onOpenChange={setRenewDialogOpen}
        item={toDashboardItem()}
        onConfirm={handleRenewConfirm}
      />
      <DismissDialog
        open={dismissDialogOpen}
        onOpenChange={setDismissDialogOpen}
        item={toDashboardItem()}
        onConfirm={handleDismissConfirm}
      />
    </div>
  );
}
