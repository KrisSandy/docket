'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { db } from '@/db/database';
import { CategoryIcon } from '@/components/ui/category-icon';
import { useBackup } from '@/hooks/use-backup';
import { useNotificationSettings } from '@/hooks/use-notification-settings';
import { AndroidNotificationHelp } from '@/components/items/android-notification-help';

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

export default function SettingsPage() {
  const router = useRouter();
  const { exportData, deleteAllData } = useBackup();
  const {
    isEnabled: notificationsEnabled,
    permissionState,
    loading: notificationsLoading,
    toggleNotifications,
  } = useNotificationSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFinalConfirm, setShowDeleteFinalConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [categorySummary, setCategorySummary] = useState<{ name: string; icon: string; count: number }[]>([]);

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
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homedocket-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAll = async () => {
    await deleteAllData();
    setShowDeleteFinalConfirm(false);
    setShowDeleteConfirm(false);
    router.push('/dashboard');
  };

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>

      {/* Notifications */}
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

      {/* Security */}
      <SettingsSection title="Security">
        <SettingsRow
          icon={<Fingerprint size={20} />}
          label="Biometric Lock"
          description="Coming soon"
          disabled
          trailing={<span className="text-[13px] text-muted-foreground">Sprint 5</span>}
        />
      </SettingsSection>

      {/* Categories Summary */}
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

      {/* Data Management */}
      <SettingsSection title="Data">
        <SettingsRow
          icon={<Archive size={20} />}
          label="Archived Items"
          onClick={() => router.push('/history')}
        />
        <SettingsRow
          icon={<HardDrive size={20} />}
          label="Backup"
          description="Coming soon"
          disabled
          trailing={<span className="text-[13px] text-muted-foreground">Sprint 5</span>}
        />
        <SettingsRow
          icon={<Download size={20} />}
          label="Export My Data"
          description="Download all your data as JSON"
          onClick={handleExport}
          trailing={
            isExporting ? (
              <span className="text-[13px] text-muted-foreground">Exporting...</span>
            ) : (
              <ChevronRight size={18} className="text-muted-foreground" />
            )
          }
        />
        <SettingsRow
          icon={<Trash2 size={20} />}
          label="Delete All My Data"
          description="Permanently erase everything"
          onClick={() => setShowDeleteConfirm(true)}
          destructive
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <SettingsRow
          icon={<ExternalLink size={20} />}
          label="Privacy Policy"
          onClick={() => window.open('/privacy', '_blank')}
        />
        <SettingsRow
          icon={<Info size={20} />}
          label="About HomeDocket"
          trailing={<span className="text-[13px] text-muted-foreground">v0.1.0</span>}
        />
      </SettingsSection>

      {/* Delete Confirmation — Step 1 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
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
                  setShowDeleteFinalConfirm(true);
                }}
                className="min-h-[44px] rounded-xl bg-destructive px-5 py-3 text-[15px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation — Step 2 (Final) */}
      {showDeleteFinalConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-8">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-[18px] font-semibold text-destructive">Are you absolutely sure?</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">
              All data will be permanently erased. There is no way to recover it.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteFinalConfirm(false)}
                className="min-h-[44px] rounded-xl px-5 py-3 text-[15px] text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="min-h-[44px] rounded-xl bg-destructive px-5 py-3 text-[15px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
