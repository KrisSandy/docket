import { describe, it, expect, vi, afterEach } from 'vitest';
import { daysUntilDate, formatCountdown, formatDate, isExpired, getEarliestDeadline } from '@/lib/dates';

describe('daysUntilDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns positive number for future date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30'));
    expect(daysUntilDate(new Date('2026-04-30'))).toBe(31);
    vi.useRealTimers();
  });

  it('returns negative number for past date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30'));
    expect(daysUntilDate(new Date('2026-03-25'))).toBe(-5);
    vi.useRealTimers();
  });

  it('returns 0 for today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30'));
    expect(daysUntilDate(new Date('2026-03-30'))).toBe(0);
    vi.useRealTimers();
  });

  it('handles DST transition correctly (spring forward)', () => {
    vi.useFakeTimers();
    // March 29 2026 is DST change in Ireland (clocks go forward)
    vi.setSystemTime(new Date('2026-03-28'));
    expect(daysUntilDate(new Date('2026-03-31'))).toBe(3);
    vi.useRealTimers();
  });

  it('handles year boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-30'));
    expect(daysUntilDate(new Date('2027-01-02'))).toBe(3);
    vi.useRealTimers();
  });
});

describe('formatCountdown', () => {
  it('formats positive days', () => {
    expect(formatCountdown(34)).toBe('in 34 days');
  });

  it('formats single day', () => {
    expect(formatCountdown(1)).toBe('in 1 day');
  });

  it('formats today', () => {
    expect(formatCountdown(0)).toBe('Today');
  });

  it('formats single day ago', () => {
    expect(formatCountdown(-1)).toBe('overdue by 1 day');
  });

  it('formats multiple days ago', () => {
    expect(formatCountdown(-5)).toBe('overdue by 5 days');
  });
});

describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate(new Date('2026-06-12'))).toBe('12 Jun 2026');
  });

  it('formats date with single-digit day', () => {
    expect(formatDate(new Date('2026-01-05'))).toBe('5 Jan 2026');
  });
});

describe('isExpired', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for past date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30'));
    expect(isExpired(new Date('2026-03-29'))).toBe(true);
    vi.useRealTimers();
  });

  it('returns false for future date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30'));
    expect(isExpired(new Date('2026-04-01'))).toBe(false);
    vi.useRealTimers();
  });

  it('returns false for today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-30'));
    expect(isExpired(new Date('2026-03-30'))).toBe(false);
    vi.useRealTimers();
  });
});

describe('getEarliestDeadline', () => {
  it('returns earliest date from array', () => {
    const result = getEarliestDeadline(['2026-06-15', '2026-04-10', '2026-08-01']);
    expect(result?.toISOString()).toContain('2026-04-10');
  });

  it('returns null for empty array', () => {
    expect(getEarliestDeadline([])).toBeNull();
  });

  it('skips null values', () => {
    const result = getEarliestDeadline([null, '2026-06-15', null]);
    expect(result?.toISOString()).toContain('2026-06-15');
  });

  it('skips empty strings', () => {
    const result = getEarliestDeadline(['', '2026-06-15', '']);
    expect(result?.toISOString()).toContain('2026-06-15');
  });

  it('returns null for all null/empty values', () => {
    expect(getEarliestDeadline([null, '', null])).toBeNull();
  });
});
