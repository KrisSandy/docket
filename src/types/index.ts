export type FieldType = 'text' | 'currency' | 'date' | 'number' | 'percentage' | 'url';
export type ItemStatus = 'active' | 'archived';
export type DisplayStatus = 'ok' | 'warning' | 'urgent' | 'expired';

export type ServiceType =
  | 'electricity'
  | 'gas'
  | 'broadband'
  | 'mobile'
  | 'tv_streaming'
  | 'water';

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  electricity: 'Electricity',
  gas: 'Gas',
  broadband: 'Broadband',
  mobile: 'Mobile',
  tv_streaming: 'TV / Streaming',
  water: 'Water',
};

export const SERVICE_TYPE_ICONS: Record<ServiceType, string> = {
  electricity: 'zap',
  gas: 'flame',
  broadband: 'wifi',
  mobile: 'smartphone',
  tv_streaming: 'tv',
  water: 'droplets',
};

export interface CategoryTemplate {
  name: string;
  icon: string;
  fields: TemplateField[];
  serviceTypes?: ServiceType[];
}

export const BILLING_FREQUENCY_OPTIONS = [
  'Weekly',
  'Fortnightly',
  'Monthly',
  'Bi-monthly',
  'Quarterly',
  'Annually',
] as const;

export type BillingFrequency = (typeof BILLING_FREQUENCY_OPTIONS)[number];

export interface TemplateField {
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  sortOrder: number;
  helperText?: string;
  placeholder?: string;
  options?: readonly string[];
  min?: number;
  max?: number;
}

/** A field snippet displayed on dashboard cards */
export interface KeyField {
  label: string;
  value: string;
  fieldType: FieldType;
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
  serviceType: ServiceType | null;
  /** Contextual subtitle for cards (e.g. "Toyota Corolla | 12-D-12345") */
  subtitle?: string;
  /** Up to 3 highlight fields shown on detail cards */
  keyFields?: KeyField[];
}
