'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  href?: string;
}

export function BackButton({ label = 'Back', href }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex min-h-[44px] min-w-[44px] items-center gap-1 -ml-2 px-2 text-primary transition-colors hover:text-primary/80 active:text-primary/60"
      aria-label={label}
    >
      <ChevronLeft size={24} />
      <span className="text-[15px]">{label}</span>
    </button>
  );
}
