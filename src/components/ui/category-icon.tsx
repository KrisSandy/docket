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

/** Category accent colors for visual identity — solid pastel badges, matching the Hearth mockup */
export const CATEGORY_ACCENTS: Record<string, { text: string; bg: string }> = {
  car: { text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/40' },
  zap: { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/40' },
  home: { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
  wifi: { text: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-950/40' },
  shield: { text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-950/40' },
  flame: { text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-950/40' },
  smartphone: { text: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-950/40' },
  tv: { text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-950/40' },
  droplets: { text: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-100 dark:bg-cyan-950/40' },
  package: { text: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800/40' },
};

export const DEFAULT_ACCENT = { text: 'text-muted-foreground', bg: 'bg-muted' };

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
