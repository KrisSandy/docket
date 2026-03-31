# Backlog — Notification System Gaps

**Source:** Code audit (2026-03-31)
**Priority:** High — these are reliability gaps, especially on Android
**Related Sprint:** Sprint 4 — Notifications & Reminders
**Status:** Complete (2026-03-31) — 350 tests passing, lint clean

---

## 1. Reschedule All Reminders on App Launch

- [x] Call `rescheduleAllReminders()` on app initialization (layout or root component `useEffect`)
- [x] Ensure it runs on both cold start and return-to-foreground
- [x] Critical for Android: OEM battery optimization (Samsung, Xiaomi, Huawei) can silently drop pending notifications
- [x] Write integration test: simulate app launch → verify all enabled reminders have pending notifications

## 2. Register Notification Tap Handler on App Init

- [x] Call `registerNotificationTapHandler()` during app initialization
- [x] Currently dead code — function exists in `lib/notification-tap-handler.ts` but is never invoked
- [x] Verify tap navigates to correct item detail screen from all three states: foreground, background, cold start
- [x] Write test: tap notification with `itemId` payload → navigates to `/item/[id]`

## 3. Integrate Notification Permission Request Flow

- [x] Add notification permission check + request to app layout or onboarding flow
- [x] `checkPermission()` and `requestPermission()` exist in `lib/notifications.ts` but are not wired into any component
- [x] Show in-app explanation before system prompt (iOS best practice)
- [x] Handle "denied" state gracefully — show persistent banner explaining how to re-enable in Settings
- [x] Write test: permission denied → banner visible with instructions

## 4. UI fixes

 - [x] Make card view as default in "All Items" section in dashboard.
 - [x] View choice selected is resetting to default if navigated to different page and come back. Persist the view option selected.
