import { Link } from "@/components/ui/link";
import { siteConfig } from "@/config/site";

const LINKS = [
  { href: "/about", label: "About GovGuide" },
  { href: "/contribute", label: "Help keep this accurate" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface print:hidden">
      <div className="mx-auto max-w-page space-y-3 px-4 py-8">
        <p className="max-w-prose font-bold">
          {siteConfig.name} is an independent guide, not an official government
          website.
        </p>
        <p className="max-w-prose text-sm text-muted">
          Requirements and fees can change. Every guide links to its official
          source and shows when it was last checked. Confirm with the office
          before you go.
        </p>
        <nav aria-label="About this site">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
