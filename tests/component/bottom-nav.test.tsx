import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { BottomNav } from '@/components/layout/bottom-nav';

describe('BottomNav', () => {
  it('renders Dashboard and Settings tabs', () => {
    render(<BottomNav />);
    expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('highlights active tab (Dashboard)', () => {
    render(<BottomNav />);
    const dashboardTab = screen.getByLabelText('Dashboard');
    expect(dashboardTab.getAttribute('aria-selected')).toBe('true');
  });

  it('has minimum 44px touch targets', () => {
    render(<BottomNav />);
    const tabs = screen.getAllByRole('tab');
    for (const tab of tabs) {
      expect(tab.className).toContain('min-h-[44px]');
      expect(tab.className).toContain('min-w-[44px]');
    }
  });
});
