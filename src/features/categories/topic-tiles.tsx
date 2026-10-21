import { Icon, categoryIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import type { Category } from "@/lib/content/schemas";
import { countLabel } from "@/lib/utils/format";

type Props = {
  city: string;
  categories: { category: Category; count: number }[];
};

/**
 * Topics as raised tiles, two across on phones. A topic with no guides yet
 * still shows, and says so, so people know it's coming.
 */
export function TopicTiles({ city, categories }: Props) {
  return (
    <ul role="list" className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {categories.map(({ category, count }) => (
        <li
          key={category.slug}
          className="tap-area flex min-h-30 flex-col justify-between gap-3 rounded-card bg-surface p-4 shadow-lip hover:bg-brand-tint/40"
        >
          <span className="grid size-11 place-items-center rounded-control bg-brand-tint text-link">
            <Icon icon={categoryIcon(category.icon)} />
          </span>
          <span>
            <Link
              href={`/${city}/categories/${category.slug}`}
              className="stretched block leading-snug font-bold text-ink no-underline"
            >
              {category.name}
            </Link>
            <span className="text-sm text-muted">
              {count > 0 ? countLabel(count, "guide") : "Coming soon"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
