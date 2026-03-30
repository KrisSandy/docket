import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceTypePicker } from '@/components/items/service-type-picker';
import type { ServiceType } from '@/types';

describe('ServiceTypePicker', () => {
  const allTypes: ServiceType[] = [
    'electricity', 'gas', 'broadband', 'mobile', 'tv_streaming', 'water',
  ];

  it('renders all service type options', () => {
    const onSelect = vi.fn();
    render(
      <ServiceTypePicker
        serviceTypes={allTypes}
        selectedType={null}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Electricity')).toBeInTheDocument();
    expect(screen.getByText('Gas')).toBeInTheDocument();
    expect(screen.getByText('Broadband')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
    expect(screen.getByText('TV / Streaming')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
  });

  it('calls onSelect when a service type is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ServiceTypePicker
        serviceTypes={allTypes}
        selectedType={null}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByText('Electricity'));
    expect(onSelect).toHaveBeenCalledWith('electricity');
  });

  it('highlights the selected service type', () => {
    const onSelect = vi.fn();
    render(
      <ServiceTypePicker
        serviceTypes={allTypes}
        selectedType="broadband"
        onSelect={onSelect}
      />
    );

    const broadbandButton = screen.getByText('Broadband').closest('button');
    expect(broadbandButton?.className).toContain('border-primary');
  });
});
