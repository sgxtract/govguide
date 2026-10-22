import { ChevronRight } from "lucide-react";

import { Icon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { VerifyText } from "@/components/ui/verify-text";
import type { Holiday, Office } from "@/lib/content/schemas";

import { OpenStatusLabel } from "./open-status-label";

/** Offices as rows with today's status; each opens the agency's page. */
export function OfficeRows({
  offices,
  holidays,
}: {
  offices: Office[];
  holidays: Holiday[];
}) {
  return (
    <ul role="list" className="rounded-card bg-surface">
      {offices.map((office) => (
        <li
          key={`${office.city}-${office.slug}`}
          className="tap-area flex min-h-16 items-center gap-3 border-b border-line px-4 py-3 first:rounded-t-card last:rounded-b-card last:border-0 hover:bg-brand-tint/40"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/agencies/${office.agency}#${office.city}-${office.slug}`}
              className="stretched leading-snug font-bold text-ink no-underline"
            >
              <VerifyText text={office.name} />
            </Link>
            <div>
              <OpenStatusLabel
                hours={office.hours}
                holidays={holidays}
                variant="compact"
              />
            </div>
          </div>
          <Icon icon={ChevronRight} className="shrink-0 text-muted" />
        </li>
      ))}
    </ul>
  );
}
