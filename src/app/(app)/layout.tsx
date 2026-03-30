'use client';

import { useEffect } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { LockScreen } from '@/components/layout/lock-screen';
import { useBiometric } from '@/hooks/use-biometric';
import { db } from '@/db/database';
import { seedDefaultCategories } from '@/db/seed';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLocked, loading, unlock } = useBiometric();

  useEffect(() => {
    const init = async () => {
      // DEV ONLY: clean up legacy categories from earlier schema.
      // Remove this block before production launch.
      const legacy = await db.categories.where('name').equals('Connectivity').first();
      if (legacy) {
        await db.categories.delete(legacy.id);
      }
      await seedDefaultCategories();
    };
    init();
  }, []);

  // Show lock screen when biometric is enabled and app is locked
  if (!loading && isLocked) {
    return <LockScreen onUnlock={unlock} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
