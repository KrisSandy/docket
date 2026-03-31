'use client';

import { useState, useEffect } from 'react';
import { BellOff, X } from 'lucide-react';
import type { DashboardItem } from '@/types';

type DismissDuration = '7' | '30' | 'indefinite';

interface DismissDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DashboardItem | null;
  onConfirm: (item: DashboardItem, duration: DismissDuration) => void;
}

const DISMISS_OPTIONS: { value: DismissDuration; label: string; description: string }[] = [
  { value: '7', label: '7 days', description: 'Check back next week' },
  { value: '30', label: '30 days', description: 'Check back next month' },
  { value: 'indefinite', label: 'Until I act', description: 'Hide until you renew' },
];

export function DismissDialog({ open, onOpenChange, item, onConfirm }: DismissDialogProps) {
  const [selected, setSelected] = useState<DismissDuration>('7');
  const isAnimating = open;

  // Reset selection when dialog re-opens using React's key-based reset pattern
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    setSelected('7');
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
    onConfirm(item, selected);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Dismiss item">
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
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <BellOff size={22} className="text-muted-foreground" />
        </div>

        {/* Title */}
        <h3 className="text-[18px] font-semibold mb-1">
          Dismiss {item.title}
        </h3>
        <p className="text-[13px] text-muted-foreground mb-5">
          How long would you like to snooze this item?
        </p>

        {/* Duration options */}
        <div className="space-y-2 mb-6">
          {DISMISS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={`flex w-full min-h-[52px] items-center rounded-xl border-2 px-4 py-3 text-left transition-all ${
                selected === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border/60 bg-background hover:border-border'
              }`}
            >
              <div className="flex-1">
                <p className={`text-[15px] ${selected === option.value ? 'font-semibold text-primary' : 'font-medium'}`}>
                  {option.label}
                </p>
                <p className="text-[12px] text-muted-foreground">{option.description}</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 transition-all ${
                  selected === option.value
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                }`}
              >
                {selected === option.value && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

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
            <BellOff size={16} />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export type { DismissDuration };
