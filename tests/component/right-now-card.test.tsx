import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RightNowCard } from '@/components/dashboard/right-now-card';

describe('RightNowCard', () => {
  it('shows the attention count and plural copy', () => {
    render(<RightNowCard attentionCount={3} items={[]} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/things need/)).toBeInTheDocument();
  });

  it('uses singular copy for exactly one item', () => {
    render(<RightNowCard attentionCount={1} items={[]} />);
    expect(screen.getByText(/thing needs/)).toBeInTheDocument();
  });

  it('renders the "Right now" caption', () => {
    render(<RightNowCard attentionCount={0} items={[]} />);
    expect(screen.getByText('Right now')).toBeInTheDocument();
  });
});
