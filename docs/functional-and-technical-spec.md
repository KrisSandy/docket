# HomeDocket — Functional & Technical Specification

**Version:** 1.0
**Date:** March 30, 2026
**Author:** Sandy
**Status:** Final (Pre-development)

---

## 1. Product Overview

### 1.1 What Is HomeDocket?

HomeDocket is a centralized household management dashboard that tracks recurring expenses, contracts, and compliance deadlines (NCT, motor tax, insurance renewals, utility contracts). It replaces the scattered mix of calendar reminders, spreadsheets, and memory that most households currently rely on.

### 1.2 The Insight

Generic bill-tracking apps (Mint, Truebill, Bobby) are built for US markets and ignore the regulatory complexity of EU/Irish households — NCT testing, motor tax cycles, SEPA-specific provider switching windows, and contract structures that differ fundamentally from US utilities. HomeDocket is localized from the ground up for EU households, starting with Ireland.

### 1.3 Target User

Irish homeowners aged 28–50 who manage multiple household contracts and have been burned at least once by a missed deadline, an auto-renewed contract at a higher rate, or a forgotten NCT/tax date.

### 1.4 V1 Goal

A free, reliable reminders-first app that tracks all five household categories with native notifications. Monetization and advanced features (provider comparison, household sharing) come later.

### 1.5 Business Model (Deferred)

V1 is free with no monetization. Future revenue exploration:
- Anonymized aggregate data (what Irish households pay by region/provider)
- Affiliate/referral for provider switching
- Premium tier for household sharing and advanced analytics

### 1.6 Strategic Moat

**Counter-Positioning:** Banks and providers will never build a tool that encourages users to switch away from them.
**Data Network Effects (future):** Aggregated anonymized pricing data becomes more valuable as more Irish households join. This data is unavailable to competitors who don't have the user base.

---

## 2. Functional Requirements

### 2.1 The "Morning Coffee Glance" — Dashboard

The main screen is NOT a grid of cards. It is a **status-first** interface designed for a 3-second glance.

**Primary element:** A single status banner.
- "All clear — nothing needs attention" (green state)
- "2 items need attention" (amber/red state, tappable to see which)

**Secondary element:** Upcoming deadlines list (next 3 deadlines with countdown: "NCT — 34 days", "Car Insurance — 62 days").

**Tertiary element:** Full item list in **Glance mode** (default) — one compact line per item: status dot + title + key date. Tappable to expand.

**Detail mode:** Available via toggle — card layout with icon, title, 2–3 key metrics, status indicator. Not the default.

**Auto-sorting:** Urgent items (≤7 days or expired) rise to top. Warning items (≤30 days) next. OK items last. Archived items hidden.

### 2.2 Item Categories & Templates

Four categories ship in V1. Vehicle is the deepest (most fields, best defaults). Utilities is the broadest (covers multiple service types). Others are lighter and will be fleshed out based on user feedback.

| Category | Service Types | Template Fields | Status |
|----------|--------------|----------------|--------|
| **Vehicle** (primary) | Car, Motorbike | Insurance Provider, Policy Number, Annual Premium, Motor Tax Due Date, NCT Date, Insurance Renewal Date, Insurer Contact | Deep — fully fleshed out |
| **Utilities** | Electricity, Gas, Broadband, Mobile, TV/Streaming, Water | Service Type, Provider, Plan Name, Monthly Cost, Contract End Date + type-specific fields (see below) | Broad — multiple service types |
| **Housing** | Mortgage, Rental | Mortgage Provider, Interest Rate, Monthly Payment, Fixed Term End Date | Standard |
| **Insurance** | Home, Life, Health, Pet, Travel | Provider, Policy Type, Annual Premium, Renewal Date, Policy Number | Standard |

**Utilities — Service-Specific Fields:**

| Service Type | Additional Fields |
|-------------|-------------------|
| Electricity | Standing Charge, Unit Cost (kWh), MPRN, Billing Cycle |
| Gas | Standing Charge, Unit Cost (kWh), GPRN, Billing Cycle |
| Broadband | Download Speed, Upload Speed, Data Allowance |
| Mobile | Data Allowance, Device on Contract, Device Payment Remaining |
| TV/Streaming | Package Tier, Number of Channels/Services |
| Water | Standing Charge (Irish Water is flat-rate currently) |

When adding a Utilities item, the user first selects the service type, then gets the relevant fields. All Utilities items share common fields (Provider, Plan Name, Monthly Cost, Contract End Date) plus type-specific ones.

**Custom fields:** Users can add arbitrary key-value fields to any item ("Landlord phone", "Meter reading date", etc.).

### 2.3 Item Detail & Edit View

**View mode:** Clean summary of all stored fields, rendered by type (currency shows €, dates show countdown, etc.). Shows reminder configuration and last-updated timestamp.

**Edit mode:** Inline editing per field. Currency fields have € prefix. Date fields use native date picker. Changes are auto-logged to history.

**No document upload.** Data is entered manually as a one-time setup per item.

### 2.4 Add Item Flow

1. Tap (+) button (de-emphasized in UI — not the hero action)
2. Select category from list (icon + name)
3. Template form appears with pre-populated field structure
4. Fill in fields, save
5. Default reminders auto-created based on category
6. Navigate to item detail view

### 2.5 Notifications & Reminders

**This is the core feature.** Everything else supports this.

**Default reminders per category:**
- Vehicle: 60, 30, 14, 7 days before NCT/Tax/Insurance dates
- Utilities (all types): 30, 14 days before contract end
- Housing: 90, 30 days before fixed term end
- Insurance: 60, 30, 14 days before renewal

**User-configurable:** Users can toggle preset intervals or add custom intervals per item.

**Notification content:** Generic on lock screen ("You have an upcoming deadline — tap to review"). Full details shown only inside the app. No PII in notifications.

**Reliability:** Native local notifications via Capacitor — scheduled in advance, fire even when app is closed. No server dependency.

### 2.6 History & Archive

**Change history:** Every field edit is logged with old value, new value, and timestamp. Displayed as a timeline in item detail ("Monthly cost changed from €95 to €120 on 15 Jan 2026").

**Archive:** Items can be archived (soft delete). Archived items are hidden from dashboard but accessible from Settings → Archived Items. Default retention: 3 years. User can extend or delete.

### 2.7 Settings

- Notification preferences (global toggle, per-category defaults)
- Biometric lock toggle (FaceID/TouchID/Fingerprint)
- Backup (trigger manual backup, show last backup date)
- Restore from backup
- Export my data (JSON/CSV)
- Delete all my data (double confirmation)
- Privacy policy link
- About / version info

### 2.8 Data Export & GDPR

- Full data export as JSON or CSV (one tap from settings)
- Full data deletion (wipes local DB, keychain, any backup references)
- Privacy policy published before launch
- No data leaves the device in V1 (local-first, no analytics, no telemetry)
- Opt-in analytics added in V2 only with explicit consent

---

## 3. Technical Specification

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   SINGLE CODEBASE                │
│                                                  │
│   Next.js 15 (App Router) + React 19 + TypeScript│
│   Tailwind CSS v4 + shadcn/ui (tweakcn theme)    │
│   Dexie.js (IndexedDB) for local data            │
│   TanStack Query for data layer                  │
│                                                  │
├─────────────┬──────────────┬────────────────────┤
│  WEB (PWA)  │  iOS NATIVE  │  ANDROID NATIVE    │
│  Vercel     │  Capacitor   │  Capacitor         │
│  Free host  │  App Store   │  Play Store        │
│  SEO pages  │  Native notif│  Native notif      │
│  Web Push   │  FaceID      │  Fingerprint       │
└─────────────┴──────────────┴────────────────────┘

         No backend server in V1
         All data local to device
```

### 3.2 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR for SEO pages, SPA for app screens |
| Language | TypeScript (strict mode) | Type safety everywhere |
| UI Library | React 19 | Components, hooks, state |
| Styling | Tailwind CSS v4 | Utility-first, shadcn/ui compatible |
| Components | shadcn/ui + tweakcn theme | Pre-built accessible components |
| Local Database | Dexie.js (IndexedDB) | Typed schemas, built-in migrations, offline-first |
| Data Layer | TanStack Query v5 | Caching, invalidation, optimistic updates |
| State | React Context | Global state (theme, auth, preferences) |
| Native Bridge | Capacitor 6 | Web → native iOS/Android |
| Notifications | @capacitor/local-notifications | Scheduled native notifications, no server |
| Biometric | @capacitor-community/biometric-auth | FaceID/TouchID/Fingerprint |
| Encryption | Web Crypto API + Capacitor Keychain | Data encryption at rest |
| Testing | Vitest + React Testing Library + Playwright | Unit, component, E2E |
| CI/CD | GitHub Actions + Vercel + Capacitor CLI | Automated test, build, deploy |
| Hosting | Vercel (free tier) | Web deployment |
| Error Tracking | Sentry | Crash reporting (post-launch) |

### 3.3 Project Structure

```
homedocket/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # SEO/content pages
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── blog/
│   │   │   │   └── [slug]/page.tsx   # Blog posts (SEO content)
│   │   │   └── privacy/page.tsx      # Privacy policy
│   │   ├── (app)/                    # App screens (behind auth)
│   │   │   ├── dashboard/page.tsx    # Main dashboard
│   │   │   ├── item/[id]/page.tsx    # Item detail/edit
│   │   │   ├── add/page.tsx          # Add item flow
│   │   │   ├── add/[category]/page.tsx
│   │   │   ├── settings/page.tsx     # Settings
│   │   │   ├── history/page.tsx      # Archived items
│   │   │   └── layout.tsx            # App shell (nav, status bar)
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Tailwind + theme tokens
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── dashboard/
│   │   │   ├── status-banner.tsx     # "All clear" / "2 items need attention"
│   │   │   ├── upcoming-deadlines.tsx
│   │   │   ├── item-glance-row.tsx   # Compact single-line item
│   │   │   └── item-card.tsx         # Expanded card view
│   │   ├── items/
│   │   │   ├── item-detail.tsx
│   │   │   ├── item-form.tsx
│   │   │   ├── field-renderer.tsx    # Renders field by type
│   │   │   ├── field-editor.tsx      # Edits field by type
│   │   │   └── history-timeline.tsx
│   │   └── layout/
│   │       ├── app-shell.tsx
│   │       ├── bottom-nav.tsx
│   │       └── lock-screen.tsx
│   ├── db/
│   │   ├── schema.ts                 # Dexie schema definition
│   │   ├── database.ts               # Dexie DB singleton
│   │   ├── migrations.ts             # Version upgrades
│   │   └── seed.ts                   # Default category templates
│   ├── hooks/
│   │   ├── use-items.ts              # Item CRUD
│   │   ├── use-item-fields.ts        # Field CRUD
│   │   ├── use-reminders.ts          # Reminder CRUD + scheduling
│   │   ├── use-dashboard.ts          # Aggregated dashboard state
│   │   ├── use-backup.ts             # Export/import
│   │   ├── use-biometric.ts          # Auth wrapper
│   │   └── use-history.ts            # Change log queries
│   ├── lib/
│   │   ├── dates.ts                  # All date math (HEAVILY tested)
│   │   ├── currency.ts               # EUR formatting
│   │   ├── notifications.ts          # Capacitor notification wrapper
│   │   ├── encryption.ts             # Web Crypto / Keychain wrapper
│   │   ├── templates.ts              # Category template definitions
│   │   └── status.ts                 # Status calculation (OK/Warn/Urgent)
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript types
│   └── constants/
│       ├── categories.ts             # Category metadata (names, icons)
│       └── defaults.ts               # Default reminder intervals
├── ios/                              # Capacitor iOS project (generated)
├── android/                          # Capacitor Android project (generated)
├── public/
│   ├── icons/                        # App icons, PWA manifest icons
│   └── manifest.json                 # PWA manifest
├── tests/
│   ├── unit/                         # Vitest unit tests
│   │   ├── dates.test.ts
│   │   ├── status.test.ts
│   │   ├── currency.test.ts
│   │   ├── notifications.test.ts
│   │   └── migrations.test.ts
│   ├── component/                    # React Testing Library
│   │   ├── status-banner.test.tsx
│   │   ├── item-glance-row.test.tsx
│   │   ├── field-editor.test.tsx
│   │   └── dashboard.test.tsx
│   └── e2e/                          # Playwright
│       ├── add-item.spec.ts
│       ├── edit-item.spec.ts
│       ├── notifications.spec.ts
│       ├── backup-restore.spec.ts
│       └── full-regression.spec.ts
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Run tests on every push
│       └── deploy.yml                # Deploy to Vercel on main
├── capacitor.config.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

### 3.4 Data Model (Dexie.js / IndexedDB)

```typescript
// db/schema.ts

import Dexie, { type Table } from 'dexie';

export interface Category {
  id: string;           // uuid
  name: string;         // "Vehicle", "Utilities"
  icon: string;         // lucide icon name
  sortOrder: number;
  isDefault: boolean;   // true for built-in templates
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;           // uuid
  categoryId: string;
  serviceType?: string; // e.g., "electricity", "gas", "broadband" for Utilities; "car", "motorbike" for Vehicle
  title: string;        // "Electricity - SSE Airtricity"
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemField {
  id: string;           // uuid
  itemId: string;
  fieldKey: string;     // "provider", "monthly_cost", "nct_date"
  fieldValue: string | null;
  fieldType: 'text' | 'currency' | 'date' | 'number' | 'percentage' | 'url';
  isTemplateField: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  itemId: string;
  fieldKey: string;     // which date field triggers this
  daysBefore: number;   // 60, 30, 14, 7, 1
  isEnabled: boolean;
  lastNotifiedAt: Date | null;
  createdAt: Date;
}

export interface HistoryEntry {
  id: string;
  itemId: string;
  fieldKey: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: Date;
}

export interface AppSettings {
  key: string;          // "biometricEnabled", "lastBackupDate", etc.
  value: string;
}

export class HomeDocketDB extends Dexie {
  categories!: Table<Category>;
  items!: Table<Item>;
  itemFields!: Table<ItemField>;
  reminders!: Table<Reminder>;
  history!: Table<HistoryEntry>;
  settings!: Table<AppSettings>;

  constructor() {
    super('homedocket');

    // Version 1 — initial schema
    this.version(1).stores({
      categories: 'id, name, sortOrder',
      items: 'id, categoryId, serviceType, status, updatedAt',
      itemFields: 'id, itemId, fieldKey, fieldType, [itemId+fieldKey]',
      reminders: 'id, itemId, fieldKey, [itemId+fieldKey]',
      history: 'id, itemId, changedAt',
      settings: 'key',
    });
  }
}

export const db = new HomeDocketDB();
```

### 3.5 Status Calculation Logic

```typescript
// lib/status.ts

export type ItemStatus = 'ok' | 'warning' | 'urgent' | 'expired';

export function calculateStatus(daysUntilDeadline: number | null): ItemStatus {
  if (daysUntilDeadline === null) return 'ok';  // no deadline set
  if (daysUntilDeadline < 0) return 'expired';
  if (daysUntilDeadline <= 7) return 'urgent';
  if (daysUntilDeadline <= 30) return 'warning';
  return 'ok';
}

export function getStatusPriority(status: ItemStatus): number {
  const priorities: Record<ItemStatus, number> = {
    expired: 0,   // highest priority (top of list)
    urgent: 1,
    warning: 2,
    ok: 3,         // lowest priority (bottom of list)
  };
  return priorities[status];
}
```

### 3.6 Notification Architecture

```typescript
// lib/notifications.ts — Capacitor wrapper

import { LocalNotifications } from '@capacitor/local-notifications';
import { subDays, isBefore } from 'date-fns';

export async function scheduleReminder(
  reminderId: string,
  itemTitle: string,
  deadlineDate: Date,
  daysBefore: number
): Promise<void> {
  const triggerDate = subDays(deadlineDate, daysBefore);

  // Don't schedule past notifications
  if (isBefore(triggerDate, new Date())) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: hashToInt(reminderId), // Capacitor needs numeric ID
        title: 'HomeDocket Reminder',
        body: 'You have an upcoming deadline. Tap to review.',
        schedule: { at: triggerDate },
        extra: { reminderId, route: '/dashboard' },
      },
    ],
  });
}

export async function cancelReminder(reminderId: string): Promise<void> {
  await LocalNotifications.cancel({
    notifications: [{ id: hashToInt(reminderId) }],
  });
}

export async function rescheduleAllReminders(): Promise<void> {
  // Called on app launch to verify all pending notifications
  // Cancels stale ones, schedules missing ones
  // Handles OS notification clearing (Android OEM issue)
}
```

### 3.7 Security Implementation

**Layer 1 — Biometric Lock:**
- Uses @capacitor-community/biometric-auth
- Prompts on app launch and return from background (>30s away)
- Fallback to device passcode
- Toggle in settings (default: on)

**Layer 2 — Backup Encryption:**
- Export: serialize DB → encrypt with user passphrase via Web Crypto API (AES-256-GCM) → save file
- Import: file picker → decrypt with passphrase → validate schema → replace local DB → run migrations
- Passphrase is never stored — user must remember it

**Layer 3 — Transport (V2 only):**
- TLS 1.3 for all API communication when backend is added
- Certificate pinning for own domain

### 3.8 Testing Strategy

**Philosophy:** Every change is tested. Full regression on every push. Speed is secondary to correctness. CI blocks merge on any failure.

**Unit Tests (Vitest):**
- All date math functions (dates.ts) — including timezone edge cases, leap years, DST transitions
- Status calculation logic
- Currency formatting
- Notification scheduling logic
- Migration upgrade/downgrade paths
- Template seeding
- Target: 100% coverage on lib/ folder

**Component Tests (React Testing Library):**
- StatusBanner renders correct state for all status combinations
- ItemGlanceRow displays correct fields and status
- FieldEditor handles all field types correctly
- Dashboard aggregates and sorts items properly
- Add item flow creates correct DB entries
- Edit saves changes and logs history

**E2E Tests (Playwright):**
- Full add item flow (select category → fill form → save → verify on dashboard)
- Edit item flow (change field → verify history logged)
- Notification scheduling (add item with date → verify notification scheduled)
- Backup and restore cycle (backup → delete data → restore → verify)
- Archive flow (archive → verify hidden → unarchive → verify visible)
- Settings changes persist across app reload
- Empty states render correctly

**CI Pipeline (GitHub Actions):**
```yaml
on: [push, pull_request]
jobs:
  test:
    - Lint (ESLint + TypeScript strict)
    - Unit tests (Vitest)
    - Component tests (React Testing Library)
    - E2E tests (Playwright)
    - Build verification (next build succeeds)
  # Deploy only on main, only if all tests pass
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    - Deploy to Vercel
```

### 3.9 Design System — Theme Tokens (from tweakcn)

The theme is iOS-inspired: clean white surfaces, bold blue (`rgb(0, 115, 255)`) primary, Inter font, with full dark mode support.

```css
/* globals.css — tweakcn theme + HomeDocket status tokens */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  /* === TWEAKCN THEME (light mode) === */
  --background: rgb(255, 255, 255);
  --foreground: rgb(26, 26, 26);
  --card: rgb(255, 255, 255);
  --card-foreground: rgb(26, 26, 26);
  --popover: rgb(245, 245, 247);
  --popover-foreground: rgb(26, 26, 26);
  --primary: rgb(0, 115, 255);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(255, 255, 255);
  --secondary-foreground: rgb(26, 26, 26);
  --muted: rgb(229, 229, 234);
  --muted-foreground: rgb(107, 107, 107);
  --accent: rgb(0, 115, 255);
  --accent-foreground: rgb(26, 26, 26);
  --destructive: rgb(231, 76, 60);
  --destructive-foreground: rgb(255, 255, 255);
  --border: rgb(237, 237, 237);
  --input: rgb(237, 237, 237);
  --ring: rgb(63, 115, 255);
  --chart-1: rgb(0, 115, 255);
  --chart-2: rgb(46, 204, 113);
  --chart-3: rgb(231, 76, 60);
  --chart-4: rgb(245, 245, 247);
  --chart-5: rgb(209, 209, 214);

  /* === HOMEDOCKET STATUS TOKENS (functional) === */
  --status-ok: rgb(46, 204, 113);       /* green — matches chart-2 */
  --status-warning: rgb(245, 166, 35);   /* amber */
  --status-urgent: rgb(231, 76, 60);     /* red — matches destructive */
  --status-expired: rgb(192, 57, 43);    /* dark red */
  --status-neutral: rgb(209, 209, 214);  /* grey — matches chart-5 */

  /* === TYPOGRAPHY === */
  --font-sans: Inter, ui-sans-serif, sans-serif, system-ui;
  --font-serif: Georgia, serif;
  --font-mono: SF Mono, ui-monospace, Menlo, Monaco, Consolas, monospace;
  --tracking-normal: -0.015em;

  /* === RADIUS === */
  --radius: 0.85rem;

  /* === SHADOWS === */
  --shadow-sm: 0px 2px 4px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0px 2px 4px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0px 2px 4px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10);

  --spacing: 0.25rem;
}

.dark {
  --background: rgb(13, 13, 15);
  --foreground: rgb(255, 255, 255);
  --card: rgb(26, 26, 26);
  --card-foreground: rgb(255, 255, 255);
  --popover: rgb(26, 26, 26);
  --popover-foreground: rgb(255, 255, 255);
  --primary: rgb(0, 115, 255);
  --primary-foreground: rgb(255, 255, 255);
  --secondary: rgb(26, 26, 26);
  --secondary-foreground: rgb(255, 255, 255);
  --muted: rgb(44, 44, 46);
  --muted-foreground: rgb(152, 152, 157);
  --accent: rgb(0, 115, 255);
  --accent-foreground: rgb(255, 255, 255);
  --destructive: rgb(255, 69, 58);
  --destructive-foreground: rgb(255, 255, 255);
  --border: rgb(56, 56, 58);
  --input: rgb(56, 56, 58);
  --ring: rgb(0, 115, 255);

  /* Status tokens in dark mode */
  --status-ok: rgb(46, 204, 113);
  --status-warning: rgb(255, 179, 64);
  --status-urgent: rgb(255, 69, 58);
  --status-expired: rgb(255, 69, 58);
  --status-neutral: rgb(56, 56, 58);

  --shadow-sm: 0px 3px 6px 0px hsl(0 0% 0% / 0.30), 0px 1px 2px -1px hsl(0 0% 0% / 0.30);
  --shadow: 0px 3px 6px 0px hsl(0 0% 0% / 0.30), 0px 1px 2px -1px hsl(0 0% 0% / 0.30);
  --shadow-md: 0px 3px 6px 0px hsl(0 0% 0% / 0.30), 0px 2px 4px -1px hsl(0 0% 0% / 0.30);
  --shadow-lg: 0px 3px 6px 0px hsl(0 0% 0% / 0.30), 0px 4px 6px -1px hsl(0 0% 0% / 0.30);
}

/* Status communication — triple-channel (Andersson framework) */
/* 1. Color: status dot/border using --status-* tokens */
/* 2. Position: urgent items auto-sort to top of dashboard */
/* 3. Typography: urgent = font-semibold, ok = font-normal */
```

**Typography scale (4 steps — using Inter):**
- Display: 28px / bold / tracking-tight — dashboard status banner
- Title: 18px / semibold / tracking-normal — card titles, section headers
- Body: 15px / regular / tracking-normal — content, field values
- Caption: 13px / regular / tracking-normal — secondary info, timestamps

**Spacing:** 4px base (0.25rem `--spacing`). Grid: 4, 8, 16, 24, 32, 48.

**Border radius:** 0.85rem base. Derived: sm (calc - 4px), md (calc - 2px), lg (base), xl (calc + 4px).

**Dark mode:** Fully supported from day one. The tweakcn theme includes complete dark mode tokens. Implement via `class` strategy (`.dark` on root element) with user toggle in settings.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Dashboard load: <200ms from app open to rendered content
- Item detail load: <100ms
- Notification scheduling: <50ms per reminder
- Database queries: <10ms for any single query (IndexedDB is fast at this scale)

### 4.2 Offline
- 100% of features work offline (local-first architecture)
- No network dependency for any V1 feature
- Backup export works offline (saves to local file system)

### 4.3 Accessibility
- WCAG 2.1 AA compliance
- All interactive elements: minimum 44x44pt touch targets
- Status communicated via color + position + typography (not color alone)
- VoiceOver (iOS) and TalkBack (Android) tested
- Focus management for screen readers

### 4.4 Supported Platforms
- iOS 16+ (required for Capacitor + notification APIs)
- Android 8+ (API 26+)
- Web: Chrome 90+, Safari 16+, Firefox 90+, Edge 90+

### 4.5 Privacy
- No data leaves the device in V1
- No analytics, no telemetry, no tracking
- No third-party SDKs that phone home
- GDPR compliant: export, deletion, privacy policy

---

## 5. Out of Scope (V1)

These are explicitly NOT built for V1. They are acknowledged as future opportunities:

- Cloud sync / multi-device
- Household sharing / multi-user
- OCR bill scanning
- Provider comparison / switching recommendations
- AI-powered features
- Email digest notifications
- Monetization of any kind
- Analytics / telemetry (added V2 with opt-in consent)
- Document upload / storage
- Dark mode — INCLUDED in V1 (theme supports it natively)

---

## 6. Success Metrics (Post-Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Installs (month 1) | 500+ | App Store + Play Store + PWA |
| Day-7 retention | >40% | Users opening app 7 days after install |
| Items per user | >3 | Average tracked items |
| Notification engagement | >60% | Users who tap notifications |
| App Store rating | >4.0 | Combined iOS + Android |
| Crash-free rate | >99.5% | Sentry monitoring |
