import { describe, it, expect } from 'vitest';
import { formatCountdown } from '@/lib/dates';

describe('formatCountdown — Sprint 3 extended ranges', () => {
  it('returns "Today" for 0 days', () => {
    expect(formatCountdown(0)).toBe('Today');
  });

  it('returns "in 1 day" for 1 day', () => {
    expect(formatCountdown(1)).toBe('in 1 day');
  });

  it('returns "in 34 days" for 34 days', () => {
    expect(formatCountdown(34)).toBe('in 34 days');
  });

  it('returns "in 59 days" for 59 days (under 60 threshold)', () => {
    expect(formatCountdown(59)).toBe('in 59 days');
  });

  it('returns "in 2 months" for 65 days', () => {
    expect(formatCountdown(65)).toBe('in 2 months');
  });

  it('returns "in 6 months" for 180 days', () => {
    expect(formatCountdown(180)).toBe('in 6 months');
  });

  it('returns "in 1 year" for 400 days', () => {
    expect(formatCountdown(400)).toBe('in 1 year');
  });

  it('returns "in 2 years" for 730 days', () => {
    expect(formatCountdown(730)).toBe('in 2 years');
  });

  it('returns "overdue by 1 day" for -1', () => {
    expect(formatCountdown(-1)).toBe('overdue by 1 day');
  });

  it('returns "overdue by 5 days" for -5', () => {
    expect(formatCountdown(-5)).toBe('overdue by 5 days');
  });

  it('returns "overdue by 3 months" for -90', () => {
    expect(formatCountdown(-90)).toBe('overdue by 3 months');
  });

  it('returns "overdue by 1 year" for -400', () => {
    expect(formatCountdown(-400)).toBe('overdue by 1 year');
  });
});
