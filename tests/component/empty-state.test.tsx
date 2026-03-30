import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders message text', () => {
    render(<EmptyState message="No items tracked yet. Tap + to add your first." />);
    expect(screen.getByText('No items tracked yet. Tap + to add your first.')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <EmptyState
        message="No items"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <EmptyState
        message="No items"
        icon={<span data-testid="icon">Icon</span>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
