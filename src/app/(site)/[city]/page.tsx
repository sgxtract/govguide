import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Link } from "@/components/ui/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SuggestService } from "@/features/feedback/report-actions";
import { OfficeRows } from "@/features/offices/office-rows";
import { pageMetadata } from "@/features/seo/page-metadata";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import { getCityHub, listCities, listHolidays } from "@/lib/content/repository";

// One hub per city folder in /content/cities.
export async function generateStaticParams() {
  const cities = await listCities();
  return cities.map((city) => ({ city: city.slug }));
}

// Any city not in /content is a 404, never rendered on demand.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[city]">): Promise<Metadata> {
  const hub = await getCityHub((await params).city);
  if (!hub) return {};
  return pageMetadata({
    title: `Government offices in ${hub.city.name}`,
    description: hub.city.description,
    path: `/${hub.city.slug}`,
  });
}

/** A city's own page: its hotlines, its offices, and the guides it runs. */
export default async function CityHubPage({ params }: PageProps<"/[city]">) {
  const hub = await getCityHub((await params).city);
  if (!hub) notFound();
  const { city, offices, localGuides } = hub;

  const [holidays, agencyNames] = await Promise.all([
    listHolidays(),
    getAgencyNames(),
  ]);
  const path = `/${city.slug}`;

  return (
    <>
      <PageHeader
        title={city.name}
        subtitle={`Province of ${city.province}`}
        back={{ href: "/", label: "Home" }}
        breadcrumbs={{
          path,
          items: [{ label: "Home", href: "/" }, { label: city.name }],
        }}
      />

      <div className="mx-auto max-w-page px-4 pt-6">
        <div className="grid max-w-3xl grid-cols-1 gap-10">
          <p className="max-w-prose text-lg">{city.description}</p>

          {city.hotlines.length > 0 && (
            <section aria-labelledby="hotlines-heading">
              <SectionHeading id="hotlines-heading">Hotlines</SectionHeading>
              <ul role="list" className="rounded-card bg-surface">
                {city.hotlines.map((h) => (
                  <li
                    key={h.label}
                    className="flex flex-wrap justify-between gap-x-4 border-b border-line px-4 py-3 last:border-0"
                  >
                    <span>{h.label}</span>
                    <a
                      href={`tel:${h.number.replace(/[^\d+]/g, "")}`}
                      className="font-bold tabular-nums"
                    >
                      {h.number}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="offices-heading">
            <SectionHeading id="offices-heading">Offices</SectionHeading>
            {offices.length > 0 ? (
              <>
                <OfficeRows offices={offices} holidays={holidays} />
                <p className="mt-2 text-sm text-muted">
                  Open or closed is worked out from each office&apos;s posted
                  hours, in Philippine time.
                </p>
              </>
            ) : (
              <p className="rounded-card bg-surface px-4 py-3">
                Office details are being checked against official sources. They
                will appear here once confirmed.
              </p>
            )}
          </section>

          {localGuides.length > 0 && (
            <section aria-labelledby="local-heading">
              <SectionHeading id="local-heading">
                Run by the city
              </SectionHeading>
              <p className="-mt-2 mb-3 max-w-prose text-muted">
                These differ from city to city. The guides below are for{" "}
                {city.name}.
              </p>
              <GuideRows
                services={localGuides}
                agencyNames={agencyNames}
                withSummary
              />
            </section>
          )}

          <section
            aria-labelledby="more-heading"
            className="rounded-card bg-surface p-5"
          >
            <h2 id="more-heading" className="text-lg font-extrabold">
              Looking for something else?
            </h2>
            <p className="mt-1 max-w-prose">
              National guides (licenses, IDs, clearances) work the same in{" "}
              {city.name}. <Link href="/services">See all guides</Link>, or tell
              us which one we should add.
            </p>
            <SuggestService city={city.name} />
          </section>
        </div>
      </div>
    </>
  );
}
