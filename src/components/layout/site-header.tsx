import { Search } from "lucide-react";

import { Icon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { siteConfig } from "@/config/site";

import { ColorSchemeToggle } from "./color-scheme-toggle";

/**
 * The teal app bar. Pages put their own teal PageHeader right under it, so
 * the two read as one block.
 */
export function SiteHeader() {
  return (
    <header className="bg-brand text-on-brand print:hidden">
      <div className="mx-auto flex max-w-page items-center justify-between gap-2 px-4 py-2">
        <Link
          href="/"
          className="flex min-h-11 items-baseline text-on-brand no-underline"
        >
          <span className="sign text-xl">{siteConfig.name}</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 font-bold text-on-brand no-underline hover:bg-brand-strong"
          >
            <Icon icon={Search} />
            Search
          </Link>
          <ColorSchemeToggle />
        </div>
      </div>
    </header>
  );
}
