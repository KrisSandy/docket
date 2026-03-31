import type { CategoryTemplate, TemplateField, ServiceType } from '@/types';
import { BILLING_FREQUENCY_OPTIONS } from '@/types';

// ─── Vehicle Template ──────────────────────────────────────────────────────────
const vehicleFields: TemplateField[] = [
  { fieldKey: 'registration_number', label: 'Registration Number', fieldType: 'text', sortOrder: 0, helperText: 'e.g., 12-D-12345', placeholder: '12-D-12345' },
  { fieldKey: 'make_model', label: 'Make & Model', fieldType: 'text', sortOrder: 1, placeholder: 'e.g., Toyota Corolla' },
  { fieldKey: 'year_of_manufacture', label: 'Year of Manufacture', fieldType: 'number', sortOrder: 2, placeholder: String(new Date().getFullYear()), min: 1900, max: new Date().getFullYear() },
  { fieldKey: 'fuel_type', label: 'Fuel Type', fieldType: 'text', sortOrder: 3, placeholder: 'Select...', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'] },
  { fieldKey: 'insurance_provider', label: 'Insurance Provider', fieldType: 'text', sortOrder: 4 },
  { fieldKey: 'policy_number', label: 'Policy Number', fieldType: 'text', sortOrder: 5 },
  { fieldKey: 'annual_premium', label: 'Annual Premium', fieldType: 'currency', sortOrder: 6 },
  { fieldKey: 'insurance_excess', label: 'Insurance Excess Amount', fieldType: 'currency', sortOrder: 7 },
  { fieldKey: 'motor_tax_due', label: 'Motor Tax Due Date', fieldType: 'date', sortOrder: 8 },
  { fieldKey: 'nct_date', label: 'NCT Date', fieldType: 'date', sortOrder: 9, helperText: 'National Car Test expiry date' },
  { fieldKey: 'insurance_renewal', label: 'Insurance Renewal Date', fieldType: 'date', sortOrder: 10 },
  { fieldKey: 'insurer_contact', label: 'Insurer Contact', fieldType: 'text', sortOrder: 11 },
];

// ─── Utilities: shared fields (present on all service types) ────────────────
const utilitiesSharedFields: TemplateField[] = [
  { fieldKey: 'provider', label: 'Provider', fieldType: 'text', sortOrder: 0 },
  { fieldKey: 'account_number', label: 'Account Number', fieldType: 'text', sortOrder: 1 },
  { fieldKey: 'payment_method', label: 'Payment Method', fieldType: 'text', sortOrder: 2, placeholder: 'e.g., Direct Debit' },
  { fieldKey: 'monthly_cost', label: 'Monthly Cost', fieldType: 'currency', sortOrder: 3 },
  { fieldKey: 'estimated_annual_cost', label: 'Estimated Annual Cost', fieldType: 'currency', sortOrder: 4 },
  { fieldKey: 'billing_date', label: 'Billing Date', fieldType: 'date', sortOrder: 5, helperText: 'Next billing date' },
  { fieldKey: 'billing_frequency', label: 'Billing Frequency', fieldType: 'text', sortOrder: 6, options: BILLING_FREQUENCY_OPTIONS },
  { fieldKey: 'contract_end', label: 'Contract End Date', fieldType: 'date', sortOrder: 7 },
];

// ─── Utilities: Electricity-specific ─────────────────────────────────────────
const electricityFields: TemplateField[] = [
  ...utilitiesSharedFields,
  { fieldKey: 'standing_charge', label: 'Standing Charge', fieldType: 'currency', sortOrder: 100, helperText: 'Daily or annual standing charge' },
  { fieldKey: 'unit_cost_kwh', label: 'Unit Cost (kWh)', fieldType: 'currency', sortOrder: 101 },
  { fieldKey: 'mprn', label: 'MPRN', fieldType: 'text', sortOrder: 102, helperText: 'Meter Point Reference Number — on your bill header' },
];

// ─── Utilities: Gas-specific ─────────────────────────────────────────────────
const gasFields: TemplateField[] = [
  ...utilitiesSharedFields,
  { fieldKey: 'standing_charge', label: 'Standing Charge', fieldType: 'currency', sortOrder: 100 },
  { fieldKey: 'unit_cost_kwh', label: 'Unit Cost (kWh)', fieldType: 'currency', sortOrder: 101 },
  { fieldKey: 'gprn', label: 'GPRN', fieldType: 'text', sortOrder: 102, helperText: 'Gas Point Reference Number — starts with 5' },
];

// ─── Utilities: Broadband-specific ───────────────────────────────────────────
const broadbandFields: TemplateField[] = [
  ...utilitiesSharedFields,
  { fieldKey: 'download_speed', label: 'Download Speed (Mbps)', fieldType: 'number', sortOrder: 100, placeholder: '500' },
  { fieldKey: 'upload_speed', label: 'Upload Speed (Mbps)', fieldType: 'number', sortOrder: 101, placeholder: '100' },
  { fieldKey: 'data_allowance', label: 'Data Allowance', fieldType: 'text', sortOrder: 102, placeholder: 'Unlimited' },
  { fieldKey: 'cancellation_notice', label: 'Cancellation Notice Period', fieldType: 'text', sortOrder: 103, placeholder: 'e.g., 30 days' },
];

// ─── Utilities: Mobile-specific ──────────────────────────────────────────────
const mobileFields: TemplateField[] = [
  ...utilitiesSharedFields,
  { fieldKey: 'data_allowance', label: 'Data Allowance', fieldType: 'text', sortOrder: 100, placeholder: 'e.g., 80 GB' },
  { fieldKey: 'device_on_contract', label: 'Device on Contract', fieldType: 'text', sortOrder: 101, placeholder: 'e.g., iPhone 16' },
  { fieldKey: 'device_payment_remaining', label: 'Device Payment Remaining', fieldType: 'currency', sortOrder: 102 },
  { fieldKey: 'cancellation_notice', label: 'Cancellation Notice Period', fieldType: 'text', sortOrder: 103, placeholder: 'e.g., 30 days' },
];

// ─── Utilities: TV/Streaming-specific ────────────────────────────────────────
const tvStreamingFields: TemplateField[] = [
  ...utilitiesSharedFields,
  { fieldKey: 'package_tier', label: 'Package Tier', fieldType: 'text', sortOrder: 100, placeholder: 'e.g., Premium' },
  { fieldKey: 'number_of_services', label: 'Number of Channels / Services', fieldType: 'number', sortOrder: 101 },
];

// ─── Utilities: Water-specific ───────────────────────────────────────────────
const waterFields: TemplateField[] = [
  ...utilitiesSharedFields,
  { fieldKey: 'standing_charge', label: 'Standing Charge', fieldType: 'currency', sortOrder: 100, helperText: 'Irish Water is currently flat-rate for most households' },
];

// ─── Housing Template ────────────────────────────────────────────────────────
const housingFields: TemplateField[] = [
  { fieldKey: 'property_address', label: 'Property Address', fieldType: 'text', sortOrder: 0 },
  { fieldKey: 'mortgage_provider', label: 'Mortgage / Landlord', fieldType: 'text', sortOrder: 1 },
  { fieldKey: 'mortgage_account_number', label: 'Mortgage Account Number', fieldType: 'text', sortOrder: 2 },
  { fieldKey: 'interest_rate', label: 'Interest Rate', fieldType: 'percentage', sortOrder: 3 },
  { fieldKey: 'mortgage_rent_amount', label: 'Mortgage / Rent Amount', fieldType: 'currency', sortOrder: 4, helperText: 'Monthly mortgage repayment or rent' },
  { fieldKey: 'lpt_amount', label: 'Property Tax (LPT) Amount', fieldType: 'currency', sortOrder: 5 },
  { fieldKey: 'lpt_due_date', label: 'LPT Due Date', fieldType: 'date', sortOrder: 6 },
  { fieldKey: 'fixed_term_end', label: 'Fixed Term End Date', fieldType: 'date', sortOrder: 7, helperText: 'Mortgage fixed rate end or lease end date' },
  { fieldKey: 'tenancy_lease_end', label: 'Tenancy / Lease End Date', fieldType: 'date', sortOrder: 8, helperText: 'For renters — when the lease expires' },
];

// ─── Insurance Template ──────────────────────────────────────────────────────
const insuranceFields: TemplateField[] = [
  { fieldKey: 'insurance_type', label: 'Insurance Type', fieldType: 'text', sortOrder: 0, helperText: 'Home, Life, Health, Pet, or Travel', placeholder: 'Home' },
  { fieldKey: 'provider', label: 'Provider', fieldType: 'text', sortOrder: 1 },
  { fieldKey: 'policy_number', label: 'Policy Number', fieldType: 'text', sortOrder: 2 },
  { fieldKey: 'annual_premium', label: 'Annual Premium', fieldType: 'currency', sortOrder: 3 },
  { fieldKey: 'cover_amount', label: 'Cover Amount', fieldType: 'currency', sortOrder: 4 },
  { fieldKey: 'excess_amount', label: 'Excess Amount', fieldType: 'currency', sortOrder: 5 },
  { fieldKey: 'payment_frequency', label: 'Payment Frequency', fieldType: 'text', sortOrder: 6, placeholder: 'Annual or Monthly' },
  { fieldKey: 'named_insured', label: 'Named Insured', fieldType: 'text', sortOrder: 7 },
  { fieldKey: 'broker_name', label: 'Broker Name', fieldType: 'text', sortOrder: 8 },
  { fieldKey: 'broker_contact', label: 'Broker Contact', fieldType: 'text', sortOrder: 9 },
  { fieldKey: 'renewal_date', label: 'Renewal Date', fieldType: 'date', sortOrder: 10 },
];

// ─── Category Templates ─────────────────────────────────────────────────────

export const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  Vehicle: {
    name: 'Vehicle',
    icon: 'car',
    fields: vehicleFields,
  },
  Utilities: {
    name: 'Utilities',
    icon: 'zap',
    fields: utilitiesSharedFields, // Default fields when no service type is selected
    serviceTypes: ['electricity', 'gas', 'broadband', 'mobile', 'tv_streaming', 'water'],
  },
  Housing: {
    name: 'Housing',
    icon: 'home',
    fields: housingFields,
  },
  Insurance: {
    name: 'Insurance',
    icon: 'shield',
    fields: insuranceFields,
  },
};

// ─── Service Type → Fields mapping ──────────────────────────────────────────

export const SERVICE_TYPE_FIELDS: Record<ServiceType, TemplateField[]> = {
  electricity: electricityFields,
  gas: gasFields,
  broadband: broadbandFields,
  mobile: mobileFields,
  tv_streaming: tvStreamingFields,
  water: waterFields,
};

/**
 * Fields used to build a contextual subtitle on dashboard cards.
 * Values are joined with " · " separator.  Falls back to category name.
 */
export const CATEGORY_SUBTITLE_FIELDS: Record<string, string[]> = {
  Vehicle: ['make_model', 'registration_number'],
  Utilities: ['provider'],
  Housing: ['property_address'],
  Insurance: ['insurance_type', 'provider'],
};

/**
 * Get the subtitle field keys for a given category name.
 */
export function getSubtitleFieldKeys(categoryName: string): string[] {
  return CATEGORY_SUBTITLE_FIELDS[categoryName] ?? [];
}

/**
 * Short labels for dashboard card display.
 * Falls back to the full template label if not listed here.
 */
export const CARD_SHORT_LABELS: Record<string, string> = {
  nct_date: 'NCT',
  motor_tax_due: 'Motor Tax',
  insurance_renewal: 'Insurance Renewal',
  contract_end: 'Contract End',
  fixed_term_end: 'Fixed Term End',
  lpt_due_date: 'LPT Due',
  renewal_date: 'Renewal',
  monthly_cost: 'Monthly',
  annual_premium: 'Premium',
  mortgage_rent_amount: 'Monthly',
  cover_amount: 'Cover',
  interest_rate: 'Rate',
  billing_frequency: 'Billing',
  estimated_annual_cost: 'Annual Est.',
};

/**
 * Key fields to highlight on dashboard cards per category.
 * Order determines display priority — first 3 with values are shown.
 */
export const CATEGORY_KEY_FIELDS: Record<string, string[]> = {
  Vehicle: ['nct_date', 'motor_tax_due', 'insurance_renewal', 'annual_premium'],
  Utilities: ['contract_end'],
  Housing: ['lpt_due_date', 'fixed_term_end', 'interest_rate'],
  Insurance: ['annual_premium', 'renewal_date', 'cover_amount'],
};

/**
 * Get the key field keys for a given category name.
 */
export function getKeyFieldKeys(categoryName: string): string[] {
  return CATEGORY_KEY_FIELDS[categoryName] ?? [];
}

/**
 * Get the template fields for a given category name.
 * If a serviceType is provided and the category supports service types,
 * returns the service-type-specific fields instead.
 */
export function getTemplateFields(categoryName: string, serviceType?: ServiceType | null): TemplateField[] {
  const template = CATEGORY_TEMPLATES[categoryName];
  if (!template) return [];

  if (serviceType && template.serviceTypes?.includes(serviceType)) {
    return SERVICE_TYPE_FIELDS[serviceType] ?? template.fields;
  }

  return template.fields;
}

/**
 * Get all date field keys for a given category (used for reminder defaults).
 */
export function getDateFieldKeys(categoryName: string, serviceType?: ServiceType | null): string[] {
  return getTemplateFields(categoryName, serviceType)
    .filter((f) => f.fieldType === 'date')
    .map((f) => f.fieldKey);
}

/**
 * Check if a category supports service types.
 */
export function hasServiceTypes(categoryName: string): boolean {
  return (CATEGORY_TEMPLATES[categoryName]?.serviceTypes?.length ?? 0) > 0;
}

/**
 * Get available service types for a category.
 */
export function getServiceTypes(categoryName: string): ServiceType[] {
  return CATEGORY_TEMPLATES[categoryName]?.serviceTypes ?? [];
}
