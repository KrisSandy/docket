# Sprint 1 — Foundation

**Duration:** Weeks 1–2
**Milestone:** M1 — Foundation Ready
**Goal:** Project scaffolded, database operational, design system defined, CI running.
**Estimated Hours:** 35–40

---

## 1. Project Setup

- [x] Initialize Next.js 15 project with TypeScript (strict mode)
- [x] Configure Tailwind CSS v4
- [ ] Install and configure shadcn/ui
- [x] Apply tweakcn theme CSS variables to globals.css
- [x] Set up App Router with route groups: (marketing) and (app)
- [x] Create placeholder pages for all routes (dashboard, item/[id], add, settings, history)
- [ ] Install Capacitor 6 and initialize iOS + Android projects
- [ ] Configure capacitor.config.ts
- [x] Set up ESLint + Prettier with strict rules
- [ ] Create .env.example (feature flags only, no secrets)
- [x] Initialize Git repo with .gitignore
- [ ] Write README with setup and run instructions

## 2. CI Pipeline

- [x] Create GitHub Actions workflow: ci.yml
- [x] Configure lint step (ESLint + TypeScript type check)
- [x] Configure Vitest test step
- [x] Configure build verification step (next build)
- [x] Ensure CI runs on every push and PR
- [x] Configure CI to block merge on any failure
- [x] Add Playwright setup (tests will be added in later sprints)

## 3. Database Layer

- [x] Install Dexie.js
- [x] Define TypeScript interfaces for all entities (Category, Item, ItemField, Reminder, HistoryEntry, AppSettings)
- [x] Create Dexie DB class with version 1 schema (db/schema.ts)
- [x] Create DB singleton (db/database.ts)
- [x] Implement seed function for default categories (Vehicle, Utilities, Housing, Connectivity, Insurance)
- [ ] Write unit test: DB initializes without error
- [ ] Write unit test: seed creates all 5 default categories
- [ ] Write unit test: schema version is tracked correctly

## 4. Data Operations (Hooks)

- [x] Implement useItems hook — createItem(categoryId, title)
- [x] Implement useItems hook — getItem(id) with all fields
- [x] Implement useItems hook — updateItem(id, updates)
- [x] Implement useItems hook — deleteItem(id) with cascade
- [x] Implement useItems hook — listItems(filters?) with status
- [x] Implement useItemFields hook — getFieldsForItem(itemId)
- [x] Implement useItemFields hook — updateField(id, value) with history logging
- [x] Implement useItemFields hook — addCustomField(itemId, key, type)
- [ ] Write unit test: create item → verify in DB
- [ ] Write unit test: update field → verify history entry created
- [ ] Write unit test: delete item → verify fields and reminders cascade deleted
- [ ] Write unit test: list items returns correct sort order

## 5. Category Templates

- [x] Define template data structure in lib/templates.ts
- [x] Create Vehicle template (7 fields: Insurance Provider, Policy Number, Annual Premium, Motor Tax Due, NCT Date, Insurance Renewal, Insurer Contact)
- [x] Create Utilities template (6 fields: Provider, Plan Name, Monthly Cost, Contract End, Standing Charge, Unit Cost)
- [x] Create Housing template (4 fields: Mortgage Provider, Interest Rate, Monthly Payment, Fixed Term End)
- [x] Create Connectivity template (4 fields: Provider, Speed Tier, Monthly Cost, Contract End)
- [x] Create Insurance template (5 fields: Provider, Policy Type, Annual Premium, Renewal Date, Policy Number)
- [x] Implement template-to-fields seeding on item creation
- [x] Write unit test: creating item from Vehicle template generates all 7 fields
- [x] Write unit test: creating item from each template generates correct field count and types

## 6. Core Utilities

- [x] Implement dates.ts — daysUntilDate(date)
- [x] Implement dates.ts — formatCountdown(days) → "34 days" / "Expired 5 days ago"
- [x] Implement dates.ts — formatDate(date) → "12 Jun 2026"
- [x] Implement dates.ts — isExpired(date)
- [x] Implement dates.ts — getEarliestDeadline(fields[])
- [x] Implement currency.ts — formatEUR(amount) → "€120.00"
- [x] Implement currency.ts — parseEUR(string) → number
- [x] Implement status.ts — calculateStatus(daysUntil) → ok/warning/urgent/expired
- [x] Implement status.ts — getStatusPriority(status) → sort order number
- [x] Write unit test: daysUntilDate with future date
- [x] Write unit test: daysUntilDate with past date
- [x] Write unit test: daysUntilDate with today
- [x] Write unit test: daysUntilDate with timezone edge cases (DST transition)
- [x] Write unit test: formatCountdown for positive, zero, negative days
- [x] Write unit test: calculateStatus for all thresholds (>30, ≤30, ≤7, <0)
- [x] Write unit test: formatEUR and parseEUR round-trip correctly
- [x] Write unit test: getStatusPriority sorts correctly

## 7. Design System Primitives

- [x] Build StatusDot component (color by status, 3 sizes)
- [x] Build MetricRow component (label + value, handles currency/date/text/number)
- [ ] Build Card component (shadcn card + status border + tap handler)
- [x] Build GlanceRow component (status dot + title + key date, single line)
- [x] Build SectionHeader component
- [x] Build EmptyState component (icon + message + optional CTA)
- [ ] Build ActionButton component (primary, secondary, destructive)
- [x] Write component test: StatusDot renders correct color for each status
- [x] Write component test: MetricRow formats currency correctly
- [x] Write component test: GlanceRow shows correct status and date
- [x] Verify all components meet 44x44pt touch target minimum
- [ ] Verify contrast ratios meet WCAG AA

---

**Sprint 1 Definition of Done:**
- [x] All unit tests passing (95/95)
- [x] All component tests passing
- [x] CI pipeline green on main branch
- [x] Can create an item from any template and retrieve it with all fields
- [x] Design primitives render correctly in browser
- [ ] Capacitor project builds for iOS and Android (even if empty shell)
