'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Settings } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={24} strokeWidth={1.5} />,
    activeIcon: <LayoutDashboard size={24} strokeWidth={2} />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings size={24} strokeWidth={1.5} />,
    activeIcon: <Settings size={24} strokeWidth={2} />,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_-1px_3px_rgba(0,0,0,0.04)] safe-bottom"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 py-2 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                {isActive ? item.activeIcon : item.icon}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
