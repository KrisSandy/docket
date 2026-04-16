'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import type { DisplayStatus } from '@/types';
import { StatusDot } from '@/components/ui/status-dot';
import { getStatusFontWeight } from '@/lib/status';

export interface DeadlineItem {
  id: string;
  title: string;
  daysUntil: number;
  status: DisplayStatus;
  dateLabel: string;
  /** When true, a "Mark Paid" action is shown — item has a recurring billing cycle. */
  isBillingItem: boolean;
}

interface UpcomingDeadlinesProps {
  items: DeadlineItem[];
  onItemClick?: (id: string) => void;
  /** Called when the user taps "Mark Paid" on a billing item. */
  onMarkPaid?: (id: string) => void;
  /** ID of the item currently being processed (shows a spinner). */
  markingPaidId?: string | null;
}

const statusDateClasses: Record<DisplayStatus, string> = {
  ok: 'text-muted-foreground',
  warning: 'text-[var(--status-warning)]',
  urgent: 'text-[var(--status-urgent)]',
  expired: 'text-[var(--status-expired)]',
};

export function UpcomingDeadlines({
  items,
  onItemClick,
  onMarkPaid,
  markingPaidId = null,
}: UpcomingDeadlinesProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-0.5 rounded-xl border border-border/40 bg-card shadow-xs overflow-hidden">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-stretch ${index > 0 ? 'border-t border-border/30' : ''}`}
        >
          {/* Navigate area — tap to open item detail */}
          <button
            type="button"
            onClick={() => onItemClick?.(item.id)}
            className={`flex flex-1 items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-all duration-150 hover:bg-muted/40 active:bg-muted active:scale-[0.99] ${getStatusFontWeight(item.status)}`}
          >
            <StatusDot status={item.status} size="sm" />
            <span className="flex-1 truncate text-[15px]">{item.title}</span>
            <span className={`shrink-0 text-[13px] font-medium ${statusDateClasses[item.status]}`}>
              {item.dateLabel}
            </span>
          </button>

          {/* Mark Paid action — only for billing items */}
          {item.isBillingItem && (
            <button
              type="button"
              onClick={() => onMarkPaid?.(item.id)}
              disabled={markingPaidId === item.id}
              className="flex items-center justify-center px-3 min-h-[44px] min-w-[52px] border-l border-border/30 text-muted-foreground transition-all duration-150 hover:bg-muted/40 hover:text-primary active:bg-muted active:scale-90 disabled:opacity-50"
              aria-label={`Mark ${item.title} as paid`}
            >
              {markingPaidId === item.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
