import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const pushMock = vi.fn();
const mockSearchParams = new URLSearchParams('id=item-1');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
  usePathname: () => '/item',
  useParams: () => ({}),
  useSearchParams: () => mockSearchParams,
}));

// Hook mocks — we control what each returns per test via these refs.
const getItemMock = vi.fn();
const getFieldsForItemMock = vi.fn();
const getReminderSummaryMock = vi.fn();
const getHistoryForItemMock = vi.fn();

vi.mock('@/hooks/use-items', () => ({
  useItems: () => ({
    getItem: getItemMock,
    updateItem: vi.fn(),
    clearDismissal: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-item-fields', () => ({
  useItemFields: () => ({
    getFieldsForItem: getFieldsForItemMock,
  }),
}));

vi.mock('@/hooks/use-reminders', () => ({
  useReminders: () => ({
    getReminderSummary: getReminderSummaryMock,
  }),
}));

vi.mock('@/hooks/use-history', () => ({
  useHistory: () => ({
    getHistoryForItem: getHistoryForItemMock,
  }),
}));

vi.mock('@/db/database', () => ({
  db: {
    categories: {
      get: vi.fn().mockResolvedValue({ id: 'cat-1', name: 'Utilities', icon: 'zap' }),
    },
  },
}));

// Keep child components light so the test focuses on loading + error + scroll.
vi.mock('@/components/layout/back-button', () => ({
  BackButton: ({ label }: { label: string }) => <a>{label}</a>,
}));
vi.mock('@/components/items/field-renderer', () => ({
  FieldRenderer: ({ label }: { label: string }) => <div>{label}</div>,
}));
vi.mock('@/components/items/status-badge', () => ({
  StatusBadge: () => <span>status</span>,
}));
vi.mock('@/components/items/item-edit-mode', () => ({
  ItemEditMode: () => <div>edit mode</div>,
}));
vi.mock('@/components/items/history-timeline', () => ({
  HistoryTimeline: () => <div>history timeline</div>,
}));

import ItemDetailClient from '@/app/(app)/item/item-detail-client';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const okItem = {
  id: 'item-1',
  categoryId: 'cat-1',
  title: 'Electricity',
  status: 'active' as const,
  serviceType: 'electricity',
  dismissedUntil: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function primeHappyPath() {
  getItemMock.mockResolvedValue(okItem);
  getFieldsForItemMock.mockResolvedValue([
    {
      id: 'f1',
      itemId: 'item-1',
      fieldKey: 'provider',
      fieldValue: 'Test Co',
      fieldType: 'text',
      label: 'Provider',
      isTemplateField: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  getReminderSummaryMock.mockResolvedValue([]);
  getHistoryForItemMock.mockResolvedValue([]);
}

describe('ItemDetailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockClear();
    window.scrollTo = vi.fn();
  });

  it('scrolls the window to the top on mount', async () => {
    primeHappyPath();

    render(<ItemDetailClient />);

    // scrollTo(0, 0) must fire on mount, before async data has resolved.
    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  it('renders item content when loadData succeeds', async () => {
    primeHappyPath();

    render(<ItemDetailClient />);

    expect(await screen.findByText('Electricity')).toBeInTheDocument();
    // Field renderer mock echoes field label.
    expect(await screen.findByText('Provider')).toBeInTheDocument();
  });

  it('shows a retryable error state when loadData rejects instead of staying stuck on Loading', async () => {
    // Simulate a Dexie failure in one of the parallel loads — the exact cause
    // observed on the Android webview when opening some items.
    getItemMock.mockRejectedValue(new Error('DexieError: SchemaError'));
    getFieldsForItemMock.mockResolvedValue([]);
    getReminderSummaryMock.mockResolvedValue([]);
    getHistoryForItemMock.mockResolvedValue([]);

    render(<ItemDetailClient />);

    expect(
      await screen.findByText(/Couldn't load this item/i)
    ).toBeInTheDocument();
    expect(screen.getByText('DexieError: SchemaError')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    // Should NOT be stuck on the Loading fallback.
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('recovers from error state on retry', async () => {
    const user = userEvent.setup();

    // First call fails.
    getItemMock.mockRejectedValueOnce(new Error('DexieError: SchemaError'));
    getFieldsForItemMock.mockResolvedValue([]);
    getReminderSummaryMock.mockResolvedValue([]);
    getHistoryForItemMock.mockResolvedValue([]);

    render(<ItemDetailClient />);

    const retry = await screen.findByRole('button', { name: /try again/i });

    // Second call succeeds.
    getItemMock.mockResolvedValueOnce(okItem);
    getFieldsForItemMock.mockResolvedValueOnce([
      {
        id: 'f1',
        itemId: 'item-1',
        fieldKey: 'provider',
        fieldValue: 'Test Co',
        fieldType: 'text',
        label: 'Provider',
        isTemplateField: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await user.click(retry);

    expect(await screen.findByText('Electricity')).toBeInTheDocument();
    expect(screen.queryByText(/Couldn't load this item/i)).not.toBeInTheDocument();
  });

  it('stops loading before navigating away when the item is missing, so we never strand the user on Loading...', async () => {
    getItemMock.mockResolvedValue(undefined);
    getFieldsForItemMock.mockResolvedValue([]);
    getReminderSummaryMock.mockResolvedValue([]);
    getHistoryForItemMock.mockResolvedValue([]);

    render(<ItemDetailClient />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });

    // The loading fallback must not be on screen after the redirect was kicked off.
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
