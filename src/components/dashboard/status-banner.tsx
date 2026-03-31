'use client';

import { useState, useEffect } from 'react';
import { CircleCheck, AlertTriangle } from 'lucide-react';
import type { DisplayStatus } from '@/types';

interface StatusBannerProps {
  attentionCount: number;
  overallStatus: DisplayStatus;
  onClick?: () => void;
}

const statusMessages: Record<DisplayStatus, (count: number) => string> = {
  ok: () => 'All clear — nothing needs attention',
  warning: (count) => `${count} item${count === 1 ? '' : 's'} need${count === 1 ? 's' : ''} attention`,
  urgent: (count) => `${count} item${count === 1 ? '' : 's'} need${count === 1 ? 's' : ''} attention`,
  expired: (count) => `${count} item${count === 1 ? '' : 's'} need${count === 1 ? 's' : ''} attention`,
};

const statusBgClasses: Record<DisplayStatus, string> = {
  ok: 'bg-[var(--status-ok)]/10',
  warning: 'bg-[var(--status-warning)]/10',
  urgent: 'bg-[var(--status-urgent)]/10',
  expired: 'bg-[var(--status-expired)]/10',
};

const statusTextClasses: Record<DisplayStatus, string> = {
  ok: 'text-[var(--status-ok)]',
  warning: 'text-[var(--status-warning)]',
  urgent: 'text-[var(--status-urgent)]',
  expired: 'text-[var(--status-expired)]',
};

export function StatusBanner({ attentionCount, overallStatus, onClick }: StatusBannerProps) {
  const message = statusMessages[overallStatus](attentionCount);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isCalm = overallStatus === 'ok';

  // Calm state: compact pill with checkmark
  if (isCalm) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-xl px-5 py-3.5 min-h-[44px] text-left transition-all duration-500 ease-out ${statusBgClasses[overallStatus]} ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--status-ok)]/15 ${statusTextClasses[overallStatus]}`}>
            <CircleCheck size={18} strokeWidth={2} />
          </div>
          <p className={`text-[15px] font-semibold ${statusTextClasses[overallStatus]}`}>
            {message}
          </p>
        </div>
      </button>
    );
  }

  // Attention state: bold, prominent hero banner
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-6 py-5 min-h-[44px] text-left shadow-sm transition-all duration-500 ease-out ${statusBgClasses[overallStatus]} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--status-${overallStatus})]/15 ${statusTextClasses[overallStatus]}`}>
          <AlertTriangle size={22} strokeWidth={2} />
        </div>
        <div>
          <p className={`text-[24px] font-bold tracking-tight ${statusTextClasses[overallStatus]}`}>
            {message}
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Tap to review
          </p>
        </div>
      </div>
    </button>
  );
}
