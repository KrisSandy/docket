# Sprint 3 — Dashboard Polish & History

**Duration:** Weeks 5–6
**Milestone:** M2 — Core App Functional
**Goal:** Dashboard is delightful and informative. History tracking complete. Archive working.
**Estimated Hours:** 30–35

---

## 1. Dashboard Refinement

- [x] Implement "Morning Coffee Glance" animation — status banner fades in with current state
- [x] Add deadline countdown formatting ("in 34 days" / "in 2 months" / "overdue by 5 days")
- [x] Add category icon to each GlanceRow and ItemCard
- [x] Implement category filter on dashboard (tap category icon to filter)
- [x] Add "Last checked" subtle timestamp at bottom of dashboard
- [x] Optimize re-render performance (memo GlanceRow, virtualize long lists)
- [ ] Test dashboard with 1, 5, 10, 20 items — verify no jank
- [x] Write component test: countdown formatting for various day ranges
- [x] Write component test: category filter shows/hides correct items
- [ ] Write performance test: dashboard renders 20 items in <200ms

## 2. History & Change Tracking

- [x] Build history timeline component (list of changes, newest first)
- [x] Format history entries ("Monthly cost: €95 → €120 on 15 Jan 2026")
- [x] Group history entries by date
- [x] Add history section to item detail screen (collapsible, default closed)
- [x] Implement useHistory hook — getHistoryForItem(itemId)
- [x] Handle items with no history (empty state: "No changes recorded yet")
- [x] Write component test: history timeline renders entries correctly
- [x] Write component test: history groups by date
- [ ] Write unit test: useHistory returns entries in reverse chronological order
- [ ] Write E2E test: edit field → view history → verify entry appears

## 3. Archive System

- [x] Build archived items screen (app/history/page.tsx)
- [x] List all archived items with original category and archive date
- [x] Implement unarchive action (returns item to active dashboard)
- [x] Implement permanent delete from archive (with confirmation)
- [x] Show retention notice ("Items archived over 3 years will be flagged for cleanup")
- [x] Flag items older than 3 years with visual indicator
- [x] Wire "Archived Items" link in settings to this screen
- [ ] Write component test: archived items list renders correctly
- [ ] Write E2E test: archive item → verify hidden from dashboard → navigate to archive → verify present → unarchive → verify back on dashboard

## 4. Responsive & Cross-Platform Polish

- [x] Test all screens at 375px (iPhone SE), 390px (iPhone 14), 428px (iPhone 14 Pro Max)
- [x] Test all screens at 360px and 412px (common Android widths)
- [x] Fix any overflow, truncation, or alignment issues
- [x] Verify touch targets are ≥44x44pt everywhere
- [ ] Test with large font sizes (iOS Dynamic Type / Android font scaling)
- [ ] Test with VoiceOver (iOS) — verify all elements are labeled
- [ ] Test with TalkBack (Android) — verify all elements are labeled
- [ ] Write accessibility audit checklist and document results

## 5. Data Edge Cases

- [x] Handle item with no date fields (no status calculation, show as "ok")
- [x] Handle item with multiple date fields (use earliest deadline for status)
- [x] Handle date field set to today (show as "urgent" not "expired")
- [x] Handle empty field values gracefully (show placeholder, not crash)
- [x] Handle very long field values (truncate with ellipsis)
- [x] Handle special characters in field values
- [x] Write unit test for each edge case above

---

**Sprint 3 Definition of Done:**
- [ ] Dashboard is polished and performant with 20 items
- [x] History tracking works for all field types
- [x] Archive/unarchive flow is complete
- [ ] Accessibility audit passed (WCAG AA)
- [x] All tests passing, CI green
- [ ] M2 milestone achieved: Core App Functional
