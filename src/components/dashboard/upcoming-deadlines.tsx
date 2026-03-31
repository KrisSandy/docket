import type { DisplayStatus } from '@/types';
import { StatusDot } from '@/components/ui/status-dot';
import { getStatusFontWeight } from '@/lib/status';

export interface DeadlineItem {
  id: string;
  title: string;
  daysUntil: number;
  status: DisplayStatus;
  dateLabel: string;
}

interface UpcomingDeadlinesProps {
  items: DeadlineItem[];
  onItemClick?: (id: string) => void;
}

const statusDateClasses: Record<DisplayStatus, string> = {
  ok: 'text-muted-foreground',
  warning: 'text-[var(--status-warning)]',
  urgent: 'text-[var(--status-urgent)]',
  expired: 'text-[var(--status-expired)]',
};

export function UpcomingDeadlines({ items, onItemClick }: UpcomingDeadlinesProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-0.5 rounded-xl border border-border/40 bg-card shadow-xs overflow-hidden">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onItemClick?.(item.id)}
          className={`flex w-full items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-all duration-150 hover:bg-muted/40 active:bg-muted active:scale-[0.99] ${getStatusFontWeight(item.status)} ${index > 0 ? 'border-t border-border/30' : ''}`}
        >
          <StatusDot status={item.status} size="sm" />
          <span className="flex-1 truncate text-[15px]">{item.title}</span>
          <span className={`shrink-0 text-[13px] font-medium ${statusDateClasses[item.status]}`}>{item.dateLabel}</span>
        </button>
      ))}
    </div>
  );
}
