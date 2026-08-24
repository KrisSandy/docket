import { format, addMonths } from 'date-fns';
import type { DisplayStatus } from '@/types';
import { getStatusColor } from '@/lib/status';

const WINDOW_DAYS = 90;
const MONTHS_SHOWN = 4;

export interface DotTimelineItem {
  id: string;
  daysUntilDeadline: number | null;
  displayStatus: DisplayStatus;
}

interface DotTimelineProps {
  items: DotTimelineItem[];
}

/** Plots each item with a deadline across a 90-day window, colored by status. */
export function DotTimeline({ items }: DotTimelineProps) {
  const dots = items.filter(
    (item): item is DotTimelineItem & { daysUntilDeadline: number } =>
      item.daysUntilDeadline !== null
  );
  const months = Array.from({ length: MONTHS_SHOWN }, (_, i) =>
    format(addMonths(new Date(), i), 'MMM')
  );

  return (
    <div className="mt-6">
      <div className="relative h-8.5">
        <div className="absolute left-0 right-0 top-3.75 h-0.75 rounded-full bg-muted" />
        {dots.map((item) => {
          const clampedDays = Math.min(Math.max(item.daysUntilDeadline, 0), WINDOW_DAYS);
          const leftPercent = Math.min((clampedDays / WINDOW_DAYS) * 100, 92);
          return (
            <span
              key={item.id}
              className="absolute top-2.25 h-3.75 w-3.75 rounded-full border-[3px] border-card"
              style={{ left: `${leftPercent}%`, backgroundColor: getStatusColor(item.displayStatus) }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  );
}
