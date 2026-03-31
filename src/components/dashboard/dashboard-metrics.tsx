import { Package, CalendarClock, AlertCircle } from 'lucide-react';
import type { DashboardItem } from '@/types';

interface DashboardMetricsProps {
  items: DashboardItem[];
  attentionCount: number;
  onAttentionTap?: () => void;
}

interface MetricCardData {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  onTap?: () => void;
}

export function DashboardMetrics({ items, attentionCount, onAttentionTap }: DashboardMetricsProps) {
  // Count items due this month
  const dueThisMonth = items.filter((i) => {
    if (i.daysUntilDeadline === null) return false;
    return i.daysUntilDeadline >= 0 && i.daysUntilDeadline <= 30;
  }).length;

  const metrics: MetricCardData[] = [
    {
      label: 'Tracked',
      value: String(items.length),
      icon: <Package size={16} strokeWidth={1.8} />,
      accent: 'text-primary bg-primary/8',
    },
    {
      label: 'Due soon',
      value: String(dueThisMonth),
      icon: <CalendarClock size={16} strokeWidth={1.8} />,
      accent: dueThisMonth > 0
        ? 'text-[var(--status-warning)] bg-[var(--status-warning)]/10'
        : 'text-muted-foreground bg-muted/50',
    },
    {
      label: 'Need action',
      value: String(attentionCount),
      icon: <AlertCircle size={16} strokeWidth={1.8} />,
      accent: attentionCount > 0
        ? 'text-[var(--status-urgent)] bg-[var(--status-urgent)]/10'
        : 'text-muted-foreground bg-muted/50',
      onTap: attentionCount > 0 ? onAttentionTap : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map((metric) => {
        const Tag = metric.onTap ? 'button' : 'div';
        return (
          <Tag
            key={metric.label}
            {...(metric.onTap ? { type: 'button' as const, onClick: metric.onTap } : {})}
            className={`flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card px-3 py-3.5 shadow-xs ${
              metric.onTap ? 'cursor-pointer transition-all active:scale-[0.97]' : ''
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${metric.accent}`}>
              {metric.icon}
            </div>
            <span className="text-[20px] font-bold tracking-tight text-foreground">
              {metric.value}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {metric.label}
            </span>
          </Tag>
        );
      })}
    </div>
  );
}
