# HomeDocket — Milestones

**Sprint Duration:** 2 weeks each
**Velocity Assumption:** Solo developer, ~15-20 hrs/week (30-40 hrs/sprint)

---

## Milestone 1: Foundation Ready
**Target:** End of Sprint 1 (Week 2)
**Definition of Done:** Project scaffolded, database operational, design system defined, CI pipeline running tests on every push. You can create and retrieve an item from IndexedDB in a test.

---

## Milestone 2: Core App Functional
**Target:** End of Sprint 3 (Week 6)
**Definition of Done:** All five screens working (Dashboard, Item Detail, Add Item, Settings, Archive). User can add items across all 4 categories (with Utilities service types), view dashboard with status sorting, edit fields, and see change history. All interactions tested.

---

## Milestone 3: Notifications Live
**Target:** End of Sprint 4 (Week 8)
**Definition of Done:** Native notifications scheduled and firing on iOS and Android via Capacitor. Reminders configurable per item. Notifications are generic (no PII). App responds correctly to notification taps.

---

## Milestone 3.5: All Categories Live
**Target:** End of Sprint 5 (Week 10)
**Definition of Done:** All 4 category templates (with 6 Utilities service types) fully fleshed out with real-world Irish field coverage. Custom category creation working. Category filtering on dashboard. Template migration tested for existing items.

---

## Milestone 4: Secure & Backed Up
**Target:** End of Sprint 6 (Week 12)
**Definition of Done:** Biometric lock working on both platforms. Backup export/import with passphrase encryption working. Data export (JSON/CSV) for GDPR. Delete-all-data functional.

---

## Milestone 4.5: Action Management Live
**Target:** Mid-Sprint 7 window (Week 12.5)
**Definition of Done:** Users can tap the attention banner to review urgent items in a bottom sheet. Renew action updates deadline + reschedules reminders. Dismiss action snoozes items for configurable period. All actions tracked in history timeline. Dismissed items indicated on dashboard.

---

## Milestone 5: Launch Ready
**Target:** End of Sprint 7 (Week 14)
**Definition of Done:** SEO landing page live. Privacy policy published. App Store and Play Store listings submitted. Beta group testing complete. Critical bugs fixed. Full E2E regression passing.

---

## Milestone 6: Post-Launch Stable
**Target:** End of Sprint 8 (Week 16)
**Definition of Done:** Error monitoring active. Beta feedback triaged. Performance optimized. App stable with >99.5% crash-free rate.

---

```
Week:  1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17
       ├───────┤───────┤───────┤───────┤───────┤───────┤────┤──────┤───────┤
Sprint:   S1      S2      S3      S4      S5      S6    S6.5   S7      S8
       ├───────┤───────┤───────┤───────┤───────┤───────┤────┤──────┤───────┤
       M1      │       M2      │  M3   │ M3.5  │  M4  M4.5│  M5   │  M6
       Found.  │       Core    │ Notif │ Cats  │ Secur│Acts│Launch │ Stable
```
