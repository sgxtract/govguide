import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site-url";
import {
  listCategories,
  listCities,
  listCityAgencies,
  listServices,
} from "@/lib/content/repository";
import { VERIFY } from "@/lib/content/verify";

/**
 * /sitemap.xml: every public page. Built from the repository, so drafts and
 * unverified agencies are never listed. Search pages are left out (noindex).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, categories] = await Promise.all([
    listCities(),
    listCategories(),
  ]);

  const perCity = await Promise.all(
    cities.map(async (city) => {
      const base = `/${city.slug}`;
      const [services, agencies] = await Promise.all([
        listServices(city.slug),
        listCityAgencies(city.slug),
      ]);
      return [
        { url: absoluteUrl(base) },
        { url: absoluteUrl(`${base}/services`) },
        { url: absoluteUrl(`${base}/agencies`) },
        ...categories.map((c) => ({
          url: absoluteUrl(`${base}/categories/${c.slug}`),
        })),
        ...agencies.map((a) => ({
          url: absoluteUrl(`${base}/agencies/${a.slug}`),
        })),
        ...services.map((s) => ({
          url: absoluteUrl(`${base}/services/${s.slug}`),
          // The date the guide was last checked is when its content changed.
          lastModified: s.lastVerified === VERIFY ? undefined : s.lastVerified,
        })),
      ];
    }),
  );

  const standalone = ["/about", "/contribute", "/disclaimer", "/privacy"];
  return [
    ...perCity.flat(),
    ...standalone.map((path) => ({ url: absoluteUrl(path) })),
  ];
}
