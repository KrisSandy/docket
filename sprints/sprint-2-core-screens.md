# Sprint 2 — Core Screens

**Duration:** Weeks 3–4
**Milestone:** Working toward M2 (Core App Functional)
**Goal:** All primary screens built and interactive. User can add, view, edit items.
**Estimated Hours:** 35–40

---

## 1. Dashboard Screen

- [ ] Build dashboard page layout (app/dashboard/page.tsx)
- [ ] Implement StatusBanner component — "All clear" / "X items need attention"
- [ ] Wire StatusBanner to useDashboard hook (aggregates item statuses)
- [ ] Build UpcomingDeadlines section — next 3 deadlines with countdown
- [ ] Build item list in Glance mode (default) — GlanceRow for each active item
- [ ] Implement auto-sort: expired → urgent → warning → ok
- [ ] Build view mode toggle (Glance ↔ Detail)
- [ ] Build Detail mode — ItemCard for each active item
- [ ] Handle empty state ("No items tracked yet. Tap + to add your first.")
- [ ] Add floating (+) button (de-emphasized, bottom-right)
- [ ] Implement pull-to-refresh (re-query dashboard data)
- [ ] Write component test: StatusBanner shows "All clear" when no urgent items
- [ ] Write component test: StatusBanner shows count when urgent items exist
- [ ] Write component test: items sort correctly by status priority
- [ ] Write component test: empty state renders when no items
- [ ] Write E2E test: dashboard loads and displays seeded items correctly

## 2. Item Detail Screen

- [ ] Build item detail page (app/item/[id]/page.tsx)
- [ ] Render item title with status badge
- [ ] Render all fields using FieldRenderer (type-aware: currency → "€120", date → "12 Jun 2026 (34 days)")
- [ ] Show reminder summary section ("Reminders: 60, 30, 14, 7 days before NCT")
- [ ] Show "Last updated" timestamp
- [ ] Show "View History" link (navigates to history section)
- [ ] Add Edit button → switches to edit mode
- [ ] Add Archive button (with confirmation dialog)
- [ ] Wire navigation from dashboard item tap → item detail
- [ ] Write component test: all field types render correctly
- [ ] Write component test: status badge shows correct color/label
- [ ] Write E2E test: tap item on dashboard → navigate to detail → correct data shown

## 3. Item Edit Mode

- [ ] Build edit mode within item detail (toggle view ↔ edit)
- [ ] Build FieldEditor for text type (standard input)
- [ ] Build FieldEditor for currency type (€ prefix, numeric keyboard)
- [ ] Build FieldEditor for date type (native date picker)
- [ ] Build FieldEditor for number type (numeric input)
- [ ] Build FieldEditor for percentage type (% suffix, numeric)
- [ ] Build FieldEditor for URL type (url input with validation)
- [ ] Add "Add Custom Field" button (key name + type selector)
- [ ] Implement save: update all changed fields in DB
- [ ] Implement auto-history logging: record old → new value for each changed field
- [ ] Show "unsaved changes" warning on back navigation
- [ ] Validate required fields (template fields cannot be empty)
- [ ] Write component test: each FieldEditor type renders correct input
- [ ] Write component test: currency editor formats value correctly
- [ ] Write component test: save triggers history logging
- [ ] Write E2E test: edit a field → save → verify value updated → verify history entry

## 4. Add Item Flow

- [ ] Build add item page — category selection (app/add/page.tsx)
- [ ] Display all 5 categories with icon and name
- [ ] Build template form page (app/add/[category]/page.tsx)
- [ ] Pre-populate form with template fields (empty values, correct types)
- [ ] Implement save: create item + seed fields + create default reminders
- [ ] Navigate to item detail on successful save
- [ ] Handle cancel (confirm discard if fields have been filled)
- [ ] Write component test: category list shows all 5 categories
- [ ] Write component test: Vehicle template form shows all 7 fields
- [ ] Write E2E test: full add flow — select Vehicle → fill fields → save → verify on dashboard

## 5. App Shell & Navigation

- [ ] Build app shell layout (app/(app)/layout.tsx)
- [ ] Build bottom navigation bar (Dashboard | Settings)
- [ ] Implement active tab indicator
- [ ] Implement back button for stack screens (item detail, add flow)
- [ ] Handle deep linking from notification tap (route to item detail)
- [ ] Write component test: nav bar highlights active tab
- [ ] Write E2E test: navigate between tabs, verify correct screen

## 6. Settings Screen (Basic)

- [ ] Build settings page (app/settings/page.tsx)
- [ ] Display settings list with section headers
- [ ] Stub notification toggle (wired in Sprint 4)
- [ ] Stub biometric toggle (wired in Sprint 5)
- [ ] Add "Archived Items" row → navigates to archive screen
- [ ] Stub "Backup" section (wired in Sprint 5)
- [ ] Add "Export My Data" row (functional — exports JSON)
- [ ] Add "Delete All My Data" row (functional — double confirmation → wipe DB)
- [ ] Add "Privacy Policy" link (opens external URL)
- [ ] Add "About" section (version number)
- [ ] Write E2E test: Export My Data produces valid JSON with all items
- [ ] Write E2E test: Delete All My Data wipes DB and returns to empty dashboard

---

**Sprint 2 Definition of Done:**
- [ ] All screens render correctly on mobile viewport (375px)
- [ ] Full add → view → edit → archive flow works end-to-end
- [ ] All unit, component, and E2E tests passing
- [ ] CI green on main
- [ ] No TypeScript errors
- [ ] Dashboard correctly sorts items by status
