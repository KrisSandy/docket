'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Pencil, Archive, Clock, History, ChevronDown, ChevronUp, BellOff } from 'lucide-react';
import { useItems } from '@/hooks/use-items';
import { useItemFields } from '@/hooks/use-item-fields';
import { useReminders, type ReminderSummary } from '@/hooks/use-reminders';
import { useHistory } from '@/hooks/use-history';
import { BackButton } from '@/components/layout/back-button';
import { FieldRenderer } from '@/components/items/field-renderer';
import { StatusBadge } from '@/components/items/status-badge';
import { ItemEditMode } from '@/components/items/item-edit-mode';
import { HistoryTimeline } from '@/components/items/history-timeline';
import { db } from '@/db/database';
import type { Item, ItemField, HistoryEntry } from '@/db/schema';
import type { DisplayStatus } from '@/types';
import { daysUntilDate, getEarliestDeadline, formatDate } from '@/lib/dates';
import { calculateStatus } from '@/lib/status';

export default function ItemDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') ?? '';

  const { getItem, updateItem, clearDismissal } = useItems();
  const { getFieldsForItem } = useItemFields();
  const { getReminderSummary } = useReminders();
  const { getHistoryForItem } = useHistory();

  const [item, setItem] = useState<Item | null>(null);
  const [fields, setFields] = useState<ItemField[]>([]);
  const [reminderSummaries, setReminderSummaries] = useState<ReminderSummary[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [displayStatus, setDisplayStatus] = useState<DisplayStatus>('ok');
  const [isEditing, setIsEditing] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [itemData, fieldsData, reminders, history] = await Promise.all([
      getItem(id),
      getFieldsForItem(id),
      getReminderSummary(id),
      getHistoryForItem(id),
    ]);

    if (!itemData) {
      router.push('/dashboard');
      return;
    }

    // Look up category name for template field options
    const category = await db.categories.get(itemData.categoryId);
    setCategoryName(category?.name ?? '');

    setItem(itemData);
    setFields(fieldsData);
    setReminderSummaries(reminders);
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

    setIsLoading(false);
  }, [id, getItem, getFieldsForItem, getReminderSummary, getHistoryForItem, router]);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[15px] text-muted-foreground">Loading...</p>
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

  return (
    <div>
      <BackButton href="/dashboard" label="Dashboard" />

      {/* Header */}
      <div className="mt-4 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold tracking-tight truncate">
              {item.title}
            </h1>
            <StatusBadge status={displayStatus} />
          </div>
        </div>
      </div>

      {/* Dismissed banner */}
      {item.dismissedUntil && item.dismissedUntil > new Date() && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
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
            className="min-h-[36px] rounded-lg bg-primary/10 px-3 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Remove
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
        >
          <Pencil size={16} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setShowArchiveConfirm(true)}
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-border px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted"
        >
          <Archive size={16} />
          Archive
        </button>
      </div>

      {/* Fields */}
      <section className="mt-8">
        <h2 className="text-[18px] font-semibold mb-2">Details</h2>
        <div className="rounded-xl border border-border bg-card px-4">
          {fields.map((field) => (
            <FieldRenderer
              key={field.id}
              label={field.label}
              value={field.fieldValue}
              fieldType={field.fieldType}
            />
          ))}
        </div>
      </section>

      {/* Reminders Summary */}
      {reminderSummaries.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[18px] font-semibold mb-2 flex items-center gap-2">
            <Clock size={18} />
            Reminders
          </h2>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            {reminderSummaries.map((summary) => {
              const fieldLabel = fields.find(
                (f) => f.fieldKey === summary.fieldKey
              )?.label ?? summary.fieldKey;
              return (
                <p
                  key={summary.fieldKey}
                  className="text-[13px] text-muted-foreground py-1"
                >
                  {fieldLabel}: {summary.intervals.join(', ')} days before
                </p>
              );
            })}
          </div>
        </section>
      )}

      {/* Last Updated */}
      <p className="mt-6 text-[13px] text-muted-foreground">
        Last updated {formatDate(item.updatedAt)}
      </p>

      {/* History Section — Collapsible */}
      <section className="mt-6">
        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          className="flex min-h-[44px] w-full items-center gap-2 text-[18px] font-semibold transition-colors"
        >
          <History size={18} />
          History
          {showHistory ? <ChevronUp size={18} className="ml-auto text-muted-foreground" /> : <ChevronDown size={18} className="ml-auto text-muted-foreground" />}
        </button>
        {showHistory && (
          <div className="mt-2">
            <HistoryTimeline entries={historyEntries} fields={fields} />
          </div>
        )}
      </section>

      {/* Archive Confirmation Dialog */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-[18px] font-semibold">Archive this item?</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">
              This item will be moved to your archive. You can find it later in Settings &gt; Archived Items.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                className="min-h-[44px] rounded-xl bg-destructive px-5 py-3 text-[15px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
