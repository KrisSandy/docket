# Sprint 8 — Post-Launch Stabilization

**Duration:** Weeks 15–16
**Milestone:** M6 — Post-Launch Stable
**Goal:** Monitor real-world usage, fix issues, add opt-in analytics, optimize based on feedback.
**Estimated Hours:** 30–35

---

## 1. Production Monitoring

- [ ] Monitor Sentry daily for first 2 weeks — triage all new errors
- [ ] Fix any crash-causing bugs immediately (hotfix → deploy)
- [ ] Monitor App Store reviews — respond to user issues within 24h
- [ ] Monitor Play Store reviews — respond to user issues within 24h
- [ ] Track install numbers (App Store Connect + Play Store Console)
- [ ] Document any device-specific issues discovered

## 2. Opt-In Analytics

- [ ] Choose analytics provider (PostHog self-hosted or Mixpanel free tier)
- [ ] Build analytics consent screen (GDPR: opt-in only, clear explanation)
- [ ] Show consent screen on first launch (after onboarding, not before)
- [ ] Implement tracking events:
  - [ ] item_created (with category, no PII)
  - [ ] item_viewed
  - [ ] item_edited
  - [ ] reminder_configured
  - [ ] notification_tapped
  - [ ] backup_created
  - [ ] backup_restored
  - [ ] app_opened (daily active)
- [ ] Implement user properties: item_count, category_distribution, days_since_install
- [ ] Build retention tracking: day-1, day-7, day-30
- [ ] Write unit test: no events fire if consent is not given
- [ ] Write unit test: events include correct properties, no PII

## 3. Performance Optimization

- [ ] Audit dashboard load time — target <200ms
- [ ] Audit item detail load time — target <100ms
- [ ] Profile React re-renders on dashboard with React DevTools
- [ ] Memoize expensive components (GlanceRow, ItemCard) if needed
- [ ] Optimize IndexedDB queries (verify indexes are used)
- [ ] Audit bundle size — identify and remove unused dependencies
- [ ] Implement code splitting if any route is >100KB
- [ ] Write performance benchmark tests (document baseline metrics)

## 4. User Feedback Loop

- [ ] Review all beta and public feedback
- [ ] Categorize feedback: bugs / feature requests / UX issues / praise
- [ ] Prioritize top 5 feature requests for V2 planning
- [ ] Close any remaining beta bugs
- [ ] Update FAQ or help text based on common user confusions
- [ ] Publish app update with accumulated fixes

## 5. Documentation & Handoff

- [ ] Update README with final architecture and setup instructions
- [ ] Document all environment variables and configuration
- [ ] Document database schema and migration process
- [ ] Document notification scheduling logic
- [ ] Document backup/restore format and encryption
- [ ] Document CI/CD pipeline and deployment process
- [ ] Create CONTRIBUTING.md if planning to open-source

---

**Sprint 8 Definition of Done:**
- [ ] Crash-free rate >99.5% for 7 consecutive days
- [ ] No unresolved critical or high-priority bugs
- [ ] Opt-in analytics collecting data from consenting users
- [ ] No category template gaps reported by users
- [ ] Dashboard loads in <200ms consistently
- [ ] All user feedback triaged and responded to
- [ ] Technical documentation complete
- [ ] All tests passing, CI green
- [ ] M6 milestone achieved: Post-Launch Stable
