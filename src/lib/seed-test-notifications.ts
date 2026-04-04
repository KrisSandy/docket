import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { LocalNotifications } from '@capacitor/local-notifications';
import { db } from '@/db/database';
import type { Item, ItemField, Reminder } from '@/db/schema';
import {
  scheduleReminder,
  cancelAllRemindersForItem,
  hashToInt,
  NOTIFICATION_TITLE,
  NOTIFICATION_BODY,
  buildNotificationExtra,
} from '@/lib/notifications';

/**
 * Test notification seed data.
 *
 * Creates 5 items across different categories with dates set so that
 * notifications fire at staggered times:
 *
 *  - IMMEDIATE (fires 10–30 s after seeding):
 *      Scheduled directly via Capacitor with a future timestamp.
 *
 *  - NEXT DAY (fires at start-of-day tomorrow):
 *      Uses the standard scheduleReminder path.
 *
 *  - EXPIRED (past deadline):
 *      Shows expired status on dashboard. No notifications.
 *
 * All items are prefixed with "[TEST]" so they are easy to identify
 * and clean up afterwards.
 */

interface TestField {
  fieldKey: string;
  fieldValue: string;
  fieldType: ItemField['fieldType'];
  label: string;
  sortOrder: number;
}

interface TestReminderConfig {
  fieldKey: string;
  daysBefore: number[];
}

interface TestItem {
  title: string;
  categoryName: string;
  serviceType: string | null;
  fields: TestField[];
  reminders: TestReminderConfig[];
  /**
   * If provided, these reminders will be scheduled directly via Capacitor
   * at `Date.now() + delayMs`, bypassing the trigger-date calculation.
   * Keyed by `${fieldKey}:${daysBefore}`.
   */
  immediateSchedule?: Map<string, number>;
}

function buildTestItems(): TestItem[] {
  const today = new Date();

  // Map of fieldKey:daysBefore → delay in ms for immediate notifications.
  // Stagger them 10 s apart so they arrive as distinct notifications.
  const vehicleImmediate = new Map<string, number>([
    ['nct_date:7', 10_000],         // fires in 10 s
    ['motor_tax_due:14', 20_000],   // fires in 20 s
  ]);

  const housingImmediate = new Map<string, number>([
    ['lpt_due_date:30', 30_000],    // fires in 30 s
  ]);

  const insuranceImmediate = new Map<string, number>([
    ['renewal_date:60', 40_000],    // fires in 40 s
  ]);

  return [
    // ── 1. Vehicle — NCT due in 7 days ─────────────────────────────────────
    {
      title: '[TEST] Honda Civic — NCT Soon',
      categoryName: 'Vehicle',
      serviceType: null,
      fields: [
        { fieldKey: 'registration_number', fieldValue: '19-D-54321', fieldType: 'text', label: 'Registration Number', sortOrder: 0 },
        { fieldKey: 'make_model', fieldValue: 'Honda Civic', fieldType: 'text', label: 'Make & Model', sortOrder: 1 },
        { fieldKey: 'nct_date', fieldValue: addDays(today, 7).toISOString(), fieldType: 'date', label: 'NCT Date', sortOrder: 9 },
        { fieldKey: 'motor_tax_due', fieldValue: addDays(today, 14).toISOString(), fieldType: 'date', label: 'Motor Tax Due Date', sortOrder: 8 },
        { fieldKey: 'insurance_renewal', fieldValue: addDays(today, 31).toISOString(), fieldType: 'date', label: 'Insurance Renewal Date', sortOrder: 10 },
      ],
      reminders: [
        { fieldKey: 'nct_date', daysBefore: [60, 30, 14, 7] },
        { fieldKey: 'motor_tax_due', daysBefore: [60, 30, 14, 7] },
        { fieldKey: 'insurance_renewal', daysBefore: [60, 30, 14, 7] },
      ],
      immediateSchedule: vehicleImmediate,
    },

    // ── 2. Insurance — Renewal in 60 days ──────────────────────────────────
    {
      title: '[TEST] Home Insurance — Renewal',
      categoryName: 'Insurance',
      serviceType: null,
      fields: [
        { fieldKey: 'insurance_type', fieldValue: 'Home', fieldType: 'text', label: 'Insurance Type', sortOrder: 0 },
        { fieldKey: 'provider', fieldValue: 'Test Insurer Ltd', fieldType: 'text', label: 'Provider', sortOrder: 1 },
        { fieldKey: 'annual_premium', fieldValue: '450.00', fieldType: 'currency', label: 'Annual Premium', sortOrder: 3 },
        { fieldKey: 'renewal_date', fieldValue: addDays(today, 60).toISOString(), fieldType: 'date', label: 'Renewal Date', sortOrder: 10 },
      ],
      reminders: [
        { fieldKey: 'renewal_date', daysBefore: [60, 30, 14] },
      ],
      immediateSchedule: insuranceImmediate,
    },

    // ── 3. Utilities (Broadband) — Contract ending in 15 days ──────────────
    {
      title: '[TEST] Broadband — Contract Ending',
      categoryName: 'Utilities',
      serviceType: 'broadband',
      fields: [
        { fieldKey: 'provider', fieldValue: 'Test Broadband Co', fieldType: 'text', label: 'Provider', sortOrder: 0 },
        { fieldKey: 'monthly_cost', fieldValue: '55.00', fieldType: 'currency', label: 'Monthly Cost', sortOrder: 3 },
        { fieldKey: 'contract_end', fieldValue: addDays(today, 15).toISOString(), fieldType: 'date', label: 'Contract End Date', sortOrder: 7 },
      ],
      reminders: [
        { fieldKey: 'contract_end', daysBefore: [30, 14] },
      ],
    },

    // ── 4. Housing — LPT due in 30 days ────────────────────────────────────
    {
      title: '[TEST] Home — LPT Due',
      categoryName: 'Housing',
      serviceType: null,
      fields: [
        { fieldKey: 'property_address', fieldValue: '42 Test Street, Dublin', fieldType: 'text', label: 'Property Address', sortOrder: 0 },
        { fieldKey: 'lpt_amount', fieldValue: '265.00', fieldType: 'currency', label: 'Property Tax (LPT) Amount', sortOrder: 5 },
        { fieldKey: 'lpt_due_date', fieldValue: addDays(today, 30).toISOString(), fieldType: 'date', label: 'LPT Due Date', sortOrder: 6 },
        { fieldKey: 'fixed_term_end', fieldValue: addDays(today, 91).toISOString(), fieldType: 'date', label: 'Fixed Term End Date', sortOrder: 7 },
      ],
      reminders: [
        { fieldKey: 'lpt_due_date', daysBefore: [30, 14] },
        { fieldKey: 'fixed_term_end', daysBefore: [90, 30] },
      ],
      immediateSchedule: housingImmediate,
    },

    // ── 5. Vehicle — Already expired ───────────────────────────────────────
    {
      title: '[TEST] Old Banger — Expired NCT',
      categoryName: 'Vehicle',
      serviceType: null,
      fields: [
        { fieldKey: 'registration_number', fieldValue: '08-C-99999', fieldType: 'text', label: 'Registration Number', sortOrder: 0 },
        { fieldKey: 'make_model', fieldValue: 'Ford Focus', fieldType: 'text', label: 'Make & Model', sortOrder: 1 },
        { fieldKey: 'nct_date', fieldValue: addDays(today, -10).toISOString(), fieldType: 'date', label: 'NCT Date', sortOrder: 9 },
      ],
      reminders: [
        { fieldKey: 'nct_date', daysBefore: [60, 30, 14, 7] },
      ],
    },
  ];
}

/**
 * Directly schedule a notification via Capacitor at a specific time.
 * Bypasses `calculateTriggerDate` entirely — used for test notifications
 * that must fire within seconds regardless of date math.
 */
async function scheduleDirectNotification(
  reminderId: string,
  itemId: string,
  fireAt: Date
): Promise<boolean> {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: hashToInt(reminderId),
          title: NOTIFICATION_TITLE,
          body: NOTIFICATION_BODY,
          schedule: { at: fireAt },
          extra: buildNotificationExtra(itemId, reminderId),
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Seed test items and schedule their notifications.
 * Returns the count of items created and notifications scheduled.
 */
export async function seedTestNotifications(): Promise<{
  itemsCreated: number;
  notificationsScheduled: number;
}> {
  // First clear any existing test data to avoid duplicates
  await clearTestNotifications();

  const testItems = buildTestItems();
  const now = new Date();
  let notificationsScheduled = 0;

  // Look up category IDs
  const categories = await db.categories.toArray();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  for (const testItem of testItems) {
    const categoryId = categoryMap.get(testItem.categoryName);
    if (!categoryId) {
      console.warn(`[seed-test] Category "${testItem.categoryName}" not found, skipping`);
      continue;
    }

    const itemId = uuidv4();

    // Create item
    const item: Item = {
      id: itemId,
      categoryId,
      title: testItem.title,
      status: 'active',
      serviceType: testItem.serviceType,
      dismissedUntil: null,
      createdAt: now,
      updatedAt: now,
    };
    await db.items.add(item);

    // Create fields
    const fields: ItemField[] = testItem.fields.map((f) => ({
      id: uuidv4(),
      itemId,
      fieldKey: f.fieldKey,
      fieldValue: f.fieldValue,
      fieldType: f.fieldType,
      label: f.label,
      isTemplateField: true,
      sortOrder: f.sortOrder,
      createdAt: now,
      updatedAt: now,
    }));
    await db.itemFields.bulkAdd(fields);

    // Build field date lookup for scheduling
    const fieldDateMap = new Map<string, Date>();
    for (const f of testItem.fields) {
      if (f.fieldType === 'date' && f.fieldValue) {
        const d = new Date(f.fieldValue);
        if (!isNaN(d.getTime())) {
          fieldDateMap.set(f.fieldKey, d);
        }
      }
    }

    // Create reminders and schedule notifications
    for (const rc of testItem.reminders) {
      const deadlineDate = fieldDateMap.get(rc.fieldKey);
      for (const daysBefore of rc.daysBefore) {
        const reminderId = uuidv4();

        const reminder: Reminder = {
          id: reminderId,
          itemId,
          fieldKey: rc.fieldKey,
          daysBefore,
          isEnabled: true,
          lastNotifiedAt: null,
          createdAt: now,
        };
        await db.reminders.add(reminder);

        // Check if this reminder should be scheduled directly (immediate fire)
        const immediateKey = `${rc.fieldKey}:${daysBefore}`;
        const immediateDelayMs = testItem.immediateSchedule?.get(immediateKey);

        if (immediateDelayMs !== undefined) {
          // Direct schedule — bypasses calculateTriggerDate, fires in N seconds
          const fireAt = new Date(Date.now() + immediateDelayMs);
          const scheduled = await scheduleDirectNotification(reminderId, itemId, fireAt);
          if (scheduled) {
            notificationsScheduled++;
          }
        } else if (deadlineDate) {
          // Standard schedule — uses calculateTriggerDate path
          const scheduled = await scheduleReminder(reminderId, itemId, deadlineDate, daysBefore);
          if (scheduled) {
            notificationsScheduled++;
          }
        }
      }
    }
  }

  return {
    itemsCreated: testItems.length,
    notificationsScheduled,
  };
}

/**
 * Remove all test items (items whose title starts with "[TEST]").
 * Also cancels their notifications and removes reminders.
 */
export async function clearTestNotifications(): Promise<number> {
  const testItems = await db.items
    .filter((item) => item.title.startsWith('[TEST]'))
    .toArray();

  for (const item of testItems) {
    // Cancel notifications and delete reminders
    const reminders = await db.reminders.where('itemId').equals(item.id).toArray();
    await cancelAllRemindersForItem(reminders.map((r) => r.id));
    await db.reminders.where('itemId').equals(item.id).delete();

    // Delete fields
    await db.itemFields.where('itemId').equals(item.id).delete();

    // Delete history
    await db.history.where('itemId').equals(item.id).delete();

    // Delete item
    await db.items.delete(item.id);
  }

  return testItems.length;
}
