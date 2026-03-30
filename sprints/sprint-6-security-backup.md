# Sprint 6 — Security & Backup

**Duration:** Weeks 11–12
**Milestone:** M4 — Secure & Backed Up
**Goal:** Biometric auth, encrypted backup/restore, GDPR compliance complete.
**Estimated Hours:** 35–40

---

## 1. Biometric Authentication

- [ ] Install @capacitor-community/biometric-auth (or @capacitor/biometric)
- [ ] Implement biometric availability check (is FaceID/TouchID/Fingerprint enrolled?)
- [ ] Build lock screen component (full-screen overlay, biometric prompt)
- [ ] Trigger biometric check on app launch
- [ ] Trigger biometric check on return from background (>30s away)
- [ ] Handle biometric not available (skip lock, show info in settings)
- [ ] Handle biometric not enrolled (prompt user to set up in device settings)
- [ ] Handle biometric failure (allow retry, fallback to device passcode)
- [ ] Handle biometric enrollment change (e.g., new fingerprint added — re-authenticate)
- [ ] Write component test: lock screen renders correctly
- [ ] Write unit test: background timer correctly triggers re-auth after 30s
- [ ] Write E2E test: app launches → lock screen shown → biometric success → dashboard shown

## 2. Biometric Settings Toggle

- [ ] Wire biometric toggle in settings
- [ ] When enabling: verify biometric is available, prompt to confirm
- [ ] When disabling: require current biometric verification to turn off
- [ ] Persist biometric preference in AppSettings table
- [ ] Write E2E test: enable biometric → close app → reopen → lock screen shown
- [ ] Write E2E test: disable biometric → close app → reopen → no lock screen

## 3. Backup Export

- [ ] Implement DB serialization (export all tables as JSON)
- [ ] Implement passphrase encryption (AES-256-GCM via Web Crypto API)
- [ ] Build backup UI in settings (button + last backup date display)
- [ ] Generate backup file with metadata (app version, schema version, export date)
- [ ] Implement share/save via Capacitor Filesystem + Share plugin
- [ ] Save to device storage / share to Files / iCloud / Google Drive
- [ ] Update "last backup date" in AppSettings after successful export
- [ ] Write unit test: serialization includes all tables
- [ ] Write unit test: encryption produces non-readable output
- [ ] Write unit test: backup metadata includes correct versions
- [ ] Write E2E test: trigger backup → file is created → file is encrypted

## 4. Backup Restore

- [ ] Build restore UI in settings (button + file picker)
- [ ] Implement file picker via Capacitor Filesystem
- [ ] Implement passphrase decryption
- [ ] Validate backup file structure (check metadata, schema version)
- [ ] Handle schema version mismatch (run migrations on imported data)
- [ ] Show confirmation dialog before overwriting current data
- [ ] Replace local DB with backup data
- [ ] Reschedule all notifications after restore
- [ ] Handle invalid file (show error, don't destroy current data)
- [ ] Handle wrong passphrase (show error, retry)
- [ ] Write unit test: decryption reverses encryption correctly
- [ ] Write unit test: schema mismatch triggers migration
- [ ] Write E2E test: backup → add new item → restore → new item gone → old data intact
- [ ] Write E2E test: restore with wrong passphrase → error → data unchanged

## 5. GDPR Data Export

- [ ] Implement full data export as JSON (all items, fields, history, reminders)
- [ ] Implement full data export as CSV (flattened: one row per item, columns per field)
- [ ] Build export UI in settings (format selector → JSON or CSV → download)
- [ ] Ensure export includes ALL user data (nothing hidden)
- [ ] Write unit test: JSON export contains all tables
- [ ] Write unit test: CSV export has correct headers and row count
- [ ] Write E2E test: export JSON → parse → verify matches DB content

## 6. GDPR Data Deletion

- [ ] Implement "Delete All My Data" function
- [ ] First confirmation: "This will permanently delete all your data. This cannot be undone."
- [ ] Second confirmation: "Type DELETE to confirm"
- [ ] On confirm: wipe all IndexedDB tables, clear AppSettings, cancel all notifications
- [ ] Clear any Keychain/Keystore entries
- [ ] Redirect to empty dashboard / first-run state
- [ ] Write E2E test: delete all data → verify DB is empty → verify notifications cancelled → verify dashboard shows empty state

## 7. Privacy Policy & Legal

- [ ] Write privacy policy (what data is collected: none in V1, what's stored locally, no third-party sharing)
- [ ] Publish privacy policy as a page (app/(marketing)/privacy/page.tsx)
- [ ] Link privacy policy in settings
- [ ] Link privacy policy in app store listings
- [ ] Write terms of service
- [ ] Publish ToS page

---

**Sprint 6 Definition of Done:**
- [ ] Biometric lock works on iOS (FaceID + TouchID)
- [ ] Biometric lock works on Android (Fingerprint)
- [ ] Backup export + restore cycle works end-to-end with encryption
- [ ] JSON and CSV data export produces complete, valid output
- [ ] Delete-all-data wipes everything cleanly
- [ ] Privacy policy and ToS published
- [ ] All tests passing, CI green
- [ ] M4 milestone achieved: Secure & Backed Up
