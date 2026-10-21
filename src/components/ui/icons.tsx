import {
  BriefcaseBusiness,
  Car,
  HandCoins,
  HeartPulse,
  IdCard,
  Users,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

import type { CategoryIcon } from "@/lib/content/schemas";

/**
 * One icon set (Lucide, 2px stroke) at one size. Icons always sit next to a
 * visible word, so they're hidden from screen readers by default.
 */
export function Icon({
  icon: Glyph,
  size = 22,
  ...props
}: LucideProps & { icon: LucideIcon }) {
  return <Glyph aria-hidden="true" size={size} strokeWidth={2} {...props} />;
}

const CATEGORY_ICONS: Record<CategoryIcon, LucideIcon> = {
  documents: IdCard,
  vehicles: Car,
  business: BriefcaseBusiness,
  health: HeartPulse,
  social: Users,
  benefits: HandCoins,
};

export function categoryIcon(icon: CategoryIcon): LucideIcon {
  return CATEGORY_ICONS[icon];
}
