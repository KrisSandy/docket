import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCard } from '@/components/dashboard/item-card';
import type { DashboardItem } from '@/types';

const mockItem: DashboardItem = {
  id: '1',
  categoryId: 'cat1',
  categoryName: 'Vehicle',
  categoryIcon: 'car',
  title: 'Car Insurance',
  status: 'active',
  displayStatus: 'warning',
  earliestDeadline: new Date('2026-07-15'),
  daysUntilDeadline: 25,
  keyDateLabel: '25 days',
};

describe('ItemCard', () => {
  it('renders item title and category', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText('Car Insurance')).toBeInTheDocument();
    expect(screen.getByText('Vehicle')).toBeInTheDocument();
  });

  it('renders date label', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText('25 days')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ItemCard item={mockItem} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has 44px minimum touch target', () => {
    render(<ItemCard item={mockItem} />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('min-h-[44px]');
  });
});
