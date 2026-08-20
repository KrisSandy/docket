import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const { mockReplace, mockPush, mockHasSeen, mockIsNative } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockPush: vi.fn(),
  mockHasSeen: vi.fn(),
  mockIsNative: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, back: vi.fn() }),
}));

vi.mock('@/lib/first-launch', () => ({
  hasSeenMarketing: () => mockHasSeen(),
  isNativePlatform: () => mockIsNative(),
}));

import { MarketingGate } from '@/components/marketing/marketing-gate';

describe('MarketingGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  });

  describe('on web (not native)', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(false);
    });

    it('renders children immediately for SEO and web visitors', () => {
      render(
        <MarketingGate>
          <div data-testid="child">marketing content</div>
        </MarketingGate>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toHaveTextContent('marketing content');
    });

    it('never calls hasSeenMarketing or router.replace on web', async () => {
      render(
        <MarketingGate>
          <div>content</div>
        </MarketingGate>
      );
      await new Promise((r) => setTimeout(r, 0));
      expect(mockHasSeen).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('on native', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(true);
    });

    it('redirects to /dashboard when marketing has been seen', async () => {
      mockHasSeen.mockReturnValue(true);

      render(
        <MarketingGate>
          <div data-testid="child">marketing content</div>
        </MarketingGate>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/dashboard');
      });
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });

    it('does not redirect on first launch when marketing has not been seen', async () => {
      mockHasSeen.mockReturnValue(false);

      render(
        <MarketingGate>
          <div data-testid="child">marketing content</div>
        </MarketingGate>
      );

      await waitFor(() => {
        expect(mockHasSeen).toHaveBeenCalled();
      });
      expect(mockReplace).not.toHaveBeenCalled();
      // Children remain visible so the user can read the marketing copy
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('checks synchronously — redirects within the same effect tick with no async gap', async () => {
      mockHasSeen.mockReturnValue(true);

      render(
        <MarketingGate>
          <div data-testid="child">marketing content</div>
        </MarketingGate>
      );

      // No `await` before this assertion — a synchronous check means the
      // redirect fires within the effect itself, not after a microtask
      // or promise resolution that would leave a window for a flash.
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });

    it('always renders children on initial mount (no loading placeholder)', () => {
      mockHasSeen.mockReturnValue(true);

      render(
        <MarketingGate>
          <div data-testid="child">marketing content</div>
        </MarketingGate>
      );

      // Children are present in the DOM even though native "seen" users
      // are redirected — the pre-hydration inline script (tested
      // separately) is what actually prevents the visible flash on
      // native; this component is a synchronous fallback.
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });
});
