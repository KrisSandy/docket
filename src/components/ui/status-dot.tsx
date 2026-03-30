import type { DisplayStatus } from '@/types';

interface StatusDotProps {
  status: DisplayStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
} as const;

const statusColorClasses: Record<DisplayStatus, string> = {
  ok: 'bg-[var(--status-ok)]',
  warning: 'bg-[var(--status-warning)]',
  urgent: 'bg-[var(--status-urgent)]',
  expired: 'bg-[var(--status-expired)]',
};

export function StatusDot({ status, size = 'md', className = '' }: StatusDotProps) {
  return (
    <span
      className={`inline-block rounded-full ${sizeClasses[size]} ${statusColorClasses[status]} ${className}`}
      role="img"
      aria-label={`Status: ${status}`}
    />
  );
}
