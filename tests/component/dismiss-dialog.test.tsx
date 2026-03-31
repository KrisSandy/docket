import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DismissDialog } from '@/components/dashboard/dismiss-dialog';
import type { DashboardItem } from '@/types';

const mockItem: DashboardItem = {
  id: '1',
  categoryId: 'cat1',
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
};

describe('DismissDialog', () => {
  it('does not render when closed', () => {
    render(
      <DismissDialog open={false} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open with item title', () => {
    render(
      <DismissDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Dismiss NCT Renewal/)).toBeInTheDocument();
  });

  it('shows all three duration options', () => {
    render(
      <DismissDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    expect(screen.getByText('7 days')).toBeInTheDocument();
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('Until I act')).toBeInTheDocument();
  });

  it('defaults to 7 days selected', () => {
    render(
      <DismissDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    // The 7 days option should have the primary border
    const sevenDayButton = screen.getByText('7 days').closest('button');
    expect(sevenDayButton?.className).toContain('border-primary');
  });

  it('confirms with default 7-day duration', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DismissDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={onConfirm} />
    );
    // Click the Dismiss confirm button (not the duration options)
    const buttons = screen.getAllByText('Dismiss');
    const confirmButton = buttons.find((b) => b.closest('button')?.className.includes('bg-primary'));
    await user.click(confirmButton!);
    expect(onConfirm).toHaveBeenCalledWith(mockItem, '7');
  });

  it('allows selecting 30-day duration', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DismissDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={onConfirm} />
    );
    await user.click(screen.getByText('30 days'));
    const buttons = screen.getAllByText('Dismiss');
    const confirmButton = buttons.find((b) => b.closest('button')?.className.includes('bg-primary'));
    await user.click(confirmButton!);
    expect(onConfirm).toHaveBeenCalledWith(mockItem, '30');
  });

  it('allows selecting indefinite duration', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DismissDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={onConfirm} />
    );
    await user.click(screen.getByText('Until I act'));
    const buttons = screen.getAllByText('Dismiss');
    const confirmButton = buttons.find((b) => b.closest('button')?.className.includes('bg-primary'));
    await user.click(confirmButton!);
    expect(onConfirm).toHaveBeenCalledWith(mockItem, 'indefinite');
  });

  it('cancel button closes dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DismissDialog open={true} onOpenChange={onOpenChange} item={mockItem} onConfirm={vi.fn()} />
    );
    await user.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('close button closes dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DismissDialog open={true} onOpenChange={onOpenChange} item={mockItem} onConfirm={vi.fn()} />
    );
    await user.click(screen.getByLabelText('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('action buttons meet 44px touch target', () => {
    render(
      <DismissDialog open={true} onOpenChange={vi.fn()} item={mockItem} onConfirm={vi.fn()} />
    );
    const cancel = screen.getByText('Cancel').closest('button');
    expect(cancel?.className).toContain('min-h-[44px]');
  });
});
