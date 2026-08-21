import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockSettingsGet = vi.fn();
const mockSettingsPut = vi.fn();

vi.mock('@/db/database', () => ({
  db: {
    settings: {
      get: (...args: unknown[]) => mockSettingsGet(...args),
      put: (...args: unknown[]) => mockSettingsPut(...args),
    },
  },
}));

import { AndroidNotificationHelp } from '@/components/items/android-notification-help';

describe('AndroidNotificationHelp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the warning with a dismiss button when not previously dismissed', async () => {
    mockSettingsGet.mockResolvedValue(undefined);

    render(<AndroidNotificationHelp />);

    expect(
      await screen.findByText('Battery optimization may affect reminders')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Dismiss battery optimization warning')).toBeInTheDocument();
  });

  it('renders nothing when previously dismissed', async () => {
    mockSettingsGet.mockResolvedValue({
      key: 'battery_optimization_warning_dismissed',
      value: 'true',
    });

    const { container } = render(<AndroidNotificationHelp />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('hides itself and persists the choice when dismiss is clicked', async () => {
    const user = userEvent.setup();
    mockSettingsGet.mockResolvedValue(undefined);
    mockSettingsPut.mockResolvedValue(undefined);

    render(<AndroidNotificationHelp />);
    await screen.findByText('Battery optimization may affect reminders');

    await user.click(screen.getByLabelText('Dismiss battery optimization warning'));

    expect(mockSettingsPut).toHaveBeenCalledWith({
      key: 'battery_optimization_warning_dismissed',
      value: 'true',
    });
    expect(
      screen.queryByText('Battery optimization may affect reminders')
    ).not.toBeInTheDocument();
  });
});
