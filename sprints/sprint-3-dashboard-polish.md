# Sprint 3 — Dashboard Polish & History

**Duration:** Weeks 5–6
**Milestone:** M2 — Core App Functional
**Goal:** Dashboard is delightful and informative. History tracking complete. Archive working.
**Estimated Hours:** 30–35

---

## 1. Dashboard Refinement

- [ ] Implement "Morning Coffee Glance" animation — status banner fades in with current state
- [ ] Add deadline countdown formatting ("in 34 days" / "in 2 months" / "overdue by 5 days")
- [ ] Add category icon to each GlanceRow and ItemCard
- [ ] Implement category filter on dashboard (tap category icon to filter)
- [ ] Add "Last checked" subtle timestamp at bottom of dashboard
- [ ] Optimize re-render performance (memo GlanceRow, virtualize long lists)
- [ ] Test dashboard with 1, 5, 10, 20 items — verify no jank
- [ ] Write component test: countdown formatting for various day ranges
- [ ] Write component test: category filter shows/hides correct items
- [ ] Write performance test: dashboard renders 20 items in <200ms

## 2. History & Change Tracking

- [ ] Build history timeline component (list of changes, newest first)
- [ ] Format history entries ("Monthly cost: €95 → €120 on 15 Jan 2026")
- [ ] Group history entries by date
- [ ] Add history section to item detail screen (collapsible, default closed)
- [ ] Implement useHistory hook — getHistoryForItem(itemId)
- [ ] Handle items with no history (empty state: "No changes recorded yet")
- [ ] Write component test: history timeline renders entries correctly
- [ ] Write component test: history groups by date
- [ ] Write unit test: useHistory returns entries in reverse chronological order
- [ ] Write E2E test: edit field → view history → verify entry appears

## 3. Archive System

- [ ] Build archived items screen (app/history/page.tsx)
- [ ] List all archived items with original category and archive date
- [ ] Implement unarchive action (returns item to active dashboard)
- [ ] Implement permanent delete from archive (with confirmation)
- [ ] Show retention notice ("Items archived over 3 years will be flagged for cleanup")
- [ ] Flag items older than 3 years with visual indicator
- [ ] Wire "Archived Items" link in settings to this screen
- [ ] Write component test: archived items list renders correctly
- [ ] Write E2E test: archive item → verify hidden from dashboard → navigate to archive → verify present → unarchive → verify back on dashboard

## 4. Responsive & Cross-Platform Polish

- [ ] Test all screens at 375px (iPhone SE), 390px (iPhone 14), 428px (iPhone 14 Pro Max)
- [ ] Test all screens at 360px and 412px (common Android widths)
- [ ] Fix any overflow, truncation, or alignment issues
- [ ] Verify touch targets are ≥44x44pt everywhere
- [ ] Test with large font sizes (iOS Dynamic Type / Android font scaling)
- [ ] Test with VoiceOver (iOS) — verify all elements are labeled
- [ ] Test with TalkBack (Android) — verify all elements are labeled
- [ ] Write accessibility audit checklist and document results

## 5. Data Edge Cases

- [ ] Handle item with no date fields (no status calculation, show as "ok")
- [ ] Handle item with multiple date fields (use earliest deadline for status)
- [ ] Handle date field set to today (show as "urgent" not "expired")
- [ ] Handle empty field values gracefully (show placeholder, not crash)
- [ ] Handle very long field values (truncate with ellipsis)
- [ ] Handle special characters in field values
- [ ] Write unit test for each edge case above

---

**Sprint 3 Definition of Done:**
- [ ] Dashboard is polished and performant with 20 items
- [ ] History tracking works for all field types
- [ ] Archive/unarchive flow is complete
- [ ] Accessibility audit passed (WCAG AA)
- [ ] All tests passing, CI green
- [ ] M2 milestone achieved: Core App Functional
