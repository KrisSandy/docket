import { differenceInDays, format, startOfDay } from 'date-fns';

/**
 * Calculate the number of days from today until the given date.
 * Positive = future, negative = past, 0 = today.
 * Uses startOfDay to avoid timezone/partial-day issues.
 */
export function daysUntilDate(date: Date): number {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return differenceInDays(target, today);
}

/**
 * Format a day count into a human-readable countdown string.
 * e.g., 34 → "34 days", 1 → "1 day", 0 → "Today", -5 → "Expired 5 days ago"
 */
export function formatCountdown(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days > 1) return `${days} days`;
  if (days === -1) return 'Expired 1 day ago';
  return `Expired ${Math.abs(days)} days ago`;
}

/**
 * Format a date to a readable string: "12 Jun 2026"
 */
export function formatDate(date: Date): string {
  return format(date, 'd MMM yyyy');
}

/**
 * Check if a date is in the past (expired).
 */
export function isExpired(date: Date): boolean {
  return daysUntilDate(date) < 0;
}

/**
 * Given an array of date field values (ISO strings), find the earliest upcoming deadline.
 * Returns null if no valid dates found.
 */
export function getEarliestDeadline(dateStrings: (string | null)[]): Date | null {
  const validDates = dateStrings
    .filter((d): d is string => d !== null && d !== '')
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return validDates.length > 0 ? validDates[0] : null;
}
