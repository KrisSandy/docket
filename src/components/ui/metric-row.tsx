import { formatEUR } from '@/lib/currency';
import { formatDate } from '@/lib/dates';

interface MetricRowProps {
  label: string;
  value: string | null;
  type: 'text' | 'currency' | 'date' | 'number' | 'percentage' | 'url';
  className?: string;
}

function formatValue(value: string | null, type: MetricRowProps['type']): string {
  if (value === null || value === '') return '—';

  switch (type) {
    case 'currency': {
      const num = parseFloat(value);
      return isNaN(num) ? value : formatEUR(num);
    }
    case 'date':
      return formatDate(new Date(value));
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

export function MetricRow({ label, value, type, className = '' }: MetricRowProps) {
  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[15px] font-normal text-foreground">{formatValue(value, type)}</span>
    </div>
  );
}
