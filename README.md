# HomeDocket

A household management dashboard for tracking recurring expenses, contracts, and compliance deadlines. Built for Irish/EU households — tracks NCT dates, motor tax, insurance renewals, utility contracts, and more.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript (strict)
- **Styling:** Tailwind CSS v4 + shadcn/ui + tweakcn iOS theme
- **Database:** Dexie.js (IndexedDB) — local-first, no backend
- **Data Layer:** TanStack Query v5
- **Native:** Capacitor 6 (iOS + Android)
- **Testing:** Vitest + React Testing Library + Playwright

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint + TypeScript check
npm run test          # Run unit + component tests (watch mode)
npm run test:run      # Run tests once
npm run test:coverage # Tests with coverage report
npm run test:e2e      # Playwright E2E tests
```

## Project Structure

```
src/
  app/
    (marketing)/       # SEO pages (landing, privacy)
    (app)/             # App screens (dashboard, item detail, add, settings, history)
  components/
    ui/                # Design system primitives (StatusDot, MetricRow, etc.)
    dashboard/         # Dashboard components (StatusBanner, GlanceRow, UpcomingDeadlines)
    items/             # Item detail components
    layout/            # App shell, navigation
  db/                  # Dexie.js schema, singleton, migrations, seed
  hooks/               # Data hooks (useItems, useItemFields, useHistory)
  lib/                 # Utilities (dates, currency, status, templates)
  types/               # Shared TypeScript types
  constants/           # Category metadata, defaults
tests/
  unit/                # Vitest unit tests
  component/           # React Testing Library tests
  e2e/                 # Playwright E2E tests
```

## Architecture

HomeDocket is local-first — all data lives in IndexedDB on the user's device. No backend server, no cloud sync, no accounts. The same codebase deploys as a web app (Vercel) and native iOS/Android apps (Capacitor).

The data model uses an EAV (Entity-Attribute-Value) pattern: items belong to categories, and each item has flexible key-value fields defined by category templates. Five built-in categories ship with V1: Vehicle, Utilities, Housing, Connectivity, and Insurance.

Notifications are the core feature. Native local notifications are scheduled in advance and fire even when the app is closed. Notification content is always generic (no PII on lock screen).

## Android (Native)

HomeDocket uses Capacitor to wrap the web app as a native Android app with full access to local notifications and biometric auth.

### Prerequisites

- Android Studio (with Android SDK)
- Java 17+ (bundled with Android Studio)
- Node.js 18+

### Build & Install

```bash
# 1. Build the static web export
npm run build

# 2. Sync web assets into the Android project
npx cap sync android

# 3. Option A: Open in Android Studio (run on emulator or connected device)
npx cap open android

# 3. Option B: Build a debug APK from the command line
cd android
./gradlew assembleDebug
```

The APK is output to `android/app/build/outputs/apk/debug/app-debug.apk`. Transfer it to your phone and install (enable "Install from unknown sources" when prompted). Or install directly via USB:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Enabling USB Debugging on Your Phone

Settings → About Phone → tap Build Number 7 times → back to Settings → Developer Options → enable USB Debugging.

### Notes

- The `android/` directory is committed to git. Build outputs and local config (`.gradle/`, `build/`, `local.properties`) are gitignored.
- After changing web code, always run `npm run build && npx cap sync android` before rebuilding the APK.
- Dynamic routes use query params for static export compatibility: `/item?id=xxx` and `/add/form?categoryId=xxx`.

## Status

Sprint 1 (Foundation) complete. 95 tests passing. Build and lint clean.
