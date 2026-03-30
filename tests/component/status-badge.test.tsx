import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/items/status-badge';

describe('StatusBadge', () => {
  it('renders OK label for ok status', () => {
    render(<StatusBadge status="ok" />);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders Upcoming label for warning status', () => {
    render(<StatusBadge status="warning" />);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('renders Urgent label for urgent status', () => {
    render(<StatusBadge status="urgent" />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders Expired label for expired status', () => {
    render(<StatusBadge status="expired" />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('applies ok color class', () => {
    render(<StatusBadge status="ok" />);
    const badge = screen.getByText('OK');
    expect(badge.className).toContain('status-ok');
  });

  it('applies urgent color class', () => {
    render(<StatusBadge status="urgent" />);
    const badge = screen.getByText('Urgent');
    expect(badge.className).toContain('status-urgent');
  });
});
