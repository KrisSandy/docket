'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { DisplayStatus } from '@/types';

interface SnackbarProps {
  message: string;
  status: DisplayStatus;
  /** Auto-dismiss duration in ms. 0 = no auto-dismiss. Default: 5000 */
  duration?: number;
  /** Called when the snackbar is dismissed (auto or manual) */
  onDismiss?: () => void;
  visible?: boolean;
}

const statusBgClasses: Record<DisplayStatus, string> = {
  ok: 'bg-[var(--status-ok)]',
  warning: 'bg-[var(--status-warning)]',
  urgent: 'bg-[var(--status-urgent)]',
  expired: 'bg-[var(--status-expired)]',
};

export function Snackbar({
  message,
  status,
  duration = 5000,
  onDismiss,
  visible = true,
}: SnackbarProps) {
  const [show, setShow] = useState(false);

  const dismiss = useCallback(() => {
    setShow(false);
    // Wait for exit animation before calling onDismiss
    setTimeout(() => onDismiss?.(), 300);
  }, [onDismiss]);

  useEffect(() => {
    if (!visible) return;
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setShow(true));

    let dismissTimer: ReturnType<typeof setTimeout> | undefined;
    if (duration > 0) {
      dismissTimer = setTimeout(dismiss, duration);
    }

    return () => {
      cancelAnimationFrame(enterTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [visible, duration, dismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl px-4 py-3 shadow-lg transition-all duration-300 ease-out ${statusBgClasses[status]} ${
        show
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} strokeWidth={2} className="shrink-0 text-white" />
        <p className="flex-1 text-[14px] font-semibold text-white">
          {message}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white hover:bg-white/15 active:scale-90"
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
