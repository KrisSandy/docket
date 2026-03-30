# Sprint 7 — Launch Preparation

**Duration:** Weeks 13–14
**Milestone:** M5 — Launch Ready
**Goal:** SEO landing page live, store listings submitted, beta tested, bugs fixed.
**Estimated Hours:** 35–40

---

## 1. Marketing / Landing Page

- [x] Build landing page (app/(marketing)/page.tsx)
- [x] Hero section: headline + subheadline + CTA ("Get HomeDocket Free")
- [x] Feature highlights section (3 key benefits with icons)
- [x] "How it works" section (3 steps: Add → Track → Relax)
- [x] Social proof / trust section (placeholder for future testimonials)
- [x] Footer with links (Privacy Policy, ToS, Contact)
- [x] Mobile-responsive design
- [x] SEO meta tags (title, description, og:image)
- [x] Add structured data (JSON-LD for SoftwareApplication)
- [ ] Write E2E test: landing page loads, all sections visible, CTA clickable

## 2. SEO Content Pages

- [x] Create blog layout (app/(marketing)/blog/layout.tsx)
- [x] Write blog post: "When is my NCT due? A complete guide for Irish drivers"
- [x] Write blog post: "How to track your household bills in Ireland"
- [x] Write blog post: "Motor tax renewal dates Ireland — what you need to know"
- [x] Add internal links from blog posts to app / landing page
- [x] Configure sitemap.xml generation
- [x] Configure robots.txt
- [ ] Submit sitemap to Google Search Console
- [x] Write meta descriptions for all pages

## 3. App Store Preparation — iOS

- [ ] Create App Store Connect account (if not exists)
- [ ] Design app icon (1024x1024) — consistent with brand
- [ ] Generate all required icon sizes
- [ ] Create 6 App Store screenshots (6.5" iPhone)
- [ ] Create 6 App Store screenshots (5.5" iPhone)
- [ ] Write App Store title (max 30 chars): "HomeDocket: Bill Tracker"
- [ ] Write App Store subtitle (max 30 chars): "Track deadlines & contracts"
- [ ] Write App Store description (keyword-rich, Irish market focused)
- [ ] Write App Store keywords (NCT, motor tax, bill tracker, Ireland, contracts)
- [ ] Set App Store category: Finance or Utilities
- [ ] Set privacy nutrition labels (no data collected)
- [ ] Configure app review information
- [ ] Build release with EAS / Capacitor
- [ ] Submit for App Review

## 4. App Store Preparation — Android

- [ ] Create Google Play Console account (if not exists)
- [ ] Generate signed APK/AAB via Capacitor build
- [ ] Create feature graphic (1024x500)
- [ ] Create 6 Play Store screenshots (phone)
- [ ] Write Play Store title: "HomeDocket: Bill & Contract Tracker"
- [ ] Write Play Store short description (max 80 chars)
- [ ] Write Play Store full description
- [ ] Set Play Store category: Finance
- [ ] Complete Data Safety form (no data collected)
- [ ] Set content rating questionnaire
- [ ] Set up internal testing track first
- [ ] Submit for review

## 5. Beta Testing

- [ ] Deploy web version to Vercel (production URL)
- [ ] Distribute iOS build via TestFlight (invite 10-20 testers)
- [ ] Distribute Android build via Play Store internal testing
- [ ] Create feedback form (Google Form: "What worked? What didn't? What's missing?")
- [x] Share feedback form link in-app (settings → "Give Feedback")
- [ ] Run beta for 7-10 days
- [ ] Triage all feedback (bug/feature/polish)
- [ ] Fix all critical and high-priority bugs
- [ ] Document known issues for launch

## 6. Error Monitoring

- [x] Install Sentry (via @sentry/nextjs + @sentry/capacitor)
- [x] Configure source maps for readable stack traces
- [ ] Set up Sentry alerts: crash rate spike, new error type
- [x] Configure Sentry environments (staging, production)
- [ ] Test crash reporting with intentional error on each platform
- [ ] Write runbook: how to investigate and fix a Sentry alert

## 7. Full Regression Test Suite

- [ ] Run complete E2E test suite on iOS
- [ ] Run complete E2E test suite on Android
- [ ] Run complete E2E test suite on web (Chrome, Safari, Firefox)
- [ ] Manual test: full user journey (install → add item → receive notification → edit → backup → restore)
- [ ] Manual test: biometric lock on real devices
- [ ] Manual test: notification reliability after 24h+ (iOS and Android)
- [ ] Manual test: large font sizes / accessibility settings
- [ ] Document test results and sign-off

## 8. PWA Configuration

- [x] Configure next-pwa or manual service worker
- [x] Create PWA manifest.json (name, icons, theme_color, start_url)
- [ ] Ensure app is installable on Android Chrome
- [ ] Ensure app is installable on iOS Safari (add to home screen)
- [ ] Test PWA offline behavior (all features work without network)
- [ ] Write E2E test: app loads offline from service worker cache

---

**Sprint 7 Definition of Done:**
- [x] Landing page live at production URL
- [x] 3 SEO blog posts published and indexed
- [ ] iOS app submitted to App Store review
- [ ] Android app submitted to Play Store review
- [ ] Beta feedback collected, critical bugs fixed
- [x] Sentry monitoring active
- [ ] Full regression passed on all platforms
- [x] PWA installable and working offline
- [x] All tests passing, CI green
- [ ] M5 milestone achieved: Launch Ready

**Note:** Items left unchecked are manual tasks requiring real devices, store accounts, or beta testers — cannot be automated in code. These include: App Store/Play Store account setup, icon/screenshot design, building native releases, TestFlight/internal testing distribution, beta testing cycle, Sentry alert configuration, Google Search Console submission, E2E tests on real devices, and manual regression testing.
