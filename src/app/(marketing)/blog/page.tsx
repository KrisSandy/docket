import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides for Irish households — NCT dates, motor tax renewal, bill tracking tips, and more.',
};

const posts = [
  {
    slug: 'nct-due-date-ireland',
    title: 'When Is My NCT Due? A Complete Guide for Irish Drivers',
    description:
      'Everything you need to know about NCT testing intervals, booking, costs, and how to never miss your NCT date again.',
    date: 'March 2026',
  },
  {
    slug: 'track-household-bills-ireland',
    title: 'How to Track Your Household Bills in Ireland',
    description:
      'A practical guide to organising electricity, gas, broadband, and insurance renewals so nothing slips through the cracks.',
    date: 'March 2026',
  },
  {
    slug: 'motor-tax-renewal-ireland',
    title: 'Motor Tax Renewal Dates Ireland — What You Need to Know',
    description:
      'Motor tax classes, renewal timelines, penalties for late renewal, and tips for staying on top of it.',
    date: 'March 2026',
  },
];

export default function BlogIndexPage() {
  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Practical guides for managing household deadlines in Ireland.
      </p>

      <div className="mt-10 space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-xl border border-border p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-[13px] text-muted-foreground">{post.date}</p>
            <h2 className="mt-1 text-[18px] font-semibold leading-snug">
              {post.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {post.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
              Read more <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
