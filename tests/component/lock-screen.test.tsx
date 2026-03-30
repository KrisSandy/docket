import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LockScreen } from '@/components/layout/lock-screen';

describe('LockScreen', () => {
  let mockOnUnlock: ReturnType<typeof vi.fn<() => Promise<boolean>>>;

  beforeEach(() => {
    mockOnUnlock = vi.fn<() => Promise<boolean>>();
  });

  it('renders the lock screen with app name', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);

    expect(screen.getByText('HomeDocket')).toBeInTheDocument();
    expect(screen.getByText('Unlock to view your data')).toBeInTheDocument();
  });

  it('renders unlock button', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);

    expect(screen.getByRole('button', { name: /unlock/i })).toBeInTheDocument();
  });

  it('has correct aria attributes for modal', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'App locked');
  });

  it('calls onUnlock when unlock button is clicked', async () => {
    mockOnUnlock.mockResolvedValue(true);
    const user = userEvent.setup();

    render(<LockScreen onUnlock={mockOnUnlock} />);
    await user.click(screen.getByRole('button', { name: /unlock/i }));

    expect(mockOnUnlock).toHaveBeenCalledTimes(1);
  });

  it('shows "Verifying..." while authenticating', async () => {
    let resolveAuth!: (value: boolean) => void;
    mockOnUnlock.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveAuth = resolve;
      })
    );
    const user = userEvent.setup();

    render(<LockScreen onUnlock={mockOnUnlock} />);
    await user.click(screen.getByRole('button', { name: /unlock/i }));

    expect(screen.getByText('Verifying...')).toBeInTheDocument();

    resolveAuth(true);
    await waitFor(() => {
      expect(screen.queryByText('Verifying...')).not.toBeInTheDocument();
    });
  });

  it('shows error message on authentication failure', async () => {
    mockOnUnlock.mockResolvedValue(false);
    const user = userEvent.setup();

    render(<LockScreen onUnlock={mockOnUnlock} />);
    await user.click(screen.getByRole('button', { name: /unlock/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Authentication failed');
    });
  });

  it('clears error when retrying', async () => {
    mockOnUnlock.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const user = userEvent.setup();

    render(<LockScreen onUnlock={mockOnUnlock} />);

    // First attempt fails
    await user.click(screen.getByRole('button', { name: /unlock/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Second attempt succeeds
    await user.click(screen.getByRole('button', { name: /unlock/i }));
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('shows helpful hint text about biometric methods', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);

    expect(screen.getByText(/Face ID, Touch ID, or your device passcode/)).toBeInTheDocument();
  });
});
