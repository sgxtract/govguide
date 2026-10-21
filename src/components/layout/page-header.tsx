import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { Icon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { breadcrumbJsonLd } from "@/features/seo/structured-data";

type Crumb = { label: string; href?: string };

type Props = {
  title: ReactNode;
  /** One line under the title: the agency, or what the page lists. */
  subtitle?: ReactNode;
  /** "Back to" link, shown above the title. */
  back?: { href: string; label: string };
  /** Trail for search engines (BreadcrumbList), with the current page last. */
  breadcrumbs?: { items: Crumb[]; path: string };
  /** Extra room at the bottom for a strip that overlaps the band (at a glance). */
  overlap?: boolean;
  children?: ReactNode;
};

/** The teal band at the top of every page, under the app bar. */
export function PageHeader({
  title,
  subtitle,
  back,
  breadcrumbs,
  overlap = false,
  children,
}: Props) {
  return (
    <div className="bg-brand text-on-brand print:bg-transparent print:text-ink">
      {breadcrumbs && (
        <JsonLd data={breadcrumbJsonLd(breadcrumbs.items, breadcrumbs.path)} />
      )}
      <div
        className={`mx-auto max-w-page px-4 pt-2 ${overlap ? "pb-12" : "pb-8"} print:p-0`}
      >
        {back && (
          <Link
            href={back.href}
            className="inline-flex min-h-11 items-center gap-2 font-bold text-on-brand no-underline hover:underline print:hidden"
          >
            <Icon icon={ArrowLeft} />
            {back.label}
          </Link>
        )}
        <div className="max-w-3xl">
          <h1 className="mt-2 sign text-2xl">{title}</h1>
          {subtitle && <p className="mt-2 text-lg">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
