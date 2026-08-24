import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from '@/components/items/progress-ring';

// Note: the ring's fill is a conic-gradient() background, which jsdom's CSSOM
// doesn't parse (React writes inline styles through jsdom's style setter, which
// silently drops unsupported values). The percent-fill math itself is covered
// by exercising it through real days-remaining inputs and asserting on what
// jsdom *can* observe — element sizing and children — rather than the
// generated gradient string.

describe('ProgressRing', () => {
  it('renders its children inside the ring', () => {
    render(
      <ProgressRing daysRemaining={5} color="red" trackColor="pink" innerColor="white">
        <span>5 days</span>
      </ProgressRing>
    );
    expect(screen.getByText('5 days')).toBeInTheDocument();
  });

  it('sizes the outer ring and inner circle from props', () => {
    const { container } = render(
      <ProgressRing
        daysRemaining={5}
        color="red"
        trackColor="pink"
        innerColor="white"
        size={120}
        innerSize={90}
      >
        <span />
      </ProgressRing>
    );
    const ring = container.firstElementChild as HTMLElement;
    const inner = ring.firstElementChild as HTMLElement;
    expect(ring.style.width).toBe('120px');
    expect(ring.style.height).toBe('120px');
    expect(inner.style.width).toBe('90px');
    expect(inner.style.height).toBe('90px');
  });

  it('falls back to the default 104px/82px sizing when not specified', () => {
    const { container } = render(
      <ProgressRing daysRemaining={5} color="red" trackColor="pink" innerColor="white">
        <span />
      </ProgressRing>
    );
    const ring = container.firstElementChild as HTMLElement;
    const inner = ring.firstElementChild as HTMLElement;
    expect(ring.style.width).toBe('104px');
    expect(inner.style.width).toBe('82px');
  });
});
