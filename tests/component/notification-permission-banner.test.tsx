import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock notifications lib
const mockCheckPermission = vi.fn();
const mockRequestPermission = vi.fn();

vi.mock('@/lib/notifications', () => ({
  checkPermission: (...args: unknown[]) => mockCheckPermission(...args),
  requestPermission: (...args: unknown[]) => mockRequestPermission(...args),
}));

import { NotificationPermissionBanner } from '@/components/layout/notification-permission-banner';

describe('NotificationPermissionBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows nothing when permission is granted', async () => {
    mockCheckPermission.mockResolvedValue('granted');
    const { container } = render(<NotificationPermissionBanner />);
    // Wait for async check
    await vi.waitFor(() => {
      expect(container.querySelector('[role="alert"]')).toBeNull();
    });
  });

  it('shows enable button when permission is prompt', async () => {
    mockCheckPermission.mockResolvedValue('prompt');
    render(<NotificationPermissionBanner />);

    expect(await screen.findByText('Enable reminders')).toBeInTheDocument();
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('shows denied warning when permission is denied', async () => {
    mockCheckPermission.mockResolvedValue('denied');
    render(<NotificationPermissionBanner />);

    expect(await screen.findByText('Notifications are disabled')).toBeInTheDocument();
    expect(
      screen.getByText(/Enable notifications in your device settings/)
    ).toBeInTheDocument();
  });

  it('requests permission when enable button clicked', async () => {
    const user = userEvent.setup();
    mockCheckPermission.mockResolvedValue('prompt');
    mockRequestPermission.mockResolvedValue('granted');

    render(<NotificationPermissionBanner />);

    const enableBtn = await screen.findByText('Enable notifications');
    await user.click(enableBtn);

    expect(mockRequestPermission).toHaveBeenCalledOnce();
  });

  it('can be dismissed', async () => {
    const user = userEvent.setup();
    mockCheckPermission.mockResolvedValue('denied');

    render(<NotificationPermissionBanner />);

    await screen.findByText('Notifications are disabled');

    const dismissBtn = screen.getByLabelText('Dismiss notification banner');
    await user.click(dismissBtn);

    expect(screen.queryByText('Notifications are disabled')).not.toBeInTheDocument();
  });
});
