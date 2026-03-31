import { describe, it, expect } from 'vitest';
import {
  CATEGORY_TEMPLATES,
  SERVICE_TYPE_FIELDS,
  getTemplateFields,
  getDateFieldKeys,
  hasServiceTypes,
  getServiceTypes,
} from '@/lib/templates';

describe('CATEGORY_TEMPLATES', () => {
  it('has all 4 categories', () => {
    expect(Object.keys(CATEGORY_TEMPLATES)).toHaveLength(4);
    expect(Object.keys(CATEGORY_TEMPLATES)).toEqual([
      'Vehicle', 'Utilities', 'Housing', 'Insurance',
    ]);
  });
});

describe('getTemplateFields', () => {
  it('returns 12 fields for Vehicle', () => {
    const fields = getTemplateFields('Vehicle');
    expect(fields).toHaveLength(12);
  });

  it('returns 8 shared fields for Utilities (no service type)', () => {
    expect(getTemplateFields('Utilities')).toHaveLength(8);
  });

  it('returns 9 fields for Housing', () => {
    expect(getTemplateFields('Housing')).toHaveLength(9);
  });

  it('returns 11 fields for Insurance', () => {
    expect(getTemplateFields('Insurance')).toHaveLength(11);
  });

  it('returns empty array for unknown category', () => {
    expect(getTemplateFields('Unknown')).toEqual([]);
  });

  // ─── Vehicle template specifics ──────────────────────────────────────────

  it('Vehicle template has correct date fields', () => {
    const fields = getTemplateFields('Vehicle');
    const dateFields = fields.filter((f) => f.fieldType === 'date');
    expect(dateFields).toHaveLength(3);
    expect(dateFields.map((f) => f.fieldKey)).toEqual([
      'motor_tax_due', 'nct_date', 'insurance_renewal',
    ]);
  });

  it('Vehicle template has registration number field', () => {
    const fields = getTemplateFields('Vehicle');
    const reg = fields.find((f) => f.fieldKey === 'registration_number');
    expect(reg).toBeDefined();
    expect(reg?.fieldType).toBe('text');
    expect(reg?.helperText).toContain('12-D-12345');
  });

  it('Vehicle template has make & model field', () => {
    const fields = getTemplateFields('Vehicle');
    expect(fields.find((f) => f.fieldKey === 'make_model')).toBeDefined();
  });

  it('Vehicle template has year of manufacture field', () => {
    const fields = getTemplateFields('Vehicle');
    const yom = fields.find((f) => f.fieldKey === 'year_of_manufacture');
    expect(yom).toBeDefined();
    expect(yom?.fieldType).toBe('number');
  });

  it('Vehicle template has fuel type field', () => {
    const fields = getTemplateFields('Vehicle');
    const fuel = fields.find((f) => f.fieldKey === 'fuel_type');
    expect(fuel).toBeDefined();
    expect(fuel?.options).toContain('Petrol');
  });

  it('Vehicle template has insurance excess field', () => {
    const fields = getTemplateFields('Vehicle');
    const excess = fields.find((f) => f.fieldKey === 'insurance_excess');
    expect(excess).toBeDefined();
    expect(excess?.fieldType).toBe('currency');
  });

  it('Vehicle template has helper text for NCT Date', () => {
    const fields = getTemplateFields('Vehicle');
    const nct = fields.find((f) => f.fieldKey === 'nct_date');
    expect(nct?.helperText).toContain('National Car Test');
  });

  // ─── Electricity service type ──────────────────────────────────────────

  it('returns Electricity-specific fields when service type is electricity', () => {
    const fields = getTemplateFields('Utilities', 'electricity');
    expect(fields.length).toBeGreaterThan(8); // More than shared
    const mprn = fields.find((f) => f.fieldKey === 'mprn');
    expect(mprn).toBeDefined();
    expect(mprn?.helperText).toContain('Meter Point Reference Number');
  });

  it('Electricity service type has standing charge', () => {
    const fields = getTemplateFields('Utilities', 'electricity');
    expect(fields.find((f) => f.fieldKey === 'standing_charge')).toBeDefined();
  });

  it('Electricity service type has unit cost', () => {
    const fields = getTemplateFields('Utilities', 'electricity');
    expect(fields.find((f) => f.fieldKey === 'unit_cost_kwh')).toBeDefined();
  });

  it('Electricity service type inherits billing frequency from shared fields', () => {
    const fields = getTemplateFields('Utilities', 'electricity');
    const bf = fields.find((f) => f.fieldKey === 'billing_frequency');
    expect(bf).toBeDefined();
    expect(bf?.options).toBeDefined();
    expect(bf?.options).toContain('Monthly');
    expect(bf?.options).toContain('Bi-monthly');
    expect(bf?.options).toContain('Quarterly');
    expect(bf?.options).toContain('Annually');
  });

  // ─── Gas service type ──────────────────────────────────────────────────

  it('returns Gas-specific fields when service type is gas', () => {
    const fields = getTemplateFields('Utilities', 'gas');
    const gprn = fields.find((f) => f.fieldKey === 'gprn');
    expect(gprn).toBeDefined();
    expect(gprn?.helperText).toContain('Gas Point Reference Number');
    expect(gprn?.helperText).toContain('starts with 5');
  });

  it('Gas service type has standing charge and unit cost', () => {
    const fields = getTemplateFields('Utilities', 'gas');
    expect(fields.find((f) => f.fieldKey === 'standing_charge')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'unit_cost_kwh')).toBeDefined();
  });

  // ─── Broadband service type ────────────────────────────────────────────

  it('returns Broadband-specific fields when service type is broadband', () => {
    const fields = getTemplateFields('Utilities', 'broadband');
    expect(fields.find((f) => f.fieldKey === 'download_speed')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'upload_speed')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'data_allowance')).toBeDefined();
  });

  // ─── Mobile service type ───────────────────────────────────────────────

  it('returns Mobile-specific fields when service type is mobile', () => {
    const fields = getTemplateFields('Utilities', 'mobile');
    expect(fields.find((f) => f.fieldKey === 'data_allowance')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'device_on_contract')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'device_payment_remaining')).toBeDefined();
  });

  // ─── TV/Streaming service type ─────────────────────────────────────────

  it('returns TV/Streaming-specific fields', () => {
    const fields = getTemplateFields('Utilities', 'tv_streaming');
    expect(fields.find((f) => f.fieldKey === 'package_tier')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'number_of_services')).toBeDefined();
  });

  // ─── Water service type ────────────────────────────────────────────────

  it('returns Water-specific fields', () => {
    const fields = getTemplateFields('Utilities', 'water');
    const standing = fields.find((f) => f.fieldKey === 'standing_charge');
    expect(standing).toBeDefined();
    expect(standing?.helperText).toContain('flat-rate');
  });

  // ─── Housing template specifics ────────────────────────────────────────

  it('Housing template has property address', () => {
    const fields = getTemplateFields('Housing');
    expect(fields.find((f) => f.fieldKey === 'property_address')).toBeDefined();
  });

  it('Housing template has mortgage/rent amount', () => {
    const fields = getTemplateFields('Housing');
    const mort = fields.find((f) => f.fieldKey === 'mortgage_rent_amount');
    expect(mort).toBeDefined();
    expect(mort?.fieldType).toBe('currency');
  });

  it('Housing template has LPT fields', () => {
    const fields = getTemplateFields('Housing');
    expect(fields.find((f) => f.fieldKey === 'lpt_amount')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'lpt_due_date')).toBeDefined();
  });

  it('Housing template has tenancy/lease end date', () => {
    const fields = getTemplateFields('Housing');
    const tenancy = fields.find((f) => f.fieldKey === 'tenancy_lease_end');
    expect(tenancy).toBeDefined();
    expect(tenancy?.fieldType).toBe('date');
  });

  // ─── Insurance template specifics ──────────────────────────────────────

  it('Insurance template has insurance type', () => {
    const fields = getTemplateFields('Insurance');
    const type = fields.find((f) => f.fieldKey === 'insurance_type');
    expect(type).toBeDefined();
    expect(type?.helperText).toContain('Home');
  });

  it('Insurance template has policy number and cover amount', () => {
    const fields = getTemplateFields('Insurance');
    expect(fields.find((f) => f.fieldKey === 'policy_number')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'cover_amount')).toBeDefined();
  });

  it('Insurance template has excess amount', () => {
    const fields = getTemplateFields('Insurance');
    expect(fields.find((f) => f.fieldKey === 'excess_amount')).toBeDefined();
  });

  it('Insurance template has payment frequency', () => {
    const fields = getTemplateFields('Insurance');
    expect(fields.find((f) => f.fieldKey === 'payment_frequency')).toBeDefined();
  });

  it('Insurance template has broker fields', () => {
    const fields = getTemplateFields('Insurance');
    expect(fields.find((f) => f.fieldKey === 'broker_name')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'broker_contact')).toBeDefined();
  });

  it('Insurance template has named insured', () => {
    const fields = getTemplateFields('Insurance');
    expect(fields.find((f) => f.fieldKey === 'named_insured')).toBeDefined();
  });

  // ─── Sort order ────────────────────────────────────────────────────────

  it('all base template fields have sorted sortOrder', () => {
    Object.values(CATEGORY_TEMPLATES).forEach((template) => {
      const sortOrders = template.fields.map((f) => f.sortOrder);
      const sorted = [...sortOrders].sort((a, b) => a - b);
      expect(sortOrders).toEqual(sorted);
    });
  });

  it('all service type fields have sorted sortOrder', () => {
    Object.values(SERVICE_TYPE_FIELDS).forEach((fields) => {
      const sortOrders = fields.map((f) => f.sortOrder);
      const sorted = [...sortOrders].sort((a, b) => a - b);
      expect(sortOrders).toEqual(sorted);
    });
  });
});

describe('getDateFieldKeys', () => {
  it('returns 3 date field keys for Vehicle', () => {
    expect(getDateFieldKeys('Vehicle')).toEqual([
      'motor_tax_due', 'nct_date', 'insurance_renewal',
    ]);
  });

  it('returns date field keys for Utilities shared (no service type)', () => {
    const keys = getDateFieldKeys('Utilities');
    expect(keys).toContain('billing_date');
    expect(keys).toContain('contract_end');
  });

  it('returns date field keys for Electricity service type', () => {
    const keys = getDateFieldKeys('Utilities', 'electricity');
    expect(keys).toContain('billing_date');
    expect(keys).toContain('contract_end');
  });

  it('returns 3 date field keys for Housing', () => {
    const keys = getDateFieldKeys('Housing');
    expect(keys).toContain('lpt_due_date');
    expect(keys).toContain('fixed_term_end');
    expect(keys).toContain('tenancy_lease_end');
  });

  it('returns 1 date field key for Insurance', () => {
    expect(getDateFieldKeys('Insurance')).toEqual(['renewal_date']);
  });

  it('returns empty array for unknown category', () => {
    expect(getDateFieldKeys('Unknown')).toEqual([]);
  });
});

describe('hasServiceTypes', () => {
  it('returns true for Utilities', () => {
    expect(hasServiceTypes('Utilities')).toBe(true);
  });

  it('returns false for Vehicle', () => {
    expect(hasServiceTypes('Vehicle')).toBe(false);
  });

  it('returns false for Housing', () => {
    expect(hasServiceTypes('Housing')).toBe(false);
  });

  it('returns false for Insurance', () => {
    expect(hasServiceTypes('Insurance')).toBe(false);
  });

  it('returns false for unknown category', () => {
    expect(hasServiceTypes('Unknown')).toBe(false);
  });
});

describe('getServiceTypes', () => {
  it('returns 6 service types for Utilities', () => {
    const types = getServiceTypes('Utilities');
    expect(types).toHaveLength(6);
    expect(types).toEqual([
      'electricity', 'gas', 'broadband', 'mobile', 'tv_streaming', 'water',
    ]);
  });

  it('returns empty array for non-utility categories', () => {
    expect(getServiceTypes('Vehicle')).toEqual([]);
    expect(getServiceTypes('Housing')).toEqual([]);
    expect(getServiceTypes('Insurance')).toEqual([]);
  });
});

describe('SERVICE_TYPE_FIELDS', () => {
  it('has fields for all 6 service types', () => {
    expect(Object.keys(SERVICE_TYPE_FIELDS)).toHaveLength(6);
  });

  it('electricity fields include shared + specific fields', () => {
    const fields = SERVICE_TYPE_FIELDS.electricity;
    // Shared: 8, Electricity-specific: 3 (standing charge, unit cost, MPRN)
    expect(fields).toHaveLength(11);
    expect(fields.find((f) => f.fieldKey === 'provider')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'mprn')).toBeDefined();
  });

  it('gas fields include shared + specific fields', () => {
    const fields = SERVICE_TYPE_FIELDS.gas;
    // Shared: 8, Gas-specific: 3 (standing charge, unit cost, GPRN)
    expect(fields).toHaveLength(11);
    expect(fields.find((f) => f.fieldKey === 'gprn')).toBeDefined();
  });

  it('broadband fields include download/upload speed', () => {
    const fields = SERVICE_TYPE_FIELDS.broadband;
    expect(fields).toHaveLength(12);
    expect(fields.find((f) => f.fieldKey === 'download_speed')).toBeDefined();
    expect(fields.find((f) => f.fieldKey === 'upload_speed')).toBeDefined();
  });

  it('mobile fields include device-specific fields', () => {
    const fields = SERVICE_TYPE_FIELDS.mobile;
    expect(fields).toHaveLength(12);
    expect(fields.find((f) => f.fieldKey === 'device_on_contract')).toBeDefined();
  });

  it('tv_streaming fields include package tier', () => {
    const fields = SERVICE_TYPE_FIELDS.tv_streaming;
    expect(fields).toHaveLength(10);
    expect(fields.find((f) => f.fieldKey === 'package_tier')).toBeDefined();
  });

  it('water fields include standing charge with flat-rate note', () => {
    const fields = SERVICE_TYPE_FIELDS.water;
    expect(fields).toHaveLength(9);
    const standing = fields.find((f) => f.fieldKey === 'standing_charge');
    expect(standing?.helperText).toContain('flat-rate');
  });
});
