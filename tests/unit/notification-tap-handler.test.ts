import { describe, it, expect } from 'vitest';
import { extractItemIdFromExtra } from '@/lib/notification-tap-handler';

describe('notification-tap-handler', () => {
  describe('extractItemIdFromExtra', () => {
    it('extracts itemId from valid extra data', () => {
      const result = extractItemIdFromExtra({ itemId: 'item-123', reminderId: 'rem-456' });
      expect(result).toBe('item-123');
    });

    it('returns null for undefined extra', () => {
      expect(extractItemIdFromExtra(undefined)).toBeNull();
    });

    it('returns null for empty extra', () => {
      expect(extractItemIdFromExtra({})).toBeNull();
    });

    it('returns null for non-string itemId', () => {
      expect(extractItemIdFromExtra({ itemId: 123 })).toBeNull();
    });

    it('returns null for empty string itemId', () => {
      expect(extractItemIdFromExtra({ itemId: '' })).toBeNull();
    });

    it('returns null for null itemId', () => {
      expect(extractItemIdFromExtra({ itemId: null })).toBeNull();
    });
  });
});
