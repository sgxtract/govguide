import "server-only";

import path from "node:path";

import { cache } from "react";

import {
  composeAgencies,
  composeCityHub,
  composeGuide,
  composeListings,
  composeOffices,
  composePopular,
  type CityHub,
  type Guide,
  type ServiceListing,
} from "./compose";
import { loadFileContent } from "./loaders/file-loader";
import type { Agency, Category, City, Holiday, Office } from "./schemas";

export type { CityGuide, CityHub, Guide, ServiceListing } from "./compose";

/**
 * The only door to content. Pages and components call these functions and
 * never touch files (or, in Phase 2, the database) themselves. Swapping the
 * data source means changing getStore() and nothing else.
 */

// Normally ./content. End-to-end tests point this at fixture content
// (tests/fixtures/content) so they don't depend on real guides. Content is
// only read at build time (every page is static), so the bundler is told not
// to trace this path into the server output.
const CONTENT_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.cwd(),
  process.env.CONTENT_DIR ?? "content",
);

// Drafts show in `pnpm dev` (and when SHOW_DRAFTS=true), never in production.
const SHOW_DRAFTS =
  process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "true";

// cache(): read the files once per request/render, but re-read on the next
// one, so edits to YAML show up on refresh in dev.
const getStore = cache(() => loadFileContent(CONTENT_DIR));

const visibility = { showDrafts: SHOW_DRAFTS };

// ── Cities ─────────────────────────────────────────────────────────────────

export async function listCities(): Promise<City[]> {
  return (await getStore()).cities;
}

export async function getCity(slug: string): Promise<City | undefined> {
  return (await getStore()).cities.find((c) => c.slug === slug);
}

// ── Holidays ───────────────────────────────────────────────────────────────

/** Public holidays from content/holidays.yaml, for office open/closed status. */
export async function listHolidays(): Promise<Holiday[]> {
  return (await getStore()).holidays;
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

export async function listAgencies(): Promise<Agency[]> {
  return (await getStore()).agencies;
}

/** Agencies with a visible office or guide: the ones that get a page. */
export async function listVisibleAgencies(): Promise<Agency[]> {
  return composeAgencies(await getStore(), visibility);
}

// ── Offices ────────────────────────────────────────────────────────────────

export async function listOffices(
  filter: { city?: string; agency?: string } = {},
): Promise<Office[]> {
  return composeOffices(await getStore(), visibility, filter);
}

// ── Guides ─────────────────────────────────────────────────────────────────

/** A guide with each city's part (offices, tips, or its own version). */
export async function getGuide(slug: string): Promise<Guide | undefined> {
  return composeGuide(await getStore(), slug, visibility);
}

export async function listServices(
  filter: { category?: string; agency?: string; city?: string } = {},
): Promise<ServiceListing[]> {
  return composeListings(await getStore(), visibility, filter);
}

/** "Most looked up" on the home page, in the order of popular.yaml. */
export async function listPopularServices(): Promise<ServiceListing[]> {
  return composePopular(await getStore(), visibility);
}

// ── City hub ───────────────────────────────────────────────────────────────

/** A city's own page: its offices, hotlines and city-run guides. */
export async function getCityHub(city: string): Promise<CityHub | undefined> {
  return composeCityHub(await getStore(), city, visibility);
}
