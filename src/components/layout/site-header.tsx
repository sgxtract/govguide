import { Link } from "@/components/ui/link";

import { siteConfig } from "@/config/site";

import { ColorSchemeToggle } from "./color-scheme-toggle";

type Props = {
  /** The city being browsed. Omitted on pages that aren't tied to a city. */
  city?: { slug: string; name: string };
};

export function SiteHeader({ city }: Props) {
  return (
    <header className="border-t-6 border-b border-t-ink border-b-rule print:hidden">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3">
        <Link
          href={city ? `/${city.slug}` : "/"}
          className="text-lg text-ink no-underline"
        >
          <span className="font-extrabold tracking-tight">
            {siteConfig.name}
          </span>
          {city && (
            <>
              <span aria-hidden="true" className="mx-2 text-muted">
                /
              </span>
              <span>{city.name}</span>
            </>
          )}
        </Link>
        <ColorSchemeToggle />
      </div>
    </header>
  );
}
