import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { SuggestService } from "@/features/feedback/report-actions";
import { pageMetadata } from "@/features/seo/page-metadata";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import {
  getCity,
  listCategories,
  listServices,
} from "@/lib/content/repository";
import { countLabel } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/services">): Promise<Metadata> {
  const city = await getCity((await params).city);
  if (!city) return {};
  return pageMetadata({
    title: `All guides for ${city.name}`,
    description: `Every government service guide for ${city.name}, by topic.`,
    path: `/${city.slug}/services`,
  });
}

/** Every guide, grouped by topic, with jump links to each topic. */
export default async function AllGuidesPage({
  params,
}: PageProps<"/[city]/services">) {
  const city = await getCity((await params).city);
  if (!city) notFound();

  const [categories, services, agencyNames] = await Promise.all([
    listCategories(),
    listServices(city.slug),
    getAgencyNames(),
  ]);
  const groups = categories
    .map((category) => ({
      category,
      services: services.filter((s) => s.category === category.slug),
    }))
    .filter((g) => g.services.length > 0);

  return (
    <>
      <PageHeader
        title="All guides"
        subtitle={`${countLabel(services.length, "guide")} for ${city.name}`}
        back={{ href: `/${city.slug}`, label: city.name }}
        breadcrumbs={{
          path: `/${city.slug}/services`,
          items: [
            { label: city.name, href: `/${city.slug}` },
            { label: "All guides" },
          ],
        }}
      />

      <div className="mx-auto max-w-page px-4 pt-6">
        <div className="max-w-3xl">
          {groups.length > 1 && (
            <nav aria-label="Topics">
              <ul className="flex flex-wrap gap-2">
                {groups.map(({ category }) => (
                  <li key={category.slug}>
                    <a
                      href={`#${category.slug}`}
                      className="inline-flex min-h-11 items-center rounded-pill bg-surface px-4 text-sm font-bold text-ink no-underline hover:bg-brand-tint"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="mt-8 grid grid-cols-1 gap-10">
            {groups.map(({ category, services: inCategory }) => (
              <section
                key={category.slug}
                id={category.slug}
                aria-labelledby={`${category.slug}-heading`}
              >
                <SectionHeading id={`${category.slug}-heading`}>
                  {category.name}
                </SectionHeading>
                <GuideRows
                  services={inCategory}
                  agencyNames={agencyNames}
                  withSummary
                />
              </section>
            ))}
          </div>

          <section
            aria-labelledby="missing-heading"
            className="mt-12 rounded-card bg-surface p-5"
          >
            <h2 id="missing-heading" className="text-lg font-extrabold">
              {services.length === 0
                ? "Guides are being checked"
                : "Can't find your errand?"}
            </h2>
            <p className="mt-1 max-w-prose">
              Tell us which service you need. We research it from official
              sources and add a guide.
            </p>
            <SuggestService city={city.name} />
          </section>
        </div>
      </div>
    </>
  );
}
