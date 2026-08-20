import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  HAS_SEEN_MARKETING_KEY,
  hasSeenMarketing,
  isNativePlatform,
  markMarketingSeen,
  clearMarketingSeen,
} from '@/lib/first-launch';

describe('first-launch helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Ensure no Capacitor global by default
    delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  });

  afterEach(() => {
    window.localStorage.clear();
    delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  });

  describe('HAS_SEEN_MARKETING_KEY', () => {
    it('uses the expected localStorage key', () => {
      expect(HAS_SEEN_MARKETING_KEY).toBe('hd_has_seen_marketing');
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
    it('returns false when the flag has never been written', () => {
      expect(hasSeenMarketing()).toBe(false);
    });

    it('returns true when the stored value is exactly "true"', () => {
      window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, 'true');
      expect(hasSeenMarketing()).toBe(true);
    });

    it('returns false for any other stored value', () => {
      window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, 'false');
      expect(hasSeenMarketing()).toBe(false);

      window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, '1');
      expect(hasSeenMarketing()).toBe(false);

      window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, '');
      expect(hasSeenMarketing()).toBe(false);
    });

    it('is synchronous — reads without awaiting anything', () => {
      window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, 'true');
      const result = hasSeenMarketing();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('markMarketingSeen', () => {
    it('writes the flag with value "true"', () => {
      markMarketingSeen();
      expect(window.localStorage.getItem(HAS_SEEN_MARKETING_KEY)).toBe('true');
    });

    it('makes hasSeenMarketing return true afterwards', () => {
      expect(hasSeenMarketing()).toBe(false);
      markMarketingSeen();
      expect(hasSeenMarketing()).toBe(true);
    });
  });

  describe('clearMarketingSeen', () => {
    it('removes the flag so hasSeenMarketing returns false again', () => {
      markMarketingSeen();
      expect(hasSeenMarketing()).toBe(true);

      clearMarketingSeen();
      expect(hasSeenMarketing()).toBe(false);
    });

    it('is safe to call when the flag was never set', () => {
      expect(() => clearMarketingSeen()).not.toThrow();
      expect(hasSeenMarketing()).toBe(false);
    });
  });
});
