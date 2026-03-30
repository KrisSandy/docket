export const CATEGORY_ICONS: Record<string, string> = {
  Vehicle: 'car',
  Utilities: 'zap',
  Housing: 'home',
  Insurance: 'shield',
};

export const CATEGORY_NAMES = ['Vehicle', 'Utilities', 'Housing', 'Insurance'] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];
