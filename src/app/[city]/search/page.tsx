import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SearchBox } from "@/features/search/search-box";
import { SearchForm } from "@/features/search/search-form";
import { getAgencyNames } from "@/features/services/agency-names";
import { ServiceList } from "@/features/services/service-list";
import { getCity, listServices } from "@/lib/content/repository";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/search">): Promise<Metadata> {
  const city = await getCity((await params).city);
  if (!city) return {};
  return {
    title: `Search guides in ${city.name}`,
    robots: { index: false }, // result pages don't belong in search engines
  };
}

export default async function SearchPage({
  params,
}: PageProps<"/[city]/search">) {
  const city = await getCity((await params).city);
  if (!city) notFound();

  const [services, agencyNames] = await Promise.all([
    listServices(city.slug),
    getAgencyNames(),
  ]);

  return (
    <div className="mx-auto max-w-page px-4 py-10">
      <Breadcrumbs
        items={[
          { label: city.name, href: `/${city.slug}` },
          { label: "Search" },
        ]}
      />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
        Search guides in {city.name}
      </h1>

      <div className="mt-6 max-w-3xl">
        {/* The page stays static: ?q= is read in the browser. The fallback is
            the same form as plain HTML, for the moment before JS loads. */}
        <Suspense fallback={<SearchForm city={city.slug} inputId="q" />}>
          <SearchBox city={city.slug} mode="page" />
        </Suspense>

        {/* Without JavaScript there's no instant search, so list every guide. */}
        <noscript>
          <h2 className="mt-8 mb-3 text-xl font-bold">All guides</h2>
          <ServiceList services={services} agencyNames={agencyNames} />
        </noscript>
      </div>
    </div>
  );
}
