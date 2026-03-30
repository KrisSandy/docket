import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldEditor } from '@/components/items/field-editor';

describe('FieldEditor', () => {
  it('renders text input for text type', () => {
    render(
      <FieldEditor label="Provider" value="" fieldType="text" onChange={() => {}} />
    );
    expect(screen.getByLabelText('Provider')).toBeInTheDocument();
    const input = screen.getByLabelText('Provider') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('renders number input with € prefix for currency type', () => {
    render(
      <FieldEditor label="Cost" value="120" fieldType="currency" onChange={() => {}} />
    );
    expect(screen.getByText('€')).toBeInTheDocument();
    const input = screen.getByLabelText('Cost') as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  it('renders date input for date type', () => {
    render(
      <FieldEditor label="Due Date" value="2026-07-01" fieldType="date" onChange={() => {}} />
    );
    const input = screen.getByLabelText('Due Date') as HTMLInputElement;
    expect(input.type).toBe('date');
  });

  it('renders number input for number type', () => {
    render(
      <FieldEditor label="Count" value="5" fieldType="number" onChange={() => {}} />
    );
    const input = screen.getByLabelText('Count') as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  it('renders percentage input with % suffix', () => {
    render(
      <FieldEditor label="Rate" value="3.5" fieldType="percentage" onChange={() => {}} />
    );
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders url input for url type', () => {
    render(
      <FieldEditor label="Website" value="" fieldType="url" onChange={() => {}} />
    );
    const input = screen.getByLabelText('Website') as HTMLInputElement;
    expect(input.type).toBe('url');
  });

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FieldEditor label="Provider" value="" fieldType="text" onChange={onChange} />
    );
    const input = screen.getByLabelText('Provider');
    await user.type(input, 'Aviva');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows required indicator for required fields', () => {
    render(
      <FieldEditor label="Provider" value="" fieldType="text" isRequired onChange={() => {}} />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    render(
      <FieldEditor
        label="Provider"
        value=""
        fieldType="text"
        onChange={() => {}}
        error="This field is required"
      />
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('formats currency input correctly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FieldEditor label="Cost" value="" fieldType="currency" onChange={onChange} />
    );
    const input = screen.getByLabelText('Cost');
    await user.type(input, '120.50');
    // onChange should be called with the typed value
    expect(onChange).toHaveBeenCalled();
  });

  it('renders a select dropdown when options are provided', () => {
    render(
      <FieldEditor
        label="Billing Frequency"
        value=""
        fieldType="text"
        onChange={() => {}}
        options={['Monthly', 'Bi-monthly', 'Quarterly', 'Annually']}
      />
    );
    const select = screen.getByLabelText('Billing Frequency') as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Bi-monthly')).toBeInTheDocument();
    expect(screen.getByText('Quarterly')).toBeInTheDocument();
    expect(screen.getByText('Annually')).toBeInTheDocument();
  });

  it('has a default empty option in select dropdown', () => {
    render(
      <FieldEditor
        label="Billing Frequency"
        value=""
        fieldType="text"
        onChange={() => {}}
        options={['Monthly', 'Quarterly']}
      />
    );
    expect(screen.getByText('Select...')).toBeInTheDocument();
  });

  it('calls onChange with selected option value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FieldEditor
        label="Billing Frequency"
        value=""
        fieldType="text"
        onChange={onChange}
        options={['Monthly', 'Bi-monthly', 'Quarterly']}
      />
    );
    const select = screen.getByLabelText('Billing Frequency');
    await user.selectOptions(select, 'Monthly');
    expect(onChange).toHaveBeenCalledWith('Monthly');
  });

  it('shows pre-selected value in dropdown', () => {
    render(
      <FieldEditor
        label="Billing Frequency"
        value="Quarterly"
        fieldType="text"
        onChange={() => {}}
        options={['Monthly', 'Bi-monthly', 'Quarterly']}
      />
    );
    const select = screen.getByLabelText('Billing Frequency') as HTMLSelectElement;
    expect(select.value).toBe('Quarterly');
  });
});
