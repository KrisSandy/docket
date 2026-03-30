import type { DisplayStatus } from '@/types';

/**
 * Calculate display status based on days until deadline.
 * > 30 days → ok, ≤ 30 → warning, ≤ 7 → urgent, < 0 → expired, null → ok
 */
export function calculateStatus(daysUntilDeadline: number | null): DisplayStatus {
  if (daysUntilDeadline === null) return 'ok';
  if (daysUntilDeadline < 0) return 'expired';
  if (daysUntilDeadline <= 7) return 'urgent';
  if (daysUntilDeadline <= 30) return 'warning';
  return 'ok';
}

/**
 * Get numeric sort priority for a status.
 * Lower number = higher priority (sorts to top).
 */
export function getStatusPriority(status: DisplayStatus): number {
  const priorities: Record<DisplayStatus, number> = {
    expired: 0,
    urgent: 1,
    warning: 2,
    ok: 3,
  };
  return priorities[status];
}

/**
 * Get the CSS variable name for a status color.
 */
export function getStatusColor(status: DisplayStatus): string {
  const colors: Record<DisplayStatus, string> = {
    ok: 'var(--status-ok)',
    warning: 'var(--status-warning)',
    urgent: 'var(--status-urgent)',
    expired: 'var(--status-expired)',
  };
  return colors[status];
}

/**
 * Get the Tailwind font weight class for a status.
 * Urgent and expired items get semibold weight.
 */
export function getStatusFontWeight(status: DisplayStatus): string {
  return status === 'urgent' || status === 'expired' ? 'font-semibold' : 'font-normal';
}
