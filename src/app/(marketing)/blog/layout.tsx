import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    template: '%s — HomeDocket Blog',
    default: 'HomeDocket Blog — Tips for Irish Households',
  },
  description:
    'Guides and tips for managing household deadlines in Ireland — NCT, motor tax, insurance, utility contracts.',
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-[18px] font-semibold tracking-tight">
            HomeDocket
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open App
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
          <p className="text-[13px] text-muted-foreground">
            &copy; {new Date().getFullYear()} HomeDocket
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
