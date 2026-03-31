import { BellOff } from 'lucide-react';
import type { DashboardItem, DisplayStatus, KeyField } from '@/types';
import { SERVICE_TYPE_LABELS } from '@/types';
import { StatusDot } from '@/components/ui/status-dot';
import { getStatusFontWeight } from '@/lib/status';
import { CategoryIconBadge } from '@/components/ui/category-icon';
import { SERVICE_TYPE_ICONS } from '@/types';
import { formatEUR } from '@/lib/currency';
import { formatDate } from '@/lib/dates';

interface ItemCardProps {
  item: DashboardItem;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const statusTintClasses: Record<DisplayStatus, string> = {
  ok: '',
  warning: '',
  urgent: '',
  expired: '',
};

function formatKeyFieldValue(field: KeyField): string {
  switch (field.fieldType) {
    case 'currency': {
      const num = parseFloat(field.value);
      return isNaN(num) ? field.value : formatEUR(num);
    }
    case 'date': {
      const date = new Date(field.value);
      return isNaN(date.getTime()) ? field.value : formatDate(date);
    }
    case 'percentage':
      return `${field.value}%`;
    default:
      return field.value;
  }
}

export function ItemCard({ item, onClick, style }: ItemCardProps) {
  const fontWeight = getStatusFontWeight(item.displayStatus);
  const keyFields = item.keyFields ?? [];
  const isDismissed = item.dismissedUntil !== null
    && item.dismissedUntil !== undefined
    && item.dismissedUntil > new Date();

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
      style={style}
      className={`flex w-full flex-col rounded-xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-all duration-150 hover:shadow-md hover:bg-muted/20 active:scale-[0.98] active:shadow-xs min-h-[44px] ${statusTintClasses[item.displayStatus]}`}
    >
      {/* Header: icon + title inline */}
      <div className="flex items-center gap-3.5 min-w-0">
        <CategoryIconBadge icon={displayIcon} size="sm" />
        <h3 className="text-[16px] font-bold leading-tight truncate min-w-0">
          {item.title}
        </h3>
      </div>

      {/* Body — grows to fill space, pushing footer down */}
      <div className="flex-1">
        {/* Subtitle */}
        <p className="mt-1.5 text-[12px] text-muted-foreground truncate">
          {item.subtitle ?? (
            <>
              {item.categoryName}
              {serviceLabel && ` · ${serviceLabel}`}
            </>
          )}
        </p>

        {/* Key fields */}
        {keyFields.length > 0 && (
          <div className="mt-2 grid gap-1.5">
            {keyFields.map((field) => (
              <div key={field.label}>
                <span className="text-[10px] text-muted-foreground/70">
                  {field.label}
                </span>
                <p className="text-[12px] font-medium text-foreground/80 leading-tight">
                  {formatKeyFieldValue(field)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: status dot + deadline — always at bottom */}
      <div className="pt-3 mt-3 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <StatusDot status={item.displayStatus} size="sm" />
          {isDismissed && <BellOff size={10} className="shrink-0 text-muted-foreground/50" />}
          {isDismissed ? (
            <span className="text-[11px] text-muted-foreground/60">
              Snoozed
            </span>
          ) : item.keyDateLabel ? (
            <span className={`text-[11px] ${fontWeight} text-muted-foreground`}>
              {item.keyDateLabel}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
