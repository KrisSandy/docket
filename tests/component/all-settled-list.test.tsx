import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AllSettledList } from '@/components/dashboard/all-settled-list';
import type { DashboardItem } from '@/types';

function makeItem(overrides: Partial<DashboardItem>): DashboardItem {
  return {
    id: '1',
    categoryId: 'cat1',
    categoryName: 'Housing',
    categoryIcon: 'home',
    title: 'Mortgage',
    status: 'active',
    displayStatus: 'ok',
    earliestDeadline: new Date('2026-11-01'),
    daysUntilDeadline: 60,
    keyDateLabel: 'in 60 days',
    serviceType: null,
    dismissedUntil: null,
    ...overrides,
  };
}

describe('AllSettledList', () => {
  it('renders a title and date per item', () => {
    render(<AllSettledList items={[makeItem({})]} onItemClick={vi.fn()} />);
    expect(screen.getByText('Mortgage')).toBeInTheDocument();
    expect(screen.getByText('1 Nov')).toBeInTheDocument();
  });

  it('shows an em dash when an item has no deadline', () => {
    render(<AllSettledList items={[makeItem({ earliestDeadline: null })]} onItemClick={vi.fn()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('calls onItemClick with the item id when a row is clicked', async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(<AllSettledList items={[makeItem({ id: 'item-42' })]} onItemClick={onItemClick} />);
    await user.click(screen.getByText('Mortgage'));
    expect(onItemClick).toHaveBeenCalledWith('item-42');
  });

  it('renders one row per item', () => {
    render(
      <AllSettledList
        items={[makeItem({ id: '1', title: 'Mortgage' }), makeItem({ id: '2', title: 'Broadband' })]}
        onItemClick={vi.fn()}
      />
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
