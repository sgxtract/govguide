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
  getCity,
  listCityAgencies,
  listHolidays,
  listOffices,
  listServices,
} from "@/lib/content/repository";
import { VERIFY } from "@/lib/content/schemas";

// The parent [city] layout supplies `city`; only agencies active there get a page.
export async function generateStaticParams({
  params,
}: {
  params: { city: string };
}) {
  const agencies = await listCityAgencies(params.city);
  return agencies.map((agency) => ({ slug: agency.slug }));
}

export const dynamicParams = false;

type Params = PageProps<"/[city]/agencies/[slug]">["params"];

async function load(params: Params) {
  const { city: citySlug, slug } = await params;
  const [city, agency] = await Promise.all([
    getCity(citySlug),
    getAgency(slug),
  ]);
  return city && agency ? { city, agency } : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/[city]/agencies/[slug]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  return pageMetadata({
    title: `${agencyDisplayName(data.agency)} in ${data.city.name}`,
    description: data.agency.description,
    path: `/${data.city.slug}/agencies/${data.agency.slug}`,
  });
}

export default async function AgencyPage({
  params,
}: PageProps<"/[city]/agencies/[slug]">) {
  const data = await load(params);
  if (!data) notFound();
  const { city, agency } = data;

  const [offices, services, holidays, agencyNames] = await Promise.all([
    listOffices(city.slug, { agency: agency.slug }),
    listServices(city.slug, { agency: agency.slug }),
    listHolidays(),
    getAgencyNames(),
  ]);
  const path = `/${city.slug}/agencies/${agency.slug}`;
  const hasChannels =
    agency.website || agency.portals.length > 0 || agency.hotline;

  return (
    <>
      <PageHeader
        title={agencyDisplayName(agency)}
        subtitle={agencyLevelLabel(agency.level)}
        back={{ href: `/${city.slug}/agencies`, label: "All offices" }}
        breadcrumbs={{
          path,
          items: [
            { label: city.name, href: `/${city.slug}` },
            { label: "Offices", href: `/${city.slug}/agencies` },
            { label: agency.acronym ?? agency.name },
          ],
        }}
      />

      <div className="mx-auto max-w-page px-4 pt-6">
        <div className="grid max-w-3xl grid-cols-1 gap-10">
          <p className="text-lg">{agency.description}</p>

          <section aria-labelledby="offices-heading">
            <SectionHeading id="offices-heading">
              Offices in {city.name}
            </SectionHeading>
            {offices.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {offices.map((office) => (
                  <OfficeCard
                    key={office.slug}
                    office={office}
                    holidays={holidays}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-card bg-surface px-4 py-3">
                No local office listed. Use the official channels below.
              </p>
            )}
          </section>

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
                <SuggestService city={city.name} />
              </div>
            )}
          </section>

          <section
            aria-label="Report a change"
            className="border-t-2 border-ink pt-5"
          >
            <ReportOutdated
              subject={`${agencyDisplayName(agency)} in ${city.name}`}
              path={path}
            />
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
