import {
  Car, Zap, Home, Wifi, Shield, HelpCircle,
  Flame, Smartphone, Tv, Droplets, Package,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  car: Car,
  zap: Zap,
  home: Home,
  wifi: Wifi,
  shield: Shield,
  flame: Flame,
  smartphone: Smartphone,
  tv: Tv,
  droplets: Droplets,
  package: Package,
};

/** Category accent colors for visual identity */
export const CATEGORY_ACCENTS: Record<string, { text: string; bg: string }> = {
  car: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-400/10' },
  zap: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-400/10' },
  home: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-400/10' },
  wifi: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 dark:bg-violet-400/10' },
  shield: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-400/10' },
  flame: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 dark:bg-orange-400/10' },
  smartphone: { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10 dark:bg-sky-400/10' },
  tv: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10 dark:bg-indigo-400/10' },
  droplets: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10 dark:bg-cyan-400/10' },
  package: { text: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-500/10 dark:bg-gray-400/10' },
};

const DEFAULT_ACCENT = { text: 'text-muted-foreground', bg: 'bg-muted/50' };

interface CategoryIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ icon, size = 16 }: CategoryIconProps) {
  const IconComponent = ICON_MAP[icon] ?? HelpCircle;
  return <IconComponent size={size} />;
}

/**
 * Renders a category icon inside a colored circular badge.
 */
interface CategoryIconBadgeProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg';
}

const badgeSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

const iconSizes = { sm: 16, md: 20, lg: 24 } as const;

export function CategoryIconBadge({ icon, size = 'sm' }: CategoryIconBadgeProps) {
  const IconComponent = ICON_MAP[icon] ?? HelpCircle;
  const accent = CATEGORY_ACCENTS[icon] ?? DEFAULT_ACCENT;

  return (
    <div className={`flex ${badgeSizes[size]} shrink-0 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>
      <IconComponent size={iconSizes[size]} />
    </div>
  );
}
