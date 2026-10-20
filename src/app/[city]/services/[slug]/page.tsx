import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { VerifyText } from "@/components/ui/verify-text";
import { reportIssueUrl, siteConfig } from "@/config/site";
import { OfficeDetails } from "@/features/offices/office-details";
import { FeeTable } from "@/features/services/fee-table";
import { RequirementList } from "@/features/services/requirement-list";
import { SourceList } from "@/features/services/source-list";
import { StepList } from "@/features/services/step-list";
import { isDueForReverification } from "@/lib/content/freshness";
import {
  getAgency,
  getCategory,
  getCity,
  getOffice,
  getService,
  listServices,
} from "@/lib/content/repository";
import { VERIFY } from "@/lib/content/schemas";
import { formatDate, formatPeso } from "@/lib/utils/format";
import { ChecklistMemory } from "@/features/services/checklist-memory";
import { PrintButton } from "@/features/services/print-button";
import { pageMetadata } from "@/features/seo/page-metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/config/site-url";
import { serviceJsonLd } from "@/features/seo/structured-data";

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

  const [agency, category, offices, related] = await Promise.all([
    getAgency(service.agency),
    getCategory(service.category),
    Promise.all(service.offices.map((o) => getOffice(city.slug, o))),
    Promise.all(service.related.map((r) => getService(city.slug, r))),
  ]);
  if (!agency || !category) return undefined;

  return {
    city,
    service,
    agency,
    category,
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
  const { city, service, agency, category, offices, related } = data;

  const path = `/${city.slug}/services/${service.slug}`;
  const isDraft = service.status === "draft";
  const isStale = !isDraft && isDueForReverification(service.lastVerified);
  const totalFee = service.fees.every((f) => typeof f.amount === "number")
    ? service.fees.reduce(
        (sum, f) => (typeof f.amount === "number" ? sum + f.amount : sum),
        0,
      )
    : undefined;

  // Only link to sections that exist on this guide.
  const sections = [
    { id: "requirements", label: "What to bring" },
    { id: "steps", label: "Steps" },
    service.fees.length > 0 && { id: "fees", label: "Fees" },
    offices.length > 0 && { id: "where", label: "Where to go" },
    service.online.length > 0 && { id: "online", label: "Online" },
    service.faqs.length > 0 && { id: "faqs", label: "Questions" },
    { id: "sources", label: "Sources" },
  ].filter((s) => s !== false);

  return (
    <article className="mx-auto max-w-page px-4 py-10">
      {/* Paper has no header or footer, so the print copy says what it is. */}
      <p className="mb-4 hidden border-b-2 border-ink pb-2 text-sm print:block">
        {siteConfig.name}: an independent guide, not an official government
        website. Online version: {absoluteUrl(path)}
      </p>
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
      <Breadcrumbs
        path={path}
        items={[
          { label: city.name, href: `/${city.slug}` },
          {
            label: category.name,
            href: `/${city.slug}/categories/${category.slug}`,
          },
          { label: service.title },
        ]}
      />

      <div className="max-w-3xl">
        {isDraft && (
          <p className="mt-6 rounded-md border-l-6 border-ink bg-notice px-4 py-3">
            <strong>Draft, not published.</strong> Highlighted {VERIFY} values
            still need checking against an official source.
          </p>
        )}

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          {service.title}
        </h1>
        <p className="mt-3 text-lg">
          <VerifyText text={service.summary} />
        </p>
        <p className="mt-2 text-muted">
          {agency.name}
          {agency.acronym && ` (${agency.acronym})`}
        </p>

        {isStale && (
          <p className="mt-4 rounded-md border-l-6 border-ink bg-notice px-4 py-3">
            This guide was last checked on{" "}
            <time dateTime={service.lastVerified}>
              {formatDate(service.lastVerified)}
            </time>
            . Things may have changed, so confirm with the office before you go.
          </p>
        )}

        {/* At a glance: the three things people ask first. */}
        <dl className="mt-6 grid border-t-2 border-ink sm:grid-cols-3">
          <div className="border-b border-rule py-3 sm:pr-4">
            <dt className="text-sm text-muted">Fees</dt>
            <dd className="font-bold tabular-nums">
              {totalFee !== undefined ? (
                service.fees.length === 0 ? (
                  "Not listed"
                ) : (
                  formatPeso(totalFee)
                )
              ) : (
                <VerifyText text={VERIFY} />
              )}
            </dd>
          </div>
          <div className="border-b border-rule py-3 sm:pr-4">
            <dt className="text-sm text-muted">Processing time</dt>
            <dd className="font-bold">
              <VerifyText text={service.processingTime} />
            </dd>
          </div>
          <div className="border-b border-rule py-3">
            <dt className="text-sm text-muted">Last checked</dt>
            <dd className="font-bold">
              {service.lastVerified === VERIFY ? (
                <VerifyText text={VERIFY} />
              ) : (
                <time dateTime={service.lastVerified}>
                  {formatDate(service.lastVerified)}
                </time>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <PrintButton />
        </div>

        <nav aria-label="On this page" className="mt-6 text-sm print:hidden">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {service.whoCanApply.length > 0 && (
          <section aria-labelledby="who-heading" className="mt-10">
            <h2 id="who-heading" className="text-xl font-bold">
              Who can apply
            </h2>
            <ul role="list" className="mt-3 list-disc space-y-1 pl-5">
              {service.whoCanApply.map((item) => (
                <li key={item}>
                  <VerifyText text={item} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section
          id="requirements"
          aria-labelledby="requirements-heading"
          className="mt-10 scroll-mt-4"
        >
          <h2 id="requirements-heading" className="mb-3 text-xl font-bold">
            What to bring
          </h2>
          <ChecklistMemory guide={path}>
            <RequirementList requirements={service.requirements} />
          </ChecklistMemory>
        </section>

        <section
          id="steps"
          aria-labelledby="steps-heading"
          className="mt-10 scroll-mt-4"
        >
          <h2 id="steps-heading" className="mb-3 text-xl font-bold">
            Steps
          </h2>
          <StepList steps={service.steps} />
        </section>

        {service.fees.length > 0 && (
          <section
            id="fees"
            aria-labelledby="fees-heading"
            className="mt-10 scroll-mt-4"
          >
            <h2 id="fees-heading" className="mb-3 text-xl font-bold">
              Fees
            </h2>
            <FeeTable fees={service.fees} />
          </section>
        )}

        {offices.length > 0 && (
          <section
            id="where"
            aria-labelledby="where-heading"
            className="mt-10 scroll-mt-4"
          >
            <h2 id="where-heading" className="mb-3 text-xl font-bold">
              Where to go
            </h2>
            <div className="space-y-8">
              {offices.map((office) => (
                <OfficeDetails key={office.slug} office={office} />
              ))}
            </div>
          </section>
        )}

        {service.online.length > 0 && (
          <section
            id="online"
            aria-labelledby="online-heading"
            className="print-urls mt-10 scroll-mt-4"
          >
            <h2 id="online-heading" className="mb-3 text-xl font-bold">
              What you can do online
            </h2>
            <ul role="list" className="border-t-2 border-ink">
              {service.online.map((item) => (
                <li key={item.label} className="border-b border-rule py-3">
                  {item.url === VERIFY ? (
                    <span className="font-bold">
                      {item.label} <VerifyText text={item.url} />
                    </span>
                  ) : (
                    <a href={item.url} className="font-bold">
                      {item.label}
                    </a>
                  )}
                  <span className="ml-2 text-sm text-muted">official site</span>
                  <p className="mt-1">
                    <VerifyText text={item.whatYouCanDo} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {service.tips.length > 0 && (
          <section
            aria-labelledby="tips-heading"
            className="mt-10 rounded-md border-l-6 border-ink bg-notice px-4 py-4"
          >
            <h2 id="tips-heading" className="text-lg font-bold">
              Good to know
            </h2>
            <ul role="list" className="mt-2 list-disc space-y-1 pl-5">
              {service.tips.map((tip) => (
                <li key={tip}>
                  <VerifyText text={tip} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {service.faqs.length > 0 && (
          <section
            id="faqs"
            aria-labelledby="faqs-heading"
            className="mt-10 scroll-mt-4 print:hidden"
          >
            <h2 id="faqs-heading" className="mb-3 text-xl font-bold">
              Common questions
            </h2>
            <div className="border-t-2 border-ink">
              {service.faqs.map((faq) => (
                // Native disclosure: works without JS, and Ctrl+F finds hidden answers.
                <details key={faq.question} className="border-b border-rule">
                  <summary className="cursor-pointer py-3 font-bold">
                    <VerifyText text={faq.question} />
                  </summary>
                  <p className="pb-4">
                    <VerifyText text={faq.answer} />
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-10">
            <h2 id="related-heading" className="mb-3 text-xl font-bold">
              Related guides
            </h2>
            <ul role="list" className="space-y-1">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/${city.slug}/services/${r.slug}`}>
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section
          id="sources"
          aria-labelledby="sources-heading"
          className="print-urls mt-10 scroll-mt-4 border-t-2 border-ink pt-4"
        >
          <h2 id="sources-heading" className="mb-3 text-xl font-bold">
            Sources
          </h2>
          <SourceList sources={service.sources} />
          <p className="mt-4">
            Something changed?{" "}
            <a href={reportIssueUrl(service.title, path)}>
              Report outdated info
            </a>
          </p>
        </section>
      </div>
    </article>
  );
}
