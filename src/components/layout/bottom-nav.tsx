'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Settings, Plus } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: <LayoutDashboard size={19} strokeWidth={1.75} />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings size={19} strokeWidth={1.75} />,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 safe-bottom"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2 rounded-full bg-nav-bg p-2 shadow-lg">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-full text-[14px] font-bold transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'flex-1 bg-nav-pill px-4 text-nav-text'
                  : 'w-12 text-nav-icon-inactive hover:text-nav-text'
              }`}
            >
              {item.icon}
              {isActive && item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => router.push('/add')}
          aria-label="Add new item"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-150 active:scale-90"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}
