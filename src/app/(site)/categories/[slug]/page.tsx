import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { SuggestService } from "@/features/feedback/report-actions";
import { pageMetadata } from "@/features/seo/page-metadata";
import { getAgencyNames } from "@/features/services/agency-names";
import { GuideRows } from "@/features/services/guide-rows";
import {
  getCategory,
  listCategories,
  listServices,
} from "@/lib/content/repository";

export async function generateStaticParams() {
  const categories = await listCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  if (!category) return {};
  return pageMetadata({
    title: category.name,
    description: category.description,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
}: PageProps<"/categories/[slug]">) {
  const category = await getCategory((await params).slug);
  if (!category) notFound();

  const [services, agencyNames] = await Promise.all([
    listServices({ category: category.slug }),
    getAgencyNames(),
  ]);
  const path = `/categories/${category.slug}`;

  return (
    <>
      <PageHeader
        title={category.name}
        subtitle={category.description}
        back={{ href: "/", label: "Home" }}
        breadcrumbs={{
          path,
          items: [{ label: "Home", href: "/" }, { label: category.name }],
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
              <SuggestService />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
