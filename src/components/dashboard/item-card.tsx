import type { DashboardItem } from '@/types';
import { StatusDot } from '@/components/ui/status-dot';
import { getStatusFontWeight } from '@/lib/status';
import { Car, Zap, Home, Wifi, Shield, HelpCircle } from 'lucide-react';

interface ItemCardProps {
  item: DashboardItem;
  onClick?: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  car: <Car size={18} />,
  zap: <Zap size={18} />,
  home: <Home size={18} />,
  wifi: <Wifi size={18} />,
  shield: <Shield size={18} />,
};

function getCategoryIcon(icon: string): React.ReactNode {
  return CATEGORY_ICON_MAP[icon] ?? <HelpCircle size={18} />;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const fontWeight = getStatusFontWeight(item.displayStatus);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 min-h-[44px]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">
          {getCategoryIcon(item.categoryIcon)}
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
