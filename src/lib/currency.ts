/**
 * Format a number as EUR currency: €1,234.56
 */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse a EUR currency string back to a number.
 * Handles: "€1,234.56", "1234.56", "€1234", etc.
 * Returns NaN if unparseable.
 */
export function parseEUR(value: string): number {
  const cleaned = value.replace(/[€,\s]/g, '');
  const num = parseFloat(cleaned);
  return num;
}
