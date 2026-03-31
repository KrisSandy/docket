import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ categoryId: 'cat-3' }),
  useSearchParams: () => new URLSearchParams('name=Housing'),
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

import AddItemFormPage from '@/app/(app)/add/form/add-form-client';

describe('Housing Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all Housing template fields', () => {
    render(<AddItemFormPage />);

    expect(screen.getByText('Property Address')).toBeInTheDocument();
    expect(screen.getByText('Mortgage / Landlord')).toBeInTheDocument();
    expect(screen.getByText('Mortgage Account Number')).toBeInTheDocument();
    expect(screen.getByText('Interest Rate')).toBeInTheDocument();
    expect(screen.getByText('Mortgage / Rent Amount')).toBeInTheDocument();
    expect(screen.getByText('Property Tax (LPT) Amount')).toBeInTheDocument();
    expect(screen.getByText('LPT Due Date')).toBeInTheDocument();
    expect(screen.getByText('Fixed Term End Date')).toBeInTheDocument();
    expect(screen.getByText('Tenancy / Lease End Date')).toBeInTheDocument();
  });
});
