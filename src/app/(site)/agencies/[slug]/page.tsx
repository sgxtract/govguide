import { ExternalLink, Globe, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { VerifyText } from "@/components/ui/verify-text";
import {
  agencyDisplayName,
  agencyLevelLabel,
} from "@/features/agencies/agency-level";
import {
  ReportOutdated,
  SuggestService,
} from "@/features/feedback/report-actions";
import { OfficeCard } from "@/features/offices/office-card";
import { pageMetadata } from "@/features/seo/page-metadata";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import {
  getAgency,
  listCities,
  listHolidays,
  listOffices,
  listServices,
  listVisibleAgencies,
} from "@/lib/content/repository";
import { VERIFY } from "@/lib/content/schemas";

// Only agencies with a visible guide or office get a page.
export async function generateStaticParams() {
  const agencies = await listVisibleAgencies();
  return agencies.map((agency) => ({ slug: agency.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/agencies/[slug]">): Promise<Metadata> {
  const agency = await getAgency((await params).slug);
  if (!agency) return {};
  return pageMetadata({
    title: agencyDisplayName(agency),
    description: agency.description,
    path: `/agencies/${agency.slug}`,
  });
}

export default async function AgencyPage({
  params,
}: PageProps<"/agencies/[slug]">) {
  const agency = await getAgency((await params).slug);
  if (!agency) notFound();

  const [offices, services, holidays, agencyNames, cities] = await Promise.all([
    listOffices({ agency: agency.slug }),
    listServices({ agency: agency.slug }),
    listHolidays(),
    getAgencyNames(),
    listCities(),
  ]);
  // Offices grouped by city, in city name order; cities without one are left out.
  const byCity = cities
    .map((city) => ({
      city,
      offices: offices.filter((o) => o.city === city.slug),
    }))
    .filter((group) => group.offices.length > 0);
  const path = `/agencies/${agency.slug}`;
  const hasChannels =
    agency.website || agency.portals.length > 0 || agency.hotline;

  return (
    <>
      <PageHeader
        title={agencyDisplayName(agency)}
        subtitle={agencyLevelLabel(agency.level)}
        back={{ href: "/agencies", label: "All offices" }}
        breadcrumbs={{
          path,
          items: [
            { label: "Home", href: "/" },
            { label: "Offices", href: "/agencies" },
            { label: agency.acronym ?? agency.name },
          ],
        }}
      />

      <div className="mx-auto max-w-page px-4 pt-6">
        <div className="grid max-w-3xl grid-cols-1 gap-10">
          <p className="text-lg">{agency.description}</p>

          {byCity.length > 0 ? (
            byCity.map(({ city, offices: cityOffices }) => (
              <section
                key={city.slug}
                aria-labelledby={`${city.slug}-offices-heading`}
              >
                <SectionHeading id={`${city.slug}-offices-heading`}>
                  Offices in {city.name}
                </SectionHeading>
                <div className="grid grid-cols-1 gap-4">
                  {cityOffices.map((office) => (
                    <OfficeCard
                      key={`${office.city}-${office.slug}`}
                      office={office}
                      holidays={holidays}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <section aria-labelledby="offices-heading">
              <SectionHeading id="offices-heading">Offices</SectionHeading>
              <p className="rounded-card bg-surface px-4 py-3">
                No local office listed. Use the official channels below.
              </p>
            </section>
          )}

          {hasChannels && (
            <section aria-labelledby="channels-heading" className="print-urls">
              <SectionHeading id="channels-heading">
                Official channels
              </SectionHeading>
              <ul role="list" className="rounded-card bg-surface">
                {agency.website && (
                  <Channel icon={Globe} label="Website">
                    {agency.website === VERIFY ? (
                      <VerifyText text={VERIFY} />
                    ) : (
                      <a href={agency.website}>{agency.website}</a>
                    )}
                  </Channel>
                )}
                {agency.portals.map((portal) => (
                  <Channel
                    key={portal.label}
                    icon={ExternalLink}
                    label="Online"
                  >
                    {portal.url === VERIFY ? (
                      <span>
                        <VerifyText text={portal.label} />{" "}
                        <VerifyText text={VERIFY} />
                      </span>
                    ) : (
                      <a href={portal.url}>
                        <VerifyText text={portal.label} />
                      </a>
                    )}
                  </Channel>
                ))}
                {agency.hotline && (
                  <Channel icon={Phone} label="Hotline">
                    {agency.hotline.includes(VERIFY) ? (
                      <VerifyText text={agency.hotline} />
                    ) : (
                      <a href={`tel:${agency.hotline.replace(/[^\d+]/g, "")}`}>
                        {agency.hotline}
                      </a>
                    )}
                  </Channel>
                )}
              </ul>
            </section>
          )}

          <section aria-labelledby="guides-heading">
            <SectionHeading id="guides-heading">
              Guides for this agency
            </SectionHeading>
            {services.length > 0 ? (
              <GuideRows services={services} agencyNames={agencyNames} />
            ) : (
              <div className="rounded-card bg-surface p-5">
                <p>No guides for this agency yet.</p>
                <SuggestService />
              </div>
            )}
          </section>

          <section
            aria-label="Report a change"
            className="border-t-2 border-ink pt-5"
          >
            <ReportOutdated subject={agencyDisplayName(agency)} path={path} />
          </section>
        </div>
      </div>
    </>
  );
}

function Channel({
  icon,
  label,
  children,
}: {
  icon: typeof Globe;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 border-b border-line px-4 py-3 last:border-0">
      <Icon icon={icon} className="mt-0.5 shrink-0 text-muted" />
      <div className="min-w-0 wrap-anywhere">
        <span className="block text-sm text-muted">{label}</span>
        {children}
      </div>
    </li>
  );
}
