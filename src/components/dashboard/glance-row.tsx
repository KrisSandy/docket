import { memo } from 'react';
import type { DisplayStatus } from '@/types';
import { StatusDot } from '@/components/ui/status-dot';
import { getStatusFontWeight } from '@/lib/status';

interface GlanceRowProps {
  title: string;
  status: DisplayStatus;
  dateLabel: string | null;
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const statusDateClasses: Record<DisplayStatus, string> = {
  ok: 'text-muted-foreground',
  warning: 'text-[var(--status-warning)]',
  urgent: 'text-[var(--status-urgent)]',
  expired: 'text-[var(--status-expired)]',
};

export const GlanceRow = memo(function GlanceRow({
  title,
  status,
  dateLabel,
  icon,
  onClick,
  style,
}: GlanceRowProps) {
  const fontWeight = getStatusFontWeight(status);

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`flex w-full items-center gap-3 px-4 py-3 min-h-[44px] text-left transition-all duration-150 hover:bg-muted/50 active:bg-muted active:scale-[0.99] rounded-lg ${fontWeight}`}
    >
      <StatusDot status={status} size="sm" />
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <span className="flex-1 truncate text-[15px]">{title}</span>
      {dateLabel && (
        <span className={`shrink-0 text-[13px] font-medium ${statusDateClasses[status]}`}>{dateLabel}</span>
      )}
    </button>
  );
});
