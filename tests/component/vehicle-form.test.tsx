import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ categoryId: 'cat-1' }),
  useSearchParams: () => new URLSearchParams('name=Vehicle'),
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

describe('Vehicle Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all Vehicle template fields with helper text', async () => {
    render(<AddItemFormPage />);

    // Core vehicle fields
    expect(screen.getByText('Registration Number')).toBeInTheDocument();
    expect(screen.getByText('Make & Model')).toBeInTheDocument();
    expect(screen.getByText('Year of Manufacture')).toBeInTheDocument();
    expect(screen.getByText('Fuel Type')).toBeInTheDocument();
    expect(screen.getByText('Insurance Provider')).toBeInTheDocument();
    expect(screen.getByText('Policy Number')).toBeInTheDocument();
    expect(screen.getByText('Annual Premium')).toBeInTheDocument();
    expect(screen.getByText('Insurance Excess Amount')).toBeInTheDocument();
    expect(screen.getByText('Motor Tax Due Date')).toBeInTheDocument();
    expect(screen.getByText('NCT Date')).toBeInTheDocument();
    expect(screen.getByText('Insurance Renewal Date')).toBeInTheDocument();
    expect(screen.getByText('Insurer Contact')).toBeInTheDocument();
  });

  it('shows helper text for registration number', () => {
    render(<AddItemFormPage />);
    expect(screen.getByText(/12-D-12345/)).toBeInTheDocument();
  });

  it('shows fuel type as dropdown with options', () => {
    render(<AddItemFormPage />);
    const select = screen.getByLabelText('Fuel Type');
    expect(select.tagName).toBe('SELECT');
    expect(screen.getByText('Petrol')).toBeInTheDocument();
    expect(screen.getByText('Diesel')).toBeInTheDocument();
    expect(screen.getByText('Electric')).toBeInTheDocument();
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
  });

  it('does not show service type picker for Vehicle', () => {
    render(<AddItemFormPage />);
    expect(screen.queryByText('What type of service?')).not.toBeInTheDocument();
  });
});
