import { ChevronRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Icon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { Notice } from "@/components/ui/notice";
import { VerifyText } from "@/components/ui/verify-text";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/config/site-url";
import { agencyDisplayName } from "@/features/agencies/agency-level";
import { ReportOutdated } from "@/features/feedback/report-actions";
import { OfficeCard } from "@/features/offices/office-card";
import { pageMetadata } from "@/features/seo/page-metadata";
import { serviceJsonLd } from "@/features/seo/structured-data";
import { AtAGlance } from "@/features/services/at-a-glance";
import { FeeTable } from "@/features/services/fee-table";
import { PrintButton } from "@/features/services/print-button";
import { RequirementChecklist } from "@/features/services/requirement-checklist";
import { SectionTabs } from "@/features/services/section-tabs";
import { SourceList } from "@/features/services/source-list";
import { StepRoute } from "@/features/services/step-route";
import { isDueForReverification } from "@/lib/content/freshness";
import {
  getAgency,
  getCategory,
  getCity,
  getOffice,
  getService,
  listHolidays,
  listServices,
} from "@/lib/content/repository";
import { VERIFY } from "@/lib/content/schemas";
import { formatDate } from "@/lib/utils/format";

// The parent [city] layout supplies `city`; we add every visible guide in it.
export async function generateStaticParams({
  params,
}: {
  params: { city: string };
}) {
  const services = await listServices(params.city);
  return services.map((service) => ({ slug: service.slug }));
}

export const dynamicParams = false;

type Params = PageProps<"/[city]/services/[slug]">["params"];

async function load(params: Params) {
  const { city: citySlug, slug } = await params;
  const [city, service] = await Promise.all([
    getCity(citySlug),
    getService(citySlug, slug),
  ]);
  if (!city || !service) return undefined;

  const [agency, category, offices, related, holidays] = await Promise.all([
    getAgency(service.agency),
    getCategory(service.category),
    Promise.all(service.offices.map((o) => getOffice(city.slug, o))),
    Promise.all(service.related.map((r) => getService(city.slug, r))),
    listHolidays(),
  ]);
  if (!agency || !category) return undefined;

  return {
    city,
    service,
    agency,
    category,
    holidays,
    // Drop references that aren't visible (e.g. a related draft in production).
    offices: offices.filter((o) => o !== undefined),
    related: related.filter((r) => r !== undefined),
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/[city]/services/[slug]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { city, service } = data;
  return {
    ...pageMetadata({
      title: `${service.title} in ${city.name}`,
      description: service.summary,
      path: `/${city.slug}/services/${service.slug}`,
    }),
    // Drafts are only built in dev or previews; never let them be indexed.
    ...(service.status === "draft" && { robots: { index: false } }),
  };
}

export default async function ServicePage({
  params,
}: PageProps<"/[city]/services/[slug]">) {
  const data = await load(params);
  if (!data) notFound();
  const { city, service, agency, category, offices, related, holidays } = data;

  const path = `/${city.slug}/services/${service.slug}`;
  const isDraft = service.status === "draft";
  const isStale = !isDraft && isDueForReverification(service.lastVerified);

  // Tabs only for sections this guide has, in reading order.
  const sections = [
    { id: "bring", label: "What to bring" },
    { id: "route", label: "Your route" },
    service.fees.length > 0 && { id: "fees", label: "Fees" },
    offices.length > 0 && { id: "where", label: "Where to go" },
    service.online.length > 0 && { id: "online", label: "Online" },
    service.faqs.length > 0 && { id: "questions", label: "Questions" },
    { id: "sources", label: "Sources" },
  ].filter((s) => s !== false);

  return (
    <article>
      {!isDraft && (
        <JsonLd
          data={serviceJsonLd({
            service,
            agency,
            category,
            city,
            offices,
            path,
          })}
        />
      )}

      {/* Paper has no header or footer, so the print copy says what it is. */}
      <p className="mx-4 mb-4 hidden border-b-2 border-ink pb-2 text-sm print:block">
        {siteConfig.name}: an independent guide, not an official government
        website. Online version: {absoluteUrl(path)}
      </p>

      <PageHeader
        title={service.title}
        subtitle={agencyDisplayName(agency)}
        back={{
          href: `/${city.slug}/categories/${category.slug}`,
          label: category.name,
        }}
        breadcrumbs={{
          path,
          items: [
            { label: city.name, href: `/${city.slug}` },
            {
              label: category.name,
              href: `/${city.slug}/categories/${category.slug}`,
            },
            { label: service.title },
          ],
        }}
        overlap
      />

      <div className="mx-auto max-w-page px-4">
        <div className="max-w-3xl">
          <AtAGlance service={service} />

          <div className="mt-5 grid grid-cols-1 gap-3">
            {isDraft && (
              <Notice kind="draft" title="Draft, not published">
                <p>
                  Highlighted <VerifyText text={VERIFY} /> values still need
                  checking against an official source.
                </p>
              </Notice>
            )}
            {isStale && (
              <Notice kind="warning" title="This guide may be out of date">
                <p>
                  Last checked{" "}
                  <time dateTime={service.lastVerified}>
                    {formatDate(service.lastVerified)}
                  </time>
                  . Confirm with the office before you go.
                </p>
              </Notice>
            )}
          </div>

          <p className="mt-5 text-lg">
            <VerifyText text={service.summary} />
          </p>

          <div className="mt-4">
            <SectionTabs sections={sections} />
          </div>

          <div className="grid grid-cols-1 gap-12 pt-4">
            {service.whoCanApply.length > 0 && (
              <GuideSection id="who" title="Who can apply">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  {service.whoCanApply.map((item) => (
                    <li key={item}>
                      <VerifyText text={item} />
                    </li>
                  ))}
                </ul>
              </GuideSection>
            )}

            <GuideSection id="bring" title="What to bring">
              <RequirementChecklist
                guide={path}
                requirements={service.requirements}
                labelledBy="bring-heading"
              />
              <div className="mt-4">
                <PrintButton />
              </div>
            </GuideSection>

            <GuideSection id="route" title="Your route">
              <StepRoute steps={service.steps} />
            </GuideSection>

            {service.fees.length > 0 && (
              <GuideSection id="fees" title="Fees">
                <FeeTable fees={service.fees} />
              </GuideSection>
            )}

            {offices.length > 0 && (
              <GuideSection id="where" title="Where to go">
                <div className="grid grid-cols-1 gap-4">
                  {offices.map((office) => (
                    <OfficeCard
                      key={office.slug}
                      office={office}
                      holidays={holidays}
                    />
                  ))}
                </div>
              </GuideSection>
            )}

            {service.online.length > 0 && (
              <GuideSection id="online" title="What you can do online">
                <ul role="list" className="print-urls rounded-card bg-surface">
                  {service.online.map((item) => (
                    <li
                      key={item.label}
                      className="border-b border-line px-4 py-3 last:border-0"
                    >
                      {item.url === VERIFY ? (
                        <span className="font-bold">
                          <VerifyText text={item.label} />{" "}
                          <VerifyText text={item.url} />
                        </span>
                      ) : (
                        <a
                          href={item.url}
                          className="inline-flex items-center gap-1.5 font-bold"
                        >
                          <VerifyText text={item.label} />
                          <Icon icon={ExternalLink} size={18} />
                        </a>
                      )}
                      <span className="ml-2 text-sm text-muted">
                        official site
                      </span>
                      <p className="mt-1">
                        <VerifyText text={item.whatYouCanDo} />
                      </p>
                    </li>
                  ))}
                </ul>
              </GuideSection>
            )}

            {service.tips.length > 0 && (
              <Notice kind="info" title="Good to know">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  {service.tips.map((tip) => (
                    <li key={tip}>
                      <VerifyText text={tip} />
                    </li>
                  ))}
                </ul>
              </Notice>
            )}

            {service.faqs.length > 0 && (
              <GuideSection id="questions" title="Common questions" noPrint>
                <div className="rounded-card bg-surface">
                  {service.faqs.map((faq) => (
                    // Native disclosure: works without JS, and Ctrl+F finds hidden answers.
                    <details
                      key={faq.question}
                      className="group border-b border-line last:border-0"
                    >
                      <summary className="flex min-h-14 list-none items-center justify-between gap-3 px-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
                        <span>
                          <VerifyText text={faq.question} />
                        </span>
                        <Icon
                          icon={ChevronRight}
                          className="shrink-0 text-muted transition-transform group-open:rotate-90"
                        />
                      </summary>
                      <p className="px-4 pb-4">
                        <VerifyText text={faq.answer} />
                      </p>
                    </details>
                  ))}
                </div>
              </GuideSection>
            )}

            {related.length > 0 && (
              <GuideSection id="related" title="Related guides" noPrint>
                <ul role="list" className="rounded-card bg-surface">
                  {related.map((r) => (
                    <li
                      key={r.slug}
                      className="tap-area flex min-h-14 items-center gap-3 border-b border-line px-4 py-3 first:rounded-t-card last:rounded-b-card last:border-0 hover:bg-brand-tint/40"
                    >
                      <Link
                        href={`/${city.slug}/services/${r.slug}`}
                        className="stretched flex-1 font-bold text-ink no-underline"
                      >
                        {r.title}
                      </Link>
                      <Icon
                        icon={ChevronRight}
                        className="shrink-0 text-muted"
                      />
                    </li>
                  ))}
                </ul>
              </GuideSection>
            )}

            <section
              id="sources"
              aria-labelledby="sources-heading"
              className="print-urls border-t-2 border-ink pt-5"
            >
              <h2 id="sources-heading" className="mb-3 text-xl font-extrabold">
                Sources
              </h2>
              <SourceList sources={service.sources} />
              <div className="mt-8">
                <ReportOutdated subject={service.title} path={path} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}

function GuideSection({
  id,
  title,
  noPrint = false,
  children,
}: {
  id: string;
  title: string;
  noPrint?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={noPrint ? "print:hidden" : undefined}
    >
      <h2 id={`${id}-heading`} className="mb-3 text-xl font-extrabold">
        {title}
      </h2>
      {children}
    </section>
  );
}
