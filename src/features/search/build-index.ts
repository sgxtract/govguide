import "server-only";

import { agencyDisplayName } from "@/features/agencies/agency-level";
import {
  listAgencies,
  listCategories,
  listCityAgencies,
  listServices,
} from "@/lib/content/repository";

import type { SearchDoc } from "./engine";

/**
 * Everything searchable in one city. Uses the repository, so drafts and
 * unverified offices are left out in production automatically.
 */
export async function buildSearchDocs(city: string): Promise<SearchDoc[]> {
  const [services, allAgencies, cityAgencies, categories] = await Promise.all([
    listServices(city),
    listAgencies(),
    listCityAgencies(city),
    listCategories(),
  ]);
  const agencyBySlug = new Map(allAgencies.map((a) => [a.slug, a]));
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  const guides: SearchDoc[] = services.map((s) => {
    const agency = agencyBySlug.get(s.agency);
    return {
      id: `guide:${s.slug}`,
      kind: "guide",
      title: s.title,
      summary: s.summary,
      keywords: [...s.keywords, ...(agency?.keywords ?? [])].join(" "),
      agency: agency ? agencyDisplayName(agency) : s.agency,
      category: categoryName.get(s.category) ?? "",
      url: `/${city}/services/${s.slug}`,
    };
  });

  const offices: SearchDoc[] = cityAgencies.map((a) => ({
    id: `office:${a.slug}`,
    kind: "office",
    title: agencyDisplayName(a),
    summary: a.description,
    keywords: ["office", "hours", "address", ...a.keywords].join(" "),
    agency: a.acronym ?? "",
    category: "",
    url: `/${city}/agencies/${a.slug}`,
  }));

  return [...guides, ...offices];
}
