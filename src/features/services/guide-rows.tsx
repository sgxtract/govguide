import { ChevronRight } from "lucide-react";

import { Icon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { VerifyText } from "@/components/ui/verify-text";
import type { Service } from "@/lib/content/schemas";

type Props = {
  services: Service[];
  /** Agency slug → display name, from getAgencyNames(). */
  agencyNames: Record<string, string>;
  /** Show the one-sentence summary under each title (lists, not home). */
  withSummary?: boolean;
};

/** Guides as rows. The whole row is the tap target; the title stays short. */
export function GuideRows({
  services,
  agencyNames,
  withSummary = false,
}: Props) {
  return (
    <ul role="list" className="rounded-card bg-surface">
      {services.map((service) => (
        <li
          key={service.slug}
          className="tap-area flex min-h-16 items-center gap-3 border-b border-line px-4 py-3 first:rounded-t-card last:rounded-b-card last:border-0 hover:bg-brand-tint/40"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/${service.city}/services/${service.slug}`}
              className="stretched leading-snug font-bold text-ink no-underline"
            >
              {service.title}
            </Link>
            <p className="text-sm text-muted">
              {agencyNames[service.agency] ?? service.agency}
            </p>
            {withSummary && (
              <p className="mt-1 text-sm">
                <VerifyText text={service.summary} />
              </p>
            )}
          </div>
          <Icon icon={ChevronRight} className="shrink-0 text-muted" />
        </li>
      ))}
    </ul>
  );
}
