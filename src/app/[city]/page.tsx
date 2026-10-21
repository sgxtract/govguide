import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { TopicTiles } from "@/features/categories/topic-tiles";
import { SuggestService } from "@/features/feedback/report-actions";
import { OfficeRows } from "@/features/offices/office-rows";
import { SearchBox } from "@/features/search/search-box";
import { SearchForm } from "@/features/search/search-form";
import { pageMetadata } from "@/features/seo/page-metadata";
import { websiteJsonLd } from "@/features/seo/structured-data";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import {
  getCity,
  listCategories,
  listHolidays,
  listOffices,
  listPopularServices,
  listServices,
} from "@/lib/content/repository";

/** How many offices the home page lists before "All offices and hours". */
const HOME_OFFICES = 4;

export async function generateMetadata({
  params,
}: PageProps<"/[city]">): Promise<Metadata> {
  const city = await getCity((await params).city);
  if (!city) return {};
  return pageMetadata({
    title: `Government services in ${city.name}`,
    description: city.description,
    path: `/${city.slug}`,
  });
}

export default async function CityHomePage({ params }: PageProps<"/[city]">) {
  const city = await getCity((await params).city);
  if (!city) notFound();

  const [categories, services, popular, offices, holidays, agencyNames] =
    await Promise.all([
      listCategories(),
      listServices(city.slug),
      listPopularServices(city.slug),
      listOffices(city.slug),
      listHolidays(),
      getAgencyNames(),
    ]);

  // Without a curated list in city.yaml, show the first few guides instead.
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
              services in {city.name}.
            </p>
            <div className="mt-5">
              <Suspense
                fallback={
                  <SearchForm
                    city={city.slug}
                    inputId="home-search"
                    variant="hero"
                    labelledBy="home-question"
                  />
                }
              >
                <SearchBox
                  city={city.slug}
                  mode="home"
                  labelledBy="home-question"
                />
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
                <SuggestService city={city.name} />
              </div>
            </section>
          ) : (
            featured.length > 0 && (
              <section aria-labelledby="popular-heading">
                <SectionHeading
                  id="popular-heading"
                  more={{ href: `/${city.slug}/services`, label: "All guides" }}
                >
                  {popular.length > 0 ? "Most looked up" : "Guides"}
                </SectionHeading>
                <GuideRows services={featured} agencyNames={agencyNames} />
              </section>
            )
          )}

          <section aria-labelledby="topics-heading">
            <SectionHeading id="topics-heading">Browse by topic</SectionHeading>
            <TopicTiles city={city.slug} categories={topics} />
          </section>
        </div>

        <aside className="grid grid-cols-1 content-start gap-10">
          {offices.length > 0 && (
            <section aria-labelledby="offices-heading">
              <SectionHeading
                id="offices-heading"
                more={
                  offices.length > HOME_OFFICES
                    ? { href: `/${city.slug}/agencies`, label: "All offices" }
                    : undefined
                }
              >
                Offices
              </SectionHeading>
              <OfficeRows
                offices={offices.slice(0, HOME_OFFICES)}
                holidays={holidays}
              />
              <p className="mt-2 text-sm text-muted">
                Open or closed is worked out from each office&apos;s posted
                hours, in Philippine time.
              </p>
            </section>
          )}

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
        </aside>
      </div>
    </>
  );
}
