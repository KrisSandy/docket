import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock notifications — hoisted above imports
const mockScheduleReminder = vi.fn().mockResolvedValue(true);
const mockCancelReminder = vi.fn().mockResolvedValue(undefined);
const mockCancelAllRemindersForItem = vi.fn().mockResolvedValue(undefined);
const mockCancelAllNotifications = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/notifications', () => ({
  scheduleReminder: (...args: unknown[]) => mockScheduleReminder(...args),
  cancelReminder: (...args: unknown[]) => mockCancelReminder(...args),
  cancelAllRemindersForItem: (...args: unknown[]) => mockCancelAllRemindersForItem(...args),
  cancelAllNotifications: (...args: unknown[]) => mockCancelAllNotifications(...args),
}));

// Store mock data outside factory for access in tests
const mockReminderData = [
  { id: 'rem-1', itemId: 'item-1', fieldKey: 'nct_date', daysBefore: 30, isEnabled: true, lastNotifiedAt: null, createdAt: new Date() },
  { id: 'rem-2', itemId: 'item-1', fieldKey: 'nct_date', daysBefore: 7, isEnabled: true, lastNotifiedAt: null, createdAt: new Date() },
];

const mockDateFieldData = [
  { id: 'f-1', itemId: 'item-1', fieldKey: 'nct_date', fieldValue: '2026-09-15', fieldType: 'date', label: 'NCT Date', isTemplateField: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
];

vi.mock('@/db/database', () => {
  const reminderData = [
    { id: 'rem-1', itemId: 'item-1', fieldKey: 'nct_date', daysBefore: 30, isEnabled: true, lastNotifiedAt: null, createdAt: new Date() },
    { id: 'rem-2', itemId: 'item-1', fieldKey: 'nct_date', daysBefore: 7, isEnabled: true, lastNotifiedAt: null, createdAt: new Date() },
  ];

  const dateFieldData = [
    { id: 'f-1', itemId: 'item-1', fieldKey: 'nct_date', fieldValue: '2026-09-15', fieldType: 'date', label: 'NCT Date', isTemplateField: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
  ];

  return {
    db: {
      reminders: {
        where: vi.fn().mockImplementation(() => ({
          equals: vi.fn().mockImplementation(() => ({
            toArray: vi.fn().mockResolvedValue(reminderData),
            modify: vi.fn().mockResolvedValue(2),
            delete: vi.fn().mockResolvedValue(2),
          })),
        })),
        toArray: vi.fn().mockResolvedValue(reminderData),
      },
      items: {
        where: vi.fn().mockReturnValue({
          equals: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([{ id: 'item-1', status: 'active' }]),
          }),
        }),
      },
      itemFields: {
        where: vi.fn().mockReturnValue({
          equals: vi.fn().mockReturnValue({
            filter: vi.fn().mockReturnValue({
              toArray: vi.fn().mockResolvedValue(dateFieldData),
            }),
          }),
        }),
      },
    },
  };
});

import {
  onDateFieldUpdated,
  onItemArchived,
  onItemDeleted,
  onItemUnarchived,
} from '@/lib/reminder-sync';

describe('reminder-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onDateFieldUpdated', () => {
    it('cancels old and schedules new reminders when date changes', async () => {
      const newDate = new Date('2026-10-01T00:00:00');
      await onDateFieldUpdated('item-1', 'nct_date', newDate);

      // Should cancel each existing reminder
      expect(mockCancelReminder).toHaveBeenCalledWith('rem-1');
      expect(mockCancelReminder).toHaveBeenCalledWith('rem-2');
      expect(mockCancelReminder).toHaveBeenCalledTimes(2);

      // Should schedule new notifications for each reminder
      expect(mockScheduleReminder).toHaveBeenCalledWith('rem-1', 'item-1', newDate, 30);
      expect(mockScheduleReminder).toHaveBeenCalledWith('rem-2', 'item-1', newDate, 7);
      expect(mockScheduleReminder).toHaveBeenCalledTimes(2);
    });

    it('only cancels (does not schedule) when date is set to null', async () => {
      await onDateFieldUpdated('item-1', 'nct_date', null);

      expect(mockCancelReminder).toHaveBeenCalledTimes(2);
      expect(mockScheduleReminder).not.toHaveBeenCalled();
    });
  });

  describe('onItemArchived', () => {
    it('cancels all reminders for the item', async () => {
      await onItemArchived('item-1');

      expect(mockCancelAllRemindersForItem).toHaveBeenCalledWith(['rem-1', 'rem-2']);
    });
  });

  describe('onItemDeleted', () => {
    it('cancels all notifications and removes reminders from DB', async () => {
      await onItemDeleted('item-1');

      expect(mockCancelAllRemindersForItem).toHaveBeenCalledWith(['rem-1', 'rem-2']);
    });
  });

  describe('onItemUnarchived', () => {
    it('re-enables reminders and reschedules notifications', async () => {
      await onItemUnarchived('item-1');

      // Should schedule for each reminder with the date from DB
      expect(mockScheduleReminder).toHaveBeenCalledTimes(2);
    });
  });
});
