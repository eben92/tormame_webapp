import { toTitleCase } from '@/lib/utils';
import {
  CalendarDays,
  Pill,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon for each known category vertical, keyed by its Title Case display label (matching
 * `toTitleCase(apiLabel)`). Covers both the verticals the API currently returns (Food,
 * Groceries/Grocery, Shops, Events/Entertainment, Health, Express) and the ones the design
 * anticipates the API growing into (Beauty, Digital, Electronics, Fashion, Pharmacy).
 * Anything not listed here falls back to `Tag` — the fallback never invents a
 * category-specific icon for a label we don't recognize.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Food: UtensilsCrossed,
  Grocery: ShoppingCart,
  Groceries: ShoppingCart,
  Shops: Store,
  Events: CalendarDays,
  Entertainment: CalendarDays,
  Health: Pill,
  Pharmacy: Pill,
  Express: Zap,
  Digital: Smartphone,
  Electronics: Zap,
  Beauty: Sparkles,
  Fashion: Shirt,
};

/** Resolves a raw API category label (e.g. "FOOD") to its bubble icon, defaulting to `Tag`. */
export function getCategoryIcon(apiLabel: string): LucideIcon {
  return CATEGORY_ICONS[toTitleCase(apiLabel)] ?? Tag;
}
