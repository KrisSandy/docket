'use client';

import { useState, useCallback } from 'react';
import {
  CUSTOM_OFFSET_OPTIONS,
  formatOffsetsSummary,
} from '@/constants/reminder-presets';

interface ReminderPresetSheetProps {
  /** Current offsets (empty = none) */
  currentOffsets: number[];
  /** Called when the user saves their selection */
  onSelect: (offsets: number[]) => void;
  /** Close the sheet */
  onClose: () => void;
  /** Optional title override */
  title?: string;
}

export function ReminderPresetSheet({
  currentOffsets,
  onSelect,
  onClose,
  title = 'Reminder schedule',
}: ReminderPresetSheetProps) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(currentOffsets)
  );

  const handleToggle = useCallback((day: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    onSelect([...selected].sort((a, b) => b - a));
  }, [selected, onSelect]);

  const handleNone = useCallback(() => {
    onSelect([]);
  }, [onSelect]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl">
        <h3 className="text-[18px] font-semibold">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Tap to toggle when you want reminders.
        </p>

        {/* Day chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CUSTOM_OFFSET_OPTIONS.map((day) => {
            const isOn = selected.has(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleToggle(day)}
                className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                  isOn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                aria-pressed={isOn}
                aria-label={`${day} day${day === 1 ? '' : 's'} before`}
              >
                {day}d
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <p className="mt-3 text-[13px] text-muted-foreground">
          {selected.size === 0
            ? 'No reminders selected'
            : formatOffsetsSummary([...selected])}
        </p>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={selected.size === 0}
            className="w-full min-h-[44px] rounded-xl bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Save
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNone}
              className="flex-1 min-h-[44px] rounded-xl px-4 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
            >
              No reminders
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] rounded-xl px-4 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
