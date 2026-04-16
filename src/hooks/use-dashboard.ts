import { useCallback, useMemo } from 'react';
import { db } from '@/db/database';
import type { ItemField, Category } from '@/db/schema';
import type { DashboardItem, DisplayStatus } from '@/types';
import { daysUntilDate, getEarliestDeadline, formatCountdown } from '@/lib/dates';
import { calculateStatus, getStatusPriority } from '@/lib/status';
import { getKeyFieldKeys, getSubtitleFieldKeys, getTemplateFields, CARD_SHORT_LABELS } from '@/lib/templates';
import { loadPreferences, resolveOffsets } from '@/lib/reminder-preferences';
import type { ServiceType, KeyField } from '@/types';

export interface DashboardCategory {
  id: string;
  name: string;
  icon: string;
}

export interface DashboardData {
  items: DashboardItem[];
  attentionCount: number;
  overallStatus: DisplayStatus;
  categories: DashboardCategory[];
  upcomingDeadlines: {
    id: string;
    title: string;
    daysUntil: number;
    status: DisplayStatus;
    dateLabel: string;
    /** True when the item has billing_day + billing_frequency + billing_date all set — supports auto-advance on mark paid. */
    isBillingItem: boolean;
  }[];
}

export function useDashboard() {
  const getDashboardData = useCallback(async (): Promise<DashboardData> => {
    // Fetch all active items
    const items = await db.items.where('status').equals('active').toArray();

    // Fetch all categories for lookup
    const categories = await db.categories.toArray();
    const categoryMap = new Map<string, Category>(
      categories.map((c) => [c.id, c])
    );

    // Fetch all fields for all active items
    const itemIds = items.map((i) => i.id);
    const allFields = await db.itemFields
      .where('itemId')
      .anyOf(itemIds)
      .toArray();

    // Group fields by itemId
    const fieldsByItem = new Map<string, ItemField[]>();
    for (const field of allFields) {
      const existing = fieldsByItem.get(field.itemId) ?? [];
      existing.push(field);
      fieldsByItem.set(field.itemId, existing);
    }

    // Build dashboard items
    const dashboardItems: DashboardItem[] = items.map((item) => {
      const category = categoryMap.get(item.categoryId);
      const fields = fieldsByItem.get(item.id) ?? [];

      // Get all date field values
      const dateValues = fields
        .filter((f) => f.fieldType === 'date')
        .map((f) => f.fieldValue);

      const earliestDeadline = getEarliestDeadline(dateValues);
      const daysUntilDeadline = earliestDeadline
        ? daysUntilDate(earliestDeadline)
        : null;
      // Check if item is dismissed (snoozed)
      const isDismissed = item.dismissedUntil !== null
        && item.dismissedUntil !== undefined
        && item.dismissedUntil > new Date();
      const displayStatus = isDismissed ? 'ok' as DisplayStatus : calculateStatus(daysUntilDeadline);

      // Build a key date label
      let keyDateLabel: string | null = null;
      if (daysUntilDeadline !== null) {
        keyDateLabel = formatCountdown(daysUntilDeadline);
      }

      // Build key fields for card detail view
      const catName = category?.name ?? '';
      const highlightKeys = getKeyFieldKeys(catName);
      const templateFieldDefs = getTemplateFields(catName, (item.serviceType as ServiceType) ?? undefined);
      const templateFieldMap = new Map(templateFieldDefs.map((tf) => [tf.fieldKey, tf]));
      const fieldMap = new Map(fields.map((f) => [f.fieldKey, f]));

      const keyFields: KeyField[] = [];
      for (const key of highlightKeys) {
        if (keyFields.length >= 3) break;
        const dbField = fieldMap.get(key);
        if (dbField?.fieldValue) {
          const templateDef = templateFieldMap.get(key);
          const fullLabel = templateDef?.label ?? dbField.label;
          keyFields.push({
            label: CARD_SHORT_LABELS[key] ?? fullLabel,
            value: dbField.fieldValue,
            fieldType: dbField.fieldType,
          });
        }
      }

      // Build contextual subtitle from category-specific fields
      const subtitleKeys = getSubtitleFieldKeys(catName);
      const subtitleParts = subtitleKeys
        .map((key) => fieldMap.get(key)?.fieldValue)
        .filter((v): v is string => !!v && v.trim() !== '');
      const subtitle = subtitleParts.length > 0
        ? subtitleParts.join(' · ')
        : undefined;

      return {
        id: item.id,
        categoryId: item.categoryId,
        categoryName: category?.name ?? 'Unknown',
        categoryIcon: category?.icon ?? 'help-circle',
        title: item.title,
        status: item.status,
        displayStatus,
        earliestDeadline,
        daysUntilDeadline,
        keyDateLabel,
        serviceType: (item.serviceType as ServiceType) ?? null,
        dismissedUntil: item.dismissedUntil ?? null,
        subtitle,
        keyFields,
      };
    });

    // Sort by status priority (expired first), then by days until deadline
    dashboardItems.sort((a, b) => {
      const priorityDiff =
        getStatusPriority(a.displayStatus) - getStatusPriority(b.displayStatus);
      if (priorityDiff !== 0) return priorityDiff;

      // Within same status, sort by days until deadline (ascending — closest first)
      const aDays = a.daysUntilDeadline ?? Infinity;
      const bDays = b.daysUntilDeadline ?? Infinity;
      return aDays - bDays;
    });

    // Calculate attention count (items that are warning, urgent, or expired)
    const attentionCount = dashboardItems.filter(
      (i) => i.displayStatus !== 'ok'
    ).length;

    // Determine overall status (worst status of any item)
    let overallStatus: DisplayStatus = 'ok';
    if (dashboardItems.some((i) => i.displayStatus === 'expired')) {
      overallStatus = 'expired';
    } else if (dashboardItems.some((i) => i.displayStatus === 'urgent')) {
      overallStatus = 'urgent';
    } else if (dashboardItems.some((i) => i.displayStatus === 'warning')) {
      overallStatus = 'warning';
    }

    // Extract unique categories from active items
    const categorySet = new Map<string, DashboardCategory>();
    for (const item of dashboardItems) {
      if (!categorySet.has(item.categoryId)) {
        categorySet.set(item.categoryId, {
          id: item.categoryId,
          name: item.categoryName,
          icon: item.categoryIcon,
        });
      }
    }
    const uniqueCategories = Array.from(categorySet.values());

    // Load reminder preferences once for window calculation
    const prefs = await loadPreferences();

    // Build upcoming deadlines — only include items within their reminder window.
    // e.g. billing_date has reminderOffsets: [3] → appears only when ≤ 3 days away.
    // Insurance/vehicle fields use the global default (e.g. [30, 7, 1]) → appear when ≤ 30 days away.
    const upcomingDeadlines: DashboardData['upcomingDeadlines'] = [];

    for (const i of dashboardItems) {
      if (i.daysUntilDeadline === null) continue;

      const fields = fieldsByItem.get(i.id) ?? [];
      const fieldMap = new Map(fields.map((f) => [f.fieldKey, f]));

      // Find the date field with the earliest deadline
      let earliestFieldKey: string | null = null;
      let earliestMs = Infinity;
      for (const f of fields) {
        if (f.fieldType !== 'date' || !f.fieldValue) continue;
        const d = new Date(f.fieldValue);
        if (isNaN(d.getTime())) continue;
        if (d.getTime() < earliestMs) {
          earliestMs = d.getTime();
          earliestFieldKey = f.fieldKey;
        }
      }

      // Resolve reminder window for that field
      const templateFields = getTemplateFields(i.categoryName, i.serviceType);
      const templateFieldMap = new Map(templateFields.map((tf) => [tf.fieldKey, tf]));
      const targetTemplateFld = earliestFieldKey ? templateFieldMap.get(earliestFieldKey) : undefined;
      const offsets = targetTemplateFld?.reminderOffsets ?? resolveOffsets(prefs, i.categoryName);
      const maxReminderOffset = offsets.length > 0 ? Math.max(...offsets) : 0;

      // Skip items not yet within their reminder window
      if (i.daysUntilDeadline > maxReminderOffset) continue;

      const isBillingItem = !!(
        fieldMap.get('billing_day')?.fieldValue &&
        fieldMap.get('billing_frequency')?.fieldValue &&
        fieldMap.get('billing_date')?.fieldValue
      );

      upcomingDeadlines.push({
        id: i.id,
        title: i.title,
        daysUntil: i.daysUntilDeadline,
        status: i.displayStatus,
        dateLabel: i.keyDateLabel!,
        isBillingItem,
      });
    }

    return {
      items: dashboardItems,
      attentionCount,
      overallStatus,
      categories: uniqueCategories,
      upcomingDeadlines,
    };
  }, []);

  return useMemo(
    () => ({
      getDashboardData,
    }),
    [getDashboardData]
  );
}
