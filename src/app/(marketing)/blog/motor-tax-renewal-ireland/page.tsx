import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Motor Tax Renewal Dates Ireland — What You Need to Know',
  description:
    'Motor tax classes, renewal timelines, penalties for late renewal, online renewal options, and tips for Irish drivers to stay on top of motor tax.',
  alternates: {
    canonical: 'https://homedocket.app/blog/motor-tax-renewal-ireland',
  },
};

export default function MotorTaxBlogPost() {
  return (
    <article>
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to blog
      </Link>

      <h1 className="mt-6 text-[28px] font-bold leading-tight tracking-tight">
        Motor Tax Renewal Dates Ireland — What You Need to Know
      </h1>
      <p className="mt-2 text-[13px] text-muted-foreground">March 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground">
        <p>
          Motor tax is a legal requirement for every vehicle driven or parked on public
          roads in Ireland. Unlike the NCT, which has variable intervals based on vehicle
          age, motor tax is due on a fixed schedule — and it&apos;s your responsibility to
          renew it on time. There&apos;s no grace period, and no automatic reminders from
          the authorities.
        </p>

        <h2 className="text-[18px] font-semibold">When Is Motor Tax Due?</h2>
        <p>
          Motor tax expires on the last day of the period you&apos;ve paid for. If you
          paid for annual tax starting in January, it expires on 31 December. You can
          choose to pay monthly, half-yearly, or annually — but the shorter periods cost
          more overall. Annual payment gives the best value, while monthly provides the
          most flexibility.
        </p>

        <h2 className="text-[18px] font-semibold">How Much Does Motor Tax Cost?</h2>
        <p>
          The cost depends on your vehicle&apos;s tax class. Cars registered from July 2008
          onwards are taxed based on CO2 emissions — lower emissions mean lower tax. Cars
          registered before that date are taxed based on engine capacity (cc). Commercial
          vehicles, vintage vehicles, and electric vehicles each have their own rate bands.
          You can check the exact rate for your vehicle on motortax.ie.
        </p>

        <h2 className="text-[18px] font-semibold">Penalties for Late Renewal</h2>
        <p>
          Driving with expired motor tax is an offence. If stopped by the Gard&aacute;i,
          you can receive a fixed charge penalty notice. If the case goes to court, the
          fines are significantly higher. Additionally, your vehicle cannot pass the NCT
          if the motor tax is not current, which can create a cascade of compliance issues.
        </p>

        <h2 className="text-[18px] font-semibold">How to Renew Motor Tax</h2>
        <p>
          The simplest way to renew is online at motortax.ie. You&apos;ll need your
          vehicle registration number and the PIN from your renewal notice (RF100B form).
          If you don&apos;t have the form, you can still renew at your local Motor Tax
          Office. Online renewals are processed within a few days, and the new disc is
          posted to you. You can print a receipt to display in your windscreen while waiting.
        </p>

        <h2 className="text-[18px] font-semibold">What You Need to Renew</h2>
        <p>
          To renew motor tax, you need a valid NCT certificate (if your car requires one),
          valid motor insurance, and — for some vehicles — a certificate of roadworthiness
          (CRW). If any of these are missing or expired, you won&apos;t be able to renew.
          This is why keeping all your vehicle deadlines in one place is so important — a
          lapsed NCT can block your motor tax renewal.
        </p>

        <h2 className="text-[18px] font-semibold">Tips for Staying on Top of Motor Tax</h2>
        <p>
          The key is to set a reminder well before the expiry date — at least 30 days in
          advance. This gives you time to ensure your NCT and insurance are current (both
          are prerequisites for renewal), and to complete the renewal online. If you&apos;re
          on monthly payments, it&apos;s even more important to track each monthly
          expiry, since missing a month resets you to the next available period with
          potential arrears charges.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="text-[15px] font-semibold">Track motor tax with HomeDocket</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Add your vehicle, set the motor tax due date, and get layered reminders at 60,
            30, 14, 7, and 1 day before. Alongside your NCT and insurance — all in one place.
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
