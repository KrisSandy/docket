'use client';

import type { FieldType } from '@/types';

interface FieldEditorProps {
  label: string;
  value: string;
  fieldType: FieldType;
  isRequired?: boolean;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options?: readonly string[];
}

export function FieldEditor({
  label,
  value,
  fieldType,
  isRequired = false,
  onChange,
  error,
  helperText,
  placeholder,
  options,
}: FieldEditorProps) {
  const inputId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const commonClasses =
    'w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]';

  const renderInput = () => {
    // If options are provided, render a select dropdown regardless of fieldType
    if (options && options.length > 0) {
      return (
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${commonClasses} appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat`}
          required={isRequired}
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")` }}
        >
          <option value="">{placeholder ?? 'Select...'}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    switch (fieldType) {
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
              &euro;
            </span>
            <input
              id={inputId}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`${commonClasses} pl-8`}
              required={isRequired}
              placeholder={placeholder ?? '0.00'}
            />
          </div>
        );

      case 'date':
        return (
          <input
            id={inputId}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
            required={isRequired}
          />
        );

      case 'number':
        return (
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
            required={isRequired}
            placeholder={placeholder ?? '0'}
          />
        );

      case 'percentage':
        return (
          <div className="relative">
            <input
              id={inputId}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="100"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`${commonClasses} pr-8`}
              required={isRequired}
              placeholder={placeholder ?? '0'}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">
              %
            </span>
          </div>
        );

      case 'url':
        return (
          <input
            id={inputId}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
            required={isRequired}
            placeholder={placeholder ?? 'https://'}
          />
        );

      case 'text':
      default:
        return (
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
            required={isRequired}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className="py-3">
      <label htmlFor={inputId} className="mb-2 block text-[13px] text-muted-foreground">
        {label}
        {isRequired && <span className="ml-1 text-destructive">*</span>}
      </label>
      {renderInput()}
      {helperText && !error && (
        <p className="mt-1 text-[13px] text-muted-foreground/70">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-[13px] text-destructive">{error}</p>
      )}
    </div>
  );
}
