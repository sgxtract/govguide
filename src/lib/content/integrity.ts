import type { ContentStore } from "./loaders/file-loader";
import { VERIFY } from "./schemas";

/** True if any value inside still contains the [VERIFY] placeholder. */
export function hasPlaceholders(value: unknown): boolean {
  return JSON.stringify(value).includes(VERIFY);
}

/**
 * Rules the schemas can't express on their own: references between files,
 * duplicate slugs, and "nothing unverified gets published".
 */
export function checkIntegrity(store: ContentStore): string[] {
  const problems: string[] = [];
  const categories = new Set(store.categories.map((c) => c.slug));
  const agencies = new Map(store.agencies.map((a) => [a.slug, a]));

  for (const slug of duplicates(store.categories.map((c) => c.slug))) {
    problems.push(`categories.yaml\n  ✖ Duplicate category "${slug}"`);
  }

  for (const office of store.offices) {
    if (!agencies.has(office.agency)) {
      problems.push(
        `cities/${office.city}/offices/${office.slug}.yaml\n  ✖ Unknown agency "${office.agency}"`,
      );
    }
  }

  for (const service of store.services) {
    const where = `cities/${service.city}/services/${service.slug}.yaml`;
    const cityOffices = new Map(
      store.offices
        .filter((o) => o.city === service.city)
        .map((o) => [o.slug, o]),
    );
    const cityServices = new Set(
      store.services.filter((s) => s.city === service.city).map((s) => s.slug),
    );

    if (!categories.has(service.category)) {
      problems.push(`${where}\n  ✖ Unknown category "${service.category}"`);
    }
    if (!agencies.has(service.agency)) {
      problems.push(`${where}\n  ✖ Unknown agency "${service.agency}"`);
    }
    for (const office of service.offices) {
      if (!cityOffices.has(office)) {
        problems.push(
          `${where}\n  ✖ Unknown office "${office}" in ${service.city}`,
        );
      }
    }
    for (const related of service.related) {
      if (!cityServices.has(related)) {
        problems.push(`${where}\n  ✖ Unknown related service "${related}"`);
      }
    }

    // The accuracy rule: a published guide (and the agency and offices it
    // shows) must not contain a single unverified value.
    if (service.status === "published") {
      const shown = [
        service,
        agencies.get(service.agency),
        ...service.offices.map((o) => cityOffices.get(o)),
      ];
      if (shown.some(hasPlaceholders)) {
        problems.push(
          `${where}\n  ✖ Published, but it (or its agency/offices) still contains ${VERIFY}. Verify the values or set status: draft.`,
        );
      }
    }
  }

  return problems;
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((v) => (seen.has(v) ? true : (seen.add(v), false)));
}
