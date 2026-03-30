'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Fingerprint,
  Archive,
  Download,
  Trash2,
  ExternalLink,
  Info,
  ChevronRight,
  HardDrive,
  Upload,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { db } from '@/db/database';
import { CategoryIcon } from '@/components/ui/category-icon';
import { useBackup } from '@/hooks/use-backup';
import { saveAndShareFile } from '@/lib/native-file';
import { useBiometric } from '@/hooks/use-biometric';
import { useNotificationSettings } from '@/hooks/use-notification-settings';
import { AndroidNotificationHelp } from '@/components/items/android-notification-help';
import { isValidEncryptedPayload } from '@/lib/encryption';
import { seedDefaultCategories } from '@/db/seed';

// ---------- Shared sub-components ----------

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  trailing?: React.ReactNode;
}

function SettingsRow({
  icon,
  label,
  description,
  onClick,
  disabled = false,
  destructive = false,
  trailing,
}: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-4 px-4 py-4 min-h-[44px] text-left transition-colors hover:bg-muted/30 active:bg-muted/50 disabled:opacity-50 ${
        destructive ? 'text-destructive' : ''
      }`}
    >
      <div className={`${destructive ? 'text-destructive' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] ${destructive ? 'text-destructive' : 'text-foreground'}`}>
          {label}
        </p>
        {description && (
          <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {trailing ?? <ChevronRight size={18} className="text-muted-foreground" />}
    </button>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="px-4 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {title}
      </h2>
      <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
        {children}
      </div>
    </section>
  );
}

// ---------- Modal component ----------

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

// ---------- Main Page ----------

export default function SettingsPage() {
  const router = useRouter();
  const {
    exportEncrypted,
    exportJSON,
    exportCSV,
    restoreFromEncrypted,
    deleteAllData,
    getLastBackupDate,
  } = useBackup();
  const {
    isEnabled: biometricEnabled,
    biometricStatus,
    loading: biometricLoading,
    enableBiometric,
    disableBiometric,
  } = useBiometric();
  const {
    isEnabled: notificationsEnabled,
    permissionState,
    loading: notificationsLoading,
    toggleNotifications,
  } = useNotificationSettings();

  // State
  const [categorySummary, setCategorySummary] = useState<{ name: string; icon: string; count: number }[]>([]);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

  // Backup export state
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [backupConfirmPassphrase, setBackupConfirmPassphrase] = useState('');
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);

  // Restore state
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GDPR export state
  const [isExportingData, setIsExportingData] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFinalConfirm, setShowDeleteFinalConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Load initial data
  useEffect(() => {
    const loadSummary = async () => {
      const categories = await db.categories.orderBy('sortOrder').toArray();
      const items = await db.items.where('status').equals('active').toArray();
      const summary = categories.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        count: items.filter((i) => i.categoryId === cat.id).length,
      }));
      setCategorySummary(summary);
    };
    loadSummary();
    getLastBackupDate().then(setLastBackupDate);
  }, [getLastBackupDate]);

  // ---------- Handlers ----------

  const handleBackupExport = async () => {
    setBackupError(null);

    if (backupPassphrase.length < 8) {
      setBackupError('Passphrase must be at least 8 characters');
      return;
    }
    if (backupPassphrase !== backupConfirmPassphrase) {
      setBackupError('Passphrases do not match');
      return;
    }

    setIsExportingBackup(true);
    try {
      const encrypted = await exportEncrypted(backupPassphrase);
      const filename = `homedocket-backup-${new Date().toISOString().split('T')[0]}.hdbackup`;
      await saveAndShareFile(filename, encrypted, 'application/json');

      // Update last backup date
      await db.settings.put({ key: 'last_backup_date', value: new Date().toISOString() });
      setLastBackupDate(new Date().toISOString());

      setShowBackupModal(false);
      setBackupPassphrase('');
      setBackupConfirmPassphrase('');
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'Backup failed');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestoreFile(file);
      setRestoreError(null);
    }
  };

  const handleRestoreStart = () => {
    if (!restoreFile) {
      setRestoreError('Please select a backup file');
      return;
    }
    if (!restorePassphrase) {
      setRestoreError('Please enter your backup passphrase');
      return;
    }
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = async () => {
    if (!restoreFile) return;

    setIsRestoring(true);
    setRestoreError(null);

    try {
      const content = await restoreFile.text();

      if (!isValidEncryptedPayload(content)) {
        setRestoreError('This does not appear to be a valid HomeDocket backup file');
        setIsRestoring(false);
        setShowRestoreConfirm(false);
        return;
      }

      await restoreFromEncrypted(content, restorePassphrase);

      // Reset state and redirect
      setShowRestoreModal(false);
      setShowRestoreConfirm(false);
      setRestorePassphrase('');
      setRestoreFile(null);
      router.push('/dashboard');
    } catch (err) {
      setRestoreError(err instanceof Error ? err.message : 'Restore failed');
      setShowRestoreConfirm(false);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleGDPRExport = async () => {
    setIsExportingData(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      if (exportFormat === 'json') {
        const json = await exportJSON();
        await saveAndShareFile(`homedocket-export-${dateStr}.json`, json, 'application/json');
      } else {
        const csv = await exportCSV();
        await saveAndShareFile(`homedocket-export-${dateStr}.csv`, csv, 'text/csv');
      }
    } finally {
      setIsExportingData(false);
    }
  };

  const handleDeleteAll = async () => {
    await deleteAllData();
    setShowDeleteFinalConfirm(false);
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    // Re-seed default categories so app isn't broken
    await seedDefaultCategories();
    router.push('/dashboard');
  };

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      await disableBiometric();
    } else {
      await enableBiometric();
    }
  };

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>

      {/* ===== Notifications ===== */}
      <SettingsSection title="Notifications">
        <div className="flex w-full items-center gap-4 px-4 py-4 min-h-[44px]">
          <div className="text-muted-foreground">
            <Bell size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-foreground">Notifications</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {notificationsLoading
                ? 'Loading...'
                : notificationsEnabled
                  ? 'Reminders are active'
                  : 'Reminders are paused'}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            disabled={notificationsLoading}
            onClick={() => toggleNotifications(!notificationsEnabled)}
            className={`relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              notificationsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform ${
                notificationsEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>
      </SettingsSection>

      {/* Notification warnings */}
      {!notificationsEnabled && !notificationsLoading && (
        <div className="mx-4 mt-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30" role="alert">
          <p className="text-[13px] text-amber-700 dark:text-amber-300">
            All reminders are paused. You won&apos;t receive any deadline notifications until re-enabled.
          </p>
        </div>
      )}

      {notificationsEnabled && permissionState === 'denied' && (
        <div className="mx-4 mt-2 rounded-xl bg-red-50 p-3 dark:bg-red-950/30" role="alert">
          <p className="text-[13px] text-red-700 dark:text-red-300">
            Notification permission is denied. Enable in your device settings to receive reminders.
          </p>
        </div>
      )}

      {notificationsEnabled && typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent) && (
        <div className="mx-4 mt-2">
          <AndroidNotificationHelp />
        </div>
      )}

      {/* ===== Security ===== */}
      <SettingsSection title="Security">
        <div className="flex w-full items-center gap-4 px-4 py-4 min-h-[44px]">
          <div className="text-muted-foreground">
            <Fingerprint size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-foreground">Biometric Lock</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {biometricLoading
                ? 'Loading...'
                : biometricStatus === 'not_available'
                  ? 'Not available on this device'
                  : biometricStatus === 'not_enrolled'
                    ? 'Set up biometrics in device settings'
                    : biometricEnabled
                      ? 'App locked on launch and after 30s'
                      : 'Protect your data with Face ID or fingerprint'}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={biometricEnabled}
            aria-label={biometricEnabled ? 'Disable biometric lock' : 'Enable biometric lock'}
            disabled={biometricLoading || biometricStatus !== 'available'}
            onClick={handleBiometricToggle}
            className={`relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              biometricEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-sm transition-transform ${
                biometricEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>
      </SettingsSection>

      {/* ===== Categories Summary ===== */}
      {categorySummary.length > 0 && (
        <SettingsSection title="Categories">
          {categorySummary.map((cat) => (
            <div key={cat.name} className="flex w-full items-center gap-4 px-4 py-3 min-h-[44px]">
              <div className="text-muted-foreground">
                <CategoryIcon icon={cat.icon} size={20} />
              </div>
              <span className="flex-1 text-[15px] text-foreground">{cat.name}</span>
              <span className="text-[13px] text-muted-foreground">
                {cat.count} {cat.count === 1 ? 'item' : 'items'}
              </span>
            </div>
          ))}
        </SettingsSection>
      )}

      {/* ===== Data Management ===== */}
      <SettingsSection title="Data">
        <SettingsRow
          icon={<Archive size={20} />}
          label="Archived Items"
          onClick={() => router.push('/history')}
        />
        <SettingsRow
          icon={<HardDrive size={20} />}
          label="Backup"
          description={lastBackupDate ? `Last: ${new Date(lastBackupDate).toLocaleDateString()}` : 'Create an encrypted backup'}
          onClick={() => {
            setBackupError(null);
            setBackupPassphrase('');
            setBackupConfirmPassphrase('');
            setShowBackupModal(true);
          }}
        />
        <SettingsRow
          icon={<Upload size={20} />}
          label="Restore from Backup"
          description="Restore from an encrypted backup file"
          onClick={() => {
            setRestoreError(null);
            setRestorePassphrase('');
            setRestoreFile(null);
            setShowRestoreModal(true);
          }}
        />
        <div className="flex w-full items-center gap-4 px-4 py-4 min-h-[44px]">
          <div className="text-muted-foreground">
            <Download size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-foreground">Export My Data</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">Download all your data</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="min-h-[36px] rounded-lg border border-border bg-card px-2 py-1 text-[13px] text-foreground"
              aria-label="Export format"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <button
              type="button"
              onClick={handleGDPRExport}
              disabled={isExportingData}
              className="min-h-[36px] rounded-lg bg-primary px-3 py-1 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isExportingData ? '...' : 'Export'}
            </button>
          </div>
        </div>
        <SettingsRow
          icon={<Trash2 size={20} />}
          label="Delete All My Data"
          description="Permanently erase everything"
          onClick={() => setShowDeleteConfirm(true)}
          destructive
        />
      </SettingsSection>

      {/* ===== About ===== */}
      <SettingsSection title="About">
        <SettingsRow
          icon={<MessageCircle size={20} />}
          label="Give Feedback"
          description="Help us improve HomeDocket"
          onClick={() => window.open('https://forms.gle/homedocket-feedback', '_blank')}
        />
        <SettingsRow
          icon={<ExternalLink size={20} />}
          label="Privacy Policy"
          onClick={() => router.push('/privacy')}
        />
        <SettingsRow
          icon={<FileText size={20} />}
          label="Terms of Service"
          onClick={() => router.push('/terms')}
        />
        <SettingsRow
          icon={<Info size={20} />}
          label="About HomeDocket"
          trailing={<span className="text-[13px] text-muted-foreground">v0.1.0</span>}
        />
      </SettingsSection>

      {/* ===== Backup Export Modal ===== */}
      {showBackupModal && (
        <Modal onClose={() => setShowBackupModal(false)}>
          <h3 className="text-[18px] font-semibold">Create Backup</h3>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Your backup will be encrypted with a passphrase. You&apos;ll need this passphrase to restore.
          </p>
          <div className="mt-4 space-y-3">
            <input
              type="password"
              placeholder="Passphrase (min 8 characters)"
              value={backupPassphrase}
              onChange={(e) => setBackupPassphrase(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <input
              type="password"
              placeholder="Confirm passphrase"
              value={backupConfirmPassphrase}
              onChange={(e) => setBackupConfirmPassphrase(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {backupError && (
            <p className="mt-2 text-[13px] text-destructive" role="alert">{backupError}</p>
          )}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowBackupModal(false)}
              className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBackupExport}
              disabled={isExportingBackup}
              className="min-h-[44px] rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isExportingBackup ? 'Encrypting...' : 'Create Backup'}
            </button>
          </div>
        </Modal>
      )}

      {/* ===== Restore Modal ===== */}
      {showRestoreModal && !showRestoreConfirm && (
        <Modal onClose={() => setShowRestoreModal(false)}>
          <h3 className="text-[18px] font-semibold">Restore from Backup</h3>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Select your backup file and enter the passphrase used when creating it.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".hdbackup,.json"
                onChange={handleRestoreFileSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[44px] rounded-xl border border-dashed border-border bg-background px-4 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/30"
              >
                {restoreFile ? restoreFile.name : 'Select backup file (.hdbackup)'}
              </button>
            </div>
            <input
              type="password"
              placeholder="Backup passphrase"
              value={restorePassphrase}
              onChange={(e) => setRestorePassphrase(e.target.value)}
              className="w-full min-h-[44px] rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {restoreError && (
            <p className="mt-2 text-[13px] text-destructive" role="alert">{restoreError}</p>
          )}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowRestoreModal(false)}
              className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRestoreStart}
              disabled={isRestoring}
              className="min-h-[44px] rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Restore
            </button>
          </div>
        </Modal>
      )}

      {/* ===== Restore Confirmation ===== */}
      {showRestoreConfirm && (
        <Modal onClose={() => setShowRestoreConfirm(false)}>
          <h3 className="text-[18px] font-semibold text-destructive">Replace Current Data?</h3>
          <p className="mt-2 text-[15px] text-muted-foreground">
            This will replace all your current data with the backup. Your existing items, history, and settings will be overwritten. This cannot be undone.
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowRestoreConfirm(false)}
              className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRestoreConfirm}
              disabled={isRestoring}
              className="min-h-[44px] rounded-xl bg-destructive px-5 py-3 text-[15px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              {isRestoring ? 'Restoring...' : 'Replace My Data'}
            </button>
          </div>
        </Modal>
      )}

      {/* ===== Delete Confirmation — Step 1 ===== */}
      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)}>
          <h3 className="text-[18px] font-semibold text-destructive">Delete All Data?</h3>
          <p className="mt-2 text-[15px] text-muted-foreground">
            This will permanently delete all your items, history, and settings. This action cannot be undone.
          </p>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText('');
                setShowDeleteFinalConfirm(true);
              }}
              className="min-h-[44px] rounded-xl bg-destructive px-5 py-3 text-[15px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              Continue
            </button>
          </div>
        </Modal>
      )}

      {/* ===== Delete Confirmation — Step 2 (Type DELETE) ===== */}
      {showDeleteFinalConfirm && (
        <Modal onClose={() => setShowDeleteFinalConfirm(false)}>
          <h3 className="text-[18px] font-semibold text-destructive">Are you absolutely sure?</h3>
          <p className="mt-2 text-[15px] text-muted-foreground">
            All data will be permanently erased. There is no way to recover it.
          </p>
          <p className="mt-3 text-[15px] text-foreground font-medium">
            Type <span className="font-mono text-destructive">DELETE</span> to confirm:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="mt-2 w-full min-h-[44px] rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground font-mono"
            autoFocus
            autoComplete="off"
          />
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowDeleteFinalConfirm(false);
                setDeleteConfirmText('');
              }}
              className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={deleteConfirmText !== 'DELETE'}
              className="min-h-[44px] rounded-xl bg-destructive px-5 py-3 text-[15px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              Delete Everything
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

