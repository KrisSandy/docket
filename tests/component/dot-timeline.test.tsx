import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DotTimeline } from '@/components/dashboard/dot-timeline';

describe('DotTimeline', () => {
  it('renders four month labels starting from the current month', () => {
    render(<DotTimeline items={[]} />);
    // Exactly 4 month abbreviations should be shown, whatever the current month is.
    const labels = screen.getAllByText(/^[A-Z][a-z]{2}$/);
    expect(labels).toHaveLength(4);
  });

  it('renders one dot per item that has a deadline', () => {
    const { container } = render(
      <DotTimeline
        items={[
          { id: '1', daysUntilDeadline: 5, displayStatus: 'urgent' },
          { id: '2', daysUntilDeadline: 40, displayStatus: 'ok' },
          { id: '3', daysUntilDeadline: null, displayStatus: 'ok' },
        ]}
      />
    );
    // Dots are absolutely positioned spans with an inline background-color.
    const dots = container.querySelectorAll('span[style*="background-color"]');
    expect(dots).toHaveLength(2);
  });

  it('clamps an overdue item to the start of the timeline', () => {
    const { container } = render(
      <DotTimeline items={[{ id: '1', daysUntilDeadline: -10, displayStatus: 'expired' }]} />
    );
    const dot = container.querySelector('span[style*="background-color"]') as HTMLElement;
    expect(dot.style.left).toBe('0%');
  });

  it('clamps a far-future item near the end of the timeline', () => {
    const { container } = render(
      <DotTimeline items={[{ id: '1', daysUntilDeadline: 900, displayStatus: 'ok' }]} />
    );
    const dot = container.querySelector('span[style*="background-color"]') as HTMLElement;
    expect(dot.style.left).toBe('92%');
  });
});
