import { differenceInDays, format, startOfDay, addMonths, setDate, getDaysInMonth, isBefore, isEqual } from 'date-fns';
import type { BillingFrequency } from '@/types';

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
 * e.g., 34 → "in 34 days", 1 → "in 1 day", 0 → "Today", -5 → "overdue by 5 days"
 * For longer periods: 65 → "in 2 months", 400 → "in 1 year"
 */
export function formatCountdown(days: number): string {
  if (days === 0) return 'Today';

  if (days > 0) {
    if (days === 1) return 'in 1 day';
    if (days < 60) return `in ${days} days`;
    const months = Math.round(days / 30);
    if (months < 12) return `in ${months} month${months === 1 ? '' : 's'}`;
    const years = Math.round(days / 365);
    return `in ${years} year${years === 1 ? '' : 's'}`;
  }

  // Overdue
  const absDays = Math.abs(days);
  if (absDays === 1) return 'overdue by 1 day';
  if (absDays < 60) return `overdue by ${absDays} days`;
  const months = Math.round(absDays / 30);
  if (months < 12) return `overdue by ${months} month${months === 1 ? '' : 's'}`;
  const years = Math.round(absDays / 365);
  return `overdue by ${years} year${years === 1 ? '' : 's'}`;
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

/**
 * Map billing frequency to the number of months between billing cycles.
 */
function frequencyToMonths(frequency: BillingFrequency): number {
  switch (frequency) {
    case 'Monthly':
      return 1;
    case 'Bi-monthly':
      return 2;
    case 'Quarterly':
      return 3;
    case 'Annually':
      return 12;
  }
}

/**
 * Set the day of month on a date, clamping to the last day of that month
 * if the requested day exceeds the month's length (e.g., day 31 in a 30-day month).
 */
function setDayClamped(date: Date, day: number): Date {
  const maxDay = getDaysInMonth(date);
  return setDate(date, Math.min(day, maxDay));
}

/**
 * Given a billing day (1–31) and frequency, compute the next billing date
 * on or after `from` (defaults to today).
 *
 * Logic:
 * 1. Try the billing day in the current month.
 * 2. If that date is in the past, step forward by frequency interval until
 *    we find a date that is today or in the future.
 *
 * For months shorter than the billing day (e.g., day 31 in April),
 * the date is clamped to the last day of that month.
 */
export function getNextBillingDate(
  dayOfMonth: number,
  frequency: BillingFrequency,
  from: Date = new Date()
): Date {
  const today = startOfDay(from);
  const intervalMonths = frequencyToMonths(frequency);

  // Start from the billing day in the current month
  let candidate = startOfDay(setDayClamped(today, dayOfMonth));

  // If candidate is in the past, jump forward by the frequency interval
  // until we land on today or a future date.
  while (isBefore(candidate, today) && !isEqual(candidate, today)) {
    candidate = startOfDay(setDayClamped(addMonths(candidate, intervalMonths), dayOfMonth));
  }

  return candidate;
}

/**
 * Advance a billing date to the next occurrence after the current one,
 * based on the frequency interval. Used when a billing date has passed
 * to auto-compute the next one.
 */
export function advanceBillingDate(
  currentBillingDate: Date,
  dayOfMonth: number,
  frequency: BillingFrequency
): Date {
  const intervalMonths = frequencyToMonths(frequency);
  const next = addMonths(currentBillingDate, intervalMonths);
  return startOfDay(setDayClamped(next, dayOfMonth));
}
