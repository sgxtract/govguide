import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { newIssueUrl } from "@/config/site";
import { CategoryList } from "@/features/categories/category-list";
import { getAgencyNames } from "@/features/services/agency-names";
import { ServiceList } from "@/features/services/service-list";
import {
  getCity,
  listCategories,
  listServices,
} from "@/lib/content/repository";
import Link from "next/dist/client/link";

export async function generateMetadata({
  params,
}: PageProps<"/[city]">): Promise<Metadata> {
  const city = await getCity((await params).city);
  if (!city) return {};
  return {
    title: `Government services in ${city.name}`,
    description: city.description,
  };
}

export default async function CityHomePage({ params }: PageProps<"/[city]">) {
  const city = await getCity((await params).city);
  if (!city) notFound();

  const [categories, services, agencyNames] = await Promise.all([
    listCategories(),
    listServices(city.slug),
    getAgencyNames(),
  ]);

  const categoriesWithCounts = categories.map((category) => ({
    category,
    count: services.filter((s) => s.category === category.slug).length,
  }));

  return (
    <div className="mx-auto max-w-page px-4 py-10">
      <h1 className="max-w-prose text-display font-extrabold tracking-tight">
        Government services in {city.name}
      </h1>
      <p className="mt-4 max-w-prose text-lg text-muted">
        Where to go, what to bring, the steps, the fees, and how long it takes.
        Every guide is checked against official sources.
      </p>

      <p className="mt-4">
        <Link href={`/${city.slug}/agencies`}>
          Find a government office and its hours
        </Link>
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-3">
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="mb-3 text-xl font-bold">
            Browse by category
          </h2>
          <CategoryList city={city.slug} categories={categoriesWithCounts} />
        </section>

        <section aria-labelledby="guides-heading" className="lg:col-span-2">
          <h2 id="guides-heading" className="mb-3 text-xl font-bold">
            All guides
          </h2>
          {services.length > 0 ? (
            <ServiceList services={services} agencyNames={agencyNames} />
          ) : (
            <div className="border-t-2 border-ink pt-4">
              <p className="max-w-prose">
                Guides are being checked against official sources. The first
                ones will appear here soon.
              </p>
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
