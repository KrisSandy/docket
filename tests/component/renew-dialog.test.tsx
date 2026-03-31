import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RenewDialog } from '@/components/dashboard/renew-dialog';
import type { DashboardItem } from '@/types';

const mockItem: DashboardItem = {
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
};

describe('RenewDialog', () => {
  it('does not render when closed', () => {
    render(
      <RenewDialog open={false} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open with item title', () => {
    render(
      <RenewDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Renew Car Insurance/)).toBeInTheDocument();
  });

  it('shows current deadline', () => {
    render(
      <RenewDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    expect(screen.getByText(/Current deadline:/)).toBeInTheDocument();
  });

  it('shows error when confirming without date', async () => {
    const user = userEvent.setup();
    render(
      <RenewDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    await user.click(screen.getByText('Confirm'));
    expect(screen.getByText('Please select a date')).toBeInTheDocument();
  });

  it('calls onConfirm with valid future date', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RenewDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={onConfirm} />
    );
    // Use a date far in the future to avoid timezone issues
    const input = screen.getByDisplayValue('');
    await user.clear(input);
    await user.type(input, '2028-06-15');
    await user.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledWith(mockItem, '2028-06-15');
  });

  it('has close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <RenewDialog open={true} onOpenChange={onOpenChange} item={mockItem} onConfirm={vi.fn()} />
    );
    await user.click(screen.getByLabelText('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('cancel button closes dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <RenewDialog open={true} onOpenChange={onOpenChange} item={mockItem} onConfirm={vi.fn()} />
    );
    await user.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('action buttons meet 44px touch target', () => {
    render(
      <RenewDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    const confirm = screen.getByText('Confirm').closest('button');
    const cancel = screen.getByText('Cancel').closest('button');
    expect(confirm?.className).toContain('min-h-[44px]');
    expect(cancel?.className).toContain('min-h-[44px]');
  });
});
