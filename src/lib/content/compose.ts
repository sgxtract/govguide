import { hasPlaceholders } from "./integrity";
import type { ContentStore } from "./loaders/file-loader";
import type {
  Agency,
  City,
  CityLocalService,
  Office,
  Service,
} from "./schemas";
import { VERIFY } from "./verify";

/**
 * Combines national guides with what each city adds, into what a page shows.
 * Pure (no files, no React), so the rules are unit-tested; the repository
 * wraps these with the loaded store and the draft setting.
 */

export type Visibility = { showDrafts: boolean };

/** One city's part of a guide: where to go, and for city-run guides, the rest. */
export type CityGuide = {
  city: City;
  offices: Office[];
  /** Local tips for a national guide. City-run guides keep tips in `local`. */
  tips: string[];
  /** The city's own version of a city-run guide. */
  local?: CityLocalService;
};

export type Guide = {
  service: Service;
  /** National guides only; a city-run guide's agency is in each `local`. */
  agency?: Agency;
  /** Cities that have something to show for this guide, by name. */
  cities: CityGuide[];
};

/** A guide in a list or search: enough to link to it and say who runs it. */
export type ServiceListing = {
  slug: string;
  title: string;
  summary: string;
  keywords: string[];
  category: string;
  scope: "national" | "local";
  agencies: string[];
  cities: string[];
  /** Never [VERIFY]; the latest city version's date for city-run guides. */
  lastVerified?: string;
};

export type CityHub = {
  city: City;
  offices: Office[];
  localGuides: ServiceListing[];
};

/** Unverified offices, agencies and city files are hidden in production. */
const isVerified = (item: unknown, v: Visibility) =>
  v.showDrafts || !hasPlaceholders(item);

const isPublished = (item: { status: string }, v: Visibility) =>
  v.showDrafts || item.status === "published";

function cityGuides(
  store: ContentStore,
  service: Service,
  v: Visibility,
): CityGuide[] {
  const result: CityGuide[] = [];
  for (const city of store.cities) {
    const cityOffices = store.offices.filter(
      (o) => o.city === city.slug && isVerified(o, v),
    );
    const extra = store.cityServices.find(
      (c) => c.city === city.slug && c.slug === service.slug,
    );

    if (service.scope === "national") {
      const shownExtra =
        extra?.scope === "national" && isVerified(extra, v) ? extra : undefined;
      const offices = shownExtra?.offices
        ? cityOffices.filter((o) => shownExtra.offices?.includes(o.slug))
        : cityOffices.filter((o) => o.agency === service.agency);
      const tips = shownExtra?.tips ?? [];
      if (offices.length > 0 || tips.length > 0) {
        result.push({ city, offices, tips });
      }
    } else if (extra?.scope === "local" && isPublished(extra, v)) {
      result.push({
        city,
        offices: cityOffices.filter((o) => extra.offices.includes(o.slug)),
        tips: [],
        local: extra,
      });
    }
  }
  return result.sort((a, b) => a.city.name.localeCompare(b.city.name));
}

function isServiceVisible(
  store: ContentStore,
  service: Service,
  v: Visibility,
): boolean {
  return service.scope === "national"
    ? isPublished(service, v)
    : cityGuides(store, service, v).length > 0;
}

export function composeGuide(
  store: ContentStore,
  slug: string,
  v: Visibility,
): Guide | undefined {
  const service = store.services.find((s) => s.slug === slug);
  if (!service || !isServiceVisible(store, service, v)) return undefined;

  const agency =
    service.scope === "national"
      ? store.agencies.find((a) => a.slug === service.agency)
      : undefined;
  return {
    service,
    agency: agency && isVerified(agency, v) ? agency : undefined,
    cities: cityGuides(store, service, v),
  };
}

const knownDate = (date: string) => (date === VERIFY ? undefined : date);

function toListing(
  store: ContentStore,
  service: Service,
  v: Visibility,
): ServiceListing {
  const cities = cityGuides(store, service, v);
  const versions = cities.flatMap((c) => (c.local ? [c.local] : []));
  const dates = versions.flatMap((l) => knownDate(l.lastVerified) ?? []);
  return {
    slug: service.slug,
    title: service.title,
    summary: service.summary,
    keywords: service.keywords,
    category: service.category,
    scope: service.scope,
    agencies:
      service.scope === "national"
        ? [service.agency]
        : [...new Set(versions.map((l) => l.agency))].sort(),
    cities: cities.map((c) => c.city.slug).sort(),
    lastVerified:
      service.scope === "national"
        ? knownDate(service.lastVerified)
        : dates.sort().at(-1),
  };
}

export function composeListings(
  store: ContentStore,
  v: Visibility,
  filter: { category?: string; agency?: string; city?: string } = {},
): ServiceListing[] {
  return store.services
    .filter((s) => isServiceVisible(store, s, v))
    .map((s) => toListing(store, s, v))
    .filter(
      (l) =>
        (!filter.category || l.category === filter.category) &&
        (!filter.agency || l.agencies.includes(filter.agency)) &&
        (!filter.city || l.cities.includes(filter.city)),
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** "Most looked up", in the order of popular.yaml. */
export function composePopular(
  store: ContentStore,
  v: Visibility,
): ServiceListing[] {
  return store.popular.flatMap((slug) => {
    const service = store.services.find((s) => s.slug === slug);
    return service && isServiceVisible(store, service, v)
      ? [toListing(store, service, v)]
      : [];
  });
}

/** Offices in content order: by city, then file name. */
export function composeOffices(
  store: ContentStore,
  v: Visibility,
  filter: { city?: string; agency?: string } = {},
): Office[] {
  return store.offices.filter(
    (o) =>
      isVerified(o, v) &&
      (!filter.city || o.city === filter.city) &&
      (!filter.agency || o.agency === filter.agency),
  );
}

/** Agencies with something to show: a visible office or guide. */
export function composeAgencies(store: ContentStore, v: Visibility): Agency[] {
  const used = new Set([
    ...composeOffices(store, v).map((o) => o.agency),
    ...composeListings(store, v).flatMap((l) => l.agencies),
  ]);
  return store.agencies
    .filter((a) => used.has(a.slug) && isVerified(a, v))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function composeCityHub(
  store: ContentStore,
  city: string,
  v: Visibility,
): CityHub | undefined {
  const found = store.cities.find((c) => c.slug === city);
  if (!found) return undefined;
  return {
    city: found,
    offices: composeOffices(store, v, { city }),
    localGuides: composeListings(store, v, { city }).filter(
      (l) => l.scope === "local",
    ),
  };
}
