import { describe, it, expect } from 'vitest';
import { calculateStatus } from '@/lib/status';

describe('calculateStatus with dismissals (dashboard-level logic)', () => {
  // Note: dismissal logic lives in useDashboard, not calculateStatus itself.
  // These tests verify the pure status calculation still works correctly,
  // ensuring dismissed items can be overridden to 'ok' at the dashboard layer.

  it('returns ok for null (no deadline) — baseline', () => {
    expect(calculateStatus(null)).toBe('ok');
  });

  it('returns expired for overdue items', () => {
    expect(calculateStatus(-5)).toBe('expired');
  });

  it('returns urgent for items due within 7 days', () => {
    expect(calculateStatus(3)).toBe('urgent');
  });

  it('returns warning for items due within 30 days', () => {
    expect(calculateStatus(20)).toBe('warning');
  });

  it('returns ok for items > 30 days out', () => {
    expect(calculateStatus(60)).toBe('ok');
  });
});

describe('dismissal date logic (used in useDashboard)', () => {
  function isDismissed(dismissedUntil: Date | null): boolean {
    return dismissedUntil !== null && dismissedUntil > new Date();
  }

  it('not dismissed when null', () => {
    expect(isDismissed(null)).toBe(false);
  });

  it('dismissed when date is in the future', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(isDismissed(future)).toBe(true);
  });

  it('not dismissed when date is in the past', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(isDismissed(past)).toBe(false);
  });

  it('dismissed when far-future date (indefinite)', () => {
    expect(isDismissed(new Date('2099-12-31'))).toBe(true);
  });
});
