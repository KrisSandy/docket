import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { BottomNav } from '@/components/layout/bottom-nav';

describe('BottomNav', () => {
  it('renders Overview and Settings tabs plus an add button', () => {
    render(<BottomNav />);
    expect(screen.getByLabelText('Overview')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Add new item')).toBeInTheDocument();
  });

  it('highlights active tab (Overview) and shows its label', () => {
    render(<BottomNav />);
    const overviewTab = screen.getByLabelText('Overview');
    expect(overviewTab.getAttribute('aria-selected')).toBe('true');
    expect(overviewTab).toHaveTextContent('Overview');
  });

  it('does not show a label for the inactive tab', () => {
    render(<BottomNav />);
    const settingsTab = screen.getByLabelText('Settings');
    expect(settingsTab.getAttribute('aria-selected')).toBe('false');
    expect(settingsTab).not.toHaveTextContent('Settings');
  });

  it('has at least 44px-equivalent touch targets on every tab', () => {
    render(<BottomNav />);
    const tabs = screen.getAllByRole('tab');
    for (const tab of tabs) {
      // min-h-12 = 48px, comfortably over the 44px minimum
      expect(tab.className).toMatch(/min-h-12/);
    }
  });

  it('navigates to /add when the add button is clicked', async () => {
    const user = userEvent.setup();
    render(<BottomNav />);
    await user.click(screen.getByLabelText('Add new item'));
    expect(pushMock).toHaveBeenCalledWith('/add');
  });
});
