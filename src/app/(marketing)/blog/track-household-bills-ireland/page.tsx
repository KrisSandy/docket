import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Track Your Household Bills in Ireland',
  description:
    'A practical guide to organising electricity, gas, broadband, mobile, and insurance bills for Irish households — avoid missed payments and rip-off renewals.',
  alternates: {
    canonical: 'https://homedocket.app/blog/track-household-bills-ireland',
  },
};

export default function TrackBillsBlogPost() {
  return (
    <article>
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to blog
      </Link>

      <h1 className="mt-6 text-[28px] font-bold leading-tight tracking-tight">
        How to Track Your Household Bills in Ireland
      </h1>
      <p className="mt-2 text-[13px] text-muted-foreground">March 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground">
        <p>
          Between electricity, gas, broadband, mobile, home insurance, car insurance,
          motor tax, and the NCT, the average Irish household has a dozen or more
          recurring commitments. Each one has its own billing cycle, contract end date,
          and renewal terms. Missing a deadline can mean penalty fees, auto-renewal at a
          higher rate, or a lapse in cover you didn&apos;t notice until you needed it.
        </p>

        <h2 className="text-[18px] font-semibold">The Real Cost of Disorganisation</h2>
        <p>
          Research from the Commission for Regulation of Utilities (CRU) consistently
          shows that Irish consumers who don&apos;t switch providers at the end of a
          contract pay significantly more. Loyalty penalties — where existing customers
          pay more than new sign-ups for the same service — are common across energy and
          broadband providers. Knowing when your contract ends is the first step to
          avoiding this.
        </p>

        <h2 className="text-[18px] font-semibold">What to Track for Each Bill</h2>
        <p>
          For each household service, there are a few key pieces of information worth
          recording: the provider name, the contract start and end dates, the billing
          frequency (monthly, bi-monthly, or quarterly), and the current plan or tariff
          name. For utilities, having your MPRN (electricity) or GPRN (gas) on hand makes
          switching providers much faster when the time comes.
        </p>

        <h2 className="text-[18px] font-semibold">Spreadsheets vs. Dedicated Apps</h2>
        <p>
          Many people start with a spreadsheet. It works until it doesn&apos;t — the
          spreadsheet sits forgotten in a folder, dates pass without anyone checking, and
          the whole exercise was wasted. The difference with a dedicated tracking app is
          that it actively pushes reminders to you. You don&apos;t have to remember to
          check. It checks for you.
        </p>

        <h2 className="text-[18px] font-semibold">Setting Effective Reminders</h2>
        <p>
          A single reminder the day before a deadline is too late for most things — you
          can&apos;t switch broadband provider or renew your insurance in 24 hours. The
          most useful approach is layered reminders: a first alert 60 days out (for
          research and comparison), 30 days (to make a decision), 14 days (to act on it),
          and a final nudge at 7 and 1 day before. This gives you time to act without
          feeling panicked.
        </p>

        <h2 className="text-[18px] font-semibold">Irish-Specific Considerations</h2>
        <p>
          Ireland has some unique billing patterns worth knowing about. Many energy
          providers bill bi-monthly. Broadband contracts typically run for 12 or 18 months.
          Home insurance renewals often arrive only 14 days before expiry, which
          doesn&apos;t leave much time to shop around. Motor tax can be paid monthly,
          half-yearly, or annually — but the annual rate is the best value. And Local
          Property Tax (LPT) has its own annual cycle that&apos;s easy to forget about.
        </p>

        <h2 className="text-[18px] font-semibold">Getting Started</h2>
        <p>
          The best time to organise your household bills is now. Gather your most recent
          bills, note down the key dates and account numbers, and enter them somewhere you
          won&apos;t ignore. Whether that&apos;s a spreadsheet, a calendar, or a tool like
          HomeDocket, the important thing is that the information is centralised and the
          reminders are automatic.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="text-[15px] font-semibold">Track all your bills with HomeDocket</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add your utilities, insurance, vehicle, and housing items. Get reminders before
            every contract end date and renewal deadline. Free and private.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </article>
  );
}
