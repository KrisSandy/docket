import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockPush, mockReplace, mockMarkSeen } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockMarkSeen: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    [key: string]: unknown;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/first-launch', () => ({
  markMarketingSeen: () => mockMarkSeen(),
}));

import { OpenAppButton } from '@/components/marketing/open-app-button';

describe('OpenAppButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkSeen.mockResolvedValue(undefined);
  });

  it('renders as a link to /dashboard for SEO and right-click', () => {
    render(<OpenAppButton>Open App</OpenAppButton>);
    const link = screen.getByRole('link', { name: 'Open App' });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('forwards className to the underlying link', () => {
    render(
      <OpenAppButton className="btn-primary custom">Open App</OpenAppButton>
    );
    const link = screen.getByRole('link', { name: 'Open App' });
    expect(link.className).toContain('btn-primary');
    expect(link.className).toContain('custom');
  });

  it('marks marketing as seen and navigates to /dashboard on click', async () => {
    const user = userEvent.setup();
    render(<OpenAppButton>Open App</OpenAppButton>);

    await user.click(screen.getByRole('link', { name: 'Open App' }));

    expect(mockMarkSeen).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('still navigates when marking seen fails (best-effort persistence)', async () => {
    mockMarkSeen.mockRejectedValue(new Error('db down'));
    const user = userEvent.setup();
    render(<OpenAppButton>Open App</OpenAppButton>);

    await user.click(screen.getByRole('link', { name: 'Open App' }));

    expect(mockMarkSeen).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('does not hijack modifier-key clicks (cmd/ctrl/shift open in new tab)', () => {
    render(<OpenAppButton>Open App</OpenAppButton>);
    const link = screen.getByRole('link', { name: 'Open App' });

    // Dispatch a click with metaKey pressed
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      metaKey: true,
      button: 0,
    });
    link.dispatchEvent(event);

    // preventDefault should NOT have been called — the browser should
    // handle this natively and open in a new tab.
    expect(event.defaultPrevented).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockMarkSeen).not.toHaveBeenCalled();
  });
});
