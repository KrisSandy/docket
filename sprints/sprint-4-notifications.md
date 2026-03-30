# Sprint 4 — Notifications & Reminders

**Duration:** Weeks 7–8
**Milestone:** M3 — Notifications Live
**Goal:** Native notifications scheduling and firing reliably on iOS and Android. Reminders configurable per item.
**Estimated Hours:** 35–40

---

## 1. Capacitor Notification Setup

- [x] Install @capacitor/local-notifications
- [x] Configure notification permissions in capacitor.config.ts
- [x] Implement permission request flow (first launch + settings toggle)
- [x] Handle permission denied gracefully (show in-app banner explaining why notifications matter)
- [ ] Test notification permission flow on iOS simulator
- [ ] Test notification permission flow on Android emulator
- [x] Write unit test: permission check returns correct state

## 2. Notification Scheduling Service

- [x] Implement scheduleReminder(reminderId, deadlineDate, daysBefore) in lib/notifications.ts
- [x] Implement cancelReminder(reminderId)
- [x] Implement cancelAllRemindersForItem(itemId)
- [x] Implement rescheduleAllReminders() — re-syncs all pending notifications with DB state
- [x] Implement hashToInt(string) → stable numeric ID for Capacitor
- [x] Handle edge case: trigger date is in the past (skip, don't crash)
- [x] Handle edge case: trigger date is today (schedule for now)
- [x] Handle edge case: same deadline has multiple reminders at different intervals
- [x] Write unit test: scheduleReminder calculates correct trigger date
- [x] Write unit test: past dates are skipped
- [x] Write unit test: cancelReminder cancels correct notification
- [x] Write unit test: rescheduleAll syncs DB state with pending notifications

## 3. Reminder Management UI

- [x] Build reminder configuration section in item detail
- [x] Display preset reminder options as toggleable chips (60, 30, 14, 7, 1 days)
- [x] Pre-select defaults based on category template
- [x] Allow custom reminder interval (user enters number of days)
- [x] Wire reminder toggles to useReminders hook → DB create/delete
- [x] Auto-schedule/cancel notification when reminder is toggled
- [x] Show next notification date for each active reminder
- [x] Write component test: preset chips render with correct default selection
- [x] Write component test: toggling chip creates/deletes reminder in DB
- [ ] Write E2E test: enable reminder → verify notification scheduled → disable → verify cancelled

## 4. Notification Tap Handling

- [x] Implement notification tap listener (Capacitor LocalNotifications.addListener)
- [x] Extract itemId from notification extra data
- [x] Navigate to item detail screen on tap
- [x] Handle tap when app is closed (cold start → route to item)
- [x] Handle tap when app is in background (resume → route to item)
- [x] Handle tap when app is in foreground (navigate → route to item)
- [ ] Write E2E test: simulate notification tap → verify navigation to correct item

## 5. Notification Content Safety

- [x] Ensure all notification titles are generic: "HomeDocket Reminder"
- [x] Ensure all notification bodies are generic: "You have an upcoming deadline. Tap to review."
- [x] Never include provider names, amounts, or dates in notification content
- [x] Write snapshot test: notification content matches expected generic format
- [x] Write unit test: no PII in any generated notification content

## 6. Auto-Rescheduling on Data Change

- [x] When a date field is updated → cancel old reminders → schedule new ones
- [x] When an item is archived → cancel all its reminders
- [x] When an item is deleted → cancel all its reminders
- [x] When an item is unarchived → reschedule all its reminders
- [x] On app launch → call rescheduleAllReminders() to sync state
- [x] Write unit test: field update triggers reschedule
- [x] Write unit test: archive cancels reminders
- [x] Write unit test: unarchive reschedules reminders
- [ ] Write E2E test: change NCT date → verify old notification cancelled → new one scheduled

## 7. Android Notification Reliability

- [x] Research Android OEM notification killing behavior (document findings)
- [x] Implement app-foreground check: verify pending notifications still exist, reschedule missing ones
- [x] Add help text in settings for affected Android devices ("Battery optimization may affect reminders")
- [x] Provide link to dontkillmyapp.com for user's specific device
- [ ] Test on Samsung, Xiaomi, and Pixel emulators/devices

## 8. Wire Settings Toggle

- [x] Wire "Notifications" toggle in settings to global enable/disable
- [x] When disabled: cancel all pending notifications, show warning
- [x] When re-enabled: reschedule all reminders from DB
- [ ] Write E2E test: disable notifications → verify all cancelled → re-enable → verify all rescheduled

---

**Sprint 4 Definition of Done:**
- [ ] Notifications fire correctly on iOS (real device or TestFlight)
- [ ] Notifications fire correctly on Android (real device or internal testing)
- [x] All reminder presets configurable per item
- [x] Notification content contains zero PII
- [x] All reschedule/cancel flows tested
- [x] All tests passing, CI green
- [ ] M3 milestone achieved: Notifications Live
