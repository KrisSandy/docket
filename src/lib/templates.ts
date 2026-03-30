import type { CategoryTemplate, TemplateField } from '@/types';

const vehicleFields: TemplateField[] = [
  { fieldKey: 'insurance_provider', label: 'Insurance Provider', fieldType: 'text', sortOrder: 0 },
  { fieldKey: 'policy_number', label: 'Policy Number', fieldType: 'text', sortOrder: 1 },
  { fieldKey: 'annual_premium', label: 'Annual Premium', fieldType: 'currency', sortOrder: 2 },
  { fieldKey: 'motor_tax_due', label: 'Motor Tax Due Date', fieldType: 'date', sortOrder: 3 },
  { fieldKey: 'nct_date', label: 'NCT Date', fieldType: 'date', sortOrder: 4 },
  { fieldKey: 'insurance_renewal', label: 'Insurance Renewal Date', fieldType: 'date', sortOrder: 5 },
  { fieldKey: 'insurer_contact', label: 'Insurer Contact', fieldType: 'text', sortOrder: 6 },
];

const utilitiesFields: TemplateField[] = [
  { fieldKey: 'provider', label: 'Provider', fieldType: 'text', sortOrder: 0 },
  { fieldKey: 'plan_name', label: 'Plan Name', fieldType: 'text', sortOrder: 1 },
  { fieldKey: 'monthly_cost', label: 'Monthly Cost', fieldType: 'currency', sortOrder: 2 },
  { fieldKey: 'contract_end', label: 'Contract End Date', fieldType: 'date', sortOrder: 3 },
  { fieldKey: 'standing_charge', label: 'Standing Charge', fieldType: 'currency', sortOrder: 4 },
  { fieldKey: 'unit_cost', label: 'Unit Cost (kWh)', fieldType: 'currency', sortOrder: 5 },
];

const housingFields: TemplateField[] = [
  { fieldKey: 'mortgage_provider', label: 'Mortgage Provider', fieldType: 'text', sortOrder: 0 },
  { fieldKey: 'interest_rate', label: 'Interest Rate', fieldType: 'percentage', sortOrder: 1 },
  { fieldKey: 'monthly_payment', label: 'Monthly Payment', fieldType: 'currency', sortOrder: 2 },
  { fieldKey: 'fixed_term_end', label: 'Fixed Term End Date', fieldType: 'date', sortOrder: 3 },
];

const connectivityFields: TemplateField[] = [
  { fieldKey: 'provider', label: 'Provider', fieldType: 'text', sortOrder: 0 },
  { fieldKey: 'speed_tier', label: 'Speed Tier', fieldType: 'text', sortOrder: 1 },
  { fieldKey: 'monthly_cost', label: 'Monthly Cost', fieldType: 'currency', sortOrder: 2 },
  { fieldKey: 'contract_end', label: 'Contract End Date', fieldType: 'date', sortOrder: 3 },
];

const insuranceFields: TemplateField[] = [
  { fieldKey: 'provider', label: 'Provider', fieldType: 'text', sortOrder: 0 },
  { fieldKey: 'policy_type', label: 'Policy Type', fieldType: 'text', sortOrder: 1 },
  { fieldKey: 'annual_premium', label: 'Annual Premium', fieldType: 'currency', sortOrder: 2 },
  { fieldKey: 'renewal_date', label: 'Renewal Date', fieldType: 'date', sortOrder: 3 },
  { fieldKey: 'policy_number', label: 'Policy Number', fieldType: 'text', sortOrder: 4 },
];

export const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  Vehicle: { name: 'Vehicle', icon: 'car', fields: vehicleFields },
  Utilities: { name: 'Utilities', icon: 'zap', fields: utilitiesFields },
  Housing: { name: 'Housing', icon: 'home', fields: housingFields },
  Connectivity: { name: 'Connectivity', icon: 'wifi', fields: connectivityFields },
  Insurance: { name: 'Insurance', icon: 'shield', fields: insuranceFields },
};

/**
 * Get the template fields for a given category name.
 * Returns empty array if category not found.
 */
export function getTemplateFields(categoryName: string): TemplateField[] {
  return CATEGORY_TEMPLATES[categoryName]?.fields ?? [];
}

/**
 * Get all date field keys for a given category (used for reminder defaults).
 */
export function getDateFieldKeys(categoryName: string): string[] {
  return getTemplateFields(categoryName)
    .filter((f) => f.fieldType === 'date')
    .map((f) => f.fieldKey);
}
