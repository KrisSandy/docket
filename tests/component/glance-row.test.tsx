import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlanceRow } from '@/components/dashboard/glance-row';

describe('GlanceRow', () => {
  it('renders title and date label', () => {
    render(<GlanceRow title="Car Insurance" status="ok" dateLabel="34 days" />);
    expect(screen.getByText('Car Insurance')).toBeInTheDocument();
    expect(screen.getByText('34 days')).toBeInTheDocument();
  });

  it('renders status dot with correct label', () => {
    render(<GlanceRow title="NCT" status="urgent" dateLabel="5 days" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Status: urgent');
  });

  it('applies font-semibold for urgent status', () => {
    render(<GlanceRow title="NCT" status="urgent" dateLabel="5 days" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('font-semibold');
  });

  it('applies font-normal for ok status', () => {
    render(<GlanceRow title="WiFi" status="ok" dateLabel="90 days" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('font-normal');
  });

  it('hides date label when null', () => {
    render(<GlanceRow title="WiFi" status="ok" dateLabel={null} />);
    expect(screen.queryByText('days')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GlanceRow title="NCT" status="ok" dateLabel="34 days" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has minimum 44px height for touch target', () => {
    render(<GlanceRow title="Test" status="ok" dateLabel="5 days" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('min-h-[44px]');
  });
});
