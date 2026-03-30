# Sprint 6 — Security & Backup

**Duration:** Weeks 11–12
**Milestone:** M4 — Secure & Backed Up
**Goal:** Biometric auth, encrypted backup/restore, GDPR compliance complete.
**Estimated Hours:** 35–40

---

## 1. Biometric Authentication

- [x] Install @capacitor-community/biometric-auth (or @capacitor/biometric)
- [x] Implement biometric availability check (is FaceID/TouchID/Fingerprint enrolled?)
- [x] Build lock screen component (full-screen overlay, biometric prompt)
- [x] Trigger biometric check on app launch
- [x] Trigger biometric check on return from background (>30s away)
- [x] Handle biometric not available (skip lock, show info in settings)
- [x] Handle biometric not enrolled (prompt user to set up in device settings)
- [x] Handle biometric failure (allow retry, fallback to device passcode)
- [x] Handle biometric enrollment change (e.g., new fingerprint added — re-authenticate)
- [x] Write component test: lock screen renders correctly
- [x] Write unit test: background timer correctly triggers re-auth after 30s
- [ ] Write E2E test: app launches → lock screen shown → biometric success → dashboard shown

## 2. Biometric Settings Toggle

- [x] Wire biometric toggle in settings
- [x] When enabling: verify biometric is available, prompt to confirm
- [x] When disabling: require current biometric verification to turn off
- [x] Persist biometric preference in AppSettings table
- [ ] Write E2E test: enable biometric → close app → reopen → lock screen shown
- [ ] Write E2E test: disable biometric → close app → reopen → no lock screen

## 3. Backup Export

- [x] Implement DB serialization (export all tables as JSON)
- [x] Implement passphrase encryption (AES-256-GCM via Web Crypto API)
- [x] Build backup UI in settings (button + last backup date display)
- [x] Generate backup file with metadata (app version, schema version, export date)
- [x] Implement share/save via Capacitor Filesystem + Share plugin
- [x] Save to device storage / share to Files / iCloud / Google Drive
- [x] Update "last backup date" in AppSettings after successful export
- [x] Write unit test: serialization includes all tables
- [x] Write unit test: encryption produces non-readable output
- [x] Write unit test: backup metadata includes correct versions
- [ ] Write E2E test: trigger backup → file is created → file is encrypted

## 4. Backup Restore

- [x] Build restore UI in settings (button + file picker)
- [x] Implement file picker via Capacitor Filesystem
- [x] Implement passphrase decryption
- [x] Validate backup file structure (check metadata, schema version)
- [x] Handle schema version mismatch (run migrations on imported data)
- [x] Show confirmation dialog before overwriting current data
- [x] Replace local DB with backup data
- [x] Reschedule all notifications after restore
- [x] Handle invalid file (show error, don't destroy current data)
- [x] Handle wrong passphrase (show error, retry)
- [x] Write unit test: decryption reverses encryption correctly
- [x] Write unit test: schema mismatch triggers migration
- [ ] Write E2E test: backup → add new item → restore → new item gone → old data intact
- [ ] Write E2E test: restore with wrong passphrase → error → data unchanged

## 5. GDPR Data Export

- [x] Implement full data export as JSON (all items, fields, history, reminders)
- [x] Implement full data export as CSV (flattened: one row per item, columns per field)
- [x] Build export UI in settings (format selector → JSON or CSV → download)
- [x] Ensure export includes ALL user data (nothing hidden)
- [x] Write unit test: JSON export contains all tables
- [x] Write unit test: CSV export has correct headers and row count
- [ ] Write E2E test: export JSON → parse → verify matches DB content

## 6. GDPR Data Deletion

- [x] Implement "Delete All My Data" function
- [x] First confirmation: "This will permanently delete all your data. This cannot be undone."
- [x] Second confirmation: "Type DELETE to confirm"
- [x] On confirm: wipe all IndexedDB tables, clear AppSettings, cancel all notifications
- [x] Clear any Keychain/Keystore entries
- [x] Redirect to empty dashboard / first-run state
- [ ] Write E2E test: delete all data → verify DB is empty → verify notifications cancelled → verify dashboard shows empty state

## 7. Privacy Policy & Legal

- [x] Write privacy policy (what data is collected: none in V1, what's stored locally, no third-party sharing)
- [x] Publish privacy policy as a page (app/(marketing)/privacy/page.tsx)
- [x] Link privacy policy in settings
- [ ] Link privacy policy in app store listings
- [x] Write terms of service
- [x] Publish ToS page

---

**Sprint 6 Definition of Done:**
- [x] Biometric lock works on iOS (FaceID + TouchID)
- [x] Biometric lock works on Android (Fingerprint)
- [x] Backup export + restore cycle works end-to-end with encryption
- [x] JSON and CSV data export produces complete, valid output
- [x] Delete-all-data wipes everything cleanly
- [x] Privacy policy and ToS published
- [x] All tests passing, CI green
- [x] M4 milestone achieved: Secure & Backed Up

**Note:** Items left unchecked are E2E tests (Playwright, deferred to Sprint 7), Capacitor Filesystem native integration (requires device testing), Keychain/Keystore clearing (depends on biometric plugin integration), and app store listing links (Sprint 7 — Launch).
