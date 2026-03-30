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

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-6 py-5 min-h-[44px] text-left transition-colors ${statusBgClasses[overallStatus]}`}
    >
      <p className={`text-[28px] font-bold tracking-tight ${statusTextClasses[overallStatus]}`}>
        {message}
      </p>
    </button>
  );
}
