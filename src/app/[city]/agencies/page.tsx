import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
  getCity,
  listCityAgencies,
  listHolidays,
  listOffices,
} from "@/lib/content/repository";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/agencies">): Promise<Metadata> {
  const city = await getCity((await params).city);
  if (!city) return {};
  return pageMetadata({
    title: `Government offices in ${city.name}`,
    description: `Addresses, office hours and contact details of government offices in ${city.name}.`,
    path: `/${city.slug}/agencies`,
  });
}

/** Every agency with something in this city, and its local offices. */
export default async function OfficesPage({
  params,
}: PageProps<"/[city]/agencies">) {
  const city = await getCity((await params).city);
  if (!city) notFound();

  const [agencies, offices, holidays] = await Promise.all([
    listCityAgencies(city.slug),
    listOffices(city.slug),
    listHolidays(),
  ]);

  return (
    <>
      <PageHeader
        title="Offices and hours"
        subtitle={`Government offices serving ${city.name}`}
        back={{ href: `/${city.slug}`, label: city.name }}
        breadcrumbs={{
          path: `/${city.slug}/agencies`,
          items: [
            { label: city.name, href: `/${city.slug}` },
            { label: "Offices" },
          ],
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
                    href: `/${city.slug}/agencies/${agency.slug}`,
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
                    <Link href={`/${city.slug}/agencies/${agency.slug}`}>
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
