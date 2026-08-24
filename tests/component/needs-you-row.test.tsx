import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NeedsYouRow } from '@/components/dashboard/needs-you-row';
import type { DashboardItem } from '@/types';

function makeItem(overrides: Partial<DashboardItem>): DashboardItem {
  return {
    id: '1',
    categoryId: 'cat1',
    categoryName: 'Vehicle',
    categoryIcon: 'car',
    title: 'Family Car',
    status: 'active',
    displayStatus: 'urgent',
    earliestDeadline: new Date('2026-08-26'),
    daysUntilDeadline: 5,
    keyDateLabel: 'in 5 days',
    serviceType: null,
    dismissedUntil: null,
    ...overrides,
  };
}

describe('NeedsYouRow', () => {
  it('shows a day-count badge for a warning/urgent item', () => {
    render(<NeedsYouRow item={makeItem({})} onClick={vi.fn()} onRenewClick={vi.fn()} />);
    expect(screen.getByText('Family Car')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('days')).toBeInTheDocument();
    expect(screen.queryByText('Renew')).not.toBeInTheDocument();
  });

  it('shows a Renew button for an expired item instead of a day count', () => {
    render(
      <NeedsYouRow
        item={makeItem({ displayStatus: 'expired', daysUntilDeadline: -3 })}
        onClick={vi.fn()}
        onRenewClick={vi.fn()}
      />
    );
    expect(screen.getByText('Renew')).toBeInTheDocument();
  });

  it('calls onClick when the row is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NeedsYouRow item={makeItem({})} onClick={onClick} onRenewClick={vi.fn()} />);
    await user.click(screen.getByText('Family Car'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onRenewClick (not onClick) when Renew is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRenewClick = vi.fn();
    render(
      <NeedsYouRow
        item={makeItem({ displayStatus: 'expired', daysUntilDeadline: -3 })}
        onClick={onClick}
        onRenewClick={onRenewClick}
      />
    );
    await user.click(screen.getByText('Renew'));
    expect(onRenewClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
