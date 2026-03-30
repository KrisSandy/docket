import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { format } from 'date-fns';
import {
  hashToInt,
  buildNotificationId,
  calculateTriggerDate,
  isTriggerToday,
  buildNotificationExtra,
  NOTIFICATION_TITLE,
  NOTIFICATION_BODY,
} from '@/lib/notifications';

/** Helper: format date as YYYY-MM-DD in local time */
function toLocalDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

describe('notifications', () => {
  describe('hashToInt', () => {
    it('returns a positive integer for any string', () => {
      const result = hashToInt('test-reminder-id');
      expect(result).toBeGreaterThan(0);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('returns the same value for the same input (deterministic)', () => {
      const a = hashToInt('reminder-abc-123');
      const b = hashToInt('reminder-abc-123');
      expect(a).toBe(b);
    });

    it('returns different values for different inputs', () => {
      const a = hashToInt('reminder-1');
      const b = hashToInt('reminder-2');
      expect(a).not.toBe(b);
    });

    it('handles empty string (returns 1 as fallback)', () => {
      const result = hashToInt('');
      expect(result).toBe(1);
    });

    it('handles very long strings without error', () => {
      const longString = 'a'.repeat(10000);
      const result = hashToInt(longString);
      expect(result).toBeGreaterThan(0);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('buildNotificationId', () => {
    it('returns a positive integer from reminder ID', () => {
      const id = buildNotificationId('rem-123');
      expect(id).toBeGreaterThan(0);
      expect(Number.isInteger(id)).toBe(true);
    });

    it('is deterministic', () => {
      const a = buildNotificationId('rem-456');
      const b = buildNotificationId('rem-456');
      expect(a).toBe(b);
    });
  });

  describe('calculateTriggerDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-30T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns correct trigger date for future deadline', () => {
      const deadline = new Date('2026-05-01T00:00:00');
      const result = calculateTriggerDate(deadline, 7);
      expect(result).not.toBeNull();
      // May 1 minus 7 days = April 24
      expect(toLocalDate(result!)).toBe('2026-04-24');
    });

    it('returns correct trigger date for 30 days before', () => {
      const deadline = new Date('2026-06-15T00:00:00');
      const result = calculateTriggerDate(deadline, 30);
      expect(result).not.toBeNull();
      // June 15 minus 30 days = May 16
      expect(toLocalDate(result!)).toBe('2026-05-16');
    });

    it('returns correct trigger date for 60 days before', () => {
      const deadline = new Date('2026-06-15T00:00:00');
      const result = calculateTriggerDate(deadline, 60);
      expect(result).not.toBeNull();
      // June 15 minus 60 days = April 16
      expect(toLocalDate(result!)).toBe('2026-04-16');
    });

    it('returns null when trigger date is in the past', () => {
      const deadline = new Date('2026-04-01T00:00:00'); // 2 days away
      const result = calculateTriggerDate(deadline, 30); // 30 days before = March 2, in the past
      expect(result).toBeNull();
    });

    it('returns trigger date when trigger date is today', () => {
      const deadline = new Date('2026-04-06T00:00:00'); // 7 days away
      const result = calculateTriggerDate(deadline, 7); // 7 days before = March 30 = today
      expect(result).not.toBeNull();
      expect(toLocalDate(result!)).toBe('2026-03-30');
    });

    it('returns null for past deadlines', () => {
      const deadline = new Date('2026-01-15T00:00:00'); // Past
      const result = calculateTriggerDate(deadline, 7);
      expect(result).toBeNull();
    });

    it('handles daysBefore of 0 (trigger on deadline day)', () => {
      const deadline = new Date('2026-04-15T00:00:00'); // Future
      const result = calculateTriggerDate(deadline, 0);
      expect(result).not.toBeNull();
      expect(toLocalDate(result!)).toBe('2026-04-15');
    });

    it('handles daysBefore of 1 (trigger day before)', () => {
      const deadline = new Date('2026-03-31T00:00:00'); // Tomorrow
      const result = calculateTriggerDate(deadline, 1);
      expect(result).not.toBeNull();
      // March 31 minus 1 = March 30 = today
      expect(toLocalDate(result!)).toBe('2026-03-30');
    });
  });

  describe('isTriggerToday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-30T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true for today', () => {
      expect(isTriggerToday(new Date('2026-03-30T00:00:00'))).toBe(true);
    });

    it('returns true for today at any time', () => {
      expect(isTriggerToday(new Date('2026-03-30T23:59:59'))).toBe(true);
    });

    it('returns false for tomorrow', () => {
      expect(isTriggerToday(new Date('2026-03-31T00:00:00'))).toBe(false);
    });

    it('returns false for yesterday', () => {
      expect(isTriggerToday(new Date('2026-03-29T00:00:00'))).toBe(false);
    });
  });

  describe('buildNotificationExtra', () => {
    it('includes itemId and reminderId', () => {
      const extra = buildNotificationExtra('item-1', 'rem-1');
      expect(extra).toEqual({
        itemId: 'item-1',
        reminderId: 'rem-1',
      });
    });
  });

  describe('notification content safety', () => {
    it('title is generic and contains no PII', () => {
      expect(NOTIFICATION_TITLE).toBe('HomeDocket Reminder');
      // Must not contain any variable content
      expect(NOTIFICATION_TITLE).not.toMatch(/\$/);
      expect(NOTIFICATION_TITLE).not.toMatch(/\{/);
    });

    it('body is generic and contains no PII', () => {
      expect(NOTIFICATION_BODY).toBe('You have an upcoming deadline. Tap to review.');
      // Must not contain any variable content
      expect(NOTIFICATION_BODY).not.toMatch(/\$/);
      expect(NOTIFICATION_BODY).not.toMatch(/\{/);
    });

    it('notification content does not include provider names, amounts, or dates', () => {
      const content = `${NOTIFICATION_TITLE} ${NOTIFICATION_BODY}`;
      // Should not contain currency symbols
      expect(content).not.toMatch(/[€£$]/);
      // Should not contain specific dates
      expect(content).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
      expect(content).not.toMatch(/\d{4}-\d{2}-\d{2}/);
      // Should not contain common provider names
      expect(content.toLowerCase()).not.toMatch(/aviva|axa|zurich|bord gais|electric ireland/);
    });
  });
});
