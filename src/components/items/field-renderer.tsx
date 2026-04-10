import type { FieldType } from '@/types';
import { formatEUR } from '@/lib/currency';
import { formatDate, daysUntilDate, formatCountdown } from '@/lib/dates';

interface FieldRendererProps {
  label: string;
  value: string | null;
  fieldType: FieldType;
  className?: string;
  /** Optional trailing element — used to render a reminder button next to date fields. */
  trailing?: React.ReactNode;
}

function formatFieldValue(value: string | null, fieldType: FieldType): string {
  if (value === null || value === '') return '—';

  switch (fieldType) {
    case 'currency': {
      const num = parseFloat(value);
      return isNaN(num) ? value : formatEUR(num);
    }
    case 'date': {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      const days = daysUntilDate(date);
      return `${formatDate(date)} (${formatCountdown(days)})`;
    }
    case 'percentage':
      return `${value}%`;
    case 'url':
      return value;
    case 'number':
    case 'text':
    default:
      return value;
  }
}

export function FieldRenderer({ label, value, fieldType, className = '', trailing }: FieldRendererProps) {
  const formattedValue = formatFieldValue(value, fieldType);
  const isUrl = fieldType === 'url' && value !== null && value !== '';

  return (
    <div className={`flex items-start justify-between py-3 border-b border-border/50 last:border-b-0 ${className}`}>
      <span className="text-[13px] text-muted-foreground shrink-0 pr-4">{label}</span>
      <div className="flex items-center gap-2 min-w-0 max-w-[65%] justify-end">
        {isUrl ? (
          <a
            href={value!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] text-primary truncate text-right"
          >
            {formattedValue}
          </a>
        ) : (
          <span className="text-[15px] text-foreground truncate text-right">
            {formattedValue}
          </span>
        )}
        {trailing}
      </div>
    </div>
  );
}
