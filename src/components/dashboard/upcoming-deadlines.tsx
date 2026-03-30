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

export function UpcomingDeadlines({ items, onItemClick }: UpcomingDeadlinesProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onItemClick?.(item.id)}
          className={`flex w-full items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-colors hover:bg-muted/50 active:bg-muted rounded-lg ${getStatusFontWeight(item.status)}`}
        >
          <StatusDot status={item.status} size="sm" />
          <span className="flex-1 truncate text-[15px]">{item.title}</span>
          <span className="shrink-0 text-[13px] text-muted-foreground">{item.dateLabel}</span>
        </button>
      ))}
    </div>
  );
}
