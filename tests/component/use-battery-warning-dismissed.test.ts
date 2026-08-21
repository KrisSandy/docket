import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

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

import { useBatteryWarningDismissed } from '@/hooks/use-battery-warning-dismissed';

describe('useBatteryWarningDismissed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to not dismissed when no setting has been saved', async () => {
    mockSettingsGet.mockResolvedValue(undefined);

    const { result } = renderHook(() => useBatteryWarningDismissed());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.dismissed).toBe(false);
  });

  it('restores dismissed=true from a previously saved setting', async () => {
    mockSettingsGet.mockResolvedValue({
      key: 'battery_optimization_warning_dismissed',
      value: 'true',
    });

    const { result } = renderHook(() => useBatteryWarningDismissed());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.dismissed).toBe(true);
  });

  it('persists dismissal and updates state when dismiss() is called', async () => {
    mockSettingsGet.mockResolvedValue(undefined);
    mockSettingsPut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useBatteryWarningDismissed());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.dismiss();
    });

    expect(mockSettingsPut).toHaveBeenCalledWith({
      key: 'battery_optimization_warning_dismissed',
      value: 'true',
    });
    expect(result.current.dismissed).toBe(true);
  });
});
