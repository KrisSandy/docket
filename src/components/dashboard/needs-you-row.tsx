import type { DashboardItem } from '@/types';
import { CategoryIcon, CATEGORY_ACCENTS, DEFAULT_ACCENT } from '@/components/ui/category-icon';
import { formatCountdown, formatDateShort } from '@/lib/dates';
import { getStatusColor } from '@/lib/status';

interface NeedsYouRowProps {
  item: DashboardItem;
  onClick: () => void;
  onRenewClick: () => void;
}

/** One row in the Overview screen's "Needs you" list — expired items get a
 * quick "Renew" action, items still counting down show a day count instead. */
export function NeedsYouRow({ item, onClick, onRenewClick }: NeedsYouRowProps) {
  const accent = CATEGORY_ACCENTS[item.categoryIcon] ?? DEFAULT_ACCENT;
  const days = item.daysUntilDeadline;
  const subtitle = [
    days !== null ? formatCountdown(days) : null,
    item.earliestDeadline ? formatDateShort(item.earliestDeadline) : null,
    item.subtitle,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex w-full cursor-pointer items-center gap-3.5 rounded-lg bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
    >
      <span
        className={`flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}
      >
        <CategoryIcon icon={item.categoryIcon} size={21} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[17px] font-semibold tracking-tight text-foreground">
          {item.title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
      {item.displayStatus === 'expired' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRenewClick();
          }}
          className="flex h-9.5 shrink-0 items-center rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground"
        >
          Renew
        </button>
      ) : (
        <span className="flex shrink-0 flex-col items-end">
          <span
            className="font-heading text-[24px] leading-none font-bold tracking-tight"
            style={{ color: getStatusColor(item.displayStatus) }}
          >
            {days !== null ? Math.abs(days) : '—'}
          </span>
          <span className="text-[11px] font-bold text-muted-foreground">days</span>
        </span>
      )}
    </div>
  );
}
