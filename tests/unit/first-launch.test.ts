import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockGet, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPut: vi.fn(),
}));

vi.mock('@/db/database', () => ({
  db: {
    settings: {
      get: mockGet,
      put: mockPut,
    },
  },
}));

import {
  HAS_SEEN_MARKETING_KEY,
  hasSeenMarketing,
  isNativePlatform,
  markMarketingSeen,
} from '@/lib/first-launch';

describe('first-launch helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure no Capacitor global by default
    delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  });

  afterEach(() => {
    delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  });

  describe('HAS_SEEN_MARKETING_KEY', () => {
    it('uses the expected settings key', () => {
      expect(HAS_SEEN_MARKETING_KEY).toBe('has_seen_marketing');
    });
  });

  describe('isNativePlatform', () => {
    it('returns false when no Capacitor global exists', () => {
      expect(isNativePlatform()).toBe(false);
    });

    it('returns false when Capacitor exists but isNativePlatform is missing', () => {
      (window as unknown as { Capacitor: unknown }).Capacitor = {};
      expect(isNativePlatform()).toBe(false);
    });

    it('returns false when Capacitor.isNativePlatform() returns false', () => {
      (window as unknown as { Capacitor: unknown }).Capacitor = {
        isNativePlatform: () => false,
      };
      expect(isNativePlatform()).toBe(false);
    });

    it('returns true when Capacitor.isNativePlatform() returns true', () => {
      (window as unknown as { Capacitor: unknown }).Capacitor = {
        isNativePlatform: () => true,
      };
      expect(isNativePlatform()).toBe(true);
    });
  });

  describe('hasSeenMarketing', () => {
    it('returns false when the setting has never been written', async () => {
      mockGet.mockResolvedValue(undefined);
      await expect(hasSeenMarketing()).resolves.toBe(false);
      expect(mockGet).toHaveBeenCalledWith('has_seen_marketing');
    });

    it('returns true when the stored value is exactly "true"', async () => {
      mockGet.mockResolvedValue({ key: 'has_seen_marketing', value: 'true' });
      await expect(hasSeenMarketing()).resolves.toBe(true);
    });

    it('returns false for any other stored value', async () => {
      mockGet.mockResolvedValue({ key: 'has_seen_marketing', value: 'false' });
      await expect(hasSeenMarketing()).resolves.toBe(false);

      mockGet.mockResolvedValue({ key: 'has_seen_marketing', value: '1' });
      await expect(hasSeenMarketing()).resolves.toBe(false);

      mockGet.mockResolvedValue({ key: 'has_seen_marketing', value: '' });
      await expect(hasSeenMarketing()).resolves.toBe(false);
    });

    it('swallows DB errors and returns false (fail-open to marketing)', async () => {
      mockGet.mockRejectedValue(new Error('db exploded'));
      await expect(hasSeenMarketing()).resolves.toBe(false);
    });
  });

  describe('markMarketingSeen', () => {
    it('writes the flag with value "true"', async () => {
      mockPut.mockResolvedValue(undefined);
      await markMarketingSeen();
      expect(mockPut).toHaveBeenCalledWith({
        key: 'has_seen_marketing',
        value: 'true',
      });
    });

    it('resolves even if the DB write fails (best-effort)', async () => {
      mockPut.mockRejectedValue(new Error('quota exceeded'));
      await expect(markMarketingSeen()).resolves.toBeUndefined();
    });
  });
});
