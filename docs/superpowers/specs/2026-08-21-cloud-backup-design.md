# Cloud Backup (Android) — Design

**Date:** 2026-08-21
**Status:** Draft — pending review

## 1. Motivation

HomeDocket already supports encrypted local backup/restore (`src/lib/backup.ts`, `src/hooks/use-backup.ts`), but it's entirely manual: the user must remember to export, and the file lands wherever the OS share sheet puts it. The goal here is to make backups automatic and recoverable after losing or replacing a phone, without introducing user accounts, a backend server, or live multi-device sync — all of which CLAUDE.md currently rules out for V1.

We arrived at this design after considering and rejecting two heavier alternatives:

- **Firebase Storage with a passphrase-derived path** (path = `hash(passphrase)`, so a new device can find the blob using only the passphrase). Rejected: changing the passphrase orphans the old backup with no migration path, two people who pick the same passphrase collide and silently overwrite each other, and Firebase Storage's security rules can't meaningfully enforce per-user isolation on a shared/guessable path — the "security" is really just obscurity.
- **Firebase Auth + Firestore live sync.** Rejected: requires real user accounts, a live backend, and rewrites the app's local-first architecture and privacy positioning — explicitly out of scope per this discussion.

The approach below decouples *location* (a folder the user picks and controls directly, typically inside their own Google Drive) from *decryption* (a passphrase only the user knows), which avoids the failure modes above without adding any new backend.

## 2. Scope

**In scope (v1):**
- Android only. iOS is deferred — it needs an equivalent-but-separate native mechanism (`UIDocumentPickerViewController` + security-scoped bookmarks) and is out of scope for this spec.
- One user-authorized folder, one fixed filename, overwritten in place on each backup. No backup history/versioning.
- Opportunistic automatic backup, checked on app foreground — not a true background job.
- Restore on a new device via a one-time file picker (reuses the existing restore flow as-is).

**Explicitly out of scope:**
- Firebase, or any backend server. No accounts, no login.
- Real-time / live multi-device sync.
- iOS support.
- True background execution while the app is closed (would require storing the passphrase without a live biometric gate — see §8).
- Backup history/versioning — only the single most recent backup is ever kept at the destination.

## 3. Architecture & Data Flow

```
App foreground (existing (app)/layout.tsx mount)
  → cloud backup enabled?            (settings table)
  → biometric already unlocked this session, or biometric lock disabled?
  → ≥24h since last cloud backup?    (settings table: cloud_last_backup_date)
  → max(updatedAt) across items/itemFields/reminders/history
      newer than cloud_last_backup_date?
  → if all yes:
      exportData() → encryptData(passphrase)   [reuse existing lib/backup.ts, lib/encryption.ts]
      → write to <granted folder>/homedocket-backup.hdbackup (overwrite)
      → update cloud_last_backup_date
      → show dismissible Snackbar confirmation
  → on any failure: fail silently, retry at next opportunity,
    surface via a cloud-specific staleness indicator (§4.6)
```

Restore (new device or manual) is a separate, simpler flow that does not depend on the folder-access grant:

```
Settings → Restore from Backup → file picker → user navigates to the same
Drive folder → picks homedocket-backup.hdbackup → existing
restoreFromEncrypted() flow, unchanged
```

## 4. Components

### 4.1 Folder access grant (new native capability — spike required)

Android's Storage Access Framework (`Intent.ACTION_OPEN_DOCUMENT_TREE` + `ContentResolver.takePersistableUriPermission`) lets the user pick an arbitrary folder — typically one inside the Google Drive app, since Drive is registered as a `DocumentsProvider` on Android — and grants the app persistent read/write access to it across app restarts.

**This does not exist in the app's current dependencies.** `@capacitor/filesystem` covers fixed, app-scoped directories (Cache, Documents, Data, External) but not arbitrary user-picked folder trees with a persisted grant. This needs either a small custom native Capacitor plugin (Kotlin, wrapping the SAF picker + `DocumentFile` writes) or a vetted community plugin — to be resolved as a spike in the implementation plan, not assumed here.

### 4.2 Setup flow (Settings → new "Cloud Backup" section)

A toggle that, when enabled, walks through:
1. Native folder picker (§4.1) — user grants access to a folder.
2. Passphrase entry — set once, distinct from today's local-export passphrase (which is deliberately typed fresh every time and never persisted). This one must persist so the opportunistic trigger can reuse it without prompting.

Both the granted folder reference and the passphrase are stored in the existing Dexie `settings` table for v1 (see §8 for the security trade-off and the backlog item tracking the upgrade to real Keystore-backed storage — `issues.md`, "Backlog" entry).

### 4.3 Change detection

Compare `max(updatedAt)` across `items`, `itemFields`, `reminders`, and `history` (all already carry `updatedAt`/`changedAt` timestamps per `db/schema.ts`) against the stored `cloud_last_backup_date`. No new dirty-flag bookkeeping needed.

### 4.4 Write

Identical serialization/encryption path as local backup: `exportData()` → `JSON.stringify` → `encryptData(passphrase)` from `lib/encryption.ts`. Written to a fixed filename (`homedocket-backup.hdbackup`) inside the granted folder via the new plugin from §4.1, overwriting any existing file there.

### 4.5 Restore

No changes to `restoreFromEncrypted()` in `use-backup.ts`. The existing one-shot file-picker pattern already used for local restore is sufficient — restore happens once, so it doesn't need persistent folder access.

### 4.6 Failure handling

Folder permission revoked, network unavailable, write failure — fail silently, no error dialog, retry at the next opportunistic check. Surfaced non-intrusively as its own staleness-toned description line on the Cloud Backup row (§4.2), reusing the *same* `getBackupStalenessTone` helper and thresholds already built for local backups but evaluated against `cloud_last_backup_date` — a separate indicator, not merged into the existing local "Backup" row's description, since the two dates are independent. No separate error-notification mechanism.

## 5. Data Model Changes

New keys in the existing Dexie `settings` table (no schema/version bump needed — it's a key-value table):

| Key | Value | Notes |
|---|---|---|
| `cloud_backup_enabled` | `'true'` \| `'false'` | |
| `cloud_backup_folder_uri` | string | Persisted SAF tree URI reference |
| `cloud_backup_passphrase` | string | v1: plaintext in Dexie. See §8. |
| `cloud_last_backup_date` | ISO string | Mirrors the existing `last_backup_date` pattern |

## 6. Security Considerations

- The encrypted blob itself is unchanged — same AES-256-GCM envelope as local backups, so the destination folder (even if it were somehow exposed) reveals nothing without the passphrase.
- **v1 trade-off:** `cloud_backup_passphrase` is stored in the same Dexie table as everything else — protected by normal OS app-sandboxing, not hardware-backed encryption. This is a deliberate, tracked trade-off (see `issues.md` backlog entry), not an oversight.
- The opportunistic trigger only fires after the user has already passed biometric unlock for that app session (if biometric lock is enabled) — it never prompts or decrypts unattended while the phone is asleep.
- GDPR deletion: the cloud file lives in the user's own Drive folder, fully visible and deletable by them directly — no dependency on the app or on remembering the passphrase to remove it, unlike the passphrase-derived-path approach that was rejected.

## 7. Testing Strategy

- Unit tests: change-detection logic (`max(updatedAt)` comparison), staleness-tone extension for cloud backup recency — pure functions, same pattern as existing `lib/backup.ts` / `lib/dates.ts` tests.
- Component tests: Settings "Cloud Backup" section (enable/disable toggle, setup flow states).
- The native folder-access plugin itself is not unit-testable — needs on-device verification (per this session's earlier lesson: a device/emulator check before considering it done, not just a green test suite).
- E2E: opportunistic-trigger conditions (enabled + stale + changed → backup fires; any condition false → it doesn't) can be tested against the pure decision function without needing a real folder grant.

## 8. Open Risks

1. **Folder-access plugin (§4.1)** — no existing dependency covers this; needs a spike to decide custom plugin vs. community plugin before implementation can start in earnest.
2. **Passphrase storage (§6)** — v1 ships with the weaker Dexie-table storage by deliberate choice; tracked in `issues.md` for a future Keystore-backed upgrade.
3. **iOS** — explicitly deferred; will need its own spec when scoped.

## 9. CLAUDE.md Update Required

This feature knowingly bends the stated V1 architecture principle "Local-first... No backend server... No cloud sync." It doesn't introduce a backend or accounts, but it does add a real external dependency (the user's own Drive, accessed via OS-native folder permission — no server of ours involved). CLAUDE.md's Architecture Principles section should be updated as part of implementing this to distinguish "no backend service of our own" (still true) from "no cloud involvement of any kind" (no longer true) — otherwise the doc will keep contradicting the shipped app.
