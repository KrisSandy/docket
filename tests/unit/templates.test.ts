import { describe, it, expect } from 'vitest';
import { CATEGORY_TEMPLATES, getTemplateFields, getDateFieldKeys } from '@/lib/templates';

describe('CATEGORY_TEMPLATES', () => {
  it('has all 5 categories', () => {
    expect(Object.keys(CATEGORY_TEMPLATES)).toHaveLength(5);
    expect(Object.keys(CATEGORY_TEMPLATES)).toEqual([
      'Vehicle', 'Utilities', 'Housing', 'Connectivity', 'Insurance',
    ]);
  });
});

describe('getTemplateFields', () => {
  it('returns 7 fields for Vehicle', () => {
    const fields = getTemplateFields('Vehicle');
    expect(fields).toHaveLength(7);
  });

  it('returns 6 fields for Utilities', () => {
    expect(getTemplateFields('Utilities')).toHaveLength(6);
  });

  it('returns 4 fields for Housing', () => {
    expect(getTemplateFields('Housing')).toHaveLength(4);
  });

  it('returns 4 fields for Connectivity', () => {
    expect(getTemplateFields('Connectivity')).toHaveLength(4);
  });

  it('returns 5 fields for Insurance', () => {
    expect(getTemplateFields('Insurance')).toHaveLength(5);
  });

  it('returns empty array for unknown category', () => {
    expect(getTemplateFields('Unknown')).toEqual([]);
  });

  it('Vehicle template has correct date fields', () => {
    const fields = getTemplateFields('Vehicle');
    const dateFields = fields.filter((f) => f.fieldType === 'date');
    expect(dateFields).toHaveLength(3);
    expect(dateFields.map((f) => f.fieldKey)).toEqual([
      'motor_tax_due', 'nct_date', 'insurance_renewal',
    ]);
  });

  it('all fields have sorted sortOrder', () => {
    Object.values(CATEGORY_TEMPLATES).forEach((template) => {
      const sortOrders = template.fields.map((f) => f.sortOrder);
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

  it('returns 1 date field key for Utilities', () => {
    expect(getDateFieldKeys('Utilities')).toEqual(['contract_end']);
  });

  it('returns 1 date field key for Housing', () => {
    expect(getDateFieldKeys('Housing')).toEqual(['fixed_term_end']);
  });

  it('returns empty array for unknown category', () => {
    expect(getDateFieldKeys('Unknown')).toEqual([]);
  });
});
