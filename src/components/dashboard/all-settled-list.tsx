import type { DashboardItem } from '@/types';
import { CategoryIcon, CATEGORY_ACCENTS, DEFAULT_ACCENT } from '@/components/ui/category-icon';
import { formatDateShort } from '@/lib/dates';

interface AllSettledListProps {
  items: DashboardItem[];
  onItemClick: (id: string) => void;
}

/** A single quiet card listing every item that's currently in good standing. */
export function AllSettledList({ items, onItemClick }: AllSettledListProps) {
  return (
    <div className="divide-y divide-border/50 overflow-hidden rounded-lg bg-card shadow-sm">
      {items.map((item) => {
        const accent = CATEGORY_ACCENTS[item.categoryIcon] ?? DEFAULT_ACCENT;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item.id)}
            className="flex w-full items-center gap-3.5 p-3.5 text-left"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}
            >
              <CategoryIcon icon={item.categoryIcon} size={17} />
            </span>
            <span className="flex-1 truncate text-[15px] font-medium text-foreground">
              {item.title}
            </span>
            <span className="shrink-0 text-[13px] font-medium text-muted-foreground">
              {item.earliestDeadline ? formatDateShort(item.earliestDeadline) : '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
