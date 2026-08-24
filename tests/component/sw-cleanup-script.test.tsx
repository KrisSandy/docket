import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ServiceWorkerCleanupScript } from '@/components/pwa/sw-cleanup-script';

describe('ServiceWorkerCleanupScript', () => {
  it('renders an inline script containing the real cleanup check', () => {
    const { container } = render(<ServiceWorkerCleanupScript />);
    const script = container.querySelector('script#sw-cleanup');

    expect(script).not.toBeNull();
    // Deliberately checks location, not window.Capacitor — see
    // getServiceWorkerCleanupScript for why the bridge-based check isn't
    // reliable enough here.
    expect(script?.innerHTML).toContain('location.hostname');
    expect(script?.innerHTML).toContain('getRegistrations');
    expect(script?.innerHTML).toContain('unregister');
  });
});
