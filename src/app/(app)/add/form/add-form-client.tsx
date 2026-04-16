'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { useItems } from '@/hooks/use-items';
import { useReminders } from '@/hooks/use-reminders';
import { BackButton } from '@/components/layout/back-button';
import { FieldEditor } from '@/components/items/field-editor';
import { ServiceTypePicker } from '@/components/items/service-type-picker';
import { getTemplateFields, hasServiceTypes, getServiceTypes } from '@/lib/templates';
import { getNextBillingDate } from '@/lib/dates';
import type { TemplateField, FieldType, ServiceType, BillingFrequency } from '@/types';
import { BILLING_FREQUENCY_OPTIONS } from '@/types';

interface FormFieldState {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  value: string;
  helperText?: string;
  placeholder?: string;
  options?: readonly string[];
  min?: number;
  max?: number;
  computed?: boolean;
  futureOnly?: boolean;
}

export default function AddItemFormPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = searchParams.get('categoryId') ?? '';
  const categoryName = searchParams.get('name') ?? '';

  const { createItem } = useItems();
  const { createDefaultReminders } = useReminders();

  const [title, setTitle] = useState('');
  const [fieldStates, setFieldStates] = useState<FormFieldState[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Service type state for categories that support it (Utilities)
  const categoryHasServiceTypes = hasServiceTypes(categoryName);
  const availableServiceTypes = getServiceTypes(categoryName);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);

  useEffect(() => {
    const templateFields = getTemplateFields(categoryName, selectedServiceType);
    setFieldStates(
      templateFields.map((tf: TemplateField) => ({
        fieldKey: tf.fieldKey,
        label: tf.label,
        fieldType: tf.fieldType,
        value: '',
        helperText: tf.helperText,
        placeholder: tf.placeholder,
        options: tf.options,
        min: tf.min,
        max: tf.max,
        computed: tf.computed,
        futureOnly: tf.futureOnly,
      }))
    );
  }, [categoryName, selectedServiceType]);

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFieldStates((prev) =>
      prev.map((f) => (f.fieldKey === fieldKey ? { ...f, value } : f))
    );
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Billing day ↔ billing frequency cross-field validation
    const billingFreq = fieldStates.find((f) => f.fieldKey === 'billing_frequency');
    const billingDay = fieldStates.find((f) => f.fieldKey === 'billing_day');

    if (billingFreq && billingDay) {
      const freqSet = billingFreq.value.trim() !== '';
      const dayRaw = billingDay.value.trim();
      const dayNum = parseInt(dayRaw, 10);

      if (freqSet && dayRaw === '') {
        newErrors['billing_day'] = 'Required when billing frequency is set';
      } else if (!freqSet && dayRaw !== '') {
        newErrors['billing_frequency'] = 'Required when billing day is set';
      } else if (dayRaw !== '') {
        if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31) {
          newErrors['billing_day'] = 'Must be a day between 1 and 31';
        }
      }
    }

    // Future-only date validation
    for (const field of fieldStates) {
      if (field.futureOnly && field.value.trim() !== '') {
        const date = new Date(field.value);
        if (!isNaN(date.getTime()) && date < today) {
          newErrors[field.fieldKey] = 'Must be a future date';
        }
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleServiceTypeSelect = (type: ServiceType) => {
    setSelectedServiceType(type);
  };

  /**
   * Auto-compute billing_date from billing_day + billing_frequency.
   */
  const computeBillingDate = (states: FormFieldState[]): FormFieldState[] => {
    const freqField = states.find((f) => f.fieldKey === 'billing_frequency');
    const dayField = states.find((f) => f.fieldKey === 'billing_day');
    const dateField = states.find((f) => f.fieldKey === 'billing_date');

    if (!freqField || !dayField || !dateField) return states;

    const frequency = freqField.value as BillingFrequency;
    const day = parseInt(dayField.value, 10);

    if (
      !frequency ||
      !BILLING_FREQUENCY_OPTIONS.includes(frequency as BillingFrequency) ||
      isNaN(day) ||
      day < 1 ||
      day > 31
    ) {
      return states;
    }

    const nextDate = getNextBillingDate(day, frequency);
    const isoDate = nextDate.toISOString().split('T')[0];

    return states.map((f) =>
      f.fieldKey === 'billing_date' ? { ...f, value: isoDate } : f
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    // Require service type for Utilities
    if (categoryHasServiceTypes && !selectedServiceType) {
      return;
    }

    if (!validateFields()) return;

    setTitleError('');
    setIsSaving(true);

    try {
      // Auto-compute computed fields before saving
      const finalStates = computeBillingDate(fieldStates);

      // Create the item (this also seeds template fields)
      const itemId = await createItem({
        categoryId,
        categoryName,
        title: title.trim(),
        serviceType: selectedServiceType,
      });

      // Update fields with entered values (including computed ones)
      const { db } = await import('@/db/database');
      for (const field of finalStates) {
        if (field.value.trim()) {
          const dbField = await db.itemFields
            .where('[itemId+fieldKey]')
            .equals([itemId, field.fieldKey])
            .first();
          if (dbField) {
            await db.itemFields.update(dbField.id, {
              fieldValue: field.value.trim(),
              updatedAt: new Date(),
            });
          }
        }
      }

      // Create default reminders
      await createDefaultReminders(itemId, categoryName);

      // Navigate to the new item
      router.push(`/item?id=${itemId}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <BackButton href="/add" label="Categories" />

      <h1 className="mt-4 text-[28px] font-bold tracking-tight">
        New {categoryName}
      </h1>

      {/* Service Type Picker (for Utilities) */}
      {categoryHasServiceTypes && (
        <div className="mt-6">
          <p className="mb-3 text-[13px] text-muted-foreground">
            What type of service?
          </p>
          <ServiceTypePicker
            serviceTypes={availableServiceTypes}
            selectedType={selectedServiceType}
            onSelect={handleServiceTypeSelect}
          />
        </div>
      )}

      {/* Show form only after service type is selected (if applicable) */}
      {(!categoryHasServiceTypes || selectedServiceType) && (
        <>
          {/* Title Field */}
          <div className="mt-6">
            <label htmlFor="item-title" className="mb-2 block text-[13px] text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="item-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError('');
              }}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
              placeholder={`e.g., My ${categoryName}`}
              autoFocus={!categoryHasServiceTypes}
            />
            {titleError && (
              <p className="mt-1 text-[13px] text-destructive">{titleError}</p>
            )}
          </div>

          {/* Template Fields — computed fields are hidden (auto-filled on save) */}
          <div className="mt-6 rounded-xl border border-border bg-card px-4">
            {fieldStates
              .filter((field) => !field.computed)
              .map((field) => (
                <FieldEditor
                  key={field.fieldKey}
                  label={field.label}
                  value={field.value}
                  fieldType={field.fieldType}
                  onChange={(value) => handleFieldChange(field.fieldKey, value)}
                  error={fieldErrors[field.fieldKey]}
                  helperText={field.helperText}
                  placeholder={field.placeholder}
                  options={field.options}
                  min={field.min}
                  max={field.max}
                  futureOnly={field.futureOnly}
                />
              ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </>
      )}

      {/* Discard Confirmation */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-[18px] font-semibold">Discard this item?</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">
              You have unsaved changes that will be lost.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => router.push('/add')}
                className="min-h-[44px] rounded-xl bg-destructive px-5 py-3 text-[15px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
