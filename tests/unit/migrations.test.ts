import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addMissingTemplateFields } from '@/db/migrations';

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-' + Math.random().toString(36).slice(2, 8),
}));

// Mock the database module
vi.mock('@/db/database', () => {
  const mockBulkAdd = vi.fn().mockResolvedValue(undefined);
  const mockToArray = vi.fn().mockResolvedValue([]);

  return {
    db: {
      categories: {
        where: () => ({
          equals: () => ({ first: vi.fn().mockResolvedValue(null) }),
          equalsIgnoreCase: () => ({ first: vi.fn().mockResolvedValue(null) }),
        }),
        delete: vi.fn(),
      },
      items: {
        where: () => ({
          equals: () => ({
            modify: vi.fn(),
            toArray: vi.fn().mockResolvedValue([]),
          }),
        }),
      },
      itemFields: {
        where: () => ({
          equals: () => ({
            toArray: mockToArray,
          }),
        }),
        bulkAdd: mockBulkAdd,
      },
      __mocks: { mockBulkAdd, mockToArray },
    },
  };
});

describe('addMissingTemplateFields', () => {
  let mockBulkAdd: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Access the mocked functions
    const { db } = await import('@/db/database');
    mockBulkAdd = (db as unknown as { __mocks: { mockBulkAdd: ReturnType<typeof vi.fn> } }).__mocks.mockBulkAdd;
    mockBulkAdd.mockResolvedValue(undefined);
  });

  it('adds missing fields for Vehicle template', async () => {
    const count = await addMissingTemplateFields('item-1', 'Vehicle');
    expect(count).toBe(12);
    expect(mockBulkAdd).toHaveBeenCalledTimes(1);
    const addedFields = mockBulkAdd.mock.calls[0][0];
    expect(addedFields).toHaveLength(12);
  });

  it('adds missing fields for Insurance template', async () => {
    const count = await addMissingTemplateFields('item-2', 'Insurance');
    expect(count).toBe(11);
  });

  it('adds missing fields for Housing template', async () => {
    const count = await addMissingTemplateFields('item-3', 'Housing');
    expect(count).toBe(9);
  });

  it('returns 0 for unknown category', async () => {
    const count = await addMissingTemplateFields('item-4', 'Unknown');
    expect(count).toBe(0);
    expect(mockBulkAdd).not.toHaveBeenCalled();
  });

  it('adds service-type-specific fields for Electricity', async () => {
    const count = await addMissingTemplateFields('item-5', 'Utilities', 'electricity');
    // Shared: 9 (incl. billing_day + computed billing_date), Electricity-specific: 3
    expect(count).toBe(12);
  });
});
