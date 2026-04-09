import { useCallback, useMemo } from 'react';
import { db } from '@/db/database';
import type { HistoryEntry } from '@/db/schema';

/**
 * Coerce a value that should be a Date into a Date.
 *
 * Historic rows can come back from IndexedDB with `changedAt` as a string
 * (observed on devices that restored a backup before the restore path was
 * rehydrating Date fields — see use-backup.ts). Calling `.getTime()` on a
 * string throws "b.changedAt.getTime is not a function" and crashes the
 * item detail screen, leaving it stuck on "Loading...".
 *
 * We defensively normalise here so the sort comparator is crash-proof
 * regardless of how the row was persisted.
 */
function toDate(value: Date | string | number | null | undefined): Date {
  if (value instanceof Date) return value;
  if (value == null) return new Date(0);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

export function useHistory() {
  const getHistoryForItem = useCallback(async (itemId: string): Promise<HistoryEntry[]> => {
    const entries = await db.history.where('itemId').equals(itemId).toArray();
    // Normalise `changedAt` to Date objects in-place so every consumer
    // downstream (sort, timeline render, formatters) can rely on the type.
    const normalised = entries.map((entry) => ({
      ...entry,
      changedAt: toDate(entry.changedAt as unknown as Date | string),
    }));
    return normalised.sort(
      (a, b) => b.changedAt.getTime() - a.changedAt.getTime()
    );
  }, []);

  return useMemo(() => ({
    getHistoryForItem,
  }), [getHistoryForItem]);
}
