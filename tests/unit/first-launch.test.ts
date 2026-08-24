import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HAS_SEEN_MARKETING_KEY,
  hasSeenMarketing,
  isNativePlatform,
  isCapacitorOrigin,
  markMarketingSeen,
  clearMarketingSeen,
  getMarketingRedirectScript,
  getServiceWorkerCleanupScript,
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

  describe('isCapacitorOrigin', () => {
    const originalLocation = window.location;

    function setLocation(hostname: string, protocol: string) {
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, hostname, protocol },
        configurable: true,
        writable: true,
      });
    }

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      });
    });

    // Regression coverage: isCapacitorOrigin exists specifically because
    // isNativePlatform() (which reads window.Capacitor) lost a real race
    // against Capacitor's native bridge attaching, letting a service worker
    // register on-device and get the app stuck in a reload loop. This check
    // must never depend on window.Capacitor.

    it('returns true for the Android Capacitor origin (https://localhost)', () => {
      setLocation('localhost', 'https:');
      expect(isCapacitorOrigin()).toBe(true);
    });

    it('returns true for the default iOS Capacitor origin (capacitor://localhost)', () => {
      setLocation('localhost', 'capacitor:');
      expect(isCapacitorOrigin()).toBe(true);
    });

    it('returns false for the Next.js dev server (http://localhost:PORT)', () => {
      setLocation('localhost', 'http:');
      expect(isCapacitorOrigin()).toBe(false);
    });

    it('returns false for the deployed web app on a real domain', () => {
      setLocation('homedocket.app', 'https:');
      expect(isCapacitorOrigin()).toBe(false);
    });

    it('does not depend on window.Capacitor at all', () => {
      setLocation('localhost', 'https:');
      delete (window as unknown as { Capacitor?: unknown }).Capacitor;
      expect(isCapacitorOrigin()).toBe(true);

      (window as unknown as { Capacitor: unknown }).Capacitor = {
        isNativePlatform: () => false,
      };
      expect(isCapacitorOrigin()).toBe(true);
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

  describe('getMarketingRedirectScript', () => {
    // The returned string is embedded as a raw inline <script>, so its
    // real behaviour can only be verified by actually executing it — a
    // pure string-content assertion would miss logic bugs entirely.
    function runScript() {
      new Function(getMarketingRedirectScript())();
    }

    const originalLocation = window.location;
    let replaceSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      replaceSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, replace: replaceSpy },
        configurable: true,
        writable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      });
    });

    it('redirects to /dashboard when native and marketing already seen', () => {
      (window as unknown as { Capacitor: unknown }).Capacitor = {
        isNativePlatform: () => true,
      };
      window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, 'true');

      runScript();

      expect(replaceSpy).toHaveBeenCalledWith('/dashboard');
    });

    it('does not redirect when native but marketing has not been seen yet', () => {
      (window as unknown as { Capacitor: unknown }).Capacitor = {
        isNativePlatform: () => true,
      };

      runScript();

      expect(replaceSpy).not.toHaveBeenCalled();
    });

    it('does not redirect on web (no Capacitor global), even if seen is set', () => {
      window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, 'true');

      runScript();

      expect(replaceSpy).not.toHaveBeenCalled();
    });

    it('does not redirect when Capacitor exists but is not the native platform', () => {
      (window as unknown as { Capacitor: unknown }).Capacitor = {
        isNativePlatform: () => false,
      };
      window.localStorage.setItem(HAS_SEEN_MARKETING_KEY, 'true');

      runScript();

      expect(replaceSpy).not.toHaveBeenCalled();
    });

    it('never throws even if reading Capacitor throws', () => {
      Object.defineProperty(window, 'Capacitor', {
        get() {
          throw new Error('boom');
        },
        configurable: true,
      });

      expect(() => runScript()).not.toThrow();

      delete (window as unknown as { Capacitor?: unknown }).Capacitor;
    });

    it('embeds the real storage key rather than a placeholder', () => {
      expect(getMarketingRedirectScript()).toContain(HAS_SEEN_MARKETING_KEY);
    });
  });

  describe('getServiceWorkerCleanupScript', () => {
    // Regression coverage for a real device bug that recurred in production:
    // a service worker got registered on native and got the app stuck in an
    // infinite reload loop (its navigate-mode fetch handling re-triggers
    // WebView navigation). That registration survives app reinstalls, so
    // this script runs on every page load (embedded pre-hydration, see
    // ServiceWorkerCleanupScript) to unregister it — verified here by
    // actually executing the script.
    //
    // This originally checked window.Capacitor, same as isNativePlatform()
    // — and a real device still got stuck after that fix shipped, because
    // this script can run before Capacitor's native bridge attaches to
    // window. It now checks location.hostname/protocol directly (see
    // isCapacitorOrigin), which has no such gap.
    function runScript() {
      new Function(getServiceWorkerCleanupScript())();
    }

    const originalLocation = window.location;

    function setLocation(hostname: string, protocol: string) {
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, hostname, protocol },
        configurable: true,
        writable: true,
      });
    }

    let getRegistrationsSpy: ReturnType<typeof vi.fn>;
    let unregisterSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      unregisterSpy = vi.fn();
      getRegistrationsSpy = vi.fn().mockResolvedValue([{ unregister: unregisterSpy }]);
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistrations: getRegistrationsSpy },
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true,
      });
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      });
    });

    it('unregisters existing service workers on the Android Capacitor origin', async () => {
      setLocation('localhost', 'https:');

      runScript();
      await new Promise((r) => setTimeout(r, 0));

      expect(getRegistrationsSpy).toHaveBeenCalledTimes(1);
      expect(unregisterSpy).toHaveBeenCalledTimes(1);
    });

    it('unregisters existing service workers on the default iOS Capacitor origin', async () => {
      setLocation('localhost', 'capacitor:');

      runScript();
      await new Promise((r) => setTimeout(r, 0));

      expect(getRegistrationsSpy).toHaveBeenCalledTimes(1);
    });

    it('does nothing on the Next.js dev server (http://localhost:PORT)', async () => {
      setLocation('localhost', 'http:');

      runScript();
      await new Promise((r) => setTimeout(r, 0));

      expect(getRegistrationsSpy).not.toHaveBeenCalled();
    });

    it('does nothing on the deployed web app', async () => {
      setLocation('homedocket.app', 'https:');

      runScript();
      await new Promise((r) => setTimeout(r, 0));

      expect(getRegistrationsSpy).not.toHaveBeenCalled();
    });

    it('runs even when window.Capacitor is completely absent', async () => {
      setLocation('localhost', 'https:');
      delete (window as unknown as { Capacitor?: unknown }).Capacitor;

      runScript();
      await new Promise((r) => setTimeout(r, 0));

      expect(getRegistrationsSpy).toHaveBeenCalledTimes(1);
    });

    it('never throws even if serviceWorker is unavailable', () => {
      setLocation('localhost', 'https:');
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        configurable: true,
      });

      expect(() => runScript()).not.toThrow();
    });
  });
});
