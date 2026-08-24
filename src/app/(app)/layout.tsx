'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/layout/bottom-nav';
import { LockScreen } from '@/components/layout/lock-screen';
import { NotificationPermissionBanner } from '@/components/layout/notification-permission-banner';
import { useBiometric } from '@/hooks/use-biometric';
import { useNotificationInit } from '@/hooks/use-notification-init';
import { useHardwareBackButton } from '@/hooks/use-hardware-back-button';
import { seedDefaultCategories } from '@/db/seed';

/** Top-level tab routes that show the floating pill nav. Drill-in screens
 * (item detail, add flow) hide it in favor of a full-bleed back button. */
const NAV_ROUTES = ['/dashboard', '/settings'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLocked, loading, unlock } = useBiometric();
  const pathname = usePathname();
  const showNav = NAV_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));

  // Initialize notification system: tap handler, reschedule on launch/foreground
  useNotificationInit();

  // Route the Android hardware/gesture back button through in-app navigation
  useHardwareBackButton();

  useEffect(() => {
    seedDefaultCategories();
  }, []);

  // Show lock screen when biometric is enabled and app is locked
  if (!loading && isLocked) {
    return <LockScreen onUnlock={unlock} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NotificationPermissionBanner />
      <main
        className={`mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-6 ${showNav ? 'pb-28' : 'pb-6'}`}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
