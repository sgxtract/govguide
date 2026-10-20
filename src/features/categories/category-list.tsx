import { Link } from "@/components/ui/link";

import type { Category } from "@/lib/content/schemas";
import { countLabel } from "@/lib/utils/format";

type Props = {
  city: string;
  categories: { category: Category; count: number }[];
};

/** Categories as ruled rows, like a posted timetable. The whole row is clickable. */
export function CategoryList({ city, categories }: Props) {
  return (
    // role="list": Safari drops list semantics when bullets are removed.
    <ul role="list" className="border-t-2 border-ink">
      {categories.map(({ category, count }) => (
        <li
          key={category.slug}
          className="relative border-b border-rule py-3 hover:bg-surface"
        >
          <div className="flex items-baseline justify-between gap-4">
            <Link
              href={`/${city}/categories/${category.slug}`}
              className="font-bold text-ink no-underline after:absolute after:inset-0 hover:underline"
            >
              {category.name}
            </Link>
            <span className="shrink-0 text-sm text-muted tabular-nums">
              {count === 0 ? "No guides yet" : countLabel(count, "guide")}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{category.description}</p>
        </li>
      ))}
    </ul>
  );
}
