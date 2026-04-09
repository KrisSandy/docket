'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { markMarketingSeen } from '@/lib/first-launch';

interface OpenAppButtonProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Drop-in replacement for the "Open App" / primary CTA links on the
 * marketing page. Renders a real `<a href="/dashboard">` so the
 * pre-rendered HTML is still crawlable and right-click-copyable, but
 * intercepts clicks to persist the has-seen-marketing flag before
 * navigating.
 *
 * On native, this flag ensures the next launch skips the marketing
 * page and opens straight into the dashboard.
 *
 * On web, writing the flag is harmless: each origin/install has its
 * own IndexedDB, so the web flag never affects the native app.
 */
export function OpenAppButton({ children, className }: OpenAppButtonProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, download, etc.) behave normally.
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    e.preventDefault();
    try {
      await markMarketingSeen();
    } catch {
      // Defense-in-depth: never block navigation on a storage failure.
      // The helper already swallows errors, but we retain this guard in
      // case that contract ever changes.
    }
    router.push('/dashboard');
  };

  return (
    <Link href="/dashboard" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
