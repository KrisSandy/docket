'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArchiveRestore, Trash2, AlertTriangle } from 'lucide-react';
import { useItems } from '@/hooks/use-items';
import { useHistory } from '@/hooks/use-history';
import { useItemFields } from '@/hooks/use-item-fields';
import { BackButton } from '@/components/layout/back-button';
import { EmptyState } from '@/components/ui/empty-state';
import { HistoryTimeline } from '@/components/items/history-timeline';
import { StatusDot } from '@/components/ui/status-dot';
import type { Item, ItemField, HistoryEntry } from '@/db/schema';
import { formatDate } from '@/lib/dates';
import { ARCHIVE_RETENTION_YEARS } from '@/constants/defaults';

function isOlderThanRetention(item: Item): boolean {
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() - ARCHIVE_RETENTION_YEARS);
  return item.updatedAt < retentionDate;
}

function HistoryContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get('itemId');

  const { listItems, updateItem, deleteItem } = useItems();
  const { getHistoryForItem } = useHistory();
  const { getFieldsForItem } = useItemFields();

  const [archivedItems, setArchivedItems] = useState<Item[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [historyFields, setHistoryFields] = useState<ItemField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (itemId) {
      const [entries, fields] = await Promise.all([
        getHistoryForItem(itemId),
        getFieldsForItem(itemId),
      ]);
      setHistoryEntries(entries);
      setHistoryFields(fields);
    } else {
      const items = await listItems({ status: 'archived' });
      setArchivedItems(items);
    }
    setIsLoading(false);
  }, [itemId, listItems, getHistoryForItem, getFieldsForItem]);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const handleUnarchive = async (id: string) => {
    await updateItem(id, { status: 'active' });
    setArchivedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handlePermanentDelete = async (id: string) => {
    await deleteItem(id);
    setArchivedItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirmId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[15px] text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Item History View
  if (itemId) {
    return (
      <div>
        <BackButton />
        <h1 className="mt-4 text-[28px] font-bold tracking-tight">
          Change History
        </h1>
        <div className="mt-6">
          <HistoryTimeline entries={historyEntries} fields={historyFields} />
        </div>
      </div>
    );
  }

  // Archived Items View
  const hasOldItems = archivedItems.some(isOlderThanRetention);

  return (
    <div>
      <BackButton href="/settings" label="Settings" />

      <h1 className="mt-4 text-[28px] font-bold tracking-tight">
        Archived Items
      </h1>

      {hasOldItems && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--status-warning)]/30 bg-[var(--status-warning)]/5 px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--status-warning)]" />
          <p className="text-[13px] text-muted-foreground">
            Items archived over {ARCHIVE_RETENTION_YEARS} years are flagged for cleanup.
          </p>
        </div>
      )}

      {archivedItems.length === 0 ? (
        <EmptyState message="No archived items." />
      ) : (
        <div className="mt-6 space-y-2">
          {archivedItems.map((item) => {
            const isOld = isOlderThanRetention(item);

            return (
              <div
                key={item.id}
                className={`rounded-xl border bg-card px-4 py-3 ${
                  isOld ? 'border-[var(--status-warning)]/40' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <StatusDot status={isOld ? 'warning' : 'ok'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold truncate">{item.title}</p>
                    <p className="text-[13px] text-muted-foreground">
                      Archived {formatDate(item.updatedAt)}
                      {isOld && (
                        <span className="ml-2 text-[var(--status-warning)]">
                          (over {ARCHIVE_RETENTION_YEARS} years)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUnarchive(item.id)}
                    className="flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <ArchiveRestore size={16} />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-[18px] font-semibold text-destructive">Permanently delete?</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">
              This will permanently delete this item and all its history. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handlePermanentDelete(deleteConfirmId)}
                className="min-h-[44px] rounded-xl bg-destructive px-5 py-3 text-[15px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <p className="text-[15px] text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
