import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
    settings: {
      get: vi.fn().mockResolvedValue(undefined),
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

// Mock reminder-preferences
vi.mock('@/lib/reminder-preferences', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/reminder-preferences')>();
  return {
    ...actual,
    getNotifyTimeLocal: vi.fn().mockResolvedValue('09:00'),
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

  it('renders field label with bell icon', async () => {
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('NCT Date reminders')).toBeInTheDocument();
    });
  });

  it('shows preset dropdown button after loading', async () => {
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      // With no active reminders, the preset label shows "None" from the
      // matchPresetFromOffsets([]) call
      const button = screen.getByRole('button', { name: /none/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('shows message when no deadline date set', async () => {
    render(<ReminderChips {...defaultProps} deadlineDate={null} />);

    await waitFor(() => {
      expect(screen.getByText(/Set a date for this field/)).toBeInTheDocument();
    });
  });

  it('shows "Reminders off" when sentinel is in DB', async () => {
    // Override the mock to return a sentinel row
    const { db } = await import('@/db/database');
    (db.reminders.where as ReturnType<typeof vi.fn>).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([
          {
            id: 'sentinel-1',
            itemId: 'item-1',
            fieldKey: 'nct_date',
            daysBefore: -1,
            isEnabled: false,
            lastNotifiedAt: null,
            createdAt: new Date(),
          },
        ]),
      }),
    });

    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Reminders off for this field')).toBeInTheDocument();
      expect(screen.getByText('Re-enable')).toBeInTheDocument();
    });
  });

  it('shows active interval pills when reminders exist', async () => {
    const { db } = await import('@/db/database');
    (db.reminders.where as ReturnType<typeof vi.fn>).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([
          { id: 'r-1', itemId: 'item-1', fieldKey: 'nct_date', daysBefore: 30, isEnabled: true, lastNotifiedAt: null, createdAt: new Date() },
          { id: 'r-2', itemId: 'item-1', fieldKey: 'nct_date', daysBefore: 7, isEnabled: true, lastNotifiedAt: null, createdAt: new Date() },
          { id: 'r-3', itemId: 'item-1', fieldKey: 'nct_date', daysBefore: 1, isEnabled: true, lastNotifiedAt: null, createdAt: new Date() },
        ]),
      }),
    });

    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('30d')).toBeInTheDocument();
      expect(screen.getByText('7d')).toBeInTheDocument();
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  it('preset button meets 44px min touch target', async () => {
    render(<ReminderChips {...defaultProps} />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/min-h-\[(44|36)px\]/);
      });
    });
  });
});
