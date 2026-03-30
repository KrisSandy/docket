/**
 * Default reminder intervals (days before deadline) by category.
 */
export const DEFAULT_REMINDER_INTERVALS: Record<string, number[]> = {
  Vehicle: [60, 30, 14, 7],
  Utilities: [30, 14],
  Housing: [90, 30],
  Connectivity: [30, 14],
  Insurance: [60, 30, 14],
};

/**
 * Status thresholds (days until deadline).
 */
export const STATUS_THRESHOLDS = {
  WARNING: 30,
  URGENT: 7,
} as const;

/**
 * Archive retention period in years.
 */
export const ARCHIVE_RETENTION_YEARS = 3;
