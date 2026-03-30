import type { DisplayStatus } from '@/types';

interface StatusBadgeProps {
  status: DisplayStatus;
  className?: string;
}

const statusLabels: Record<DisplayStatus, string> = {
  ok: 'OK',
  warning: 'Upcoming',
  urgent: 'Urgent',
  expired: 'Expired',
};

const statusBadgeClasses: Record<DisplayStatus, string> = {
  ok: 'bg-[var(--status-ok)]/15 text-[var(--status-ok)]',
  warning: 'bg-[var(--status-warning)]/15 text-[var(--status-warning)]',
  urgent: 'bg-[var(--status-urgent)]/15 text-[var(--status-urgent)]',
  expired: 'bg-[var(--status-expired)]/15 text-[var(--status-expired)]',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold ${statusBadgeClasses[status]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
