import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { newIssueUrl } from "@/config/site";
import { getAgencyNames } from "@/features/services/agency-names";
import { ServiceList } from "@/features/services/service-list";
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
  return {
    title: `${data.category.name} in ${data.city.name}`,
    description: data.category.description,
  };
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

  return (
    <div className="mx-auto max-w-page px-4 py-10">
      <Breadcrumbs
        items={[
          { label: city.name, href: `/${city.slug}` },
          { label: category.name },
        ]}
      />
      <h1 className="mt-4 max-w-prose text-2xl font-extrabold tracking-tight">
        {category.name}
      </h1>
      <p className="mt-3 max-w-prose text-lg text-muted">
        {category.description}
      </p>

      <div className="mt-8 max-w-3xl">
        {services.length > 0 ? (
          <ServiceList services={services} agencyNames={agencyNames} />
        ) : (
          <div className="border-t-2 border-ink pt-4">
            <p>No guides in this category yet.</p>
            <p className="mt-2">
              <a href={newIssueUrl}>Suggest a service to cover</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
