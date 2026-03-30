'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus } from 'lucide-react';
import { db } from '@/db/database';
import type { Reminder } from '@/db/schema';
import { useReminders } from '@/hooks/use-reminders';
import { calculateTriggerDate } from '@/lib/notifications';
import { formatDate } from '@/lib/dates';

/** Standard preset intervals offered as toggleable chips */
const PRESET_INTERVALS = [60, 30, 14, 7, 1];

interface ReminderChipsProps {
  itemId: string;
  fieldKey: string;
  fieldLabel: string;
  deadlineDate: Date | null;
  defaultIntervals: number[];
}

export function ReminderChips({
  itemId,
  fieldKey,
  fieldLabel,
  deadlineDate,
  defaultIntervals,
}: ReminderChipsProps) {
  const { toggleReminder, addCustomReminder } = useReminders();
  const [activeIntervals, setActiveIntervals] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDays, setCustomDays] = useState('');

  // Load current reminder state from DB
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const reminders = await db.reminders
        .where('[itemId+fieldKey]')
        .equals([itemId, fieldKey])
        .toArray();

      if (!cancelled) {
        const intervals = new Set(
          reminders.filter((r: Reminder) => r.isEnabled).map((r: Reminder) => r.daysBefore)
        );
        setActiveIntervals(intervals);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [itemId, fieldKey]);

  const handleToggle = useCallback(async (daysBefore: number) => {
    // Optimistic update
    setActiveIntervals((prev) => {
      const next = new Set(prev);
      if (next.has(daysBefore)) {
        next.delete(daysBefore);
      } else {
        next.add(daysBefore);
      }
      return next;
    });

    await toggleReminder(itemId, fieldKey, daysBefore, deadlineDate);
  }, [itemId, fieldKey, deadlineDate, toggleReminder]);

  const handleAddCustom = useCallback(async () => {
    const days = parseInt(customDays, 10);
    if (isNaN(days) || days < 1 || days > 365) return;

    setActiveIntervals((prev) => new Set(prev).add(days));
    setCustomDays('');
    setShowCustomInput(false);

    await addCustomReminder(itemId, fieldKey, days, deadlineDate);
  }, [customDays, itemId, fieldKey, deadlineDate, addCustomReminder]);

  const getNextNotificationDate = useCallback((daysBefore: number): string | null => {
    if (!deadlineDate) return null;
    const triggerDate = calculateTriggerDate(deadlineDate, daysBefore);
    if (!triggerDate) return null;
    return formatDate(triggerDate);
  }, [deadlineDate]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-16 rounded-full bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // Combine presets + any custom intervals not in presets
  const allIntervals = [...new Set([...PRESET_INTERVALS, ...Array.from(activeIntervals)])]
    .sort((a, b) => b - a);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{fieldLabel} reminders</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {allIntervals.map((days) => {
          const isActive = activeIntervals.has(days);
          const isDefault = defaultIntervals.includes(days);
          const nextDate = getNextNotificationDate(days);

          return (
            <button
              key={days}
              onClick={() => handleToggle(days)}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              aria-pressed={isActive}
              aria-label={`Remind ${days} day${days === 1 ? '' : 's'} before${isDefault ? ' (default)' : ''}`}
              title={nextDate ? `Next: ${nextDate}` : undefined}
            >
              <span>{days}d</span>
              {isActive && nextDate && (
                <span className="text-xs opacity-75">· {nextDate}</span>
              )}
            </button>
          );
        })}

        {/* Add custom interval button */}
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 px-4 py-2 text-sm text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            aria-label="Add custom reminder interval"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Custom</span>
          </button>
        ) : (
          <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-primary/30 bg-background px-3 py-1.5">
            <input
              type="number"
              min={1}
              max={365}
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustom();
                if (e.key === 'Escape') setShowCustomInput(false);
              }}
              placeholder="Days"
              className="w-16 bg-transparent text-sm outline-none"
              autoFocus
              aria-label="Custom reminder days before deadline"
            />
            <span className="text-xs text-muted-foreground">days</span>
            <button
              onClick={handleAddCustom}
              className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {!deadlineDate && (
        <p className="text-xs text-muted-foreground">
          Set a date for this field to activate reminders.
        </p>
      )}
    </div>
  );
}
