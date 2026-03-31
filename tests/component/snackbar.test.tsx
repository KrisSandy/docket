import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Snackbar } from '@/components/ui/snackbar';

describe('Snackbar', () => {
  it('renders message text', () => {
    render(<Snackbar message="1 item needs attention" status="urgent" />);
    expect(screen.getByText('1 item needs attention')).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(<Snackbar message="Test" status="warning" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies urgent background class', () => {
    render(<Snackbar message="Test" status="urgent" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('bg-[var(--status-urgent)]');
  });

  it('applies warning background class', () => {
    render(<Snackbar message="Test" status="warning" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('bg-[var(--status-warning)]');
  });

  it('applies expired background class', () => {
    render(<Snackbar message="Test" status="expired" />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('bg-[var(--status-expired)]');
  });

  it('does not render when visible is false', () => {
    render(<Snackbar message="Hidden" status="urgent" visible={false} />);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Snackbar message="Dismiss me" status="urgent" duration={0} onDismiss={onDismiss} />);

    const dismissBtn = screen.getByLabelText('Dismiss');
    await user.click(dismissBtn);

    // Wait for the exit animation timeout (300ms)
    await vi.waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1);
    }, { timeout: 1000 });
  });

  it('has a dismiss button with accessible label', () => {
    render(<Snackbar message="Test" status="warning" />);
    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
  });

  it('renders plural message correctly', () => {
    render(<Snackbar message="3 items need attention" status="urgent" />);
    expect(screen.getByText('3 items need attention')).toBeInTheDocument();
  });
});
