'use client';

import { useEffect } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { seedDefaultCategories } from '@/db/seed';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedDefaultCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
