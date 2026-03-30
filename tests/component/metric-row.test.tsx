import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricRow } from '@/components/ui/metric-row';

describe('MetricRow', () => {
  it('renders label and text value', () => {
    render(<MetricRow label="Provider" value="Vodafone" type="text" />);
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Vodafone')).toBeInTheDocument();
  });

  it('formats currency value', () => {
    render(<MetricRow label="Monthly Cost" value="120.50" type="currency" />);
    expect(screen.getByText('Monthly Cost')).toBeInTheDocument();
    expect(screen.getByText('€120.50')).toBeInTheDocument();
  });

  it('formats date value', () => {
    render(<MetricRow label="Due Date" value="2026-06-15" type="date" />);
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('15 Jun 2026')).toBeInTheDocument();
  });

  it('formats percentage value', () => {
    render(<MetricRow label="Rate" value="3.5" type="percentage" />);
    expect(screen.getByText('3.5%')).toBeInTheDocument();
  });

  it('shows dash for null value', () => {
    render(<MetricRow label="Provider" value={null} type="text" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows dash for empty string value', () => {
    render(<MetricRow label="Provider" value="" type="text" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('displays number value as-is', () => {
    render(<MetricRow label="Count" value="42" type="number" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays URL value as-is', () => {
    render(<MetricRow label="Website" value="https://example.com" type="url" />);
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
});
