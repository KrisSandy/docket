'use client';

import { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { LogoIcon } from '@/components/ui/logo';

interface LockScreenProps {
  onUnlock: () => Promise<boolean>;
}

/**
 * Full-screen biometric lock overlay.
 * Displayed when the app is locked and biometric verification is required.
 */
export function LockScreen({ onUnlock }: LockScreenProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setIsAuthenticating(true);
    setError(null);

    const success = await onUnlock();

    if (!success) {
      setError('Authentication failed. Try again.');
    }

    setIsAuthenticating(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="App locked"
    >
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        {/* App icon / branding */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <LogoIcon size={48} className="text-primary" />
        </div>

        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            HomeDocket
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Unlock to view your data
          </p>
        </div>

        {/* Unlock button */}
        <button
          type="button"
          onClick={handleUnlock}
          disabled={isAuthenticating}
          className="flex min-h-[56px] min-w-[200px] items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50"
        >
          <Fingerprint size={22} />
          {isAuthenticating ? 'Verifying...' : 'Unlock'}
        </button>

        {/* Error message */}
        {error && (
          <p className="text-[13px] text-destructive" role="alert">
            {error}
          </p>
        )}

        <p className="mt-4 text-[13px] text-muted-foreground">
          Use Face ID, Touch ID, or your device passcode
        </p>
      </div>
    </div>
  );
}
