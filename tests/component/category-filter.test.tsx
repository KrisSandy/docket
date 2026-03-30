import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
  usePathname: () => '/dashboard',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/db/seed', () => ({
  seedDefaultCategories: vi.fn(),
}));

const mockGetDashboardData = vi.fn();
vi.mock('@/hooks/use-dashboard', () => ({
  useDashboard: () => ({
    getDashboardData: mockGetDashboardData,
  }),
}));

import DashboardPage from '@/app/(app)/dashboard/page';

describe('Dashboard Category Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows category filter chips when multiple categories exist', async () => {
    mockGetDashboardData.mockResolvedValue({
      items: [
        {
          id: '1',
          categoryId: 'c1',
          categoryName: 'Vehicle',
          categoryIcon: 'car',
          title: 'Car Insurance',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: null,
          keyDateLabel: null,
        },
        {
          id: '2',
          categoryId: 'c2',
          categoryName: 'Utilities',
          categoryIcon: 'zap',
          title: 'Electricity',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: null,
          keyDateLabel: null,
        },
      ],
      attentionCount: 0,
      overallStatus: 'ok',
      categories: [
        { id: 'c1', name: 'Vehicle', icon: 'car' },
        { id: 'c2', name: 'Utilities', icon: 'zap' },
      ],
      upcomingDeadlines: [],
    });

    render(<DashboardPage />);

    // Wait for data to load
    await screen.findByText('Car Insurance');

    // Filter chips should be visible
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Vehicle')).toBeInTheDocument();
    expect(screen.getByText('Utilities')).toBeInTheDocument();
  });

  it('filters items when category chip is tapped', async () => {
    const user = userEvent.setup();
    mockGetDashboardData.mockResolvedValue({
      items: [
        {
          id: '1',
          categoryId: 'c1',
          categoryName: 'Vehicle',
          categoryIcon: 'car',
          title: 'Car Insurance',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: null,
          keyDateLabel: null,
        },
        {
          id: '2',
          categoryId: 'c2',
          categoryName: 'Utilities',
          categoryIcon: 'zap',
          title: 'Electricity',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: null,
          keyDateLabel: null,
        },
      ],
      attentionCount: 0,
      overallStatus: 'ok',
      categories: [
        { id: 'c1', name: 'Vehicle', icon: 'car' },
        { id: 'c2', name: 'Utilities', icon: 'zap' },
      ],
      upcomingDeadlines: [],
    });

    render(<DashboardPage />);
    await screen.findByText('Car Insurance');

    // Click "Vehicle" filter
    await user.click(screen.getByText('Vehicle'));

    // Should only show Car Insurance, not Electricity
    expect(screen.getByText('Car Insurance')).toBeInTheDocument();
    expect(screen.queryByText('Electricity')).not.toBeInTheDocument();
  });
});
