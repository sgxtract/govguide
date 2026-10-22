import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { SuggestService } from "@/features/feedback/report-actions";
import { pageMetadata } from "@/features/seo/page-metadata";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import { listCategories, listServices } from "@/lib/content/repository";
import { countLabel } from "@/lib/utils/format";

export const metadata: Metadata = pageMetadata({
  title: "All guides",
  description: "Every government service guide on GovGuide, by topic.",
  path: "/services",
});

/** Every guide, grouped by topic, with jump links to each topic. */
export default async function AllGuidesPage() {
  const [categories, services, agencyNames] = await Promise.all([
    listCategories(),
    listServices(),
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
        subtitle={countLabel(services.length, "guide")}
        back={{ href: "/", label: "Home" }}
        breadcrumbs={{
          path: "/services",
          items: [{ label: "Home", href: "/" }, { label: "All guides" }],
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
            <SuggestService />
          </section>
        </div>
      </div>
    </>
  );
}
