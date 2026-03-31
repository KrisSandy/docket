import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
  usePathname: () => '/dashboard',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the dashboard hook
const mockGetDashboardData = vi.fn();
vi.mock('@/hooks/use-dashboard', () => ({
  useDashboard: () => ({
    getDashboardData: mockGetDashboardData,
  }),
}));

// Mock the seed function
vi.mock('@/db/seed', () => ({
  seedDefaultCategories: vi.fn(),
}));

// Mock DB settings for view persistence
const mockSettingsGet = vi.fn();
const mockSettingsPut = vi.fn();
vi.mock('@/db/database', () => ({
  db: {
    settings: {
      get: (...args: unknown[]) => mockSettingsGet(...args),
      put: (...args: unknown[]) => mockSettingsPut(...args),
    },
    categories: {
      where: () => ({
        equals: () => ({
          first: () => Promise.resolve(null),
        }),
      }),
    },
  },
}));

import DashboardPage from '@/app/(app)/dashboard/page';

const baseData = {
  items: [
    {
      id: '1',
      categoryId: 'cat1',
      categoryName: 'Vehicle',
      categoryIcon: 'car',
      title: 'Car Insurance',
      status: 'active',
      displayStatus: 'ok' as const,
      earliestDeadline: null,
      daysUntilDeadline: 60,
      keyDateLabel: '60 days',
    },
  ],
  attentionCount: 0,
  overallStatus: 'ok' as const,
  categories: [{ id: 'cat1', name: 'Vehicle', icon: 'car' }],
  upcomingDeadlines: [],
};

describe('Dashboard view persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDashboardData.mockResolvedValue(baseData);
    mockSettingsGet.mockResolvedValue(undefined); // No saved preference
    mockSettingsPut.mockResolvedValue(undefined);
  });

  it('defaults to card (detail) view when no saved preference', async () => {
    render(<DashboardPage />);

    // Wait for data to load
    await screen.findByText('Car Insurance');

    // Detail view shows ItemCards — verify the toggle label says "switch to glance"
    const toggleBtn = screen.getByLabelText('Switch to glance view');
    expect(toggleBtn).toBeInTheDocument();
  });

  it('restores saved glance view preference from DB', async () => {
    mockSettingsGet.mockResolvedValue({ key: 'dashboard_view_mode', value: 'glance' });

    render(<DashboardPage />);
    await screen.findByText('Car Insurance');

    // After restoring, the toggle should offer switching to detail
    const toggleBtn = await screen.findByLabelText('Switch to detail view');
    expect(toggleBtn).toBeInTheDocument();
  });

  it('persists view mode change to DB when toggled', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);
    await screen.findByText('Car Insurance');

    // Default is detail — toggle to glance
    const toggleBtn = screen.getByLabelText('Switch to glance view');
    await user.click(toggleBtn);

    expect(mockSettingsPut).toHaveBeenCalledWith({
      key: 'dashboard_view_mode',
      value: 'glance',
    });
  });

  it('persists back to detail when toggled twice', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);
    await screen.findByText('Car Insurance');

    // Toggle to glance
    const toggleBtn = screen.getByLabelText('Switch to glance view');
    await user.click(toggleBtn);

    // Toggle back to detail
    const toggleBtn2 = await screen.findByLabelText('Switch to detail view');
    await user.click(toggleBtn2);

    expect(mockSettingsPut).toHaveBeenLastCalledWith({
      key: 'dashboard_view_mode',
      value: 'detail',
    });
  });
});
