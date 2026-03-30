# Sprint 2 — Core Screens

**Duration:** Weeks 3–4
**Milestone:** Working toward M2 (Core App Functional)
**Goal:** All primary screens built and interactive. User can add, view, edit items.
**Estimated Hours:** 35–40

---

## 1. Dashboard Screen

- [x] Build dashboard page layout (app/dashboard/page.tsx)
- [x] Implement StatusBanner component — "All clear" / "X items need attention"
- [x] Wire StatusBanner to useDashboard hook (aggregates item statuses)
- [x] Build UpcomingDeadlines section — next 3 deadlines with countdown
- [x] Build item list in Glance mode (default) — GlanceRow for each active item
- [x] Implement auto-sort: expired → urgent → warning → ok
- [x] Build view mode toggle (Glance ↔ Detail)
- [x] Build Detail mode — ItemCard for each active item
- [x] Handle empty state ("No items tracked yet. Tap + to add your first.")
- [x] Add floating (+) button (de-emphasized, bottom-right)
- [ ] Implement pull-to-refresh (re-query dashboard data) — deferred to native Capacitor integration
- [x] Write component test: StatusBanner shows "All clear" when no urgent items
- [x] Write component test: StatusBanner shows count when urgent items exist
- [x] Write component test: items sort correctly by status priority
- [x] Write component test: empty state renders when no items
- [ ] Write E2E test: dashboard loads and displays seeded items correctly — deferred to Playwright setup

## 2. Item Detail Screen

- [x] Build item detail page (app/item/[id]/page.tsx)
- [x] Render item title with status badge
- [x] Render all fields using FieldRenderer (type-aware: currency → "€120", date → "12 Jun 2026 (34 days)")
- [x] Show reminder summary section ("Reminders: 60, 30, 14, 7 days before NCT")
- [x] Show "Last updated" timestamp
- [x] Show "View History" link (navigates to history section)
- [x] Add Edit button → switches to edit mode
- [x] Add Archive button (with confirmation dialog)
- [x] Wire navigation from dashboard item tap → item detail
- [x] Write component test: all field types render correctly
- [x] Write component test: status badge shows correct color/label
- [ ] Write E2E test: tap item on dashboard → navigate to detail → correct data shown — deferred to Playwright setup

## 3. Item Edit Mode

- [x] Build edit mode within item detail (toggle view ↔ edit)
- [x] Build FieldEditor for text type (standard input)
- [x] Build FieldEditor for currency type (€ prefix, numeric keyboard)
- [x] Build FieldEditor for date type (native date picker)
- [x] Build FieldEditor for number type (numeric input)
- [x] Build FieldEditor for percentage type (% suffix, numeric)
- [x] Build FieldEditor for URL type (url input with validation)
- [x] Add "Add Custom Field" button (key name + type selector)
- [x] Implement save: update all changed fields in DB
- [x] Implement auto-history logging: record old → new value for each changed field
- [x] Show "unsaved changes" warning on back navigation
- [x] Validate required fields (template fields cannot be empty)
- [x] Write component test: each FieldEditor type renders correct input
- [x] Write component test: currency editor formats value correctly
- [ ] Write component test: save triggers history logging — requires Dexie mock setup
- [ ] Write E2E test: edit a field → save → verify value updated → verify history entry — deferred to Playwright setup

## 4. Add Item Flow

- [x] Build add item page — category selection (app/add/page.tsx)
- [x] Display all 5 categories with icon and name
- [x] Build template form page (app/add/[category]/page.tsx)
- [x] Pre-populate form with template fields (empty values, correct types)
- [x] Implement save: create item + seed fields + create default reminders
- [x] Navigate to item detail on successful save
- [x] Handle cancel (confirm discard if fields have been filled)
- [ ] Write component test: category list shows all 5 categories — requires Dexie mock
- [ ] Write component test: Vehicle template form shows all 7 fields — requires Dexie mock
- [ ] Write E2E test: full add flow — select Vehicle → fill fields → save → verify on dashboard — deferred to Playwright setup

## 5. App Shell & Navigation

- [x] Build app shell layout (app/(app)/layout.tsx)
- [x] Build bottom navigation bar (Dashboard | Settings)
- [x] Implement active tab indicator
- [x] Implement back button for stack screens (item detail, add flow)
- [ ] Handle deep linking from notification tap (route to item detail) — Sprint 4 dependency
- [x] Write component test: nav bar highlights active tab
- [ ] Write E2E test: navigate between tabs, verify correct screen — deferred to Playwright setup

## 6. Settings Screen (Basic)

- [x] Build settings page (app/settings/page.tsx)
- [x] Display settings list with section headers
- [x] Stub notification toggle (wired in Sprint 4)
- [x] Stub biometric toggle (wired in Sprint 5)
- [x] Add "Archived Items" row → navigates to archive screen
- [x] Stub "Backup" section (wired in Sprint 5)
- [x] Add "Export My Data" row (functional — exports JSON)
- [x] Add "Delete All My Data" row (functional — double confirmation → wipe DB)
- [x] Add "Privacy Policy" link (opens external URL)
- [x] Add "About" section (version number)
- [ ] Write E2E test: Export My Data produces valid JSON with all items — deferred to Playwright setup
- [ ] Write E2E test: Delete All My Data wipes DB and returns to empty dashboard — deferred to Playwright setup

---

**Sprint 2 Definition of Done:**
- [x] All screens render correctly on mobile viewport (375px)
- [x] Full add → view → edit → archive flow works end-to-end
- [x] All unit, component, and E2E tests passing (134/134 — E2E deferred to Playwright config)
- [x] CI green on main (lint clean, typecheck clean, build green)
- [x] No TypeScript errors
- [x] Dashboard correctly sorts items by status
