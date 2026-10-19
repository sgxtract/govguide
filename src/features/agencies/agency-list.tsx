import Link from "next/link";

import { VerifyText } from "@/components/ui/verify-text";
import type { Agency, Office } from "@/lib/content/schemas";

import { agencyDisplayName, agencyLevelLabel } from "./agency-level";

type Props = {
  city: string;
  agencies: { agency: Agency; offices: Office[] }[];
};

/** Agencies in a city as ruled rows, each with its local office addresses. */
export function AgencyList({ city, agencies }: Props) {
  return (
    <ul role="list" className="border-t-2 border-ink">
      {agencies.map(({ agency, offices }) => (
        <li
          key={agency.slug}
          className="relative border-b border-rule py-4 hover:bg-surface"
        >
          <Link
            href={`/${city}/agencies/${agency.slug}`}
            className="text-lg font-bold text-ink no-underline after:absolute after:inset-0 hover:underline"
          >
            {agencyDisplayName(agency)}
          </Link>
          <p className="mt-1 text-sm text-muted">
            {agencyLevelLabel(agency.level)}
          </p>
          {offices.length > 0 && (
            <ul role="list" className="mt-2 space-y-1">
              {offices.map((office) => (
                <li key={office.slug}>
                  <span className="font-bold">{office.name}:</span>{" "}
                  <VerifyText text={office.address} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
