import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AgencyList } from "@/features/agencies/agency-list";
import {
  getCity,
  listCityAgencies,
  listOffices,
} from "@/lib/content/repository";
import { pageMetadata } from "@/features/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[city]/agencies">): Promise<Metadata> {
  const city = await getCity((await params).city);
  if (!city) return {};
  return pageMetadata({
    title: `Government offices in ${city.name}`,
    description: `Addresses, office hours and guides for government offices in ${city.name}.`,
    path: `/${city.slug}/agencies`,
  });
}

export default async function AgenciesPage({
  params,
}: PageProps<"/[city]/agencies">) {
  const city = await getCity((await params).city);
  if (!city) notFound();

  const [agencies, offices] = await Promise.all([
    listCityAgencies(city.slug),
    listOffices(city.slug),
  ]);
  const rows = agencies.map((agency) => ({
    agency,
    offices: offices.filter((o) => o.agency === agency.slug),
  }));

  return (
    <div className="mx-auto max-w-page px-4 py-10">
      <Breadcrumbs
        items={[
          { label: city.name, href: `/${city.slug}` },
          { label: "Offices" },
        ]}
      />
      <h1 className="mt-4 max-w-prose text-2xl font-extrabold tracking-tight">
        Government offices in {city.name}
      </h1>
      <p className="mt-3 max-w-prose text-lg text-muted">
        Where each office is, when it&apos;s open, and which errands it handles.
      </p>
      <div className="mt-8 max-w-3xl">
        {rows.length > 0 ? (
          <AgencyList city={city.slug} agencies={rows} />
        ) : (
          <p className="border-t-2 border-ink pt-4">No offices listed yet.</p>
        )}
      </div>
    </div>
  );
}
