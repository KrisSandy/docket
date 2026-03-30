import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — HomeDocket',
  description: 'HomeDocket terms of service.',
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-[28px] font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-[13px] text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground">
        <section>
          <h2 className="text-[18px] font-semibold">1. Acceptance of Terms</h2>
          <p className="mt-2">
            By downloading, installing, or using HomeDocket (&ldquo;the App&rdquo;), you agree
            to be bound by these Terms of Service. If you do not agree, do not use the App.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">2. Description of Service</h2>
          <p className="mt-2">
            HomeDocket is a household management tool for tracking recurring expenses, contracts,
            and compliance deadlines. The App is provided free of charge and stores all data
            locally on your device.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">3. Your Data</h2>
          <p className="mt-2">
            You own all data you enter into HomeDocket. The App does not transmit your data to
            any server. You are solely responsible for backing up your data and maintaining your
            backup passphrases.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">4. No Warranty</h2>
          <p className="mt-2">
            THE APP IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
            FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP
            WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">5. Limitation of Liability</h2>
          <p className="mt-2">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE DEVELOPERS OF
            HOMEDOCKET BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR REVENUE, WHETHER INCURRED
            DIRECTLY OR INDIRECTLY, ARISING FROM YOUR USE OF THE APP.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">6. Not Financial or Legal Advice</h2>
          <p className="mt-2">
            HomeDocket is a tracking and reminder tool only. It does not provide financial,
            legal, tax, or insurance advice. Information displayed in the App is based solely
            on data you enter. Always verify deadlines and obligations with your service providers
            and professional advisors.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">7. Reminder Accuracy</h2>
          <p className="mt-2">
            While HomeDocket makes best efforts to deliver reminders on time, notification
            delivery depends on your device&apos;s operating system and settings. We are not
            responsible for missed notifications due to device settings, battery optimisation,
            do-not-disturb modes, or operating system limitations.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">8. Data Loss</h2>
          <p className="mt-2">
            Since all data is stored locally on your device, data may be lost if you uninstall
            the App, factory reset your device, or experience device failure. We strongly
            recommend regular encrypted backups. We are not responsible for any data loss.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">9. Changes to Terms</h2>
          <p className="mt-2">
            We may update these Terms from time to time. Continued use of the App after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">10. Governing Law</h2>
          <p className="mt-2">
            These Terms are governed by and construed in accordance with the laws of Ireland,
            without regard to its conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold">11. Contact</h2>
          <p className="mt-2">
            If you have questions about these Terms, contact us at{' '}
            <a href="mailto:legal@homedocket.app" className="text-primary underline">
              legal@homedocket.app
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
