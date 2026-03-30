import type { DashboardItem } from '@/types';
import { SERVICE_TYPE_LABELS } from '@/types';
import { StatusDot } from '@/components/ui/status-dot';
import { getStatusFontWeight } from '@/lib/status';
import { CategoryIcon } from '@/components/ui/category-icon';
import { SERVICE_TYPE_ICONS } from '@/types';

interface ItemCardProps {
  item: DashboardItem;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const fontWeight = getStatusFontWeight(item.displayStatus);

  // Show service type icon if available, otherwise category icon
  const displayIcon = item.serviceType
    ? SERVICE_TYPE_ICONS[item.serviceType]
    : item.categoryIcon;

  const serviceLabel = item.serviceType
    ? SERVICE_TYPE_LABELS[item.serviceType]
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 min-h-[44px]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">
          <CategoryIcon icon={displayIcon} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot status={item.displayStatus} size="sm" />
            <h3 className={`text-[15px] truncate ${fontWeight}`}>
              {item.title}
            </h3>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {item.categoryName}
            {serviceLabel && ` · ${serviceLabel}`}
          </p>
        </div>
        {item.keyDateLabel && (
          <span className={`shrink-0 text-[13px] text-muted-foreground ${fontWeight}`}>
            {item.keyDateLabel}
          </span>
        )}
      </div>
    </button>
  );
}
