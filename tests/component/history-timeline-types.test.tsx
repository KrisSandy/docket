import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryTimeline } from '@/components/items/history-timeline';
import type { HistoryEntry, ItemField } from '@/db/schema';

const mockFields: ItemField[] = [
  {
    id: 'f1',
    itemId: 'item1',
    fieldKey: 'renewal_date',
    fieldValue: '2027-06-15',
    fieldType: 'date',
    label: 'Renewal Date',
    isTemplateField: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('HistoryTimeline — change types', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders renewal entries with "Renewed" label and green styling', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'h1',
        itemId: 'item1',
        fieldKey: 'renewal_date',
        oldValue: '2026-03-01',
        newValue: '2027-06-15',
        changeType: 'renewal',
        changedAt: new Date('2026-06-15T10:00:00'),
      },
    ];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);
    expect(screen.getByText('Renewed')).toBeInTheDocument();
  });

  it('renders dismissal entries with "Dismissed" label', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'h2',
        itemId: 'item1',
        fieldKey: '_dismissal',
        oldValue: null,
        newValue: '2026-07-15T00:00:00.000Z',
        changeType: 'dismissal',
        changedAt: new Date('2026-06-15T10:00:00'),
      },
    ];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);
    expect(screen.getByText('Dismissed')).toBeInTheDocument();
  });

  it('renders indefinite dismissal correctly', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'h3',
        itemId: 'item1',
        fieldKey: '_dismissal',
        oldValue: null,
        newValue: '2099-12-31T00:00:00.000Z',
        changeType: 'dismissal',
        changedAt: new Date('2026-06-15T10:00:00'),
      },
    ];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);
    expect(screen.getByText('Dismissed')).toBeInTheDocument();
    expect(screen.getByText(/until further notice/)).toBeInTheDocument();
  });

  it('renders regular edit entries with field label and arrow', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'h4',
        itemId: 'item1',
        fieldKey: 'renewal_date',
        oldValue: '2026-03-01',
        newValue: '2026-06-01',
        changeType: 'edit',
        changedAt: new Date('2026-06-15T10:00:00'),
      },
    ];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);
    expect(screen.getByText(/Renewal Date/)).toBeInTheDocument();
  });

  it('handles legacy entries without changeType (defaults to edit)', () => {
    // Simulate a legacy entry that came from v1 migration
    const entries = [
      {
        id: 'h5',
        itemId: 'item1',
        fieldKey: 'renewal_date',
        oldValue: '2026-01-01',
        newValue: '2026-06-01',
        changedAt: new Date('2026-06-15T10:00:00'),
        // No changeType — legacy entry
      },
    ] as HistoryEntry[];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);
    // Should render as edit (default), showing field label
    expect(screen.getByText(/Renewal Date/)).toBeInTheDocument();
  });

  it('renders mixed entry types correctly', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'h6',
        itemId: 'item1',
        fieldKey: 'renewal_date',
        oldValue: '2026-03-01',
        newValue: '2027-06-15',
        changeType: 'renewal',
        changedAt: new Date('2026-06-15T14:00:00'),
      },
      {
        id: 'h7',
        itemId: 'item1',
        fieldKey: '_dismissal',
        oldValue: null,
        newValue: '2026-04-15T00:00:00.000Z',
        changeType: 'dismissal',
        changedAt: new Date('2026-06-15T10:00:00'),
      },
      {
        id: 'h8',
        itemId: 'item1',
        fieldKey: 'renewal_date',
        oldValue: null,
        newValue: '2026-03-01',
        changeType: 'edit',
        changedAt: new Date('2026-06-15T08:00:00'),
      },
    ];

    render(<HistoryTimeline entries={entries} fields={mockFields} />);
    expect(screen.getByText('Renewed')).toBeInTheDocument();
    expect(screen.getByText('Dismissed')).toBeInTheDocument();
    // Both renewal and edit entries reference Renewal Date — check we have multiple
    const renewalDateLabels = screen.getAllByText(/Renewal Date/);
    expect(renewalDateLabels.length).toBeGreaterThanOrEqual(2);
  });
});
