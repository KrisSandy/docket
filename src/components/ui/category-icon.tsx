import { Car, Zap, Home, Wifi, Shield, HelpCircle } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  car: Car,
  zap: Zap,
  home: Home,
  wifi: Wifi,
  shield: Shield,
};

interface CategoryIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ icon, size = 16 }: CategoryIconProps) {
  const IconComponent = ICON_MAP[icon] ?? HelpCircle;
  return <IconComponent size={size} />;
}
