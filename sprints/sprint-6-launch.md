# Sprint 6 — Launch Preparation

**Duration:** Weeks 11–12
**Milestone:** M5 — Launch Ready
**Goal:** SEO landing page live, store listings submitted, beta tested, bugs fixed.
**Estimated Hours:** 35–40

---

## 1. Marketing / Landing Page

- [ ] Build landing page (app/(marketing)/page.tsx)
- [ ] Hero section: headline + subheadline + CTA ("Get HomeDocket Free")
- [ ] Feature highlights section (3 key benefits with icons)
- [ ] "How it works" section (3 steps: Add → Track → Relax)
- [ ] Social proof / trust section (placeholder for future testimonials)
- [ ] Footer with links (Privacy Policy, ToS, Contact)
- [ ] Mobile-responsive design
- [ ] SEO meta tags (title, description, og:image)
- [ ] Add structured data (JSON-LD for SoftwareApplication)
- [ ] Write E2E test: landing page loads, all sections visible, CTA clickable

## 2. SEO Content Pages

- [ ] Create blog layout (app/(marketing)/blog/layout.tsx)
- [ ] Write blog post: "When is my NCT due? A complete guide for Irish drivers"
- [ ] Write blog post: "How to track your household bills in Ireland"
- [ ] Write blog post: "Motor tax renewal dates Ireland — what you need to know"
- [ ] Add internal links from blog posts to app / landing page
- [ ] Configure sitemap.xml generation
- [ ] Configure robots.txt
- [ ] Submit sitemap to Google Search Console
- [ ] Write meta descriptions for all pages

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
- [ ] Share feedback form link in-app (settings → "Give Feedback")
- [ ] Run beta for 7-10 days
- [ ] Triage all feedback (bug/feature/polish)
- [ ] Fix all critical and high-priority bugs
- [ ] Document known issues for launch

## 6. Error Monitoring

- [ ] Install Sentry (via @sentry/nextjs + @sentry/capacitor)
- [ ] Configure source maps for readable stack traces
- [ ] Set up Sentry alerts: crash rate spike, new error type
- [ ] Configure Sentry environments (staging, production)
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

- [ ] Configure next-pwa or manual service worker
- [ ] Create PWA manifest.json (name, icons, theme_color, start_url)
- [ ] Ensure app is installable on Android Chrome
- [ ] Ensure app is installable on iOS Safari (add to home screen)
- [ ] Test PWA offline behavior (all features work without network)
- [ ] Write E2E test: app loads offline from service worker cache

---

**Sprint 6 Definition of Done:**
- [ ] Landing page live at production URL
- [ ] 3 SEO blog posts published and indexed
- [ ] iOS app submitted to App Store review
- [ ] Android app submitted to Play Store review
- [ ] Beta feedback collected, critical bugs fixed
- [ ] Sentry monitoring active
- [ ] Full regression passed on all platforms
- [ ] PWA installable and working offline
- [ ] All tests passing, CI green
- [ ] M5 milestone achieved: Launch Ready
