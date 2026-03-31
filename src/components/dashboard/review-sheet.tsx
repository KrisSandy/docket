'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, BellOff, X } from 'lucide-react';
import type { DashboardItem } from '@/types';
import { StatusDot } from '@/components/ui/status-dot';
import { CategoryIcon } from '@/components/ui/category-icon';
import { getStatusFontWeight } from '@/lib/status';

interface ReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DashboardItem[];
  onRenew: (item: DashboardItem) => void;
  onDismiss: (item: DashboardItem) => void;
}

export function ReviewSheet({ open, onOpenChange, items, onRenew, onDismiss }: ReviewSheetProps) {
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  // Derive animation state from open prop — no need for separate state
  const isAnimating = open;

  useEffect(() => {
    if (open) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onOpenChange(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleItemClick = (id: string) => {
    onOpenChange(false);
    router.push(`/item/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Items needing attention">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-card shadow-xl transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-[18px] font-semibold">
            Items needing attention
            <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--status-urgent)]/15 px-1.5 text-[13px] font-bold text-[var(--status-urgent)]">
              {items.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Item list */}
        <div className="overflow-y-auto px-4 pb-24" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[15px] text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-background p-4"
                >
                  {/* Item info — tappable to navigate */}
                  <button
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className="flex w-full items-center gap-3 text-left min-h-[44px]"
                  >
                    <StatusDot status={item.displayStatus} size="sm" />
                    <CategoryIcon icon={item.categoryIcon} size={16} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] truncate ${getStatusFontWeight(item.displayStatus)}`}>
                        {item.title}
                      </p>
                      {item.keyDateLabel && (
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                          {item.keyDateLabel}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pl-10">
                    <button
                      type="button"
                      onClick={() => onRenew(item)}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all active:scale-[0.97]"
                    >
                      <RefreshCw size={14} />
                      Renew
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(item)}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2.5 text-[13px] font-semibold text-muted-foreground transition-all hover:bg-muted/80 active:scale-[0.97]"
                    >
                      <BellOff size={14} />
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
