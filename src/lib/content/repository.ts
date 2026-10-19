import "server-only";

import path from "node:path";

import { cache } from "react";

import { loadFileContent } from "./loaders/file-loader";
import type { Agency, Category, City, Office, Service } from "./schemas";

/**
 * The only door to content. Pages and components call these functions and
 * never touch files (or, in Phase 2, the database) themselves. Swapping the
 * data source means changing getStore() and nothing else.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

// Drafts show in `pnpm dev` (and when SHOW_DRAFTS=true), never in production.
const SHOW_DRAFTS =
  process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "true";

// cache(): read the files once per request/render, but re-read on the next
// one, so edits to YAML show up on refresh in dev.
const getStore = cache(() => loadFileContent(CONTENT_DIR));

const isVisible = (service: Service) =>
  SHOW_DRAFTS || service.status === "published";

// ── Cities ─────────────────────────────────────────────────────────────────

export async function listCities(): Promise<City[]> {
  return (await getStore()).cities;
}

export async function getCity(slug: string): Promise<City | undefined> {
  return (await getStore()).cities.find((c) => c.slug === slug);
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(): Promise<Category[]> {
  return (await getStore()).categories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getStore()).categories.find((c) => c.slug === slug);
}

// ── Agencies ───────────────────────────────────────────────────────────────

export async function getAgency(slug: string): Promise<Agency | undefined> {
  return (await getStore()).agencies.find((a) => a.slug === slug);
}

// ── Offices ────────────────────────────────────────────────────────────────

export async function listOffices(
  city: string,
  filter: { agency?: string } = {},
): Promise<Office[]> {
  return (await getStore()).offices.filter(
    (o) => o.city === city && (!filter.agency || o.agency === filter.agency),
  );
}

export async function getOffice(
  city: string,
  slug: string,
): Promise<Office | undefined> {
  return (await getStore()).offices.find(
    (o) => o.city === city && o.slug === slug,
  );
}

// ── Services ───────────────────────────────────────────────────────────────

export async function listServices(
  city: string,
  filter: { category?: string; agency?: string } = {},
): Promise<Service[]> {
  return (await getStore()).services
    .filter(
      (s) =>
        s.city === city &&
        isVisible(s) &&
        (!filter.category || s.category === filter.category) &&
        (!filter.agency || s.agency === filter.agency),
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getService(
  city: string,
  slug: string,
): Promise<Service | undefined> {
  const service = (await getStore()).services.find(
    (s) => s.city === city && s.slug === slug,
  );
  return service && isVisible(service) ? service : undefined;
}
