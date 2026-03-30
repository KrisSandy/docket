import type { FieldType } from '@/types';
import { formatEUR } from '@/lib/currency';
import { formatDate, daysUntilDate, formatCountdown } from '@/lib/dates';

interface FieldRendererProps {
  label: string;
  value: string | null;
  fieldType: FieldType;
  className?: string;
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

export function FieldRenderer({ label, value, fieldType, className = '' }: FieldRendererProps) {
  const formattedValue = formatFieldValue(value, fieldType);
  const isUrl = fieldType === 'url' && value !== null && value !== '';

  return (
    <div className={`flex items-start justify-between py-3 border-b border-border/50 last:border-b-0 ${className}`}>
      <span className="text-[13px] text-muted-foreground shrink-0 pr-4">{label}</span>
      {isUrl ? (
        <a
          href={value!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] text-primary truncate max-w-[60%] text-right"
        >
          {formattedValue}
        </a>
      ) : (
        <span className="text-[15px] text-foreground truncate max-w-[60%] text-right">
          {formattedValue}
        </span>
      )}
    </div>
  );
}
