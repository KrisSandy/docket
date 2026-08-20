'use client';

import { useEffect } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { LockScreen } from '@/components/layout/lock-screen';
import { NotificationPermissionBanner } from '@/components/layout/notification-permission-banner';
import { useBiometric } from '@/hooks/use-biometric';
import { useNotificationInit } from '@/hooks/use-notification-init';
import { seedDefaultCategories } from '@/db/seed';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLocked, loading, unlock } = useBiometric();

  // Initialize notification system: tap handler, reschedule on launch/foreground
  useNotificationInit();

  useEffect(() => {
    seedDefaultCategories();
  }, []);

  // Show lock screen when biometric is enabled and app is locked
  if (!loading && isLocked) {
    return <LockScreen onUnlock={unlock} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NotificationPermissionBanner />
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
