'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { useItems } from '@/hooks/use-items';
import { useReminders } from '@/hooks/use-reminders';
import { BackButton } from '@/components/layout/back-button';
import { FieldEditor } from '@/components/items/field-editor';
import { getTemplateFields } from '@/lib/templates';
import type { TemplateField, FieldType } from '@/types';

interface FormFieldState {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  value: string;
}

export default function AddItemFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = params.categoryId as string;
  const categoryName = searchParams.get('name') ?? '';

  const { createItem } = useItems();
  const { createDefaultReminders } = useReminders();

  const [title, setTitle] = useState('');
  const [fieldStates, setFieldStates] = useState<FormFieldState[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    const templateFields = getTemplateFields(categoryName);
    setFieldStates(
      templateFields.map((tf: TemplateField) => ({
        fieldKey: tf.fieldKey,
        label: tf.label,
        fieldType: tf.fieldType,
        value: '',
      }))
    );
  }, [categoryName]);

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFieldStates((prev) =>
      prev.map((f) => (f.fieldKey === fieldKey ? { ...f, value } : f))
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError('');
    setIsSaving(true);

    try {
      // Create the item (this also seeds template fields)
      const itemId = await createItem({
        categoryId,
        categoryName,
        title: title.trim(),
      });

      // Update fields with entered values
      const { db } = await import('@/db/database');
      for (const field of fieldStates) {
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
      router.push(`/item/${itemId}`);
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
          autoFocus
        />
        {titleError && (
          <p className="mt-1 text-[13px] text-destructive">{titleError}</p>
        )}
      </div>

      {/* Template Fields */}
      <div className="mt-6 rounded-xl border border-border bg-card px-4">
        {fieldStates.map((field) => (
          <FieldEditor
            key={field.fieldKey}
            label={field.label}
            value={field.value}
            fieldType={field.fieldType}
            onChange={(value) => handleFieldChange(field.fieldKey, value)}
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
