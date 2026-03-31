import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewSheet } from '@/components/dashboard/review-sheet';
import type { DashboardItem } from '@/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockItems: DashboardItem[] = [
  {
    id: '1',
    categoryId: 'cat1',
    categoryName: 'Vehicle',
    categoryIcon: 'car',
    title: 'Car Insurance',
    status: 'active',
    displayStatus: 'expired',
    earliestDeadline: new Date('2026-03-01'),
    daysUntilDeadline: -30,
    keyDateLabel: 'overdue by 30 days',
    serviceType: null,
    dismissedUntil: null,
  },
  {
    id: '2',
    categoryId: 'cat2',
    categoryName: 'Vehicle',
    categoryIcon: 'car',
    title: 'NCT Renewal',
    status: 'active',
    displayStatus: 'urgent',
    earliestDeadline: new Date('2026-04-05'),
    daysUntilDeadline: 5,
    keyDateLabel: 'in 5 days',
    serviceType: null,
    dismissedUntil: null,
  },
];

describe('ReviewSheet', () => {
  it('does not render when closed', () => {
    render(
      <ReviewSheet
        open={false}
        onOpenChange={vi.fn()}
        items={mockItems}
        onRenew={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open with correct title and count', () => {
    render(
      <ReviewSheet
        open={true}
        onOpenChange={vi.fn()}
        items={mockItems}
        onRenew={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Items needing attention')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows all attention items', () => {
    render(
      <ReviewSheet
        open={true}
        onOpenChange={vi.fn()}
        items={mockItems}
        onRenew={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('Car Insurance')).toBeInTheDocument();
    expect(screen.getByText('NCT Renewal')).toBeInTheDocument();
  });

  it('shows deadline labels', () => {
    render(
      <ReviewSheet
        open={true}
        onOpenChange={vi.fn()}
        items={mockItems}
        onRenew={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('overdue by 30 days')).toBeInTheDocument();
    expect(screen.getByText('in 5 days')).toBeInTheDocument();
  });

  it('shows Renew and Dismiss buttons for each item', () => {
    render(
      <ReviewSheet
        open={true}
        onOpenChange={vi.fn()}
        items={mockItems}
        onRenew={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    const renewButtons = screen.getAllByText('Renew');
    const dismissButtons = screen.getAllByText('Dismiss');
    expect(renewButtons).toHaveLength(2);
    expect(dismissButtons).toHaveLength(2);
  });

  it('calls onRenew when Renew button clicked', async () => {
    const user = userEvent.setup();
    const onRenew = vi.fn();
    render(
      <ReviewSheet
        open={true}
        onOpenChange={vi.fn()}
        items={mockItems}
        onRenew={onRenew}
        onDismiss={vi.fn()}
      />
    );
    const renewButtons = screen.getAllByText('Renew');
    await user.click(renewButtons[0]);
    expect(onRenew).toHaveBeenCalledWith(mockItems[0]);
  });

  it('calls onDismiss when Dismiss button clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <ReviewSheet
        open={true}
        onOpenChange={vi.fn()}
        items={mockItems}
        onRenew={vi.fn()}
        onDismiss={onDismiss}
      />
    );
    const dismissButtons = screen.getAllByText('Dismiss');
    await user.click(dismissButtons[0]);
    expect(onDismiss).toHaveBeenCalledWith(mockItems[0]);
  });

  it('shows empty state when no items', () => {
    render(
      <ReviewSheet
        open={true}
        onOpenChange={vi.fn()}
        items={[]}
        onRenew={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('All caught up!')).toBeInTheDocument();
  });

  it('has close button that calls onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ReviewSheet
        open={true}
        onOpenChange={onOpenChange}
        items={mockItems}
        onRenew={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('all action buttons meet 44px touch target', () => {
    render(
      <ReviewSheet
        open={true}
        onOpenChange={vi.fn()}
        items={mockItems}
        onRenew={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    const renewButtons = screen.getAllByText('Renew');
    for (const btn of renewButtons) {
      expect(btn.closest('button')?.className).toContain('min-h-[44px]');
    }
  });
});
