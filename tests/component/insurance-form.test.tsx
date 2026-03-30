import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ categoryId: 'cat-4' }),
  useSearchParams: () => new URLSearchParams('name=Insurance'),
}));

vi.mock('@/hooks/use-items', () => ({
  useItems: () => ({
    createItem: vi.fn().mockResolvedValue('item-1'),
  }),
}));

vi.mock('@/hooks/use-reminders', () => ({
  useReminders: () => ({
    createDefaultReminders: vi.fn(),
  }),
}));

vi.mock('@/db/database', () => ({
  db: {
    itemFields: {
      where: () => ({
        equals: () => ({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
    },
  },
}));

import AddItemFormPage from '@/app/(app)/add/[categoryId]/page';

describe('Insurance Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all Insurance template fields', () => {
    render(<AddItemFormPage />);

    expect(screen.getByText('Insurance Type')).toBeInTheDocument();
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Policy Number')).toBeInTheDocument();
    expect(screen.getByText('Annual Premium')).toBeInTheDocument();
    expect(screen.getByText('Cover Amount')).toBeInTheDocument();
    expect(screen.getByText('Excess Amount')).toBeInTheDocument();
    expect(screen.getByText('Payment Frequency')).toBeInTheDocument();
    expect(screen.getByText('Named Insured')).toBeInTheDocument();
    expect(screen.getByText('Broker Name')).toBeInTheDocument();
    expect(screen.getByText('Broker Contact')).toBeInTheDocument();
    expect(screen.getByText('Renewal Date')).toBeInTheDocument();
  });
});
