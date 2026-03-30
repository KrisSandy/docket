/**
 * Default reminder intervals (days before deadline) by category.
 * For Utilities, all service types use the same intervals.
 */
export const DEFAULT_REMINDER_INTERVALS: Record<string, number[]> = {
  Vehicle: [60, 30, 14, 7],
  Utilities: [30, 14],
  Housing: [90, 30, 14],
  Insurance: [60, 30, 14],
};

/**
 * Housing-specific reminder intervals by date field key.
 * Fixed Term End Date gets longer lead time; LPT gets standard.
 */
export const HOUSING_REMINDER_INTERVALS: Record<string, number[]> = {
  fixed_term_end: [90, 30],
  lpt_due_date: [30, 14],
  tenancy_lease_end: [90, 30, 14],
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
