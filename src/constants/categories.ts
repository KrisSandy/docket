export const CATEGORY_ICONS: Record<string, string> = {
  Vehicle: 'car',
  Utilities: 'zap',
  Housing: 'home',
  Connectivity: 'wifi',
  Insurance: 'shield',
};

export const CATEGORY_NAMES = ['Vehicle', 'Utilities', 'Housing', 'Connectivity', 'Insurance'] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];
