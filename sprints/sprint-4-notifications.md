# Sprint 4 — Notifications & Reminders

**Duration:** Weeks 7–8
**Milestone:** M3 — Notifications Live
**Goal:** Native notifications scheduling and firing reliably on iOS and Android. Reminders configurable per item.
**Estimated Hours:** 35–40

---

## 1. Capacitor Notification Setup

- [ ] Install @capacitor/local-notifications
- [ ] Configure notification permissions in capacitor.config.ts
- [ ] Implement permission request flow (first launch + settings toggle)
- [ ] Handle permission denied gracefully (show in-app banner explaining why notifications matter)
- [ ] Test notification permission flow on iOS simulator
- [ ] Test notification permission flow on Android emulator
- [ ] Write unit test: permission check returns correct state

## 2. Notification Scheduling Service

- [ ] Implement scheduleReminder(reminderId, deadlineDate, daysBefore) in lib/notifications.ts
- [ ] Implement cancelReminder(reminderId)
- [ ] Implement cancelAllRemindersForItem(itemId)
- [ ] Implement rescheduleAllReminders() — re-syncs all pending notifications with DB state
- [ ] Implement hashToInt(string) → stable numeric ID for Capacitor
- [ ] Handle edge case: trigger date is in the past (skip, don't crash)
- [ ] Handle edge case: trigger date is today (schedule for now)
- [ ] Handle edge case: same deadline has multiple reminders at different intervals
- [ ] Write unit test: scheduleReminder calculates correct trigger date
- [ ] Write unit test: past dates are skipped
- [ ] Write unit test: cancelReminder cancels correct notification
- [ ] Write unit test: rescheduleAll syncs DB state with pending notifications

## 3. Reminder Management UI

- [ ] Build reminder configuration section in item detail
- [ ] Display preset reminder options as toggleable chips (60, 30, 14, 7, 1 days)
- [ ] Pre-select defaults based on category template
- [ ] Allow custom reminder interval (user enters number of days)
- [ ] Wire reminder toggles to useReminders hook → DB create/delete
- [ ] Auto-schedule/cancel notification when reminder is toggled
- [ ] Show next notification date for each active reminder
- [ ] Write component test: preset chips render with correct default selection
- [ ] Write component test: toggling chip creates/deletes reminder in DB
- [ ] Write E2E test: enable reminder → verify notification scheduled → disable → verify cancelled

## 4. Notification Tap Handling

- [ ] Implement notification tap listener (Capacitor LocalNotifications.addListener)
- [ ] Extract itemId from notification extra data
- [ ] Navigate to item detail screen on tap
- [ ] Handle tap when app is closed (cold start → route to item)
- [ ] Handle tap when app is in background (resume → route to item)
- [ ] Handle tap when app is in foreground (navigate → route to item)
- [ ] Write E2E test: simulate notification tap → verify navigation to correct item

## 5. Notification Content Safety

- [ ] Ensure all notification titles are generic: "HomeDocket Reminder"
- [ ] Ensure all notification bodies are generic: "You have an upcoming deadline. Tap to review."
- [ ] Never include provider names, amounts, or dates in notification content
- [ ] Write snapshot test: notification content matches expected generic format
- [ ] Write unit test: no PII in any generated notification content

## 6. Auto-Rescheduling on Data Change

- [ ] When a date field is updated → cancel old reminders → schedule new ones
- [ ] When an item is archived → cancel all its reminders
- [ ] When an item is deleted → cancel all its reminders
- [ ] When an item is unarchived → reschedule all its reminders
- [ ] On app launch → call rescheduleAllReminders() to sync state
- [ ] Write unit test: field update triggers reschedule
- [ ] Write unit test: archive cancels reminders
- [ ] Write unit test: unarchive reschedules reminders
- [ ] Write E2E test: change NCT date → verify old notification cancelled → new one scheduled

## 7. Android Notification Reliability

- [ ] Research Android OEM notification killing behavior (document findings)
- [ ] Implement app-foreground check: verify pending notifications still exist, reschedule missing ones
- [ ] Add help text in settings for affected Android devices ("Battery optimization may affect reminders")
- [ ] Provide link to dontkillmyapp.com for user's specific device
- [ ] Test on Samsung, Xiaomi, and Pixel emulators/devices

## 8. Wire Settings Toggle

- [ ] Wire "Notifications" toggle in settings to global enable/disable
- [ ] When disabled: cancel all pending notifications, show warning
- [ ] When re-enabled: reschedule all reminders from DB
- [ ] Write E2E test: disable notifications → verify all cancelled → re-enable → verify all rescheduled

---

**Sprint 4 Definition of Done:**
- [ ] Notifications fire correctly on iOS (real device or TestFlight)
- [ ] Notifications fire correctly on Android (real device or internal testing)
- [ ] All reminder presets configurable per item
- [ ] Notification content contains zero PII
- [ ] All reschedule/cancel flows tested
- [ ] All tests passing, CI green
- [ ] M3 milestone achieved: Notifications Live
