/**
 * Reminder offset options and formatting utilities.
 *
 * Users pick from toggleable day-chips in the reminder sheet.
 */

/**
 * The set of individual day-options available in the reminder sheet.
 * Users can toggle any combination of these.
 */
export const CUSTOM_OFFSET_OPTIONS: readonly number[] = [90, 60, 30, 14, 7, 3, 1];

/**
 * Format an array of offsets into a human-readable summary string.
 * E.g. [30, 7, 1] → "30 days, 7 days, and 1 day before"
 */
export function formatOffsetsSummary(offsets: readonly number[]): string {
  if (offsets.length === 0) return 'No reminders';
  const sorted = [...offsets].sort((a, b) => b - a);
  const parts = sorted.map((d) => `${d} day${d === 1 ? '' : 's'}`);
  if (parts.length === 1) return `${parts[0]} before`;
  if (parts.length === 2) return `${parts[0]} and ${parts[1]} before`;
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]} before`;
}
