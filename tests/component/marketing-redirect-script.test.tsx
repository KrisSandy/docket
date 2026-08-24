import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HAS_SEEN_MARKETING_KEY } from '@/lib/first-launch';
import { MarketingRedirectScript } from '@/components/marketing/marketing-redirect-script';

describe('MarketingRedirectScript', () => {
  it('renders an inline script containing the real redirect check', () => {
    const { container } = render(<MarketingRedirectScript />);
    const script = container.querySelector('script#marketing-redirect');

    expect(script).not.toBeNull();
    expect(script?.innerHTML).toContain(HAS_SEEN_MARKETING_KEY);
    expect(script?.innerHTML).toContain('/dashboard');
    expect(script?.innerHTML).toContain('Capacitor');
  });
});
