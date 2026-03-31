# Sprint 6.5 — Action Review & Completion

**Duration:** 1 week (inserted before Sprint 7 — Launch)
**Milestone:** M4.5 — Action Management Live
**Goal:** Users can tap the attention banner to review urgent items, renew deadlines with one action, or dismiss items temporarily. All actions tracked in history.
**Estimated Hours:** 18–22

---

## 1. Data Model Changes

- [ ] Add `dismissedUntil` field (Date | null) to Item interface in `db/schema.ts`
- [ ] Add `changeType` field to HistoryEntry interface: `'edit' | 'renewal' | 'dismissal'` (default: `'edit'`)
- [ ] Create Dexie migration (version 2) adding new fields with backward-compatible defaults
- [ ] Add `dismissedUntil` to items index in Dexie store definition
- [ ] Write unit tests: migration runs cleanly on existing data, new fields default correctly

## 2. Status Calculation — Respect Dismissals

- [ ] Update `calculateStatus()` in `lib/status.ts` to accept optional `dismissedUntil` parameter
- [ ] When `dismissedUntil` is set and in the future → return `'ok'` regardless of deadline proximity
- [ ] When `dismissedUntil` is in the past or null → use existing deadline-based calculation
- [ ] Update `useDashboard` hook to pass `dismissedUntil` into status calculation
- [ ] Update `attentionCount` to exclude dismissed items
- [ ] Write unit tests: dismissed item returns 'ok', expired dismissal returns real status, null dismissal unchanged

## 3. Review Sheet Component

- [ ] Create `ReviewSheet` component (`src/components/dashboard/review-sheet.tsx`) using shadcn `Sheet` (bottom drawer)
- [ ] Sheet header: "Items needing attention" with count badge
- [ ] List of attention items, each row showing:
  - Status dot (color-coded)
  - Category icon + item title
  - Deadline status label (e.g., "overdue by 5 days", "due in 3 days")
  - "Renew" button (primary action)
  - "Dismiss" button (secondary/ghost action)
- [ ] Tapping item title navigates to `/item/[id]` detail page and closes sheet
- [ ] Empty state: "All caught up!" message (should rarely appear but handle gracefully)
- [ ] Touch targets: all buttons ≥ 44x44pt
- [ ] Animate entry from bottom, respect dark mode theme
- [ ] Write component test: renders correct items, buttons visible, empty state works

## 4. Renew Action Flow

- [ ] Create `RenewDialog` component (`src/components/dashboard/renew-dialog.tsx`)
- [ ] When "Renew" tapped in ReviewSheet → open dialog with:
  - Item title + current deadline date shown for context
  - Date picker for new deadline date
  - "Confirm Renewal" button
  - "Cancel" link
- [ ] Validation: new date must be in the future, must be after current deadline
- [ ] On confirm:
  - Update the date field value via `useItemFields().updateField()`
  - Log HistoryEntry with `changeType: 'renewal'`
  - Reschedule reminders via `useReminders().rescheduleRemindersForItem()`
  - Clear any active `dismissedUntil` on the item
  - Close dialog, update ReviewSheet list (item should disappear from attention list)
- [ ] Success feedback: brief toast/checkmark animation
- [ ] Write unit test: renewal updates field, creates history entry with 'renewal' type, reschedules reminders
- [ ] Write component test: dialog renders, date picker works, confirm triggers renewal

## 5. Dismiss Action Flow

- [ ] Create `DismissDialog` component (`src/components/dashboard/dismiss-dialog.tsx`)
- [ ] When "Dismiss" tapped in ReviewSheet → open dialog with:
  - Item title shown for context
  - Three dismiss duration options: "7 days", "30 days", "Until I act"
  - "Cancel" link
- [ ] "Until I act" sets `dismissedUntil` to a far-future date (e.g., 2099-12-31)
- [ ] On confirm:
  - Set `dismissedUntil` on the item record
  - Log HistoryEntry with `changeType: 'dismissal'`, newValue = dismissedUntil date
  - Close dialog, update ReviewSheet list (item disappears from attention list)
- [ ] Write unit test: dismiss sets correct `dismissedUntil`, creates history entry with 'dismissal' type
- [ ] Write component test: dialog renders options, confirm triggers dismiss

## 6. Wire StatusBanner → ReviewSheet

- [ ] In dashboard page, add state: `const [reviewSheetOpen, setReviewSheetOpen] = useState(false)`
- [ ] Pass `onClick={() => setReviewSheetOpen(true)}` to `StatusBanner`
- [ ] Render `ReviewSheet` with `open={reviewSheetOpen}` and `onOpenChange={setReviewSheetOpen}`
- [ ] Pass filtered attention items (status !== 'ok') to ReviewSheet
- [ ] After any renewal or dismissal, refresh dashboard data via TanStack Query invalidation
- [ ] Write component test: clicking banner opens sheet, sheet shows correct items

## 7. History Timeline Enhancement

- [ ] Update `HistoryTimeline` component to render `changeType` visually:
  - `'renewal'` → green refresh icon + "Renewed" label + old date → new date
  - `'dismissal'` → grey snooze icon + "Dismissed until [date]" label
  - `'edit'` → existing pencil icon + current format (unchanged)
- [ ] Handle legacy history entries (no `changeType` field) → default to `'edit'` display
- [ ] Write component test: all three change types render correctly, legacy entries handled

## 8. Dismissed Items Indicator

- [ ] On dashboard, show subtle "snoozed" badge on dismissed items in the list view (both Glance and Detail modes)
- [ ] In GlanceRow: small snooze icon next to status dot when item is dismissed
- [ ] In ItemCard: "Dismissed until [date]" caption below deadline label
- [ ] In item detail page: info banner at top when item is currently dismissed, with "Remove dismissal" action
- [ ] Write component test: snoozed badge appears when dismissedUntil is set and in future

## 9. Edge Cases & Polish

- [ ] Handle case: all attention items dismissed/renewed → ReviewSheet auto-closes, banner updates to "All clear"
- [ ] Handle case: item renewed in ReviewSheet then user opens detail page → shows updated date
- [ ] Handle case: dismissal expires → item reappears in attention count on next dashboard load
- [ ] Handle case: user tries to renew with past date → validation error shown
- [ ] Keyboard/screen reader accessibility: sheet is focus-trapped, escape closes, buttons labeled
- [ ] Run lint + typecheck + full test suite

## 10. Integration Tests

- [ ] Write E2E test: full flow — banner tap → sheet opens → renew item → sheet updates → banner updates
- [ ] Write E2E test: full flow — banner tap → sheet opens → dismiss item → choose 7 days → item disappears from attention
- [ ] Write E2E test: dismissed item reappears after dismissal period expires
- [ ] Run full regression: all existing tests still pass

---

**Sprint 6.5 Definition of Done:**
- [ ] "Tap to review" opens review sheet with attention items
- [ ] Users can renew items with a new deadline date inline
- [ ] Users can dismiss items for 7 days, 30 days, or indefinitely
- [ ] All actions logged in history timeline with distinct visual treatment
- [ ] Dismissed items show snoozed indicator on dashboard
- [ ] All new components have component tests
- [ ] All new logic has unit tests
- [ ] E2E tests cover renew and dismiss flows
- [ ] All existing tests still passing, lint clean, TypeScript clean
- [ ] M4.5 milestone achieved: Action Management Live
