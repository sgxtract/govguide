import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Icon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { Notice } from "@/components/ui/notice";
import { VerifyText } from "@/components/ui/verify-text";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/config/site-url";
import { agencyDisplayName } from "@/features/agencies/agency-level";
import { CitySwitch } from "@/features/cities/city-switch";
import {
  ReportOutdated,
  SuggestService,
} from "@/features/feedback/report-actions";
import { OfficeCard } from "@/features/offices/office-card";
import { pageMetadata } from "@/features/seo/page-metadata";
import { serviceJsonLd } from "@/features/seo/structured-data";
import { AtAGlance } from "@/features/services/at-a-glance";
import {
  GuideSection,
  GuideSections,
} from "@/features/services/guide-sections";
import { isDueForReverification } from "@/lib/content/freshness";
import {
  getCategory,
  getGuide,
  listAgencies,
  listCities,
  listHolidays,
  listServices,
  type CityGuide,
  type Guide,
  type ServiceListing,
} from "@/lib/content/repository";
import { VERIFY, type GuideBody, type Holiday } from "@/lib/content/schemas";
import { formatDate } from "@/lib/utils/format";

export async function generateStaticParams() {
  const services = await listServices();
  return services.map((service) => ({ slug: service.slug }));
}

export const dynamicParams = false;

type Params = PageProps<"/services/[slug]">["params"];

async function load(params: Params) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return undefined;
  const { service } = guide;
  // A national guide needs its agency; a city-run one has one per city.
  if (service.scope === "national" && !guide.agency) return undefined;

  const [category, holidays, cities, agencies, listings] = await Promise.all([
    getCategory(service.category),
    listHolidays(),
    listCities(),
    listAgencies(),
    listServices(),
  ]);
  if (!category) return undefined;

  return {
    guide,
    category,
    holidays,
    cityNames: Object.fromEntries(cities.map((c) => [c.slug, c.name])),
    agencyBySlug: new Map(agencies.map((a) => [a.slug, a])),
    related: service.related.flatMap((r) =>
      listings.filter((l) => l.slug === r),
    ),
  };
}

/** A guide is a draft until it (or, if city-run, one city's version) is published. */
function isDraftGuide(guide: Guide) {
  return guide.service.scope === "national"
    ? guide.service.status === "draft"
    : !guide.cities.some((c) => c.local?.status === "published");
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { service } = data.guide;
  return {
    ...pageMetadata({
      title: service.title,
      description: service.summary,
      path: `/services/${service.slug}`,
    }),
    // Drafts are only built in dev or previews; never let them be indexed.
    ...(isDraftGuide(data.guide) && { robots: { index: false } }),
  };
}

export default async function ServicePage({
  params,
}: PageProps<"/services/[slug]">) {
  const data = await load(params);
  if (!data) notFound();
  const { guide, category, holidays, cityNames, agencyBySlug, related } = data;
  const { service, cities } = guide;

  const path = `/services/${service.slug}`;
  const categoryPath = `/categories/${category.slug}`;
  const relatedSection = <RelatedGuides related={related} />;

  return (
    <article>
      {/* Paper has no header or footer, so the print copy says what it is. */}
      <p className="mx-4 mb-4 hidden border-b-2 border-ink pb-2 text-sm print:block">
        {siteConfig.name}: an independent guide, not an official government
        website. Online version: {absoluteUrl(path)}
      </p>

      <PageHeader
        title={service.title}
        subtitle={
          guide.agency
            ? agencyDisplayName(guide.agency)
            : "Run by your city or municipality"
        }
        back={{ href: categoryPath, label: category.name }}
        breadcrumbs={{
          path,
          items: [
            { label: "Home", href: "/" },
            { label: category.name, href: categoryPath },
            { label: service.title },
          ],
        }}
        overlap={service.scope === "national"}
      />

      <div className="mx-auto max-w-page px-4">
        <div className="max-w-3xl">
          {service.scope === "national" && guide.agency ? (
            <>
              {service.status === "published" && (
                <JsonLd
                  data={serviceJsonLd({
                    title: service.title,
                    summary: service.summary,
                    body: service,
                    agency: guide.agency,
                    category,
                    channels: cities.flatMap((c) =>
                      c.offices.map((office) => ({ office, city: c.city })),
                    ),
                    path,
                  })}
                />
              )}
              <AtAGlance body={service} />
              <GuideNotices
                draft={service.status === "draft"}
                lastVerified={service.lastVerified}
              />
              <p className="mt-5 text-lg">
                <VerifyText text={service.summary} />
              </p>
              <GuideSections
                body={service}
                idPrefix=""
                checklistKey={path}
                where={
                  cities.length > 0 ? (
                    <CitySwitch
                      cityNames={cityNames}
                      blocks={cities.map((c) => ({
                        slug: c.city.slug,
                        name: c.city.name,
                        content: (
                          <WhereToGo cityGuide={c} holidays={holidays} />
                        ),
                      }))}
                    />
                  ) : (
                    <NoOfficeYet />
                  )
                }
                related={relatedSection}
                report={<ReportOutdated subject={service.title} path={path} />}
              />
            </>
          ) : (
            <>
              <p className="mt-5 text-lg">
                <VerifyText text={service.summary} />
              </p>
              <p className="mt-2 text-muted">
                Each city sets its own requirements and fees for this, so the
                guide below is for the city you choose.
              </p>
              <div className="mt-5">
                {cities.length > 0 ? (
                  <CitySwitch
                    cityNames={cityNames}
                    blocks={cities.flatMap((c) => {
                      const local = c.local;
                      const agency = local && agencyBySlug.get(local.agency);
                      if (!local || !agency) return [];
                      return [
                        {
                          slug: c.city.slug,
                          name: c.city.name,
                          content: (
                            <>
                              {local.status === "published" && (
                                <JsonLd
                                  data={serviceJsonLd({
                                    title: service.title,
                                    summary: service.summary,
                                    body: local,
                                    agency,
                                    category,
                                    area: c.city,
                                    channels: c.offices.map((office) => ({
                                      office,
                                      city: c.city,
                                    })),
                                    path,
                                  })}
                                />
                              )}
                              <p className="mb-3 text-muted">
                                {agencyDisplayName(agency)}
                              </p>
                              <AtAGlance body={local} overlap={false} />
                              <GuideNotices
                                draft={local.status === "draft"}
                                lastVerified={local.lastVerified}
                              />
                              <GuideSections
                                body={local}
                                idPrefix={`${c.city.slug}-`}
                                checklistKey={`${path}#${c.city.slug}`}
                                where={
                                  c.offices.length > 0 ? (
                                    <OfficeCards
                                      offices={c.offices}
                                      holidays={holidays}
                                    />
                                  ) : undefined
                                }
                                report={
                                  <ReportOutdated
                                    subject={`${service.title} (${c.city.name})`}
                                    path={path}
                                  />
                                }
                              />
                            </>
                          ),
                        },
                      ];
                    })}
                  />
                ) : (
                  <NotInAnyCity />
                )}
              </div>
              <div className="mt-12">{relatedSection}</div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function GuideNotices({
  draft,
  lastVerified,
}: Pick<GuideBody, "lastVerified"> & { draft: boolean }) {
  const stale = !draft && isDueForReverification(lastVerified);
  if (!draft && !stale) return null;
  return (
    <div className="mt-5 grid grid-cols-1 gap-3">
      {draft && (
        <Notice kind="draft" title="Draft, not published">
          <p>
            Highlighted <VerifyText text={VERIFY} /> values still need checking
            against an official source.
          </p>
        </Notice>
      )}
      {stale && (
        <Notice kind="warning" title="This guide may be out of date">
          <p>
            Last checked{" "}
            <time dateTime={lastVerified}>{formatDate(lastVerified)}</time>.
            Confirm with the office before you go.
          </p>
        </Notice>
      )}
    </div>
  );
}

/** A national guide's part for one city: its offices and local tips. */
function WhereToGo({
  cityGuide,
  holidays,
}: {
  cityGuide: CityGuide;
  holidays: Holiday[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {cityGuide.offices.length > 0 && (
        <OfficeCards offices={cityGuide.offices} holidays={holidays} />
      )}
      {cityGuide.tips.length > 0 && (
        <Notice kind="info" title={`Good to know in ${cityGuide.city.name}`}>
          <ul role="list" className="list-disc space-y-1 pl-5">
            {cityGuide.tips.map((tip) => (
              <li key={tip}>
                <VerifyText text={tip} />
              </li>
            ))}
          </ul>
        </Notice>
      )}
    </div>
  );
}

function OfficeCards({
  offices,
  holidays,
}: {
  offices: CityGuide["offices"];
  holidays: Holiday[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {offices.map((office) => (
        <OfficeCard
          key={`${office.city}-${office.slug}`}
          office={office}
          holidays={holidays}
        />
      ))}
    </div>
  );
}

/** A national guide applies everywhere, even before any office is added. */
function NoOfficeYet() {
  return (
    <div className="rounded-card bg-surface p-5">
      <p className="max-w-prose">
        We haven&apos;t added an office for this guide yet. The requirements and
        steps above are the same everywhere. Tell us which city you need.
      </p>
      <SuggestService />
    </div>
  );
}

function NotInAnyCity() {
  return (
    <div className="rounded-card bg-surface p-5">
      <h2 className="text-lg font-extrabold">Not available in any city yet</h2>
      <p className="mt-1 max-w-prose">
        We haven&apos;t added an office for this guide yet. Tell us which city
        you need.
      </p>
      <SuggestService />
    </div>
  );
}

function RelatedGuides({ related }: { related: ServiceListing[] }) {
  if (related.length === 0) return null;
  return (
    <GuideSection id="related" title="Related guides" noPrint>
      <ul role="list" className="rounded-card bg-surface">
        {related.map((r) => (
          <li
            key={r.slug}
            className="tap-area flex min-h-14 items-center gap-3 border-b border-line px-4 py-3 first:rounded-t-card last:rounded-b-card last:border-0 hover:bg-brand-tint/40"
          >
            <Link
              href={`/services/${r.slug}`}
              className="stretched flex-1 font-bold text-ink no-underline"
            >
              {r.title}
            </Link>
            <Icon icon={ChevronRight} className="shrink-0 text-muted" />
          </li>
        ))}
      </ul>
    </GuideSection>
  );
}
