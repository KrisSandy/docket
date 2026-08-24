import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

const { mockIsNative } = vi.hoisted(() => ({
  mockIsNative: vi.fn(),
}));

vi.mock('@/lib/first-launch', () => ({
  isCapacitorOrigin: () => mockIsNative(),
}));

import { ServiceWorkerRegister } from '@/components/pwa/sw-register';

describe('ServiceWorkerRegister', () => {
  let registerMock: ReturnType<typeof vi.fn>;
  let getRegistrationsMock: ReturnType<typeof vi.fn>;
  let unregisterMocks: ReturnType<typeof vi.fn>[];

  beforeEach(() => {
    vi.clearAllMocks();
    unregisterMocks = [vi.fn().mockResolvedValue(true), vi.fn().mockResolvedValue(true)];
    getRegistrationsMock = vi.fn().mockResolvedValue([
      { unregister: unregisterMocks[0] },
      { unregister: unregisterMocks[1] },
    ]);
    registerMock = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: registerMock, getRegistrations: getRegistrationsMock },
      configurable: true,
    });
  });

  // Regression test: a race between this effect and Capacitor's bridge
  // attaching previously let a real service worker register on native,
  // which then caused an infinite reload loop on Android (SW navigate-mode
  // fetch handling). That registration survives `adb install -r` / app
  // updates, so the fix must actively clean up existing registrations on
  // every native launch — not just skip new ones.
  it('unregisters any existing service workers on native, and does not register a new one', async () => {
    mockIsNative.mockReturnValue(true);

    render(<ServiceWorkerRegister />);

    await waitFor(() => {
      expect(getRegistrationsMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(unregisterMocks[0]).toHaveBeenCalledTimes(1);
      expect(unregisterMocks[1]).toHaveBeenCalledTimes(1);
    });
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('registers the service worker on web and does not touch existing registrations', async () => {
    mockIsNative.mockReturnValue(false);

    render(<ServiceWorkerRegister />);

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('/sw.js');
    });
    expect(getRegistrationsMock).not.toHaveBeenCalled();
  });

  it('renders nothing', () => {
    mockIsNative.mockReturnValue(false);
    const { container } = render(<ServiceWorkerRegister />);
    expect(container).toBeEmptyDOMElement();
  });
});
