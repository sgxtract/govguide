import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { SuggestService } from "@/features/feedback/report-actions";
import { pageMetadata } from "@/features/seo/page-metadata";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import {
  getCategory,
  getCity,
  listCategories,
  listServices,
} from "@/lib/content/repository";

// The parent [city] layout supplies `city`; we add every category for it.
export async function generateStaticParams() {
  const categories = await listCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export const dynamicParams = false;

async function load(params: PageProps<"/[city]/categories/[slug]">["params"]) {
  const { city: citySlug, slug } = await params;
  const [city, category] = await Promise.all([
    getCity(citySlug),
    getCategory(slug),
  ]);
  return city && category ? { city, category } : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/[city]/categories/[slug]">): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  return pageMetadata({
    title: `${data.category.name} in ${data.city.name}`,
    description: data.category.description,
    path: `/${data.city.slug}/categories/${data.category.slug}`,
  });
}

export default async function CategoryPage({
  params,
}: PageProps<"/[city]/categories/[slug]">) {
  const data = await load(params);
  if (!data) notFound();
  const { city, category } = data;

  const [services, agencyNames] = await Promise.all([
    listServices(city.slug, { category: category.slug }),
    getAgencyNames(),
  ]);
  const path = `/${city.slug}/categories/${category.slug}`;

  return (
    <>
      <PageHeader
        title={category.name}
        subtitle={category.description}
        back={{ href: `/${city.slug}`, label: city.name }}
        breadcrumbs={{
          path,
          items: [
            { label: city.name, href: `/${city.slug}` },
            { label: category.name },
          ],
        }}
      />

      <div className="mx-auto max-w-page px-4 pt-6">
        <div className="max-w-3xl">
          {services.length > 0 ? (
            <GuideRows
              services={services}
              agencyNames={agencyNames}
              withSummary
            />
          ) : (
            <div className="rounded-card bg-surface p-5">
              <h2 className="text-lg font-extrabold">No guides here yet</h2>
              <p className="mt-1 max-w-prose">
                Guides for {category.name.toLowerCase()} are coming. Which one
                should we explain first?
              </p>
              <SuggestService city={city.name} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
