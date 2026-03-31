'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import type { DashboardItem } from '@/types';
import { formatDate } from '@/lib/dates';

interface RenewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DashboardItem | null;
  onConfirm: (item: DashboardItem, newDate: string) => void;
}

export function RenewDialog({ open, onOpenChange, item, onConfirm }: RenewDialogProps) {
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isAnimating = open;

  // Reset form when dialog re-opens using React's key-based reset pattern
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    setNewDate('');
    setError(null);
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

  useEffect(() => {
    if (open) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onOpenChange(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onOpenChange]);

  if (!open || !item) return null;

  const handleConfirm = () => {
    if (!newDate) {
      setError('Please select a date');
      return;
    }

    const selected = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selected <= today) {
      setError('Date must be in the future');
      return;
    }

    setError(null);
    onConfirm(item, newDate);
  };

  const currentDeadline = item.earliestDeadline
    ? formatDate(item.earliestDeadline)
    : 'No date set';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Renew item">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className={`relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl bg-card p-6 shadow-xl transition-all duration-300 ${
          isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
          aria-label="Close"
        >
          <X size={16} className="text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <RefreshCw size={22} className="text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-[18px] font-semibold mb-1">
          Renew {item.title}
        </h3>
        <p className="text-[13px] text-muted-foreground mb-5">
          Current deadline: {currentDeadline}
        </p>

        {/* Date input */}
        <label className="block mb-4">
          <span className="text-[13px] font-medium text-muted-foreground mb-1.5 block">
            New deadline date
          </span>
          <input
            type="date"
            value={newDate}
            onChange={(e) => {
              setNewDate(e.target.value);
              setError(null);
            }}
            className="w-full min-h-[44px] rounded-lg border border-border bg-background px-4 py-3 text-[15px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {error && (
            <p className="mt-1.5 text-[13px] text-[var(--status-urgent)]">{error}</p>
          )}
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-muted px-4 py-3 text-[15px] font-semibold text-muted-foreground transition-all active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground transition-all active:scale-[0.97]"
          >
            <RefreshCw size={16} />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
