import type { HistoryEntry, ItemField } from '@/db/schema';
import { formatDate } from '@/lib/dates';
import { formatEUR } from '@/lib/currency';

interface HistoryTimelineProps {
  entries: HistoryEntry[];
  fields: ItemField[];
}

interface GroupedEntries {
  dateLabel: string;
  entries: HistoryEntry[];
}

function formatHistoryValue(value: string | null, fieldKey: string, fields: ItemField[]): string {
  if (value === null || value === '') return '(empty)';

  const field = fields.find((f) => f.fieldKey === fieldKey);
  if (!field) return value;

  switch (field.fieldType) {
    case 'currency': {
      const num = parseFloat(value);
      return isNaN(num) ? value : formatEUR(num);
    }
    case 'date': {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : formatDate(date);
    }
    case 'percentage':
      return `${value}%`;
    default:
      return value;
  }
}

function getFieldLabel(fieldKey: string, fields: ItemField[]): string {
  return fields.find((f) => f.fieldKey === fieldKey)?.label ?? fieldKey;
}

function groupByDate(entries: HistoryEntry[]): GroupedEntries[] {
  const groups = new Map<string, HistoryEntry[]>();

  for (const entry of entries) {
    const dateKey = formatDate(entry.changedAt);
    const existing = groups.get(dateKey) ?? [];
    existing.push(entry);
    groups.set(dateKey, existing);
  }

  return Array.from(groups.entries()).map(([dateLabel, entries]) => ({
    dateLabel,
    entries,
  }));
}

export function HistoryTimeline({ entries, fields }: HistoryTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-[15px] text-muted-foreground">
        No changes recorded yet.
      </p>
    );
  }

  const grouped = groupByDate(entries);

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.dateLabel}>
          <p className="text-[13px] font-semibold text-muted-foreground mb-2">
            {group.dateLabel}
          </p>
          <div className="space-y-2">
            {group.entries.map((entry) => {
              const label = getFieldLabel(entry.fieldKey, fields);
              const oldVal = formatHistoryValue(entry.oldValue, entry.fieldKey, fields);
              const newVal = formatHistoryValue(entry.newValue, entry.fieldKey, fields);

              return (
                <div
                  key={entry.id}
                  className="rounded-lg border border-border/50 bg-card px-4 py-3"
                >
                  <p className="text-[15px]">
                    <span className="font-semibold">{label}:</span>{' '}
                    <span className="text-muted-foreground">{oldVal}</span>
                    <span className="mx-1.5 text-muted-foreground">&rarr;</span>
                    <span>{newVal}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
