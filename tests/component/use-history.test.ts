import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

/**
 * Regression tests for the item-detail "stuck on Loading..." bug.
 *
 * `getHistoryForItem` sorts rows by `changedAt.getTime()`. Historic data
 * (restored from a backup before the Date-rehydration fix landed) can
 * come back from IndexedDB with `changedAt` as an ISO string, not a Date.
 * Calling `.getTime()` on a string throws and crashes the whole item
 * detail screen — leaving the user stuck on the loading fallback.
 *
 * The hook must:
 *   1. Never throw, even when rows have string `changedAt`.
 *   2. Still sort newest-first.
 *   3. Return rows with `changedAt` as real Date instances downstream.
 */

// ─── Mock Dexie ───────────────────────────────────────────────────────────────

const toArrayMock = vi.fn();

vi.mock('@/db/database', () => ({
  db: {
    history: {
      where: () => ({
        equals: () => ({
          toArray: toArrayMock,
        }),
      }),
    },
  },
}));

import { useHistory } from '@/hooks/use-history';

describe('useHistory.getHistoryForItem', () => {
  beforeEach(() => {
    toArrayMock.mockReset();
  });

  it('does not throw when rows have string changedAt (the exact bug)', async () => {
    // This is the shape that used to crash: changedAt persisted as an
    // ISO string instead of a Date instance.
    toArrayMock.mockResolvedValue([
      {
        id: 'h1',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: null,
        newValue: '2026-06-01',
        changeType: 'edit',
        changedAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'h2',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: '2026-06-01',
        newValue: '2026-06-15',
        changeType: 'renewal',
        changedAt: '2026-02-10T00:00:00.000Z',
      },
    ]);

    const { result } = renderHook(() => useHistory());

    // The bug manifested as "b.changedAt.getTime is not a function" during
    // the sort. This MUST NOT throw.
    await expect(result.current.getHistoryForItem('item-1')).resolves.toBeDefined();
  });

  it('returns entries sorted newest first even when changedAt is a string', async () => {
    toArrayMock.mockResolvedValue([
      {
        id: 'older',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: null,
        newValue: 'a',
        changeType: 'edit',
        changedAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'newer',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: 'a',
        newValue: 'b',
        changeType: 'edit',
        changedAt: '2026-03-10T00:00:00.000Z',
      },
      {
        id: 'middle',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: 'b',
        newValue: 'c',
        changeType: 'edit',
        changedAt: '2026-02-10T00:00:00.000Z',
      },
    ]);

    const { result } = renderHook(() => useHistory());
    const entries = await result.current.getHistoryForItem('item-1');

    expect(entries.map((e) => e.id)).toEqual(['newer', 'middle', 'older']);
  });

  it('normalises every returned row so changedAt is a Date instance', async () => {
    toArrayMock.mockResolvedValue([
      {
        id: 'h1',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: null,
        newValue: '2026-06-01',
        changeType: 'edit',
        changedAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'h2',
        itemId: 'item-1',
        fieldKey: 'nct_date',
        oldValue: '2026-06-01',
        newValue: '2026-06-15',
        changeType: 'renewal',
        changedAt: new Date('2026-02-10T00:00:00.000Z'),
      },
    ]);

    const { result } = renderHook(() => useHistory());
    const entries = await result.current.getHistoryForItem('item-1');

    for (const entry of entries) {
      expect(entry.changedAt).toBeInstanceOf(Date);
    }
    // Preserves the underlying timestamp.
    const h1 = entries.find((e) => e.id === 'h1')!;
    expect(h1.changedAt.toISOString()).toBe('2026-01-10T00:00:00.000Z');
  });

  it('handles mixed Date/string rows without dropping any entry', async () => {
    toArrayMock.mockResolvedValue([
      {
        id: 'str',
        itemId: 'item-1',
        fieldKey: 'x',
        oldValue: null,
        newValue: 'a',
        changeType: 'edit',
        changedAt: '2026-01-10T00:00:00.000Z',
      },
      {
        id: 'date',
        itemId: 'item-1',
        fieldKey: 'x',
        oldValue: 'a',
        newValue: 'b',
        changeType: 'edit',
        changedAt: new Date('2026-02-10T00:00:00.000Z'),
      },
    ]);

    const { result } = renderHook(() => useHistory());
    const entries = await result.current.getHistoryForItem('item-1');

    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe('date'); // Feb is newer than Jan
    expect(entries[1].id).toBe('str');
  });

  it('returns an empty array when the item has no history', async () => {
    toArrayMock.mockResolvedValue([]);

    const { result } = renderHook(() => useHistory());
    const entries = await result.current.getHistoryForItem('item-1');

    expect(entries).toEqual([]);
  });
});
