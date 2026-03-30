# Sprint 5 — Category Expansion & Templates

**Duration:** Weeks 9–10
**Milestone:** M3.5 — All Categories Live
**Goal:** Flesh out all four category templates (with Utilities service types) to full depth with tailored fields, defaults, and reminder intervals. Validate with real-world data entry.
**Estimated Hours:** 30–35

---

## 1. Vehicle Template — Deep Polish

Vehicle was the primary template built in Sprint 1. This section upgrades it to production quality.

- [x] Review Vehicle template fields against real Irish documents (NCT cert, motor tax disc, insurance cert)
- [x] Add field: Vehicle Registration Number (text)
- [x] Add field: Make & Model (text)
- [x] Add field: Year of Manufacture (number)
- [x] Add field: Fuel Type (text — Petrol/Diesel/Electric/Hybrid)
- [x] Add field: Insurance Excess Amount (currency)
- [x] Verify default reminder intervals: 60, 30, 14, 7 days for NCT Date, Motor Tax Due, Insurance Renewal
- [x] Add sensible placeholder/helper text for each field ("e.g., 12-D-12345")
- [x] Write unit test: Vehicle template creates all expected fields with correct types
- [x] Write component test: Vehicle form renders all fields with helper text

## 2. Utilities — Electricity & Gas Service Types

- [x] Review against real Irish energy bills (Electric Ireland, Bord Gáis, SSE Airtricity, Energia)
- [x] Add Electricity-specific fields: Standing Charge, Unit Cost (kWh), MPRN, Billing Cycle
- [x] Add Gas-specific fields: Standing Charge, Unit Cost (kWh), GPRN, Billing Cycle
- [x] Add shared Utilities fields: Account Number, Payment Method, Estimated Annual Cost, Last Bill Amount, Last Bill Date
- [x] Add helper text for Electricity ("e.g., MPRN is on your bill header")
- [x] Add helper text for Gas ("e.g., GPRN starts with 5...")
- [x] Set default reminder intervals: 30, 14 days before Contract End Date
- [x] Write unit test: Electricity service type creates correct fields
- [x] Write unit test: Gas service type creates correct fields
- [x] Write component test: service type selection → correct form fields rendered

## 3. Utilities — Broadband & Mobile Service Types

- [x] Review against real Irish broadband/mobile contracts (Vodafone, Eir, Three, Virgin Media, Sky)
- [x] Add Broadband-specific fields: Download Speed, Upload Speed, Data Allowance
- [x] Add Mobile-specific fields: Data Allowance, Device on Contract, Device Payment Remaining
- [x] Add shared fields: Account Number, Cancellation Notice Period
- [x] Add TV/Streaming service type fields: Package Tier, Number of Channels/Services
- [x] Add Water service type fields: Standing Charge (note: Irish Water is flat-rate currently)
- [x] Set default reminder intervals: 30, 14 days before Contract End Date
- [x] Write unit test: Broadband service type creates correct fields
- [x] Write unit test: Mobile service type creates correct fields
- [x] Write component test: Broadband form renders speed fields correctly

## 4. Housing Template — Full Build-Out

- [x] Review Housing template against real Irish mortgage/rental documents
- [x] Add field: Property Address (text)
- [x] Add field: Mortgage/Rent Amount (currency) — rename from "Monthly Payment" for clarity
- [x] Add field: Mortgage Account Number (text)
- [x] Add field: Property Tax (LPT) Amount (currency)
- [x] Add field: LPT Due Date (date)
- [x] Add field: Tenancy/Lease End Date (date) — for renters
- [x] Set default reminder intervals: 90, 30 days before Fixed Term End Date; 30, 14 days before LPT Due Date
- [x] Write unit test: Housing template creates all expected fields
- [x] Write component test: Housing form renders correctly

## 5. Insurance Template — Full Build-Out

- [x] Review Insurance template against real Irish insurance documents (home, life, health, pet, travel)
- [x] Add field: Insurance Type (text — Home/Life/Health/Pet/Travel)
- [x] Add field: Policy Number (text)
- [x] Add field: Cover Amount (currency)
- [x] Add field: Excess Amount (currency)
- [x] Add field: Payment Frequency (text — Annual/Monthly)
- [x] Add field: Named Insured (text)
- [x] Add field: Broker Name (text)
- [x] Add field: Broker Contact (text)
- [x] Set default reminder intervals: 60, 30, 14 days before Renewal Date
- [x] Write unit test: Insurance template creates all expected fields
- [x] Write component test: Insurance form renders correctly

## 6. Utilities Service Type Picker

- [x] Build service type selection step in Add Item flow (when user picks "Utilities")
- [x] Display service types as selectable cards: Electricity, Gas, Broadband, Mobile, TV/Streaming, Water
- [x] Selected service type determines which fields appear in the form
- [x] Store serviceType on the Item record
- [x] Show service type icon/label on dashboard GlanceRow and ItemCard
- [x] Write component test: selecting Electricity shows energy-specific fields
- [x] Write component test: selecting Broadband shows connectivity-specific fields
- [ ] Write E2E test: add Electricity item → verify service type shown on dashboard

## 7. Custom Category Support

- [x] Build "Create Custom Category" flow accessible from Add Item screen
- [x] User enters: category name, icon selection (from Lucide icon picker), initial fields
- [x] Custom categories stored in categories table with `isDefault: false`
- [x] Custom categories appear alongside built-in categories in Add Item flow
- [x] Users can add/remove fields from custom categories
- [x] Write component test: custom category creation flow
- [ ] Write E2E test: create custom category → add item with it → verify on dashboard

## 8. Category Management

- [x] Add category icon to each GlanceRow and ItemCard (if not already done in Sprint 3)
- [x] Add category filter on dashboard — filter by tapping category icon/chip
- [x] Build category summary in settings ("3 Vehicle items, 2 Utilities, 1 Housing")
- [x] Ensure all new template fields work correctly with: status calculation, history logging, reminder scheduling, backup/restore
- [ ] Write E2E test: add one item per category (including multiple Utilities service types) → verify all appear on dashboard with correct status
- [ ] Write E2E test: category filter shows/hides correct items

## 9. Template Migration

- [x] Create Dexie migration for expanded template fields (version upgrade)
- [x] Existing items keep their current fields unchanged
- [x] New fields are available when editing existing items ("Add missing fields from template" option)
- [x] Write unit test: migration adds new template fields without losing existing data
- [ ] Write E2E test: existing Vehicle item gains access to new fields after migration

---

**Sprint 5 Definition of Done:**
- [x] All 4 category templates fully fleshed out with real-world field coverage
- [x] All 6 Utilities service types have correct type-specific fields
- [x] Custom category creation working
- [x] Category filtering on dashboard working
- [x] All new fields integrate with notifications, history, and backup
- [x] Migration tested: existing items unaffected, new fields available
- [x] All tests passing, CI green
- [x] M3.5 milestone achieved: All Categories Live

**Note:** E2E tests (Playwright) are deferred to Sprint 7 — Launch, as the Playwright test infrastructure requires browser setup not yet configured in CI. All unit and component tests are passing (267 tests, 29 files).
