'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Plus } from 'lucide-react';
import { db } from '@/db/database';
import type { Reminder } from '@/db/schema';
import { useReminders } from '@/hooks/use-reminders';
import { ReminderPresetSheet } from '@/components/settings/reminder-preset-sheet';
import {
  formatOffsetsSummary,
} from '@/constants/reminder-presets';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DateReminderButtonProps {
  itemId: string;
  fieldKey: string;
  fieldLabel: string;
  deadlineDate: Date | null;
  /** Called after reminders are changed so the parent can refresh. */
  onChange?: () => void;
}

// ---------------------------------------------------------------------------
// Sentinel detection
// ---------------------------------------------------------------------------

const SENTINEL_DAYS_BEFORE = -1;

function hasSentinel(reminders: Reminder[]): boolean {
  return reminders.some(
    (r) => r.daysBefore === SENTINEL_DAYS_BEFORE && !r.isEnabled
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Compact inline button that sits next to a date field in the item detail view.
 *
 * States:
 *   - No reminders set → shows "+" icon (add reminders)
 *   - Reminders active → shows bell icon with count tooltip
 *   - Sentinel (user chose "None") → shows muted bell-off icon
 *
 * Tapping opens the ReminderPresetSheet to configure this field's reminders.
 */
export function DateReminderButton({
  itemId,
  fieldKey,
  fieldLabel,
  deadlineDate,
  onChange,
}: DateReminderButtonProps) {
  const { disableFieldReminders, setFieldReminders } = useReminders();
  const [activeIntervals, setActiveIntervals] = useState<number[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);

  // Load current state from DB
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const reminders = await db.reminders
        .where('[itemId+fieldKey]')
        .equals([itemId, fieldKey])
        .toArray();

      if (!cancelled) {
        const sentinel = hasSentinel(reminders);
        const enabled = reminders
          .filter((r: Reminder) => r.isEnabled && r.daysBefore >= 0)
          .map((r: Reminder) => r.daysBefore)
          .sort((a, b) => b - a);
        setActiveIntervals(enabled);
        setIsDisabled(sentinel);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [itemId, fieldKey]);

  const handlePresetSelect = useCallback(
    async (offsets: number[]) => {
      setShowSheet(false);

      if (offsets.length === 0) {
        setActiveIntervals([]);
        setIsDisabled(true);
        await disableFieldReminders(itemId, fieldKey);
      } else {
        setActiveIntervals([...offsets].sort((a, b) => b - a));
        setIsDisabled(false);
        await setFieldReminders(itemId, fieldKey, offsets, deadlineDate);
      }

      onChange?.();
    },
    [itemId, fieldKey, deadlineDate, disableFieldReminders, setFieldReminders, onChange]
  );

  if (loading) {
    return <div className="h-8.5 w-16 animate-pulse rounded-full bg-muted" />;
  }

  // Build the tooltip / aria-label
  const ariaLabel = isDisabled
    ? `Reminders off for ${fieldLabel}`
    : activeIntervals.length > 0
      ? `Reminders: ${formatOffsetsSummary(activeIntervals)}`
      : `Add reminders for ${fieldLabel}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowSheet(true)}
        aria-label={ariaLabel}
        title={ariaLabel}
        className="flex h-8.5 shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 text-[12px] font-bold text-muted-foreground transition-colors hover:bg-muted/70"
      >
        {isDisabled ? (
          <>
            <BellOff size={13} />
            Off
          </>
        ) : activeIntervals.length > 0 ? (
          <>
            <Bell size={13} />
            {activeIntervals.join(' · ')}
          </>
        ) : (
          <>
            <Plus size={13} />
            Add
          </>
        )}
      </button>

      {showSheet && (
        <ReminderPresetSheet
          currentOffsets={activeIntervals}
          onSelect={handlePresetSelect}
          onClose={() => setShowSheet(false)}
          title={`${fieldLabel} reminders`}
        />
      )}
    </>
  );
}
