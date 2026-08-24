import { describe, it, expect } from 'vitest';
import { calculateStatus, getStatusPriority, getStatusColor, getStatusFontWeight, getStatusTint } from '@/lib/status';

describe('calculateStatus', () => {
  it('returns ok for null (no deadline)', () => {
    expect(calculateStatus(null)).toBe('ok');
  });

  it('returns ok for > 30 days', () => {
    expect(calculateStatus(31)).toBe('ok');
    expect(calculateStatus(100)).toBe('ok');
  });

  it('returns warning for ≤ 30 days', () => {
    expect(calculateStatus(30)).toBe('warning');
    expect(calculateStatus(15)).toBe('warning');
    expect(calculateStatus(8)).toBe('warning');
  });

  it('returns urgent for ≤ 7 days', () => {
    expect(calculateStatus(7)).toBe('urgent');
    expect(calculateStatus(1)).toBe('urgent');
    expect(calculateStatus(0)).toBe('urgent');
  });

  it('returns expired for < 0 days', () => {
    expect(calculateStatus(-1)).toBe('expired');
    expect(calculateStatus(-100)).toBe('expired');
  });
});

describe('getStatusPriority', () => {
  it('expired has highest priority (0)', () => {
    expect(getStatusPriority('expired')).toBe(0);
  });

  it('urgent has second priority (1)', () => {
    expect(getStatusPriority('urgent')).toBe(1);
  });

  it('warning has third priority (2)', () => {
    expect(getStatusPriority('warning')).toBe(2);
  });

  it('ok has lowest priority (3)', () => {
    expect(getStatusPriority('ok')).toBe(3);
  });

  it('sorts correctly', () => {
    const statuses = ['ok', 'expired', 'warning', 'urgent'] as const;
    const sorted = [...statuses].sort((a, b) => getStatusPriority(a) - getStatusPriority(b));
    expect(sorted).toEqual(['expired', 'urgent', 'warning', 'ok']);
  });
});

describe('getStatusColor', () => {
  it('returns correct CSS variables', () => {
    expect(getStatusColor('ok')).toBe('var(--status-ok)');
    expect(getStatusColor('warning')).toBe('var(--status-warning)');
    expect(getStatusColor('urgent')).toBe('var(--status-urgent)');
    expect(getStatusColor('expired')).toBe('var(--status-expired)');
  });
});

describe('getStatusFontWeight', () => {
  it('returns font-semibold for urgent and expired', () => {
    expect(getStatusFontWeight('urgent')).toBe('font-semibold');
    expect(getStatusFontWeight('expired')).toBe('font-semibold');
  });

  it('returns font-normal for ok and warning', () => {
    expect(getStatusFontWeight('ok')).toBe('font-normal');
    expect(getStatusFontWeight('warning')).toBe('font-normal');
  });
});

describe('getStatusTint', () => {
  it('falls back to the neutral muted surface for ok', () => {
    expect(getStatusTint('ok')).toBe('var(--muted)');
  });

  it('returns the shared warning/urgent tint for both tiers', () => {
    expect(getStatusTint('warning')).toBe('var(--status-warning-tint)');
    expect(getStatusTint('urgent')).toBe('var(--status-urgent-tint)');
  });

  it('returns a distinct tint for expired', () => {
    expect(getStatusTint('expired')).toBe('var(--status-expired-tint)');
  });
});
