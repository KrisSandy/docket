import { describe, it, expect } from 'vitest';
import {
  CUSTOM_OFFSET_OPTIONS,
  formatOffsetsSummary,
} from '@/constants/reminder-presets';

describe('reminder-presets', () => {
  describe('CUSTOM_OFFSET_OPTIONS', () => {
    it('is sorted descending', () => {
      for (let i = 1; i < CUSTOM_OFFSET_OPTIONS.length; i++) {
        expect(CUSTOM_OFFSET_OPTIONS[i]).toBeLessThan(CUSTOM_OFFSET_OPTIONS[i - 1]);
      }
    });

    it('includes the common values', () => {
      expect(CUSTOM_OFFSET_OPTIONS).toContain(30);
      expect(CUSTOM_OFFSET_OPTIONS).toContain(7);
      expect(CUSTOM_OFFSET_OPTIONS).toContain(1);
    });
  });

  describe('formatOffsetsSummary', () => {
    it('formats empty array', () => {
      expect(formatOffsetsSummary([])).toBe('No reminders');
    });

    it('formats single offset', () => {
      expect(formatOffsetsSummary([1])).toBe('1 day before');
    });

    it('formats two offsets', () => {
      expect(formatOffsetsSummary([7, 1])).toBe('7 days and 1 day before');
    });

    it('formats three offsets', () => {
      expect(formatOffsetsSummary([30, 7, 1])).toBe('30 days, 7 days, and 1 day before');
    });

    it('formats five offsets', () => {
      expect(formatOffsetsSummary([60, 30, 14, 7, 1])).toBe(
        '60 days, 30 days, 14 days, 7 days, and 1 day before'
      );
    });

    it('sorts before formatting', () => {
      expect(formatOffsetsSummary([1, 30, 7])).toBe('30 days, 7 days, and 1 day before');
    });

    it('handles singular "day" for 1', () => {
      expect(formatOffsetsSummary([1])).toContain('1 day');
      expect(formatOffsetsSummary([1])).not.toContain('1 days');
    });

    it('handles plural "days" for > 1', () => {
      expect(formatOffsetsSummary([7])).toContain('7 days');
    });
  });
});
