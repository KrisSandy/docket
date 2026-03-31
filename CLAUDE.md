# HomeDocket — Project Instructions

## Project Overview

HomeDocket is a household management dashboard for tracking recurring expenses, contracts, and compliance deadlines (NCT, motor tax, insurance renewals, utility contracts). EU/Ireland-focused. Free app, monetization deferred.

**Full spec:** `docs/functional-and-technical-spec.md`
**Milestones:** `sprints/milestones.md`
**Sprints:** `sprints/` folder — each sprint has checkboxed tasks

### Sprint Files

| Sprint | File | Milestone |
|--------|------|-----------|
| Sprint 1 — Foundation | `sprints/sprint-1-foundation.md` | M1: Foundation Ready |
| Sprint 2 — Core Screens | `sprints/sprint-2-core-screens.md` | M2: Core App Functional |
| Sprint 3 — Dashboard Polish | `sprints/sprint-3-dashboard-polish.md` | M2: Core App Functional |
| Sprint 4 — Notifications | `sprints/sprint-4-notifications.md` | M3: Notifications Live |
| Sprint 5 — Category Expansion | `sprints/sprint-5-category-expansion.md` | M3.5: All Categories Live |
| Sprint 6 — Security & Backup | `sprints/sprint-6-security-backup.md` | M4: Secure & Backed Up |
| Sprint 6.5 — Action Review | `sprints/sprint-6.5-action-review.md` | M4.5: Action Management Live |
| Sprint 7 — Launch | `sprints/sprint-7-launch.md` | M5: Launch Ready |
| Sprint 8 — Post-Launch | `sprints/sprint-8-post-launch.md` | M6: Post-Launch Stable |

## Current Sprint

> **ACTIVE: Sprint 6.5 — Action Review & Completion** (`sprints/sprint-6.5-action-review.md`)
> **Status: Not started**
>
> Sprint 6 — Security & Backup: **Complete** (333 tests passing, lint clean, TypeScript clean)

When working on tasks:
1. Open the current sprint file before starting work.
2. Complete tasks in order within each numbered section.
3. After completing a task, mark it done by changing `- [ ]` to `- [x]` in the sprint file.
4. When all tasks in a sprint are checked off, update this section to point to the next sprint.
5. Never skip a task without documenting why in the sprint file.
6. Run full test suite before marking any section complete.

# currentDate
Today's date is 2026-03-30.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript (strict)
- **Styling:** Tailwind CSS v4 + shadcn/ui + tweakcn custom theme
- **Database:** Dexie.js (IndexedDB) — local-first, no backend
- **Data Layer:** TanStack Query v5
- **State:** React Context (no Redux/Zustand)
- **Native Bridge:** Capacitor 6 (iOS + Android)
- **Notifications:** @capacitor/local-notifications (native scheduled, no server)
- **Biometric:** @capacitor-community/biometric-auth
- **Testing:** Vitest (unit) + React Testing Library (component) + Playwright (E2E)
- **CI/CD:** GitHub Actions + Vercel (web) + Capacitor CLI (native)
- **Error Tracking:** Sentry (post-launch)

## Architecture Principles

1. **Local-first.** All data lives in IndexedDB on the user's device. No backend server in V1. No cloud sync.
2. **Single codebase, three targets.** Next.js web app deployed to Vercel. Same codebase wrapped with Capacitor for iOS App Store and Android Play Store.
3. **Notifications are the core feature.** Everything else supports the reminder system. Use @capacitor/local-notifications for native scheduling — no server dependency.
4. **Notification content must be generic.** Never include provider names, amounts, dates, or any PII in notification title/body. Details shown only inside the app after biometric unlock.
5. **Test everything.** Full regression on every push. CI blocks merge on any failure. 100% coverage target on `lib/` folder.
6. **Static export for native.** Next.js uses `output: 'export'` to produce static files for Capacitor. Dynamic routes use query params (`/item?id=xxx`, `/add/form?categoryId=xxx`) instead of path segments because static export cannot pre-render IndexedDB-driven dynamic paths. Pages using `useSearchParams` must be wrapped in `<Suspense>`.

## Design System

- **Theme:** iOS-inspired tweakcn theme. Primary: `rgb(0, 115, 255)`. Font: Inter. Radius: 0.85rem. Full dark mode.
- **Theme source file:** `sample-css.tsx` (CSS variables for globals.css)
- **Status tokens:** `--status-ok` (green), `--status-warning` (amber), `--status-urgent` (red), `--status-expired` (dark red), `--status-neutral` (grey)
- **Status communication:** Triple-channel — color + position (urgent sorts to top) + typography weight (urgent = semibold). Never rely on color alone.
- **Typography:** 4-step scale — Display (28px/bold), Title (18px/semibold), Body (15px/regular), Caption (13px/regular)
- **Spacing:** 4px base grid. Use 4, 8, 16, 24, 32, 48.
- **Touch targets:** Minimum 44x44pt everywhere. No exceptions.

## Project Structure

src/
  app/
    (marketing)/          # SEO pages (landing, blog, privacy)
    (app)/                # App screens (behind biometric auth)
      dashboard/          # Main "Morning Coffee Glance" screen
      item/               # Item detail/edit (query param: ?id=xxx)
      add/                # Category picker
      add/form/           # Add new item form (query param: ?categoryId=xxx&name=xxx)
      settings/           # Settings, backup, export
      history/            # Archived items
  components/
    ui/                   # shadcn/ui primitives
    dashboard/            # StatusBanner, UpcomingDeadlines, GlanceRow, ItemCard
    items/                # ItemDetail, ItemForm, FieldRenderer, FieldEditor, HistoryTimeline
    layout/               # AppShell, BottomNav, LockScreen
  db/
    schema.ts             # Dexie DB class + TypeScript interfaces
    database.ts           # DB singleton
    migrations.ts         # Version upgrades
    seed.ts               # Default category templates
  hooks/                  # useItems, useItemFields, useReminders, useDashboard, useBackup, useBiometric, useHistory
  lib/                    # dates.ts, currency.ts, notifications.ts, encryption.ts, templates.ts, status.ts
  types/                  # Shared TypeScript types
  constants/              # categories.ts, defaults.ts
tests/
  unit/                   # Vitest
  component/              # React Testing Library
  e2e/                    # Playwright

## Data Model

Uses EAV (Entity-Attribute-Value) pattern for flexible fields:

- **categories** — 4 built-in templates (Vehicle, Utilities, Housing, Insurance)
- **items** — One per tracked service (e.g., "Car Insurance - Aviva")
- **itemFields** — Key-value fields per item (template fields + user custom fields)
- **reminders** — Configurable per item per date field (daysBefore: 60/30/14/7/1)
- **history** — Immutable change log (old value → new value + timestamp)
- **settings** — App-level key-value preferences

## Key Data Types

fieldType: 'text' | 'currency' | 'date' | 'number' | 'percentage' | 'url'
itemStatus: 'active' | 'archived'
displayStatus: 'ok' | 'warning' | 'urgent' | 'expired'

## Status Calculation

> 30 days to deadline  → ok (green)
≤ 30 days              → warning (amber)
≤ 7 days               → urgent (red)
< 0 (past deadline)    → expired (dark red)
no deadline set        → ok

## Category Templates

| Category | Service Types | Key Date Fields |
|----------|--------------|-----------------|
| Vehicle | Car, Motorbike | NCT Date, Motor Tax Due, Insurance Renewal |
| Utilities | Electricity, Gas, Broadband, Mobile, TV/Streaming, Water | Contract End Date (+ type-specific fields) |
| Housing | Mortgage, Rental | Fixed Term End Date, LPT Due |
| Insurance | Home, Life, Health, Pet, Travel | Renewal Date |

## Coding Standards

### TypeScript
- Strict mode enabled. No `any` types. No `@ts-ignore`.
- All DB entities have TypeScript interfaces in `db/schema.ts`.
- All hook return types are explicitly typed.

### Components
- Functional components only. No class components.
- Use shadcn/ui primitives from `components/ui/`. Don't build custom versions of things shadcn provides.
- Every component that displays status must use all three status channels (color + position + typography).

### Date Handling
- All date math goes in `lib/dates.ts`. No inline date calculations.
- Use `date-fns` for date operations. No raw Date arithmetic.
- Always handle timezone edge cases (DST transitions, UTC vs local).
- Every date function must have unit tests covering: future dates, past dates, today, DST boundaries.

### Currency
- Default currency: EUR. Format: `€X,XXX.XX`
- All formatting in `lib/currency.ts`.

### Testing
- Every new function in `lib/` needs unit tests before the PR is merged.
- Every new component needs a component test.
- Every user flow needs an E2E test.
- Tests must assert behavior, not implementation. Test what the user sees, not internal state.
- No `test.skip` or `test.todo` in main branch.

### Security
- No PII in logs, notifications, error messages, or Sentry breadcrumbs.
- Backup files must be encrypted with user passphrase (AES-256-GCM via Web Crypto API).
- Biometric gates encryption key access, not just UI.
- GDPR: data export (JSON/CSV) and full deletion must work at all times.

### Git
- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`
- One logical change per commit.
- PR must pass CI (lint + typecheck + unit + component + E2E + build) before merge.

## What NOT to Build (V1)

- No backend server or API
- No cloud sync or multi-device
- No user accounts or authentication (beyond biometric device lock)
- No household sharing / multi-user
- No OCR or AI features
- No document upload
- No monetization, payments, or premium tiers
- No analytics or telemetry (added V2 with opt-in consent)
- No provider comparison or switching

## File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `status-banner.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-items.ts`)
- Lib utilities: `kebab-case.ts` (e.g., `dates.ts`)
- Tests mirror source: `dates.test.ts`, `status-banner.test.tsx`
- Pages follow Next.js App Router: `page.tsx`, `layout.tsx`

## Quick Reference Commands

# Development
npm run dev              # Start Next.js dev server
npx cap sync            # Sync web build to native projects
npx cap open ios        # Open Xcode project
npx cap open android    # Open Android Studio project

# Testing
npm run test            # Run Vitest unit + component tests
npm run test:e2e        # Run Playwright E2E tests
npm run test:coverage   # Run tests with coverage report

# Build (web)
npm run build           # Next.js production build (static export to out/)
npm run lint            # ESLint + TypeScript check

# Build (Android APK)
npm run build           # Build web assets first
npx cap sync android    # Sync to Android project
cd android && ./gradlew assembleDebug  # Build debug APK
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# CI (runs automatically on push)
# lint → typecheck → unit tests → component tests → e2e tests → build
