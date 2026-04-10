'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, ChevronDown } from 'lucide-react';
import { db } from '@/db/database';
import type { Reminder } from '@/db/schema';
import { useReminders } from '@/hooks/use-reminders';
import { calculateTriggerDate } from '@/lib/notifications';
import { formatDate } from '@/lib/dates';
import { DEFAULT_NOTIFY_TIME } from '@/lib/reminder-preferences';
import { ReminderPresetSheet } from '@/components/settings/reminder-preset-sheet';
import {
  formatOffsetsSummary,
} from '@/constants/reminder-presets';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReminderChipsProps {
  itemId: string;
  fieldKey: string;
  fieldLabel: string;
  deadlineDate: Date | null;
  defaultIntervals: number[];
}

// ---------------------------------------------------------------------------
// Sentinel detection
// ---------------------------------------------------------------------------

/** The sentinel `daysBefore` value used to mark "user explicitly chose none". */
const SENTINEL_DAYS_BEFORE = -1;

function hasSentinel(reminders: Reminder[]): boolean {
  return reminders.some(
    (r) => r.daysBefore === SENTINEL_DAYS_BEFORE && !r.isEnabled
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReminderChips({
  itemId,
  fieldKey,
  fieldLabel,
  deadlineDate,
}: ReminderChipsProps) {
  const { disableFieldReminders, setFieldReminders } = useReminders();
  const [activeIntervals, setActiveIntervals] = useState<number[]>([]);
  const [isDisabled, setIsDisabled] = useState(false); // sentinel = "None"
  const [loading, setLoading] = useState(true);
  const [notifyTime, setNotifyTime] = useState(DEFAULT_NOTIFY_TIME);
  const [showPresetSheet, setShowPresetSheet] = useState(false);

  // Load current state from DB
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [reminders, timePref] = await Promise.all([
        db.reminders
          .where('[itemId+fieldKey]')
          .equals([itemId, fieldKey])
          .toArray(),
        import('@/lib/reminder-preferences').then((m) => m.getNotifyTimeLocal()),
      ]);

      if (!cancelled) {
        const sentinel = hasSentinel(reminders);
        const enabled = reminders
          .filter((r: Reminder) => r.isEnabled && r.daysBefore >= 0)
          .map((r: Reminder) => r.daysBefore)
          .sort((a, b) => b - a);
        setActiveIntervals(enabled);
        setIsDisabled(sentinel);
        setNotifyTime(timePref);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [itemId, fieldKey]);

  // Handle preset selection from the sheet
  const handlePresetSelect = useCallback(
    async (offsets: number[]) => {
      setShowPresetSheet(false);

      if (offsets.length === 0) {
        // "None" — plant sentinel
        setActiveIntervals([]);
        setIsDisabled(true);
        await disableFieldReminders(itemId, fieldKey);
      } else {
        // Apply the selected offsets
        setActiveIntervals([...offsets].sort((a, b) => b - a));
        setIsDisabled(false);
        await setFieldReminders(itemId, fieldKey, offsets, deadlineDate);
      }
    },
    [itemId, fieldKey, deadlineDate, disableFieldReminders, setFieldReminders]
  );

  // Re-enable from "None" state
  const handleReEnable = useCallback(() => {
    setShowPresetSheet(true);
  }, []);

  // Get next notification date for display
  const getNextDate = useCallback(
    (daysBefore: number): string | null => {
      if (!deadlineDate) return null;
      const triggerDate = calculateTriggerDate(deadlineDate, daysBefore, notifyTime);
      if (!triggerDate) return null;
      return formatDate(triggerDate);
    },
    [deadlineDate, notifyTime]
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-10 w-48 rounded-xl bg-muted" />
      </div>
    );
  }

  // Current label
  const presetLabel = isDisabled
    ? 'None'
    : activeIntervals.length > 0
      ? formatOffsetsSummary(activeIntervals)
      : 'None';

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        {isDisabled ? (
          <BellOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Bell className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{fieldLabel} reminders</span>
      </div>

      {/* Disabled state — "Reminders off for this field" */}
      {isDisabled ? (
        <div className="flex items-center gap-3">
          <p className="text-[13px] text-muted-foreground">
            Reminders off for this field
          </p>
          <button
            type="button"
            onClick={handleReEnable}
            className="min-h-[36px] rounded-lg bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20"
          >
            Re-enable
          </button>
        </div>
      ) : (
        <>
          {/* Preset dropdown button */}
          <button
            type="button"
            onClick={() => setShowPresetSheet(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-[15px] transition-colors hover:bg-muted/30"
          >
            <span className="font-medium">{presetLabel}</span>
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>

          {/* Active interval pills (read-only view of what's scheduled) */}
          {activeIntervals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeIntervals.map((days) => {
                const nextDate = getNextDate(days);
                return (
                  <div
                    key={days}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] text-primary"
                  >
                    <span className="font-medium">{days}d</span>
                    {nextDate && (
                      <span className="text-primary/70">· {nextDate}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No date warning */}
          {!deadlineDate && (
            <p className="text-xs text-muted-foreground">
              Set a date for this field to activate reminders.
            </p>
          )}
        </>
      )}

      {/* Preset selection sheet */}
      {showPresetSheet && (
        <ReminderPresetSheet
          currentOffsets={activeIntervals}
          onSelect={handlePresetSelect}
          onClose={() => setShowPresetSheet(false)}
          title={`${fieldLabel} reminders`}
        />
      )}
    </div>
  );
}
