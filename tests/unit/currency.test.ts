import { describe, it, expect } from 'vitest';
import { formatEUR, parseEUR } from '@/lib/currency';

describe('formatEUR', () => {
  it('formats whole number', () => {
    expect(formatEUR(1234)).toBe('€1,234.00');
  });

  it('formats decimal', () => {
    expect(formatEUR(1234.56)).toBe('€1,234.56');
  });

  it('formats zero', () => {
    expect(formatEUR(0)).toBe('€0.00');
  });

  it('formats small amount', () => {
    expect(formatEUR(0.5)).toBe('€0.50');
  });

  it('formats large amount', () => {
    expect(formatEUR(123456.78)).toBe('€123,456.78');
  });
});

describe('parseEUR', () => {
  it('parses formatted currency string', () => {
    expect(parseEUR('€1,234.56')).toBe(1234.56);
  });

  it('parses plain number string', () => {
    expect(parseEUR('1234.56')).toBe(1234.56);
  });

  it('parses integer string', () => {
    expect(parseEUR('1234')).toBe(1234);
  });

  it('parses string with only euro sign', () => {
    expect(parseEUR('€500')).toBe(500);
  });

  it('returns NaN for non-numeric string', () => {
    expect(parseEUR('abc')).toBeNaN();
  });
});

describe('formatEUR and parseEUR round-trip', () => {
  it('round-trips correctly', () => {
    const original = 1234.56;
    const formatted = formatEUR(original);
    const parsed = parseEUR(formatted);
    expect(parsed).toBe(original);
  });

  it('round-trips zero', () => {
    expect(parseEUR(formatEUR(0))).toBe(0);
  });

  it('round-trips large amount', () => {
    const original = 99999.99;
    expect(parseEUR(formatEUR(original))).toBe(original);
  });
});
