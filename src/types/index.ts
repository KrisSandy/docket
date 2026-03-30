export type FieldType = 'text' | 'currency' | 'date' | 'number' | 'percentage' | 'url';
export type ItemStatus = 'active' | 'archived';
export type DisplayStatus = 'ok' | 'warning' | 'urgent' | 'expired';

export interface CategoryTemplate {
  name: string;
  icon: string;
  fields: TemplateField[];
}

export interface TemplateField {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  sortOrder: number;
}

export interface DashboardItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  title: string;
  status: ItemStatus;
  displayStatus: DisplayStatus;
  earliestDeadline: Date | null;
  daysUntilDeadline: number | null;
  keyDateLabel: string | null;
}
