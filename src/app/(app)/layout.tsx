'use client';

import { useEffect } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { db } from '@/db/database';
import { seedDefaultCategories } from '@/db/seed';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const init = async () => {
      // DEV ONLY: delete and recreate DB to pick up schema/seed changes.
      // Remove this block before production launch.
      await db.delete();
      await db.open();
      await seedDefaultCategories();
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
