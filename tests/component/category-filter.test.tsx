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

// Mock DB for view persistence
vi.mock('@/db/database', () => ({
  db: {
    settings: {
      get: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
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

    // Filter chips should be visible (text may also appear in item cards)
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getAllByText('Vehicle').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Utilities').length).toBeGreaterThanOrEqual(1);
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

    // Click the "Vehicle" filter chip button (not the one inside an ItemCard)
    // Filter chips are direct children of the scrollable chip container
    const vehicleButtons = screen.getAllByText('Vehicle');
    // The filter chip is a <button> element in the chip bar
    const filterChip = vehicleButtons.find(
      (el) => el.closest('button')?.classList.contains('rounded-full')
    );
    expect(filterChip).toBeTruthy();
    await user.click(filterChip!);

    // Should only show Car Insurance, not Electricity
    expect(screen.getByText('Car Insurance')).toBeInTheDocument();
    expect(screen.queryByText('Electricity')).not.toBeInTheDocument();
  });
});
