'use client';

import { useState } from 'react';
import type { FieldType } from '@/types';

interface AddCustomFieldDialogProps {
  onAdd: (label: string, fieldType: FieldType) => void;
  onCancel: () => void;
}

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'currency', label: 'Currency (EUR)' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'url', label: 'URL' },
];

export function AddCustomFieldDialog({ onAdd, onCancel }: AddCustomFieldDialogProps) {
  const [label, setLabel] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim()) {
      onAdd(label.trim(), fieldType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
      >
        <h3 className="text-[18px] font-semibold">Add Custom Field</h3>

        <div className="mt-4">
          <label htmlFor="custom-field-label" className="mb-2 block text-[13px] text-muted-foreground">
            Field Name
          </label>
          <input
            id="custom-field-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
            placeholder="e.g., Account Number"
            autoFocus
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="custom-field-type" className="mb-2 block text-[13px] text-muted-foreground">
            Field Type
          </label>
          <select
            id="custom-field-type"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value as FieldType)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
          >
            {FIELD_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!label.trim()}
            className="min-h-[44px] rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Add Field
          </button>
        </div>
      </form>
    </div>
  );
}
