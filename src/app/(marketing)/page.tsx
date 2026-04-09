import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Car,
  Zap,
  Home,
  Shield,
  Bell,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { MarketingGate } from '@/components/marketing/marketing-gate';
import { OpenAppButton } from '@/components/marketing/open-app-button';

export const metadata: Metadata = {
  title: 'HomeDocket — Track Your Household Deadlines',
  description:
    'Never miss an NCT, motor tax, insurance renewal, or utility contract deadline again. Free household management app built for Irish homes.',
  openGraph: {
    title: 'HomeDocket — Track Your Household Deadlines',
    description:
      'Never miss an NCT, motor tax, insurance renewal, or utility contract deadline again. Free household management app built for Irish homes.',
    type: 'website',
    url: 'https://homedocket.app',
    siteName: 'HomeDocket',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HomeDocket — Track Your Household Deadlines',
    description:
      'Never miss an NCT, motor tax, insurance renewal, or utility contract deadline again. Free for Irish households.',
  },
  alternates: {
    canonical: 'https://homedocket.app',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'HomeDocket',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'iOS, Android, Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  description:
    'Track household deadlines — NCT, motor tax, insurance renewals, utility contracts. Built for Irish homes.',
  aggregateRating: undefined,
};

const categories = [
  {
    icon: Car,
    title: 'Vehicle',
    description: 'NCT dates, motor tax, insurance renewals — all in one place.',
  },
  {
    icon: Zap,
    title: 'Utilities',
    description: 'Electricity, gas, broadband, mobile contracts and billing cycles.',
  },
  {
    icon: Home,
    title: 'Housing',
    description: 'Mortgage fixed-rate end dates, rent reviews, LPT deadlines.',
  },
  {
    icon: Shield,
    title: 'Insurance',
    description: 'Home, life, health, pet, and travel insurance renewal tracking.',
  },
];

const features = [
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Get notified 60, 30, 14, 7, and 1 day before every deadline. Never caught off guard.',
  },
  {
    icon: Lock,
    title: 'Private & Secure',
    description: 'All data stays on your device. No accounts, no cloud, no tracking. Your data is yours.',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    description: 'Available on iPhone, Android, and web. Same great experience on every device.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Add',
    description: 'Add your household items — car, broadband, mortgage, insurance. Pick a category and fill in the details.',
  },
  {
    number: '2',
    title: 'Track',
    description: 'See all your deadlines at a glance. The dashboard highlights what needs attention first.',
  },
  {
    number: '3',
    title: 'Relax',
    description: 'Reminders arrive before every deadline. No more late fees, lapsed cover, or auto-renewed rip-offs.',
  },
];

export default function LandingPage() {
  return (
    <MarketingGate>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Nav */}
        <nav
          className="sticky z-50 border-b border-border bg-background backdrop-blur-md"
          style={{ top: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-[18px] font-semibold tracking-tight">
              HomeDocket
            </Link>
            <OpenAppButton className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Open App
            </OpenAppButton>
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-[40px]">
              Every household deadline,
              <br />
              <span className="text-primary">one calm dashboard.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-[18px]">
              NCT, motor tax, insurance renewals, utility contracts — stop juggling
              spreadsheets and calendar reminders. HomeDocket keeps everything in one
              place and nudges you before anything slips.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <OpenAppButton className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto">
                Get HomeDocket Free
                <ArrowRight className="h-4 w-4" />
              </OpenAppButton>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">
              No sign-up required. Your data stays on your device.
            </p>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-[18px] font-semibold sm:text-[22px]">
              Why HomeDocket?
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-[18px] font-semibold sm:text-[22px]">
              Track everything that matters
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-[13px] text-muted-foreground">
              Four built-in categories cover the deadlines Irish households deal with most.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => (
                <div
                  key={cat.title}
                  className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <cat.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 text-[15px] font-semibold">{cat.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-center text-[18px] font-semibold sm:text-[22px]">
              How it works
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust / Social Proof */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-[18px] font-semibold sm:text-[22px]">
              Built for Irish households
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Most bill-tracking apps are built for the US market. HomeDocket understands
              NCT cycles, motor tax classes, SEPA billing, and the way Irish utility
              contracts actually work. It&apos;s the app we wished existed — so we built it.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                'No account needed',
                'Works offline',
                'GDPR compliant',
                '100% free',
              ].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-ok)]" />
                  <span className="text-[13px] font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-primary py-16 text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <Clock className="mx-auto h-8 w-8 opacity-80" />
            <h2 className="mt-4 text-[22px] font-bold sm:text-[28px]">
              Stop missing deadlines
            </h2>
            <p className="mt-2 text-[15px] opacity-90">
              Add your first item in under a minute. Free forever, no strings attached.
            </p>
            <OpenAppButton className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-primary-foreground px-6 text-[15px] font-semibold text-primary transition-opacity hover:opacity-90">
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </OpenAppButton>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
            <p className="text-[13px] text-muted-foreground">
              &copy; {new Date().getFullYear()} HomeDocket. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms of Service
              </Link>
              <a
                href="mailto:hello@homedocket.app"
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </MarketingGate>
  );
}
