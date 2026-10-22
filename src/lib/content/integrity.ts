import type { ContentStore } from "./loaders/file-loader";
import { VERIFY } from "./schemas";

/** True if any value inside still contains the [VERIFY] placeholder. */
export function hasPlaceholders(value: unknown): boolean {
  // JSON.stringify(undefined) is undefined, not a string, e.g. when a guide
  // points at an agency that doesn't exist.
  return JSON.stringify(value)?.includes(VERIFY) ?? false;
}

/**
 * Rules the schemas can't express on their own: references between files,
 * duplicate slugs, and "nothing unverified gets published".
 *
 * `broken` lists files that exist but failed to load ("service:slug",
 * "city-service:city/slug", "office:city/slug", "agency:slug"); references
 * to them are not reported.
 */
export function checkIntegrity(
  store: ContentStore,
  broken: ReadonlySet<string> = new Set(),
): string[] {
  const problems: string[] = [];
  const categories = new Set(store.categories.map((c) => c.slug));
  const agencies = new Map(store.agencies.map((a) => [a.slug, a]));
  const services = new Set(store.services.map((s) => s.slug));
  const unknownAgency = (slug: string) =>
    !agencies.has(slug) && !broken.has(`agency:${slug}`);

  for (const slug of duplicates(store.categories.map((c) => c.slug))) {
    problems.push(`categories.yaml\n  ✖ Duplicate category "${slug}"`);
  }

  for (const slug of duplicates(store.holidays.map((h) => h.date))) {
    problems.push(`holidays.yaml\n  ✖ Duplicate date "${slug}"`);
  }

  for (const popular of store.popular) {
    if (!services.has(popular) && !broken.has(`service:${popular}`)) {
      problems.push(`popular.yaml\n  ✖ Unknown popular service "${popular}"`);
    }
  }

  for (const office of store.offices) {
    if (unknownAgency(office.agency)) {
      problems.push(
        `cities/${office.city}/offices/${office.slug}.yaml\n  ✖ Unknown agency "${office.agency}"`,
      );
    }
  }

  for (const service of store.services) {
    const where = `services/${service.slug}.yaml`;

    if (!categories.has(service.category)) {
      problems.push(`${where}\n  ✖ Unknown category "${service.category}"`);
    }
    for (const related of service.related) {
      if (!services.has(related) && !broken.has(`service:${related}`)) {
        problems.push(`${where}\n  ✖ Unknown related service "${related}"`);
      }
    }
    if (service.scope === "local") {
      // A city-run guide's title and summary show with every city's version,
      // so they must be verified once any city publishes one.
      const published = store.cityServices.some(
        (c) =>
          c.slug === service.slug &&
          c.scope === "local" &&
          c.status === "published",
      );
      if (published && hasPlaceholders(service)) {
        problems.push(`${where}\n  ✖ ${UNVERIFIED}`);
      }
      continue;
    }

    if (unknownAgency(service.agency)) {
      problems.push(`${where}\n  ✖ Unknown agency "${service.agency}"`);
    }
    // The accuracy rule. A national guide serves every city, so one city's
    // unverified office doesn't block it: that office is just hidden.
    if (
      service.status === "published" &&
      [service, agencies.get(service.agency)].some(hasPlaceholders)
    ) {
      problems.push(`${where}\n  ✖ ${UNVERIFIED}`);
    }
  }

  const serviceBySlug = new Map(store.services.map((s) => [s.slug, s]));
  for (const extra of store.cityServices) {
    const where = `cities/${extra.city}/services/${extra.slug}.yaml`;
    const cityOffices = new Map(
      store.offices
        .filter((o) => o.city === extra.city)
        .map((o) => [o.slug, o]),
    );
    // Whose offices these may be: the city version's agency for a city-run
    // guide, the guide's agency for a national one.
    const national = serviceBySlug.get(extra.slug);
    const agency =
      extra.scope === "local"
        ? extra.agency
        : national?.scope === "national"
          ? national.agency
          : undefined;

    if (extra.scope === "local" && unknownAgency(extra.agency)) {
      problems.push(`${where}\n  ✖ Unknown agency "${extra.agency}"`);
    }
    for (const slug of extra.offices ?? []) {
      const office = cityOffices.get(slug);
      if (!office) {
        if (!broken.has(`office:${extra.city}/${slug}`)) {
          problems.push(
            `${where}\n  ✖ Office "${slug}" is not in ${extra.city}`,
          );
        }
      } else if (agency && office.agency !== agency) {
        problems.push(
          `${where}\n  ✖ Office "${slug}" belongs to "${office.agency}", not "${agency}"`,
        );
      }
    }

    // A city's own version of a city-run guide shows exactly these offices,
    // so all of it must be verified before it's published.
    if (extra.scope === "local" && extra.status === "published") {
      const shown = [
        extra,
        agencies.get(extra.agency),
        ...extra.offices.map((o) => cityOffices.get(o)),
      ];
      if (shown.some(hasPlaceholders)) {
        problems.push(`${where}\n  ✖ ${UNVERIFIED}`);
      }
    }
  }

  return problems;
}

const UNVERIFIED = `Published, but it (or its agency/offices) still contains ${VERIFY}. Verify the values or set status: draft.`;

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((v) => (seen.has(v) ? true : (seen.add(v), false)));
}
