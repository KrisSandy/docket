import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — HomeDocket',
  description: 'HomeDocket privacy policy. Your data stays on your device.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-[28px] font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-[13px] text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground">
        <section>
          <h2 className="text-[18px] font-semibold">Summary</h2>
          <p className="mt-2">
            HomeDocket is a local-first app. All your data stays on your device. We do not collect,
            transmit, or store any of your personal information on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">What Data We Collect</h2>
          <p className="mt-2">
            <strong>None.</strong> HomeDocket does not collect any personal data, usage analytics,
            or telemetry in this version. There are no user accounts, no login, and no server-side
            data processing.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Where Your Data Is Stored</h2>
          <p className="mt-2">
            All data you enter into HomeDocket (items, deadlines, reminders, settings) is stored
            locally on your device using IndexedDB. This data never leaves your device unless you
            explicitly choose to export or back it up.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Backup &amp; Export</h2>
          <p className="mt-2">
            When you create a backup, your data is encrypted with a passphrase you provide using
            AES-256-GCM encryption. The encrypted file is saved to your device or shared via your
            chosen method (iCloud, Google Drive, etc.). We never have access to your backup files
            or your passphrase.
          </p>
          <p className="mt-2">
            You can also export your data in unencrypted JSON or CSV format for portability or
            record-keeping. These files are generated on your device and are not transmitted anywhere.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Notifications</h2>
          <p className="mt-2">
            HomeDocket uses local notifications scheduled on your device to remind you of upcoming
            deadlines. These notifications are processed entirely on-device using the operating
            system&apos;s notification system. No notification data is sent to any server.
          </p>
          <p className="mt-2">
            Notification content is kept generic and does not include provider names, amounts,
            or other specific details about your items.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Biometric Authentication</h2>
          <p className="mt-2">
            When enabled, HomeDocket uses your device&apos;s built-in biometric system (Face ID,
            Touch ID, or fingerprint) to lock and unlock the app. Biometric data is processed
            entirely by your device&apos;s operating system. HomeDocket never accesses, stores,
            or transmits biometric data.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Third-Party Services</h2>
          <p className="mt-2">
            HomeDocket does not use any third-party analytics, advertising, or tracking services.
            There are no cookies, no fingerprinting, and no cross-site tracking.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Your Rights (GDPR)</h2>
          <p className="mt-2">
            Since all data is stored locally on your device, you have full control at all times.
            You can export all your data (JSON or CSV), delete all your data, and uninstall the app,
            all from within the Settings screen. No request to us is needed because we never have
            your data.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Children&apos;s Privacy</h2>
          <p className="mt-2">
            HomeDocket does not knowingly collect any data from children under 16. Since we collect
            no data at all, this is inherently satisfied.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Changes to This Policy</h2>
          <p className="mt-2">
            If we make changes to this privacy policy, we will update the &ldquo;Last updated&rdquo;
            date at the top of this page and notify users through an in-app announcement.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, contact us at{' '}
            <a href="mailto:privacy@homedocket.app" className="text-primary underline">
              privacy@homedocket.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
