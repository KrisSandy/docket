import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateStatus } from '@/lib/status';
import { getEarliestDeadline, daysUntilDate } from '@/lib/dates';
import { formatEUR } from '@/lib/currency';

describe('Data Edge Cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('item with no date fields', () => {
    it('returns null for earliest deadline with empty array', () => {
      expect(getEarliestDeadline([])).toBeNull();
    });

    it('calculates status as "ok" when no deadline', () => {
      expect(calculateStatus(null)).toBe('ok');
    });
  });

  describe('item with multiple date fields', () => {
    it('picks the earliest deadline from multiple dates', () => {
      const dates = ['2026-12-01', '2026-07-01', '2026-09-15'];
      const earliest = getEarliestDeadline(dates);
      expect(earliest).toEqual(new Date('2026-07-01'));
    });

    it('ignores null/empty dates in the mix', () => {
      const dates = [null, '', '2026-08-01', null, '2026-07-01'];
      const earliest = getEarliestDeadline(dates);
      expect(earliest).toEqual(new Date('2026-07-01'));
    });
  });

  describe('date field set to today', () => {
    it('returns 0 for daysUntilDate when date is today', () => {
      const today = new Date('2026-06-15');
      expect(daysUntilDate(today)).toBe(0);
    });

    it('calculates status as "urgent" for today (0 days)', () => {
      expect(calculateStatus(0)).toBe('urgent');
    });
  });

  describe('empty field values', () => {
    it('getEarliestDeadline handles all null values', () => {
      expect(getEarliestDeadline([null, null, null])).toBeNull();
    });

    it('getEarliestDeadline handles all empty string values', () => {
      expect(getEarliestDeadline(['', '', ''])).toBeNull();
    });

    it('getEarliestDeadline handles invalid date strings', () => {
      expect(getEarliestDeadline(['not-a-date', 'abc'])).toBeNull();
    });
  });

  describe('very long field values', () => {
    it('formatEUR handles large numbers', () => {
      expect(formatEUR(1234567.89)).toBe('€1,234,567.89');
    });

    it('formatEUR handles zero', () => {
      expect(formatEUR(0)).toBe('€0.00');
    });

    it('formatEUR handles negative values', () => {
      expect(formatEUR(-50)).toBe('-€50.00');
    });
  });

  describe('special characters in field values', () => {
    it('getEarliestDeadline ignores invalid special char dates', () => {
      expect(getEarliestDeadline(['<script>alert(1)</script>'])).toBeNull();
    });
  });
});
