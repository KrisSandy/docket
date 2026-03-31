import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusBanner } from '@/components/dashboard/status-banner';

describe('StatusBanner', () => {
  it('shows all clear message for ok status', () => {
    render(<StatusBanner attentionCount={0} overallStatus="ok" />);
    expect(screen.getByText(/All clear/)).toBeInTheDocument();
  });

  it('shows attention message for warning status with count', () => {
    render(<StatusBanner attentionCount={2} overallStatus="warning" />);
    expect(screen.getByText('2 items need attention')).toBeInTheDocument();
  });

  it('shows singular attention message for 1 item', () => {
    render(<StatusBanner attentionCount={1} overallStatus="warning" />);
    expect(screen.getByText('1 item needs attention')).toBeInTheDocument();
  });

  it('shows attention message for urgent status', () => {
    render(<StatusBanner attentionCount={3} overallStatus="urgent" />);
    expect(screen.getByText('3 items need attention')).toBeInTheDocument();
  });

  it('shows attention message for expired status', () => {
    render(<StatusBanner attentionCount={1} overallStatus="expired" />);
    expect(screen.getByText('1 item needs attention')).toBeInTheDocument();
  });

  it('applies ok background class', () => {
    render(<StatusBanner attentionCount={0} overallStatus="ok" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-[var(--status-ok)]');
  });

  it('applies urgent background class', () => {
    render(<StatusBanner attentionCount={2} overallStatus="urgent" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-[var(--status-urgent)]');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StatusBanner attentionCount={2} overallStatus="warning" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has minimum 44px height touch target', () => {
    render(<StatusBanner attentionCount={0} overallStatus="ok" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('min-h-[44px]');
  });

  it('renders compact layout for ok status', () => {
    render(<StatusBanner attentionCount={0} overallStatus="ok" />);
    // OK status uses compact pill layout with 15px text
    const text = screen.getByText(/All clear/);
    expect(text.className).toContain('text-[15px]');
  });

  it('renders prominent layout for attention statuses', () => {
    render(<StatusBanner attentionCount={2} overallStatus="urgent" />);
    // Attention states use 24px bold hero text
    const text = screen.getByText('2 items need attention');
    expect(text.className).toContain('text-[24px]');
    expect(text.className).toContain('font-bold');
  });

  it('shows "Tap to review" hint for attention statuses', () => {
    render(<StatusBanner attentionCount={1} overallStatus="warning" />);
    expect(screen.getByText('Tap to review')).toBeInTheDocument();
  });
});
