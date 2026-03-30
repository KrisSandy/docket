import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusDot } from '@/components/ui/status-dot';

describe('StatusDot', () => {
  it('renders with correct aria label for ok status', () => {
    render(<StatusDot status="ok" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Status: ok');
  });

  it('renders with correct aria label for warning status', () => {
    render(<StatusDot status="warning" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Status: warning');
  });

  it('renders with correct aria label for urgent status', () => {
    render(<StatusDot status="urgent" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Status: urgent');
  });

  it('renders with correct aria label for expired status', () => {
    render(<StatusDot status="expired" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Status: expired');
  });

  it('applies ok color class', () => {
    render(<StatusDot status="ok" />);
    const dot = screen.getByRole('img');
    expect(dot.className).toContain('bg-[var(--status-ok)]');
  });

  it('applies warning color class', () => {
    render(<StatusDot status="warning" />);
    const dot = screen.getByRole('img');
    expect(dot.className).toContain('bg-[var(--status-warning)]');
  });

  it('applies urgent color class', () => {
    render(<StatusDot status="urgent" />);
    const dot = screen.getByRole('img');
    expect(dot.className).toContain('bg-[var(--status-urgent)]');
  });

  it('applies expired color class', () => {
    render(<StatusDot status="expired" />);
    const dot = screen.getByRole('img');
    expect(dot.className).toContain('bg-[var(--status-expired)]');
  });

  it('applies sm size class', () => {
    render(<StatusDot status="ok" size="sm" />);
    const dot = screen.getByRole('img');
    expect(dot.className).toContain('h-2');
    expect(dot.className).toContain('w-2');
  });

  it('applies md size class by default', () => {
    render(<StatusDot status="ok" />);
    const dot = screen.getByRole('img');
    expect(dot.className).toContain('h-3');
    expect(dot.className).toContain('w-3');
  });

  it('applies lg size class', () => {
    render(<StatusDot status="ok" size="lg" />);
    const dot = screen.getByRole('img');
    expect(dot.className).toContain('h-4');
    expect(dot.className).toContain('w-4');
  });

  it('applies custom className', () => {
    render(<StatusDot status="ok" className="my-custom-class" />);
    const dot = screen.getByRole('img');
    expect(dot.className).toContain('my-custom-class');
  });
});
