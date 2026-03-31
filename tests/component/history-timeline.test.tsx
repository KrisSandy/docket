import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryTimeline } from '@/components/items/history-timeline';
import type { HistoryEntry, ItemField } from '@/db/schema';

const mockFields: ItemField[] = [
  {
    id: 'f1',
    itemId: 'item1',
    fieldKey: 'monthly_cost',
    fieldValue: '120',
    fieldType: 'currency',
    label: 'Monthly Cost',
    isTemplateField: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'f2',
    itemId: 'item1',
    fieldKey: 'contract_end',
    fieldValue: '2026-12-01',
    fieldType: 'date',
    label: 'Contract End Date',
    isTemplateField: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('HistoryTimeline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders empty state when no entries', () => {
    render(<HistoryTimeline entries={[]} fields={mockFields} />);
    expect(screen.getByText('No changes recorded yet.')).toBeInTheDocument();
  });

  it('renders history entries with formatted values', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'h1',
        itemId: 'item1',
        fieldKey: 'monthly_cost',
        oldValue: '95',
        newValue: '120',
        changeType: 'edit' as const,
        changedAt: new Date('2026-06-15T10:30:00'),
      },
    ];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);

    // Should show the field label
    expect(screen.getByText(/Monthly Cost/)).toBeInTheDocument();
    // Should format values as currency
    expect(screen.getByText(/€95.00/)).toBeInTheDocument();
    expect(screen.getByText(/€120.00/)).toBeInTheDocument();
  });

  it('groups entries by date', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'h1',
        itemId: 'item1',
        fieldKey: 'monthly_cost',
        oldValue: '95',
        newValue: '110',
        changeType: 'edit' as const,
        changedAt: new Date('2026-06-15T10:00:00'),
      },
      {
        id: 'h2',
        itemId: 'item1',
        fieldKey: 'monthly_cost',
        oldValue: '110',
        newValue: '120',
        changeType: 'edit' as const,
        changedAt: new Date('2026-06-15T14:00:00'),
      },
      {
        id: 'h3',
        itemId: 'item1',
        fieldKey: 'contract_end',
        oldValue: null,
        newValue: '2026-12-01',
        changeType: 'edit' as const,
        changedAt: new Date('2026-06-10T09:00:00'),
      },
    ];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);

    // Should show date headers
    expect(screen.getByText('15 Jun 2026')).toBeInTheDocument();
    expect(screen.getByText('10 Jun 2026')).toBeInTheDocument();
  });

  it('shows (empty) for null values', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'h1',
        itemId: 'item1',
        fieldKey: 'contract_end',
        oldValue: null,
        newValue: '2026-12-01',
        changeType: 'edit' as const,
        changedAt: new Date('2026-06-15T10:00:00'),
      },
    ];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);
    expect(screen.getByText('(empty)')).toBeInTheDocument();
  });
});
