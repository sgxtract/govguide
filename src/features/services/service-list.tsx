import { Link } from "@/components/ui/link";

import type { Service } from "@/lib/content/schemas";

type Props = {
  services: Service[];
  /** Agency slug → display name, e.g. "lto" → "LTO". */
  agencyNames: Record<string, string>;
};

/** Guides as ruled rows: task title, one-line summary, which agency. */
export function ServiceList({ services, agencyNames }: Props) {
  return (
    <ul role="list" className="border-t-2 border-ink">
      {services.map((service) => (
        <li
          key={service.slug}
          className="relative border-b border-rule py-4 hover:bg-surface"
        >
          <div className="flex items-baseline justify-between gap-4">
            <Link
              href={`/${service.city}/services/${service.slug}`}
              className="text-lg font-bold text-ink no-underline after:absolute after:inset-0 hover:underline"
            >
              {service.title}
            </Link>
            {service.status === "draft" && (
              // Drafts only appear in dev (or with SHOW_DRAFTS), so this is a note to editors.
              <span className="shrink-0 rounded-sm bg-notice px-2 text-sm font-bold">
                Draft
              </span>
            )}
          </div>
          <p className="mt-1 text-muted">{service.summary}</p>
          <p className="mt-1 text-sm text-muted">
            {agencyNames[service.agency] ?? service.agency}
          </p>
        </li>
      ))}
    </ul>
  );
}
