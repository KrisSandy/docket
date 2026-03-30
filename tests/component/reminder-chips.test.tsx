import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReminderChips } from '@/components/items/reminder-chips';

// Mock the database
vi.mock('@/db/database', () => ({
  db: {
    reminders: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          filter: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      }),
      add: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

// Mock notifications (no Capacitor in test)
vi.mock('@/lib/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/notifications')>();
  return {
    ...actual,
    scheduleReminder: vi.fn().mockResolvedValue(true),
    cancelReminder: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-001',
}));

describe('ReminderChips', () => {
  const defaultProps = {
    itemId: 'item-1',
    fieldKey: 'nct_date',
    fieldLabel: 'NCT Date',
    deadlineDate: new Date('2026-09-15T00:00:00'),
    defaultIntervals: [60, 30, 14, 7],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders preset chips after loading', async () => {
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('60d')).toBeInTheDocument();
      expect(screen.getByText('30d')).toBeInTheDocument();
      expect(screen.getByText('14d')).toBeInTheDocument();
      expect(screen.getByText('7d')).toBeInTheDocument();
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  it('renders field label with bell icon', async () => {
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('NCT Date reminders')).toBeInTheDocument();
    });
  });

  it('renders custom interval button', async () => {
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  it('chips start in inactive state when no reminders in DB', async () => {
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      const chip60 = screen.getByLabelText(/Remind 60 days before/);
      expect(chip60.getAttribute('aria-pressed')).toBe('false');
    });
  });

  it('shows message when no deadline date set', async () => {
    render(<ReminderChips {...defaultProps} deadlineDate={null} />);

    await waitFor(() => {
      expect(screen.getByText(/Set a date for this field/)).toBeInTheDocument();
    });
  });

  it('shows custom input when custom button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Custom'));

    expect(screen.getByPlaceholderText('Days')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('all chip buttons meet 44px min touch target', async () => {
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      const chips = screen.getAllByRole('button', { pressed: false });
      chips.forEach((chip) => {
        // Check min-h-[44px] class is applied
        expect(chip.className).toMatch(/min-h-\[44px\]/);
      });
    });
  });
});
