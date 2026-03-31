import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ categoryId: 'cat-2' }),
  useSearchParams: () => new URLSearchParams('name=Utilities'),
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

describe('Utilities Form — Service Type Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows service type picker for Utilities', () => {
    render(<AddItemFormPage />);
    expect(screen.getByText('What type of service?')).toBeInTheDocument();
    expect(screen.getByText('Electricity')).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
    expect(screen.getByText('Broadband')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
  });

  it('does not show form fields until service type is selected', () => {
    render(<AddItemFormPage />);
    // Title input should not appear before selection
    expect(screen.queryByLabelText(/Title/)).not.toBeInTheDocument();
  });

  it('selecting Electricity shows energy-specific fields', async () => {
    const user = userEvent.setup();
    render(<AddItemFormPage />);

    await user.click(screen.getByText('Electricity'));

    // Now the form should be visible with electricity fields
    expect(screen.getByText('MPRN')).toBeInTheDocument();
    expect(screen.getByText('Standing Charge')).toBeInTheDocument();
    expect(screen.getByText('Unit Cost (kWh)')).toBeInTheDocument();
    // Billing Frequency should be a dropdown
    const billingFreqSelect = screen.getByLabelText('Billing Frequency') as HTMLSelectElement;
    expect(billingFreqSelect.tagName).toBe('SELECT');
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    // Shared fields too
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Account Number')).toBeInTheDocument();
  });

  it('selecting Broadband shows connectivity-specific fields', async () => {
    const user = userEvent.setup();
    render(<AddItemFormPage />);

    await user.click(screen.getByText('Broadband'));

    expect(screen.getByText('Download Speed (Mbps)')).toBeInTheDocument();
    expect(screen.getByText('Upload Speed (Mbps)')).toBeInTheDocument();
    expect(screen.getByText('Data Allowance')).toBeInTheDocument();
    expect(screen.getByText('Cancellation Notice Period')).toBeInTheDocument();
  });

  it('selecting Gas shows gas-specific fields', async () => {
    const user = userEvent.setup();
    render(<AddItemFormPage />);

    await user.click(screen.getByText('Gas'));

    expect(screen.getByText('GPRN')).toBeInTheDocument();
    expect(screen.getByText('Standing Charge')).toBeInTheDocument();
    expect(screen.getByText('Billing Frequency')).toBeInTheDocument();
  });
});
