'use client';

import { useState } from 'react';
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
import { useBackup } from '@/hooks/use-backup';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFinalConfirm, setShowDeleteFinalConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
        <SettingsRow
          icon={<Bell size={20} />}
          label="Notifications"
          description="Coming soon"
          disabled
          trailing={<span className="text-[13px] text-muted-foreground">Sprint 4</span>}
        />
      </SettingsSection>

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
