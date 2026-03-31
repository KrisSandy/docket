# Sprint 6.5 — Action Review & Completion

**Duration:** 1 week (inserted before Sprint 7 — Launch)
**Milestone:** M4.5 — Action Management Live
**Goal:** Users can tap the attention banner to review urgent items, renew deadlines with one action, or dismiss items temporarily. All actions tracked in history.
**Estimated Hours:** 18–22

---

## 1. Data Model Changes

- [x] Add `dismissedUntil` field (Date | null) to Item interface in `db/schema.ts`
- [x] Add `changeType` field to HistoryEntry interface: `'edit' | 'renewal' | 'dismissal'` (default: `'edit'`)
- [x] Create Dexie migration (version 2) adding new fields with backward-compatible defaults
- [x] Add `dismissedUntil` to items index in Dexie store definition
- [x] Write unit tests: migration runs cleanly on existing data, new fields default correctly

## 2. Status Calculation — Respect Dismissals

- [x] Update `calculateStatus()` in `lib/status.ts` to accept optional `dismissedUntil` parameter
- [x] When `dismissedUntil` is set and in the future → return `'ok'` regardless of deadline proximity
- [x] When `dismissedUntil` is in the past or null → use existing deadline-based calculation
- [x] Update `useDashboard` hook to pass `dismissedUntil` into status calculation
- [x] Update `attentionCount` to exclude dismissed items
- [x] Write unit tests: dismissed item returns 'ok', expired dismissal returns real status, null dismissal unchanged

## 3. Review Sheet Component

- [x] Create `ReviewSheet` component (`src/components/dashboard/review-sheet.tsx`) using custom bottom sheet (no Radix dependency)
- [x] Sheet header: "Items needing attention" with count badge
- [x] List of attention items, each row showing:
  - Status dot (color-coded)
  - Category icon + item title
  - Deadline status label (e.g., "overdue by 5 days", "due in 3 days")
  - "Renew" button (primary action)
  - "Dismiss" button (secondary/ghost action)
- [x] Tapping item title navigates to `/item/[id]` detail page and closes sheet
- [x] Empty state: "All caught up!" message (should rarely appear but handle gracefully)
- [x] Touch targets: all buttons ≥ 44x44pt
- [x] Animate entry from bottom, respect dark mode theme
- [x] Write component test: renders correct items, buttons visible, empty state works

## 4. Renew Action Flow

- [x] Create `RenewDialog` component (`src/components/dashboard/renew-dialog.tsx`)
- [x] When "Renew" tapped in ReviewSheet → open dialog with:
  - Item title + current deadline date shown for context
  - Date picker for new deadline date
  - "Confirm Renewal" button
  - "Cancel" link
- [x] Validation: new date must be in the future, must be after current deadline
- [x] On confirm:
  - Update the date field value via `useItemFields().updateField()`
  - Log HistoryEntry with `changeType: 'renewal'`
  - Reschedule reminders via `useReminders().rescheduleRemindersForItem()`
  - Clear any active `dismissedUntil` on the item
  - Close dialog, update ReviewSheet list (item should disappear from attention list)
- [ ] Success feedback: brief toast/checkmark animation
- [x] Write unit test: renewal updates field, creates history entry with 'renewal' type, reschedules reminders
- [x] Write component test: dialog renders, date picker works, confirm triggers renewal

## 5. Dismiss Action Flow

- [x] Create `DismissDialog` component (`src/components/dashboard/dismiss-dialog.tsx`)
- [x] When "Dismiss" tapped in ReviewSheet → open dialog with:
  - Item title shown for context
  - Three dismiss duration options: "7 days", "30 days", "Until I act"
  - "Cancel" link
- [x] "Until I act" sets `dismissedUntil` to a far-future date (e.g., 2099-12-31)
- [x] On confirm:
  - Set `dismissedUntil` on the item record
  - Log HistoryEntry with `changeType: 'dismissal'`, newValue = dismissedUntil date
  - Close dialog, update ReviewSheet list (item disappears from attention list)
- [x] Write unit test: dismiss sets correct `dismissedUntil`, creates history entry with 'dismissal' type
- [x] Write component test: dialog renders options, confirm triggers dismiss

## 6. Wire StatusBanner → ReviewSheet

- [x] In dashboard page, add state: `const [reviewSheetOpen, setReviewSheetOpen] = useState(false)`
- [x] Pass `onClick={() => setReviewSheetOpen(true)}` to `StatusBanner`
- [x] Render `ReviewSheet` with `open={reviewSheetOpen}` and `onOpenChange={setReviewSheetOpen}`
- [x] Pass filtered attention items (status !== 'ok') to ReviewSheet
- [x] After any renewal or dismissal, refresh dashboard data via TanStack Query invalidation
- [x] Write component test: clicking banner opens sheet, sheet shows correct items

## 7. History Timeline Enhancement

- [x] Update `HistoryTimeline` component to render `changeType` visually:
  - `'renewal'` → green refresh icon + "Renewed" label + old date → new date
  - `'dismissal'` → grey snooze icon + "Dismissed until [date]" label
  - `'edit'` → existing pencil icon + current format (unchanged)
- [x] Handle legacy history entries (no `changeType` field) → default to `'edit'` display
- [x] Write component test: all three change types render correctly, legacy entries handled

## 8. Dismissed Items Indicator

- [x] On dashboard, show subtle "snoozed" badge on dismissed items in the list view (both Glance and Detail modes)
- [x] In GlanceRow: small snooze icon next to status dot when item is dismissed
- [x] In ItemCard: "Dismissed until [date]" caption below deadline label
- [x] In item detail page: info banner at top when item is currently dismissed, with "Remove dismissal" action
- [x] Write component test: snoozed badge appears when dismissedUntil is set and in future

## 9. Edge Cases & Polish

- [x] Handle case: all attention items dismissed/renewed → ReviewSheet auto-closes, banner updates to "All clear"
- [x] Handle case: item renewed in ReviewSheet then user opens detail page → shows updated date
- [x] Handle case: dismissal expires → item reappears in attention count on next dashboard load
- [x] Handle case: user tries to renew with past date → validation error shown
- [x] Keyboard/screen reader accessibility: sheet is focus-trapped, escape closes, buttons labeled
- [x] Run lint + typecheck + full test suite

## 10. Integration Tests

- [ ] Write E2E test: full flow — banner tap → sheet opens → renew item → sheet updates → banner updates
- [ ] Write E2E test: full flow — banner tap → sheet opens → dismiss item → choose 7 days → item disappears from attention
- [ ] Write E2E test: dismissed item reappears after dismissal period expires
- [x] Run full regression: all existing tests still pass

---

**Sprint 6.5 Definition of Done:**
- [x] "Tap to review" opens review sheet with attention items
- [x] Users can renew items with a new deadline date inline
- [x] Users can dismiss items for 7 days, 30 days, or indefinitely
- [x] All actions logged in history timeline with distinct visual treatment
- [x] Dismissed items show snoozed indicator on dashboard
- [x] All new components have component tests
- [x] All new logic has unit tests
- [ ] E2E tests cover renew and dismiss flows
- [x] All existing tests still passing, lint clean, TypeScript clean
- [ ] M4.5 milestone achieved: Action Management Live
