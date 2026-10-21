import { ChevronRight } from "lucide-react";

import { Icon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import type { City } from "@/lib/content/schemas";

/** Cities as rows, for the city picker. */
export function CityList({ cities }: { cities: City[] }) {
  return (
    <ul role="list" className="rounded-card bg-surface">
      {cities.map((city) => (
        <li
          key={city.slug}
          className="tap-area flex min-h-16 items-center gap-3 border-b border-line px-4 py-3 first:rounded-t-card last:rounded-b-card last:border-0 hover:bg-brand-tint/40"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/${city.slug}`}
              className="stretched font-bold text-ink no-underline"
            >
              {city.name}
            </Link>
            <p className="text-sm text-muted">{city.description}</p>
          </div>
          <Icon icon={ChevronRight} className="shrink-0 text-muted" />
        </li>
      ))}
    </ul>
  );
}
