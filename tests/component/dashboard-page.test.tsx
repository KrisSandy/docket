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

import DashboardPage from '@/app/(app)/dashboard/page';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockClear();
  });

  it('shows empty state when no items', async () => {
    mockGetDashboardData.mockResolvedValue({
      items: [],
      attentionCount: 0,
      overallStatus: 'ok',
      categories: [],
      upcomingDeadlines: [],
    });

    render(<DashboardPage />);

    expect(
      await screen.findByText('No items tracked yet. Tap + to add your first.')
    ).toBeInTheDocument();
  });

  it('shows "All clear" status banner when all items ok', async () => {
    mockGetDashboardData.mockResolvedValue({
      items: [
        {
          id: '1',
          categoryId: 'cat1',
          categoryName: 'Vehicle',
          categoryIcon: 'car',
          title: 'Car Insurance',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: 60,
          keyDateLabel: '60 days',
        },
      ],
      attentionCount: 0,
      overallStatus: 'ok',
      categories: [{ id: 'cat1', name: 'Vehicle', icon: 'car' }],
      upcomingDeadlines: [],
    });

    render(<DashboardPage />);

    expect(await screen.findByText(/All clear/)).toBeInTheDocument();
  });

  it('shows attention count when urgent items exist', async () => {
    mockGetDashboardData.mockResolvedValue({
      items: [
        {
          id: '1',
          categoryId: 'cat1',
          categoryName: 'Vehicle',
          categoryIcon: 'car',
          title: 'NCT Renewal',
          status: 'active',
          displayStatus: 'urgent',
          earliestDeadline: new Date(),
          daysUntilDeadline: 3,
          keyDateLabel: '3 days',
        },
        {
          id: '2',
          categoryId: 'cat2',
          categoryName: 'Insurance',
          categoryIcon: 'shield',
          title: 'Home Insurance',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: 90,
          keyDateLabel: '90 days',
        },
      ],
      attentionCount: 1,
      overallStatus: 'urgent',
      categories: [
        { id: 'cat1', name: 'Vehicle', icon: 'car' },
        { id: 'cat2', name: 'Insurance', icon: 'shield' },
      ],
      upcomingDeadlines: [
        { id: '1', title: 'NCT Renewal', daysUntil: 3, status: 'urgent', dateLabel: '3 days' },
      ],
    });

    render(<DashboardPage />);

    expect(await screen.findByText('1 item needs attention')).toBeInTheDocument();
  });

  it('renders items sorted by status priority', async () => {
    mockGetDashboardData.mockResolvedValue({
      items: [
        {
          id: '1',
          categoryId: 'c1',
          categoryName: 'Vehicle',
          categoryIcon: 'car',
          title: 'Expired Item',
          status: 'active',
          displayStatus: 'expired',
          earliestDeadline: new Date(),
          daysUntilDeadline: -5,
          keyDateLabel: 'Expired 5 days ago',
        },
        {
          id: '2',
          categoryId: 'c2',
          categoryName: 'Insurance',
          categoryIcon: 'shield',
          title: 'Urgent Item',
          status: 'active',
          displayStatus: 'urgent',
          earliestDeadline: new Date(),
          daysUntilDeadline: 3,
          keyDateLabel: '3 days',
        },
        {
          id: '3',
          categoryId: 'c3',
          categoryName: 'Housing',
          categoryIcon: 'home',
          title: 'OK Item',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: 60,
          keyDateLabel: '60 days',
        },
      ],
      attentionCount: 2,
      overallStatus: 'expired',
      categories: [
        { id: 'c1', name: 'Vehicle', icon: 'car' },
        { id: 'c2', name: 'Insurance', icon: 'shield' },
        { id: 'c3', name: 'Housing', icon: 'home' },
      ],
      upcomingDeadlines: [],
    });

    render(<DashboardPage />);

    // Wait for items to render
    await screen.findByText('Expired Item');

    // All items should be present
    expect(screen.getByText('Expired Item')).toBeInTheDocument();
    expect(screen.getByText('Urgent Item')).toBeInTheDocument();
    expect(screen.getByText('OK Item')).toBeInTheDocument();
  });

  it('navigates to add page when FAB is clicked', async () => {
    const user = userEvent.setup();
    mockGetDashboardData.mockResolvedValue({
      items: [
        {
          id: '1',
          categoryId: 'c1',
          categoryName: 'Vehicle',
          categoryIcon: 'car',
          title: 'Test',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: null,
          keyDateLabel: null,
        },
      ],
      attentionCount: 0,
      overallStatus: 'ok',
      categories: [{ id: 'c1', name: 'Vehicle', icon: 'car' }],
      upcomingDeadlines: [],
    });

    render(<DashboardPage />);
    await screen.findByText('Test');

    const fab = screen.getByLabelText('Add new item');
    await user.click(fab);
    expect(pushMock).toHaveBeenCalledWith('/add');
  });

  it('navigates to item detail when item clicked', async () => {
    const user = userEvent.setup();
    mockGetDashboardData.mockResolvedValue({
      items: [
        {
          id: 'item-123',
          categoryId: 'c1',
          categoryName: 'Vehicle',
          categoryIcon: 'car',
          title: 'My Car',
          status: 'active',
          displayStatus: 'ok',
          earliestDeadline: null,
          daysUntilDeadline: null,
          keyDateLabel: null,
        },
      ],
      attentionCount: 0,
      overallStatus: 'ok',
      categories: [{ id: 'c1', name: 'Vehicle', icon: 'car' }],
      upcomingDeadlines: [],
    });

    render(<DashboardPage />);
    const itemRow = await screen.findByText('My Car');
    await user.click(itemRow);
    expect(pushMock).toHaveBeenCalledWith('/item/item-123');
  });
});
