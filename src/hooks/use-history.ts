import { useCallback, useMemo } from 'react';
import { db } from '@/db/database';
import type { HistoryEntry } from '@/db/schema';

export function useHistory() {
  const getHistoryForItem = useCallback(async (itemId: string): Promise<HistoryEntry[]> => {
    const entries = await db.history.where('itemId').equals(itemId).toArray();
    return entries.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
  }, []);

  return useMemo(() => ({
    getHistoryForItem,
  }), [getHistoryForItem]);
}
