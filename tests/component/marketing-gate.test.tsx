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
      mockHasSeen.mockResolvedValue(true);

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
      mockHasSeen.mockResolvedValue(false);

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

    it('does not redirect if the DB check throws (fails open to marketing)', async () => {
      mockHasSeen.mockRejectedValue(new Error('db error'));

      render(
        <MarketingGate>
          <div data-testid="child">marketing content</div>
        </MarketingGate>
      );

      await waitFor(() => {
        expect(mockHasSeen).toHaveBeenCalled();
      });
      expect(mockReplace).not.toHaveBeenCalled();
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('always renders children on initial mount (no loading placeholder)', () => {
      mockHasSeen.mockResolvedValue(true);

      render(
        <MarketingGate>
          <div data-testid="child">marketing content</div>
        </MarketingGate>
      );

      // Before the async check resolves, children are already present.
      // A brief visual flash is the deliberate trade-off for being
      // SEO-safe and hydration-safe.
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });
});
