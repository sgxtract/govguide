import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site-url";
import {
  listCategories,
  listCities,
  listServices,
  listVisibleAgencies,
} from "@/lib/content/repository";

/**
 * /sitemap.xml: every public page. Built from the repository, so drafts and
 * unverified agencies are never listed. Search pages are left out (noindex).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, categories, services, agencies] = await Promise.all([
    listCities(),
    listCategories(),
    listServices(),
    listVisibleAgencies(),
  ]);

  const pages = [
    "/",
    "/services",
    "/agencies",
    ...categories.map((c) => `/categories/${c.slug}`),
    ...agencies.map((a) => `/agencies/${a.slug}`),
    ...cities.map((c) => `/${c.slug}`),
    "/about",
    "/contribute",
    "/disclaimer",
    "/privacy",
  ];
  return [
    ...pages.map((path) => ({ url: absoluteUrl(path) })),
    ...services.map((s) => ({
      url: absoluteUrl(`/services/${s.slug}`),
      // The date the guide was last checked is when its content changed.
      lastModified: s.lastVerified,
    })),
  ];
}
