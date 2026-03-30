import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FieldRenderer } from '@/components/items/field-renderer';

describe('FieldRenderer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders text field value', () => {
    render(<FieldRenderer label="Provider" value="Aviva" fieldType="text" />);
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Aviva')).toBeInTheDocument();
  });

  it('renders currency field formatted as EUR', () => {
    render(<FieldRenderer label="Annual Premium" value="1234.56" fieldType="currency" />);
    expect(screen.getByText('Annual Premium')).toBeInTheDocument();
    // formatEUR produces "€1,234.56"
    expect(screen.getByText('€1,234.56')).toBeInTheDocument();
  });

  it('renders date field with countdown', () => {
    render(<FieldRenderer label="NCT Date" value="2026-07-19" fieldType="date" />);
    expect(screen.getByText('NCT Date')).toBeInTheDocument();
    // Should show formatted date and countdown
    expect(screen.getByText(/19 Jul 2026/)).toBeInTheDocument();
    expect(screen.getByText(/34 days/)).toBeInTheDocument();
  });

  it('renders percentage field with % suffix', () => {
    render(<FieldRenderer label="Interest Rate" value="3.5" fieldType="percentage" />);
    expect(screen.getByText('3.5%')).toBeInTheDocument();
  });

  it('renders URL field as link', () => {
    render(<FieldRenderer label="Website" value="https://example.com" fieldType="url" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders dash for null value', () => {
    render(<FieldRenderer label="Provider" value={null} fieldType="text" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders number field value', () => {
    render(<FieldRenderer label="Count" value="42" fieldType="number" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
