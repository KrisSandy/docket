import type { DisplayStatus } from '@/types';
import { StatusDot } from '@/components/ui/status-dot';
import { getStatusFontWeight } from '@/lib/status';

interface GlanceRowProps {
  title: string;
  status: DisplayStatus;
  dateLabel: string | null;
  onClick?: () => void;
}

export function GlanceRow({ title, status, dateLabel, onClick }: GlanceRowProps) {
  const fontWeight = getStatusFontWeight(status);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-colors hover:bg-muted/50 active:bg-muted rounded-lg ${fontWeight}`}
    >
      <StatusDot status={status} size="sm" />
      <span className="flex-1 truncate text-[15px]">{title}</span>
      {dateLabel && (
        <span className="shrink-0 text-[13px] text-muted-foreground">{dateLabel}</span>
      )}
    </button>
  );
}
