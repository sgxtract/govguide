import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { VerifyText } from "@/components/ui/verify-text";
import { newIssueUrl } from "@/config/site";
import {
  agencyDisplayName,
  agencyLevelLabel,
} from "@/features/agencies/agency-level";
import { OfficeDetails } from "@/features/offices/office-details";
import { getAgencyNames } from "@/features/services/agency-names";
import { ServiceList } from "@/features/services/service-list";
import {
  getAgency,
  getCity,
  listCityAgencies,
  listOffices,
  listServices,
} from "@/lib/content/repository";
import { VERIFY } from "@/lib/content/schemas";
import Link from "next/dist/client/link";
import { pageMetadata } from "@/features/seo/page-metadata";

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

  const [offices, services, agencyNames] = await Promise.all([
    listOffices(city.slug, { agency: agency.slug }),
    listServices(city.slug, { agency: agency.slug }),
    getAgencyNames(),
  ]);

  return (
    <div className="mx-auto max-w-page px-4 py-10">
      <Breadcrumbs
        items={[
          { label: city.name, href: `/${city.slug}` },
          { label: "Offices", href: `/${city.slug}/agencies` },
          { label: agency.acronym ?? agency.name },
        ]}
      />

      <div className="max-w-3xl">
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          <p className="mt-2">
            <Link href={`/${city.slug}/agencies/${agency.slug}`}>
              {agencyDisplayName(agency)}
            </Link>
          </p>
        </h1>
        <p className="mt-1 text-muted">{agencyLevelLabel(agency.level)}</p>
        <p className="mt-3 text-lg">{agency.description}</p>

        {(agency.website || agency.portals.length > 0 || agency.hotline) && (
          <section aria-labelledby="contact-heading" className="mt-8">
            <h2 id="contact-heading" className="mb-3 text-xl font-bold">
              Official channels
            </h2>
            <ul role="list" className="border-t-2 border-ink">
              {agency.website && (
                <li className="border-b border-rule py-3">
                  <span className="text-sm text-muted">Website: </span>
                  {agency.website === VERIFY ? (
                    <VerifyText text={VERIFY} />
                  ) : (
                    <a href={agency.website}>{agency.website}</a>
                  )}
                </li>
              )}
              {agency.portals.map((portal) => (
                <li key={portal.label} className="border-b border-rule py-3">
                  <span className="text-sm text-muted">Online: </span>
                  {portal.url === VERIFY ? (
                    <span>
                      {portal.label} <VerifyText text={VERIFY} />
                    </span>
                  ) : (
                    <a href={portal.url}>{portal.label}</a>
                  )}
                </li>
              ))}
              {agency.hotline && (
                <li className="border-b border-rule py-3">
                  <span className="text-sm text-muted">Hotline: </span>
                  {agency.hotline.includes(VERIFY) ? (
                    <VerifyText text={agency.hotline} />
                  ) : (
                    <a href={`tel:${agency.hotline.replace(/[^\d+]/g, "")}`}>
                      {agency.hotline}
                    </a>
                  )}
                </li>
              )}
            </ul>
          </section>
        )}

        <section aria-labelledby="offices-heading" className="mt-10">
          <h2 id="offices-heading" className="mb-3 text-xl font-bold">
            Offices in {city.name}
          </h2>
          {offices.length > 0 ? (
            <div className="space-y-8">
              {offices.map((office) => (
                // id lets guides link straight to one office: /agencies/lto#lto-sorsogon-district-office
                <div key={office.slug} id={office.slug} className="scroll-mt-4">
                  <OfficeDetails office={office} />
                </div>
              ))}
            </div>
          ) : (
            <p className="border-t-2 border-ink pt-4">
              No local office listed. Check the official channels above.
            </p>
          )}
        </section>

        <section aria-labelledby="guides-heading" className="mt-10">
          <h2 id="guides-heading" className="mb-3 text-xl font-bold">
            Guides for this agency
          </h2>
          {services.length > 0 ? (
            <ServiceList services={services} agencyNames={agencyNames} />
          ) : (
            <div className="border-t-2 border-ink pt-4">
              <p>No guides for this agency yet.</p>
              <p className="mt-2">
                <a href={newIssueUrl}>Suggest a service to cover</a>
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
