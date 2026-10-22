import "server-only";

import { agencyDisplayName } from "@/features/agencies/agency-level";
import {
  listAgencies,
  listCategories,
  listCities,
  listServices,
  listVisibleAgencies,
} from "@/lib/content/repository";

import type { SearchDoc } from "./engine";

/**
 * Everything searchable, nationwide. Uses the repository, so drafts and
 * unverified offices are left out in production automatically.
 */
export async function buildSearchDocs(): Promise<SearchDoc[]> {
  const [services, allAgencies, visibleAgencies, categories, cities] =
    await Promise.all([
      listServices(),
      listAgencies(),
      listVisibleAgencies(),
      listCategories(),
      listCities(),
    ]);
  const agencyBySlug = new Map(allAgencies.map((a) => [a.slug, a]));
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const cityName = new Map(cities.map((c) => [c.slug, c.name]));

  const guides: SearchDoc[] = services.map((s) => {
    const agencies = s.agencies.flatMap((a) => agencyBySlug.get(a) ?? []);
    return {
      id: `guide:${s.slug}`,
      kind: "guide",
      title: s.title,
      summary: s.summary,
      keywords: [
        ...s.keywords,
        ...agencies.flatMap((a) => a.keywords),
        // A city-run guide differs per city, so its cities are searchable.
        ...(s.scope === "local"
          ? s.cities.map((c) => cityName.get(c) ?? c)
          : []),
      ].join(" "),
      agency: agencies.map(agencyDisplayName).join(", "),
      category: categoryName.get(s.category) ?? "",
      url: `/services/${s.slug}`,
    };
  });

  const offices: SearchDoc[] = visibleAgencies.map((a) => ({
    id: `office:${a.slug}`,
    kind: "office",
    title: agencyDisplayName(a),
    summary: a.description,
    keywords: ["office", "hours", "address", ...a.keywords].join(" "),
    agency: a.acronym ?? "",
    category: "",
    url: `/agencies/${a.slug}`,
  }));

  return [...guides, ...offices];
}
