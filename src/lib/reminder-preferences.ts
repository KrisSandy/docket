/**
 * Reminder Preferences — user-configurable defaults for notification
 * timing, offset schedules, and per-category overrides.
 *
 * Stored as a single JSON blob in the Dexie `settings` table under
 * `reminder_preferences`. Cleared automatically by `deleteAllData()`.
 */

import { db } from '@/db/database';
import { DEFAULT_REMINDER_INTERVALS } from '@/constants/defaults';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Persisted shape. Every field is optional on disk — missing fields
 * fall back to compile-time defaults so we never need a schema migration.
 */
export interface ReminderPreferences {
  schemaVersion: 1;

  /**
   * Time of day to fire reminders, in local "HH:mm" 24-hour format.
   * Default: "09:00".
   */
  notifyTimeLocal: string;

  /**
   * Global default offsets (days before deadline) applied to new items.
   * Users can override per-field from the item detail screen.
   */
  defaultOffsets: number[];
}

// ---------------------------------------------------------------------------
// Compile-time defaults
// ---------------------------------------------------------------------------

export const DEFAULT_NOTIFY_TIME = '09:00';
export const DEFAULT_OFFSETS: readonly number[] = [30, 7, 1];
export const SETTINGS_KEY = 'reminder_preferences';

export function getDefaultPreferences(): ReminderPreferences {
  return {
    schemaVersion: 1,
    notifyTimeLocal: DEFAULT_NOTIFY_TIME,
    defaultOffsets: [...DEFAULT_OFFSETS],
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Validate a "HH:mm" string. Returns `true` for well-formed 24-hour
 * times like "09:00", "23:59". Rejects "24:00", "9:00", "25:30", etc.
 */
export function isValidTime(value: string): boolean {
  return TIME_RE.test(value);
}

/**
 * Validate an offsets array. Each entry must be a positive integer ≤ 365.
 * An empty array is valid (means "no reminders").
 */
export function isValidOffsets(offsets: unknown): offsets is number[] {
  if (!Array.isArray(offsets)) return false;
  return offsets.every(
    (n) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 365
  );
}

/**
 * Parse and validate a raw JSON value from the settings table.
 * Returns a fully-populated `ReminderPreferences` — any missing or
 * invalid fields are replaced with their defaults.
 */
export function parsePreferences(raw: unknown): ReminderPreferences {
  const defaults = getDefaultPreferences();

  if (raw === null || raw === undefined || typeof raw !== 'object') {
    return defaults;
  }

  const obj = raw as Record<string, unknown>;

  // notifyTimeLocal
  const time = typeof obj.notifyTimeLocal === 'string' && isValidTime(obj.notifyTimeLocal)
    ? obj.notifyTimeLocal
    : defaults.notifyTimeLocal;

  // defaultOffsets
  const offsets = isValidOffsets(obj.defaultOffsets)
    ? (obj.defaultOffsets as number[])
    : [...defaults.defaultOffsets];

  return {
    schemaVersion: 1,
    notifyTimeLocal: time,
    defaultOffsets: offsets,
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/**
 * Load the user's reminder preferences from Dexie.
 * Returns fully-validated preferences with defaults for missing fields.
 */
export async function loadPreferences(): Promise<ReminderPreferences> {
  try {
    const row = await db.settings.get(SETTINGS_KEY);
    if (!row?.value) return getDefaultPreferences();
    return parsePreferences(JSON.parse(row.value));
  } catch {
    return getDefaultPreferences();
  }
}

/**
 * Persist reminder preferences to Dexie.
 * Validates before writing — invalid fields are replaced with defaults.
 */
export async function savePreferences(prefs: ReminderPreferences): Promise<void> {
  const validated = parsePreferences(prefs);
  await db.settings.put({
    key: SETTINGS_KEY,
    value: JSON.stringify(validated),
  });
}

// ---------------------------------------------------------------------------
// Resolution — "what offsets should I use for this category?"
// ---------------------------------------------------------------------------

/**
 * Resolve the reminder offsets for a given category.
 *
 * Priority:
 *   1. User's global default offsets
 *   2. Legacy `DEFAULT_REMINDER_INTERVALS[categoryName]` hard-coded fallback
 *
 * Per-field overrides are handled at the item level via ReminderChips.
 *
 * Returns a sorted (descending) array of days-before values.
 */
export function resolveOffsets(
  prefs: ReminderPreferences,
  categoryName: string
): number[] {
  // 1. User's global default
  if (prefs.defaultOffsets.length > 0) {
    return [...prefs.defaultOffsets].sort((a, b) => b - a);
  }

  // 2. Legacy fallback
  const legacy = DEFAULT_REMINDER_INTERVALS[categoryName];
  if (legacy) {
    return [...legacy].sort((a, b) => b - a);
  }

  // Nothing at all — return the compile-time default
  return [...DEFAULT_OFFSETS].sort((a, b) => b - a);
}

// ---------------------------------------------------------------------------
// Convenience — read a single field without loading the full object
// ---------------------------------------------------------------------------

/**
 * Load just the notify time. Shorthand for hot-path callers like
 * `calculateTriggerDate` that don't need the full preferences blob.
 */
export async function getNotifyTimeLocal(): Promise<string> {
  const prefs = await loadPreferences();
  return prefs.notifyTimeLocal;
}

/**
 * Parse a "HH:mm" string into hours and minutes.
 * Returns `{ hours: 9, minutes: 0 }` for "09:00".
 * Throws if the input is malformed.
 */
export function parseTime(hhmm: string): { hours: number; minutes: number } {
  if (!isValidTime(hhmm)) {
    throw new Error(`Invalid time format: "${hhmm}". Expected "HH:mm".`);
  }
  const [h, m] = hhmm.split(':').map(Number);
  return { hours: h, minutes: m };
}
