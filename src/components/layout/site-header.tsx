import { Search } from "lucide-react";

import { Icon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { siteConfig } from "@/config/site";

import { ColorSchemeToggle } from "./color-scheme-toggle";

type Props = {
  /** The city being browsed. Omitted on pages that aren't tied to a city. */
  city?: { slug: string; name: string };
};

/**
 * The teal app bar. Pages put their own teal PageHeader right under it, so
 * the two read as one block.
 */
export function SiteHeader({ city }: Props) {
  return (
    <header className="bg-brand text-on-brand print:hidden">
      <div className="mx-auto flex max-w-page items-center justify-between gap-2 px-4 py-2">
        <Link
          href={city ? `/${city.slug}` : "/"}
          // flex-wrap: with large text, the city moves to its own line
          // instead of pushing the page wider than the screen.
          className="flex min-h-11 flex-wrap items-baseline gap-x-2 text-on-brand no-underline"
        >
          <span className="sign text-xl">{siteConfig.name}</span>
          {city && <span className="font-bold">{city.name}</span>}
        </Link>
        <div className="flex items-center gap-1">
          {city && (
            <Link
              href={`/${city.slug}/search`}
              className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 font-bold text-on-brand no-underline hover:bg-brand-strong"
            >
              <Icon icon={Search} />
              Search
            </Link>
          )}
          <ColorSchemeToggle />
        </div>
      </div>
    </header>
  );
}
