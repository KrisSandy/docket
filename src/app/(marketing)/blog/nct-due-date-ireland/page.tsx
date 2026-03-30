import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'When Is My NCT Due? A Complete Guide for Irish Drivers',
  description:
    'Everything you need to know about NCT testing in Ireland — intervals, booking, costs, what happens if you miss it, and how to track your date automatically.',
  alternates: {
    canonical: 'https://homedocket.app/blog/nct-due-date-ireland',
  },
};

export default function NctBlogPost() {
  return (
    <article>
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to blog
      </Link>

      <h1 className="mt-6 text-[28px] font-bold leading-tight tracking-tight">
        When Is My NCT Due? A Complete Guide for Irish Drivers
      </h1>
      <p className="mt-2 text-[13px] text-muted-foreground">March 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground">
        <p>
          The National Car Test (NCT) is a mandatory vehicle inspection for cars
          registered in Ireland. Managed by Applus+ on behalf of the Road Safety
          Authority (RSA), the NCT checks that your vehicle meets minimum safety and
          environmental standards. Driving without a valid NCT certificate is an offence
          that can result in a fine and penalty points.
        </p>

        <h2 className="text-[18px] font-semibold">How Often Do I Need an NCT?</h2>
        <p>
          New cars are exempt from NCT for the first four years after first registration.
          After that, the schedule depends on the age of the vehicle. Cars between four and
          ten years old require a test every two years. Once a car passes the ten-year mark,
          the test becomes annual. If you buy a second-hand car, the NCT due date carries
          over from the previous owner — it doesn&apos;t reset on transfer of ownership.
        </p>

        <h2 className="text-[18px] font-semibold">How to Find Your NCT Due Date</h2>
        <p>
          Your NCT due date is printed on the NCT disc displayed on your windscreen. You
          can also check it online at ncts.ie by entering your vehicle registration number.
          The date shown is the latest date by which you must complete the test — not the
          date you last passed it.
        </p>

        <h2 className="text-[18px] font-semibold">What Happens If You Miss It?</h2>
        <p>
          Driving with an expired NCT certificate is an offence under the Road Traffic Act.
          You can receive a fixed charge notice and penalty points on your licence. Your
          motor insurance may also be affected — some insurers require a valid NCT as a
          condition of cover, meaning you could be driving uninsured without one.
        </p>

        <h2 className="text-[18px] font-semibold">How Much Does the NCT Cost?</h2>
        <p>
          The standard NCT fee is &euro;55 for a full test. A retest (if your car fails on
          certain items) is free if completed within 21 days at the same centre. After 21
          days, or at a different centre, you pay the full fee again.
        </p>

        <h2 className="text-[18px] font-semibold">Tips for Never Missing Your NCT</h2>
        <p>
          The best approach is to set a reminder well in advance — at least 60 days before
          the due date. This gives you time to book a slot (which can fill up fast in busy
          periods) and to fix any issues a pre-test inspection might reveal. Calendar
          reminders work, but they&apos;re easy to dismiss. A dedicated tracking app like
          HomeDocket lets you set multiple reminders at 60, 30, 14, 7, and 1 day before,
          so the deadline stays visible without cluttering your calendar.
        </p>

        <h2 className="text-[18px] font-semibold">Book Early, Avoid the Rush</h2>
        <p>
          NCT centres tend to have longer wait times around the start of the year and in
          September, when large cohorts of cars hit their testing dates. You can book your
          NCT up to 90 days before the due date without losing any time on your next cycle —
          the new certificate will run from the original due date, not the test date. So
          there&apos;s no penalty for being early, only risk in being late.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="text-[15px] font-semibold">Track your NCT with HomeDocket</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add your vehicle, enter your NCT date, and get automatic reminders at 60, 30,
            14, 7, and 1 day before. Free, private, and works on all devices.
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
