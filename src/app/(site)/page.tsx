import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { TopicTiles } from "@/features/categories/topic-tiles";
import { SuggestService } from "@/features/feedback/report-actions";
import { CityList } from "@/features/cities/city-list";
import { SearchBox } from "@/features/search/search-box";
import { SearchForm } from "@/features/search/search-form";
import { pageMetadata } from "@/features/seo/page-metadata";
import { websiteJsonLd } from "@/features/seo/structured-data";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import {
  listCategories,
  listCities,
  listPopularServices,
  listServices,
} from "@/lib/content/repository";

export const metadata: Metadata = pageMetadata({
  title: "Government services in the Philippines",
  description:
    "Where to go, what to bring, the steps and the fees for government services, with local offices for each city.",
  path: "/",
});

export default async function HomePage() {
  const [categories, services, popular, cities, agencyNames] =
    await Promise.all([
      listCategories(),
      listServices(),
      listPopularServices(),
      listCities(),
      getAgencyNames(),
    ]);

  // Without a curated list in popular.yaml, show the first few guides instead.
  const featured = popular.length > 0 ? popular : services.slice(0, 5);

  const topics = categories.map((category) => ({
    category,
    count: services.filter((s) => s.category === category.slug).length,
  }));

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      {/* The question, then the search: the main way in. */}
      <div className="bg-brand text-on-brand">
        <div className="mx-auto max-w-page px-4 pt-4 pb-10">
          <div className="max-w-2xl">
            <h1 id="home-question" className="sign text-display">
              What do you need to get done?
            </h1>
            <p className="mt-3 max-w-prose text-lg">
              Where to go, what to bring, the steps and the fees for government
              services in the Philippines.
            </p>
            <div className="mt-5">
              <Suspense
                fallback={
                  <SearchForm
                    inputId="home-search"
                    variant="hero"
                    labelledBy="home-question"
                  />
                }
              >
                <SearchBox mode="home" labelledBy="home-question" />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-page grid-cols-1 gap-10 px-4 pt-8 lg:grid-cols-3">
        <div className="grid grid-cols-1 content-start gap-10 lg:col-span-2">
          {services.length === 0 ? (
            <section aria-labelledby="soon-heading">
              <SectionHeading id="soon-heading">
                Guides are coming
              </SectionHeading>
              <div className="rounded-card bg-surface p-5">
                <p className="max-w-prose">
                  Every guide is checked against official sources before it
                  appears here. The first ones are being checked now. Which
                  errand should we explain first?
                </p>
                <SuggestService />
              </div>
            </section>
          ) : (
            featured.length > 0 && (
              <section aria-labelledby="popular-heading">
                <SectionHeading
                  id="popular-heading"
                  more={{ href: "/services", label: "All guides" }}
                >
                  {popular.length > 0 ? "Most looked up" : "Guides"}
                </SectionHeading>
                <GuideRows services={featured} agencyNames={agencyNames} />
              </section>
            )
          )}

          <section aria-labelledby="topics-heading">
            <SectionHeading id="topics-heading">Browse by topic</SectionHeading>
            <TopicTiles categories={topics} />
          </section>
        </div>

        <aside className="grid grid-cols-1 content-start gap-10">
          <section aria-labelledby="cities-heading">
            <SectionHeading id="cities-heading">Local offices</SectionHeading>
            <p className="mb-3 max-w-prose">
              National requirements are the same everywhere. Offices, hours and
              city-run services are added city by city.
            </p>
            <CityList cities={cities} />
          </section>
        </aside>
      </div>
    </>
  );
}
