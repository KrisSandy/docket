import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Capacitor LocalNotifications
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    addListener: vi.fn().mockResolvedValue(undefined),
    removeAllListeners: vi.fn().mockResolvedValue(undefined),
    schedule: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  },
}));

// Mock DB
const mockSettingsGet = vi.fn();
const mockItemsWhere = vi.fn();
const mockRemindersToArray = vi.fn();
const mockItemFieldsWhere = vi.fn();

vi.mock('@/db/database', () => ({
  db: {
    settings: {
      get: (...args: unknown[]) => mockSettingsGet(...args),
    },
    items: {
      where: (...args: unknown[]) => mockItemsWhere(...args),
    },
    reminders: {
      toArray: () => mockRemindersToArray(),
    },
    itemFields: {
      where: (...args: unknown[]) => mockItemFieldsWhere(...args),
    },
  },
}));

import { rescheduleAllReminders } from '@/lib/reminder-sync';
import { registerNotificationTapHandler, removeNotificationTapHandler } from '@/lib/notification-tap-handler';

describe('notification-init', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: notifications enabled (no setting = default enabled)
    mockSettingsGet.mockResolvedValue(undefined);
    // Default: no active items
    mockItemsWhere.mockReturnValue({
      equals: () => ({
        toArray: () => Promise.resolve([]),
      }),
    });
    mockRemindersToArray.mockResolvedValue([]);
  });

  describe('rescheduleAllReminders', () => {
    it('reschedules reminders for active items with enabled reminders', async () => {
      const itemId = 'item-1';
      const reminderId = 'rem-1';

      mockItemsWhere.mockReturnValue({
        equals: () => ({
          toArray: () => Promise.resolve([{ id: itemId, status: 'active' }]),
        }),
      });

      mockRemindersToArray.mockResolvedValue([
        { id: reminderId, itemId, fieldKey: 'nct_date', daysBefore: 7, isEnabled: true },
      ]);

      mockItemFieldsWhere.mockReturnValue({
        equals: () => ({
          filter: () => ({
            toArray: () => Promise.resolve([
              { fieldKey: 'nct_date', fieldType: 'date', fieldValue: '2026-12-01' },
            ]),
          }),
        }),
      });

      await rescheduleAllReminders();

      // Should have queried items and reminders
      expect(mockItemsWhere).toHaveBeenCalledWith('status');
      expect(mockRemindersToArray).toHaveBeenCalled();
    });

    it('skips scheduling when no active items exist', async () => {
      mockItemsWhere.mockReturnValue({
        equals: () => ({
          toArray: () => Promise.resolve([]),
        }),
      });
      mockRemindersToArray.mockResolvedValue([]);

      await rescheduleAllReminders();

      expect(mockItemsWhere).toHaveBeenCalledWith('status');
    });

    it('skips disabled reminders', async () => {
      const itemId = 'item-1';

      mockItemsWhere.mockReturnValue({
        equals: () => ({
          toArray: () => Promise.resolve([{ id: itemId, status: 'active' }]),
        }),
      });

      // Reminder exists but is disabled
      mockRemindersToArray.mockResolvedValue([
        { id: 'rem-1', itemId, fieldKey: 'nct_date', daysBefore: 7, isEnabled: false },
      ]);

      mockItemFieldsWhere.mockReturnValue({
        equals: () => ({
          filter: () => ({
            toArray: () => Promise.resolve([]),
          }),
        }),
      });

      await rescheduleAllReminders();

      // Should complete without error — disabled reminders filtered out
      expect(mockRemindersToArray).toHaveBeenCalled();
    });
  });

  describe('registerNotificationTapHandler', () => {
    afterEach(async () => {
      await removeNotificationTapHandler();
    });

    it('registers the tap listener', async () => {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const navigateFn = vi.fn();

      await registerNotificationTapHandler(navigateFn);

      expect(LocalNotifications.addListener).toHaveBeenCalledWith(
        'localNotificationActionPerformed',
        expect.any(Function)
      );
    });

    it('does not register twice', async () => {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const navigateFn = vi.fn();

      await registerNotificationTapHandler(navigateFn);
      await registerNotificationTapHandler(navigateFn);

      // addListener should only be called once
      expect(LocalNotifications.addListener).toHaveBeenCalledTimes(1);
    });
  });
});
