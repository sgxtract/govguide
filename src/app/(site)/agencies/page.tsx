import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  agencyDisplayName,
  agencyLevelLabel,
} from "@/features/agencies/agency-level";
import { OfficeRows } from "@/features/offices/office-rows";
import { pageMetadata } from "@/features/seo/page-metadata";
import { Link } from "@/components/ui/link";
import {
  listHolidays,
  listOffices,
  listVisibleAgencies,
} from "@/lib/content/repository";

export const metadata: Metadata = pageMetadata({
  title: "Government offices",
  description:
    "Addresses, office hours and contact details of government offices, by agency.",
  path: "/agencies",
});

/** Every agency with a guide or an office, and its offices. */
export default async function OfficesPage() {
  const [agencies, offices, holidays] = await Promise.all([
    listVisibleAgencies(),
    listOffices(),
    listHolidays(),
  ]);

  return (
    <>
      <PageHeader
        title="Offices and hours"
        subtitle="By agency, with each office's hours"
        back={{ href: "/", label: "Home" }}
        breadcrumbs={{
          path: "/agencies",
          items: [{ label: "Home", href: "/" }, { label: "Offices" }],
        }}
      />

      <div className="mx-auto max-w-page px-4 pt-6">
        <div className="grid max-w-3xl grid-cols-1 gap-10">
          {agencies.length === 0 && (
            <p className="rounded-card bg-surface p-5">
              Office details are being checked against official sources. They
              will appear here once confirmed.
            </p>
          )}
          {agencies.map((agency) => {
            const own = offices.filter((o) => o.agency === agency.slug);
            return (
              <section
                key={agency.slug}
                aria-labelledby={`${agency.slug}-heading`}
              >
                <SectionHeading
                  id={`${agency.slug}-heading`}
                  more={{
                    href: `/agencies/${agency.slug}`,
                    label: "Details and guides",
                  }}
                >
                  {agencyDisplayName(agency)}
                </SectionHeading>
                <p className="-mt-2 mb-3 text-sm text-muted">
                  {agencyLevelLabel(agency.level)}
                </p>
                {own.length > 0 ? (
                  <OfficeRows offices={own} holidays={holidays} />
                ) : (
                  <p className="rounded-card bg-surface px-4 py-3">
                    No local office listed.{" "}
                    <Link href={`/agencies/${agency.slug}`}>
                      See how to reach them
                    </Link>
                    .
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
