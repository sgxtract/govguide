import Link from "next/link";

import { siteConfig } from "@/config/site";

import { ColorSchemeToggle } from "./color-scheme-toggle";

export function SiteHeader() {
  return (
    <header className="border-t-6 border-b border-t-ink border-b-rule">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight text-ink no-underline"
        >
          {siteConfig.name}
        </Link>
        <ColorSchemeToggle />
      </div>
    </header>
  );
}
